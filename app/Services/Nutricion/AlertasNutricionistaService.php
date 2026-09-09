<?php

namespace App\Services\Nutricion;

use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Services\Paciente\SeguimientoSintomasPacienteService;
use Illuminate\Support\Carbon;

class AlertasNutricionistaService
{
    private const TIPOS_COMIDA = ['desayuno', 'almuerzo', 'merienda', 'cena'];

    public function __construct(
        private readonly SeguimientoPacienteNutricionistaService $seguimientoService,
        private readonly SeguimientoSintomasPacienteService $sintomasService,
    ) {}

    public function generarParaPaciente(Paciente $paciente): array
    {
        $seguimiento = $this->seguimientoService->obtenerResumen($paciente);
        $alertas = [];
        $planId = data_get($seguimiento, 'plan.id_plan_alimentario');

        if ($planId) {
            $fechaFin = data_get($seguimiento, 'plan.fecha_fin');
            if ($fechaFin) {
                $diasRestantes = (int) now('America/La_Paz')->startOfDay()->diffInDays(Carbon::parse($fechaFin, 'America/La_Paz')->startOfDay(), false);
                if ($diasRestantes < 0) {
                    $this->agregar($alertas, 'plan_vencido', 'Plan alimentario vencido', "La planificación finalizó el {$fechaFin}.", 'alta', 'plan', 'Revisar el seguimiento y preparar una nueva planificación para la paciente.', 'vigencia_plan');
                } elseif ($diasRestantes === 0) {
                    $this->agregar($alertas, 'plan_vence_hoy', 'El plan vence hoy', 'Hoy finaliza la planificación alimentaria vigente.', 'media', 'plan', 'Revisar los resultados y preparar la siguiente planificación.', 'vigencia_plan');
                } elseif ($diasRestantes <= 2) {
                    $this->agregar($alertas, 'plan_por_vencer', 'Plan próximo a vencer', "Faltan {$diasRestantes} día(s) para que finalice la planificación.", 'baja', 'plan', 'Anticipar la revisión del progreso y preparar el siguiente plan.', 'vigencia_plan');
                }
            }
            $adherencia = data_get($seguimiento, 'resumen_adherencia.porcentaje_adherencia');
            $registradas = (int) data_get($seguimiento, 'resumen_adherencia.registradas', 0);
            $periodoIniciado = data_get($seguimiento, 'estado_periodo') !== 'no_iniciado';
            if ($registradas > 0 && $adherencia !== null && $adherencia < 60) {
                $this->agregar($alertas, 'adherencia_baja', 'Adherencia baja al plan', 'La adherencia al plan está por debajo del 60%.', 'alta', 'adherencia', 'Revisar barreras de cumplimiento y ajustar el plan si es necesario.', 'seguimiento_comidas');
            } elseif ($registradas > 0 && $adherencia !== null && $adherencia <= 75) {
                $this->agregar($alertas, 'adherencia_media', 'Adherencia moderada al plan', 'La adherencia es moderada.', 'media', 'adherencia', 'Reforzar seguimiento y revisar comidas con menor cumplimiento.', 'seguimiento_comidas');
            }

            foreach (self::TIPOS_COMIDA as $tipo) {
                $datos = data_get($seguimiento, "adherencia_por_tipo_comida.$tipo", []);
                if ($registradas > 0 && (int) ($datos['comidas_totales'] ?? 0) > 0 && (float) ($datos['porcentaje_adherencia'] ?? 0) < 50) {
                    $nombre = str_replace('_', ' ', $tipo);
                    $this->agregar($alertas, "adherencia_baja_$tipo", 'Baja adherencia por tipo de comida', "Baja adherencia en {$nombre}.", 'media', 'comidas', 'Considerar opciones más simples o adaptadas a horarios.', 'seguimiento_comidas');
                }
            }

            $plan = $seguimiento['plan'];
            $registros = $paciente->seguimientosComidas()->where('id_plan_alimentario', $planId)
                ->when($plan['fecha_inicio'], fn ($q, $fecha) => $q->whereDate('fecha_seguimiento', '>=', $fecha))
                ->when($plan['fecha_fin'], fn ($q, $fecha) => $q->whereDate('fecha_seguimiento', '<=', $fecha))
                ->whereDate('fecha_seguimiento', '<=', now('America/La_Paz')->toDateString())->get();
            if ($periodoIniciado) $this->agregarAlertasComidasSinMarcar($alertas, $planId, $registros);
            $inicio = $plan['fecha_inicio'] ? \Illuminate\Support\Carbon::parse($plan['fecha_inicio'], 'America/La_Paz')->startOfDay() : null;
            $hayTresDiasTranscurridos = $inicio && $inicio->diffInDays(now('America/La_Paz')->startOfDay(), false) >= 3;
            if ($periodoIniciado && $hayTresDiasTranscurridos && ! $registros->contains(fn ($registro) => $registro->fecha_seguimiento?->gte(now('America/La_Paz')->subDays(3)))) {
                $this->agregar($alertas, 'sin_registros_recientes', 'Falta de registros recientes', 'La paciente no registra seguimiento recientemente.', 'media', 'seguimiento', 'Recordar a la paciente registrar sus comidas para mejorar el acompañamiento.', 'seguimiento_comidas');
            }

            $this->agregarSiCuenta($alertas, $registros->where('nivel_hambre_posterior', 'alta')->count(), 'hambre_posterior_alta', 'Hambre posterior frecuente', 'Se registró hambre posterior alta en varias comidas.', 'media', 'comidas', 'Revisar saciedad, proteína y fibra en las comidas asociadas.');
            $this->agregarSiCuenta($alertas, $registros->where('ansiedad_posterior', true)->count(), 'ansiedad_posterior_frecuente', 'Ansiedad posterior frecuente', 'Se registró ansiedad posterior en varias comidas.', 'media', 'comidas', 'Considerar estrategias de saciedad y distribución de carbohidratos.');
            $this->agregarSiCuenta($alertas, $registros->filter(fn ($r) => $r->presento_molestia && in_array($r->intensidad_molestia, ['moderada', 'severa'], true))->count(), 'molestias_digestivas_frecuentes', 'Molestias digestivas frecuentes', 'Se registraron molestias digestivas moderadas o severas.', 'alta', 'sintomas', 'Revisar recetas o alimentos asociados a molestias.');
            $this->agregarSiCuenta($alertas, $registros->filter(fn ($r) => $r->consiguio_ingredientes === false || $r->motivo_no_cumplimiento === 'no_tenia_ingredientes')->count(), 'ingredientes_no_conseguidos', 'Ingredientes no conseguidos', 'La paciente reportó dificultades para conseguir ingredientes.', 'media', 'ingredientes', 'Simplificar lista de compras o proponer sustituciones.');
            $this->agregarSiCuenta($alertas, $registros->filter(fn ($r) => $r->nivel_agrado === 'no_me_gusto' || $r->desea_repetir === false)->count(), 'recetas_rechazadas', 'Recetas con baja aceptación', 'Varias recetas no fueron aceptadas por la paciente.', 'media', 'recetas', 'Evitar temporalmente recetas con baja aceptación.');
        }

        if ($planId && data_get($seguimiento, 'estado_periodo') !== 'no_iniciado') {
            $this->agregarAlertasSintomas($alertas, data_get($seguimiento, 'seguimiento_sintomas.indicadores', []));
        }

        $pendientesLectura = $paciente->retroalimentacionesPaciente()->where('visible_para_paciente', true)->where('leido_por_paciente', false)->count();
        if ($pendientesLectura > 0) {
            $this->agregar($alertas, 'retroalimentaciones_no_leidas', 'Retroalimentaciones pendientes', 'La paciente tiene retroalimentaciones pendientes de lectura.', $pendientesLectura >= 3 ? 'media' : 'baja', 'comunicacion', 'Reforzar la comunicación y confirmar la lectura de las indicaciones.', 'retroalimentaciones_paciente');
        }

        if ($paciente->planesAlimentarios()->whereIn('estado_plan', ['sugerido', 'en_revision'])->exists()) {
            $this->agregar($alertas, 'plan_pendiente_revision', 'Plan pendiente de revisión', 'Existe una planificación pendiente de revisión profesional.', 'baja', 'plan', 'Revisar y aprobar, ajustar o rechazar la planificación pendiente.', 'planes_alimentarios');
        }

        $alertas = collect($alertas)->unique('codigo')->values()->all();
        $conteos = collect($alertas)->countBy('severidad');

        return ['resumen' => [
            'total' => count($alertas), 'altas' => $conteos->get('alta', 0),
            'medias' => $conteos->get('media', 0), 'bajas' => $conteos->get('baja', 0),
            'tiene_alertas_criticas' => $conteos->get('alta', 0) > 0,
        ], 'alertas' => $alertas];
    }

    private function agregarSiCuenta(array &$alertas, int $cuenta, string $codigo, string $titulo, string $mensaje, string $severidad, string $categoria, string $recomendacion): void
    {
        if ($cuenta >= 2) $this->agregar($alertas, $codigo, $titulo, $mensaje, $severidad, $categoria, $recomendacion, 'seguimiento_comidas');
    }

    private function agregarAlertasComidasSinMarcar(array &$alertas, int $planId, $registros): void
    {
        $ahora = Carbon::now('America/La_Paz');
        $plan = PlanAlimentario::query()->with('dias.comidas')->find($planId);
        if (! $plan || $plan->fecha_inicio?->gt($ahora->copy()->startOfDay())) return;

        $registradas = $registros->pluck('id_comida_plan_alimentario');
        $vencidas = $plan->dias->flatMap(function ($dia) use ($ahora) {
            if (! $dia->fecha || $dia->fecha->gt($ahora->copy()->startOfDay())) return collect();
            return $dia->comidas->filter(function ($comida) use ($dia, $ahora) {
                if ($dia->fecha->lt($ahora->copy()->startOfDay())) return true;
                if (! $comida->hora_sugerida) return false;
                return Carbon::parse($dia->fecha->toDateString().' '.$comida->hora_sugerida, 'America/La_Paz')->addHour()->lte($ahora);
            });
        })->reject(fn ($comida) => $registradas->contains($comida->getKey()));

        if ($vencidas->isEmpty()) return;
        $tipos = $vencidas->pluck('tipo_comida')->unique()->map(fn ($tipo) => str_replace('_', ' ', $tipo))->implode(', ');
        $cantidad = $vencidas->count();
        $this->agregar($alertas, 'comidas_sin_marcar', 'Comidas pendientes de registro', "Hay {$cantidad} comida(s) cuyo horario ya pasó sin ser marcadas: {$tipos}.", 'media', 'seguimiento', 'Contactar a la paciente o recordarle registrar si completó, reemplazó o no realizó estas comidas.', 'motor_experto_seguimiento');
    }

    private function agregarAlertasSintomas(array &$alertas, array $indicadores): void
    {
        $reglas = [
            'hambre_nocturna_frecuente' => ['Hambre nocturna frecuente', 'La paciente reporta hambre nocturna frecuente.', 'Revisar la distribución y saciedad de cena y merienda.'],
            'ansiedad_comida_frecuente' => ['Ansiedad por comida frecuente', 'La paciente reporta ansiedad por comida frecuente.', 'Valorar estrategias de alimentación consciente y apoyo profesional.'],
            'antojos_dulces_frecuentes' => ['Antojos dulces frecuentes', 'La paciente reporta antojos dulces frecuentes.', 'Revisar carbohidratos simples, horarios y saciedad.'],
            'hinchazon_frecuente' => ['Hinchazón frecuente', 'La paciente reporta hinchazón abdominal frecuente.', 'Evaluar alimentos y preparaciones asociados.'],
            'baja_energia_frecuente' => ['Baja energía frecuente', 'La paciente reporta baja energía frecuente.', 'Revisar suficiencia energética, hidratación y horarios.'],
            'sueno_deficiente_frecuente' => ['Sueño deficiente frecuente', 'La paciente reporta sueño deficiente frecuente.', 'Reforzar higiene del sueño y revisar horarios de alimentación.'],
            'actividad_fisica_baja' => ['Actividad física baja', 'La paciente reporta actividad física baja.', 'Plantear una progresión de actividad acorde a su condición clínica.'],
        ];
        foreach ($reglas as $codigo => [$titulo, $mensaje, $recomendacion]) {
            if ($indicadores[$codigo] ?? false) $this->agregar($alertas, $codigo, $titulo, $mensaje, 'media', 'sintomas', $recomendacion, 'seguimiento_sintomas');
        }
    }

    private function agregar(array &$alertas, string $codigo, string $titulo, string $mensaje, string $severidad, string $categoria, string $recomendacion, string $origen): void
    {
        $alertas[] = compact('codigo', 'titulo', 'mensaje', 'severidad', 'categoria', 'recomendacion', 'origen');
    }
}
