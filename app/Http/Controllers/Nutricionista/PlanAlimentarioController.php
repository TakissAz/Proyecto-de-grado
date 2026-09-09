<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Models\Alimento;
use App\Models\ComidaPlanAlimentario;
use App\Models\ComponenteComidaPlan;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\Receta;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\User;
use App\Services\Nutricion\CalculadoraTotalesPlanAlimentarioService;
use App\Services\Nutricion\GeneradorPlanSemanalService;
use App\Services\Nutricion\PerfilNutricionalService;
use App\Services\Nutricion\ElegibilidadPlanificacionNutricionalService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PlanAlimentarioController extends Controller
{
    public function __construct(
        private readonly GeneradorPlanSemanalService $generador,
        private readonly CalculadoraTotalesPlanAlimentarioService $calculadora,
        private readonly PerfilNutricionalService $perfil,
        private readonly ElegibilidadPlanificacionNutricionalService $elegibilidadService,
    ) {}

    public function index(Paciente $paciente): JsonResponse
    {
        return response()->json(['success' => true, 'data' => [
            'principal' => $this->perfil->planAlimentarioPrincipal($paciente),
            'planes' => $paciente->planesAlimentarios()->latest('id_plan_alimentario')->get(),
        ]]);
    }

    public function generarDesdeRecomendacion(Request $request, RecomendacionNutricionalExperta $recomendacion): JsonResponse
    {
        $datos = $request->validate([
            // La nutricionista puede preparar un plan para cualquier periodo requerido.
            'fecha_inicio' => ['nullable', 'date'],
            'reemplazar_plan_id' => ['nullable', 'integer'],
        ]);
        $paciente = Paciente::query()->findOrFail($recomendacion->id_paciente);
        $elegibilidad = $this->elegibilidadService->evaluar($paciente);
        if (! $elegibilidad['elegible']) {
            throw ValidationException::withMessages([
                'diagnostico_endocrinologico' => $elegibilidad['motivo'],
            ]);
        }
        if (! in_array($recomendacion->estado_validacion_experta, ['aprobado', 'validado'], true)) {
            throw ValidationException::withMessages([
                'recomendacion' => 'Solo se puede generar el plan desde una recomendación aprobada o validada.',
            ]);
        }
        /** @var User $usuario */
        $usuario = Auth::user();
        $planAnterior = null;
        if (! empty($datos['reemplazar_plan_id'])) {
            $planAnterior = $paciente->planesAlimentarios()
                ->whereKey($datos['reemplazar_plan_id'])
                ->firstOrFail();

            if ($planAnterior->generado_por_sistema_experto || ! in_array($planAnterior->estado_plan, ['sugerido', 'en_revision'], true)) {
                throw ValidationException::withMessages([
                    'plan' => 'Solo se puede reemplazar un borrador manual que aún esté en revisión.',
                ]);
            }
        } elseif ($paciente->planesAlimentarios()->whereIn('estado_plan', ['activo', 'aprobado', 'sugerido', 'en_revision'])->exists()) {
            throw ValidationException::withMessages([
                'plan' => 'El paciente ya tiene un plan vigente. Finalízalo antes de generar una nueva propuesta.',
            ]);
        }

        $plan = DB::transaction(function () use ($planAnterior, $recomendacion, $usuario, $datos) {
            if ($planAnterior) {
                $planAnterior->update([
                    'estado_plan' => 'rechazado',
                    'observaciones' => trim(($planAnterior->observaciones ? $planAnterior->observaciones.' ' : '').'Borrador manual reemplazado por una propuesta del sistema experto.'),
                ]);
            }

            return $this->generador->generarDesdeRecomendacion($recomendacion, $usuario, $datos);
        });

        return response()->json(['success' => true, 'message' => $planAnterior ? 'Borrador manual reemplazado por una propuesta experta.' : 'Plan semanal generado correctamente.', 'data' => $this->detalle($plan)], 201);
    }

    public function crearManual(Request $request, Paciente $paciente): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            // Un borrador manual también puede corresponder a un periodo anterior o futuro.
            'fecha_inicio' => ['required', 'date'],
            'objetivo_plan' => ['nullable', 'string', 'max:500'],
        ]);
        if ($paciente->planesAlimentarios()->whereIn('estado_plan', ['sugerido', 'en_revision', 'aprobado', 'activo'])->exists()) {
            throw ValidationException::withMessages(['plan' => 'El paciente ya tiene una planificación vigente o pendiente de revisión.']);
        }

        $requerimiento = $paciente->requerimientosNutricionales()->latest('id_requerimiento_nutricional')->first();
        if (! $requerimiento) {
            throw ValidationException::withMessages(['requerimiento' => 'Primero registra el cálculo nutricional para usar sus metas en el plan manual.']);
        }
        $inicio = CarbonImmutable::parse($datos['fecha_inicio'])->startOfDay();
        $nombres = [1 => 'Lunes', 2 => 'Martes', 3 => 'Miércoles', 4 => 'Jueves', 5 => 'Viernes', 6 => 'Sábado', 7 => 'Domingo'];
        $tiempos = [
            'desayuno' => ['hora' => '08:00', 'orden' => 1],
            'almuerzo' => ['hora' => '13:00', 'orden' => 2],
            'merienda' => ['hora' => '16:30', 'orden' => 3],
            'cena' => ['hora' => '19:30', 'orden' => 4],
        ];

        /** @var PlanAlimentario $plan */
        $plan = DB::transaction(function () use ($paciente, $requerimiento, $datos, $inicio, $nombres, $tiempos): PlanAlimentario {
            $plan = PlanAlimentario::query()->create([
                'id_paciente' => $paciente->getKey(),
                'id_nutricionista' => Auth::id(),
                'id_requerimiento_nutricional' => $requerimiento->getKey(),
                'id_recomendacion_nutricional_experta' => null,
                'nombre' => $datos['nombre'],
                'fecha_inicio' => $inicio->toDateString(),
                'fecha_fin' => $inicio->addDays(6)->toDateString(),
                'duracion_dias' => 7,
                'objetivo_plan' => $datos['objetivo_plan'] ?? 'Planificación alimentaria elaborada manualmente por nutrición.',
                'calorias_objetivo' => $requerimiento->calorias_objetivo,
                'proteinas_objetivo' => $requerimiento->proteinas_diarias,
                'carbohidratos_objetivo' => $requerimiento->carbohidratos_diarios,
                'grasas_objetivo' => $requerimiento->grasas_diarias,
                'fibra_objetivo' => $requerimiento->fibra_diaria,
                'estado_plan' => 'en_revision',
                'generado_por_sistema_experto' => false,
                'observaciones' => 'Plan creado manualmente por nutrición. Pendiente de completar y validar.',
                'estado' => 'activo',
            ]);
            foreach (range(1, 7) as $numeroDia) {
                $fecha = $inicio->addDays($numeroDia - 1);
                $dia = $plan->dias()->create(['numero_dia' => $numeroDia, 'nombre_dia' => $nombres[$fecha->dayOfWeekIso], 'fecha' => $fecha->toDateString(), 'estado' => 'activo']);
                foreach ($tiempos as $tipo => $configuracion) {
                    $dia->comidas()->create(['tipo_comida' => $tipo, 'hora_sugerida' => $configuracion['hora'], 'nombre_comida' => ucfirst($tipo), 'orden' => $configuracion['orden'], 'estado' => 'activo']);
                }
            }
            return $plan;
        });

        return response()->json(['success' => true, 'message' => 'Estructura manual de 7 días creada. Completa las recetas antes de aprobarla.', 'data' => $this->detalle($plan)], 201);
    }

    public function show(PlanAlimentario $plan): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->detalle($plan)]);
    }

    public function detalleVista(PlanAlimentario $plan): Response
    {
        $plan = $this->detalle($plan);

        return Inertia::render('Nutricionista/Planes/Detalle', [
            'plan' => $plan,
            'pacienteId' => $plan->id_paciente,
            'recomendacion' => $plan->recomendacionNutricionalExperta,
            'alimentos' => Alimento::query()->where('estado', 'activo')->orderBy('nombre')->get(),
            'recetas' => Receta::query()->where('estado', 'activo')->with('recetaAlimentos.alimento')->orderBy('nombre')->limit(200)->get(),
        ]);
    }

    public function actualizarEstado(Request $request, PlanAlimentario $plan): JsonResponse
    {
        $datos = $request->validate([
            'estado_plan' => ['required', Rule::in(['en_revision', 'aprobado', 'rechazado', 'activo', 'finalizado'])],
            'observaciones' => ['nullable', 'string', 'max:2000'],
        ]);
        if (! in_array($plan->estado_plan, ['sugerido', 'en_revision', 'aprobado', 'rechazado'], true)) {
            throw ValidationException::withMessages([
                'estado_plan' => 'El estado de un plan activo o finalizado ya no puede modificarse.',
            ]);
        }

        if ($datos['estado_plan'] === 'aprobado') {
            $plan->load('dias.comidas.componentes');
            if ($plan->dias->count() !== 7
                || $plan->dias->contains(fn ($dia) => $dia->comidas->count() !== 4)
                || $plan->dias->flatMap->comidas->contains(fn ($comida) => $comida->componentes->isEmpty())) {
                throw ValidationException::withMessages([
                    'estado_plan' => 'El plan debe contener exactamente 7 días, 4 comidas por día y al menos un componente en cada comida.',
                ]);
            }

            $this->asegurarPeriodoSemanal($plan);
        }

        $plan->update([
            'estado_plan' => $datos['estado_plan'],
            'observaciones' => $datos['observaciones'] ?? $plan->observaciones,
            'fecha_aprobacion' => $datos['estado_plan'] === 'aprobado' ? now() : null,
            'aprobado_por' => $datos['estado_plan'] === 'aprobado' ? Auth::id() : null,
        ]);

        return response()->json(['success' => true, 'message' => 'Estado del plan actualizado.', 'data' => $this->detalle($plan)]);
    }

    private function asegurarPeriodoSemanal(PlanAlimentario $plan): void
    {
        $inicio = $plan->fecha_inicio
            ? CarbonImmutable::parse($plan->fecha_inicio)
            : CarbonImmutable::tomorrow();
        $nombres = [1 => 'Lunes', 2 => 'Martes', 3 => 'Miércoles', 4 => 'Jueves', 5 => 'Viernes', 6 => 'Sábado', 7 => 'Domingo'];

        $plan->update([
            'fecha_inicio' => $inicio->toDateString(),
            'fecha_fin' => $inicio->addDays(6)->toDateString(),
            'duracion_dias' => 7,
        ]);

        foreach ($plan->dias()->orderBy('numero_dia')->get() as $indice => $dia) {
            $fecha = $inicio->addDays($indice);
            $dia->update([
                'numero_dia' => $indice + 1,
                'nombre_dia' => $nombres[$fecha->dayOfWeekIso],
                'fecha' => $fecha->toDateString(),
            ]);
        }
    }

    public function actualizarComida(Request $request, ComidaPlanAlimentario $comida): JsonResponse
    {
        $this->asegurarEditable($comida->dia->plan);
        $comida->update($request->validate([
            'hora_sugerida' => ['sometimes', 'nullable', 'date_format:H:i'],
            'nombre_comida' => ['sometimes', 'required', 'string', 'max:150'],
            'observaciones' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]));
        $this->recalcularDesde($comida);

        return response()->json(['success' => true, 'message' => 'Comida actualizada.', 'data' => $comida->refresh()]);
    }

    public function crearComponente(Request $request, ComidaPlanAlimentario $comida): JsonResponse
    {
        $this->asegurarEditable($comida->dia->plan);
        $datos = $this->validarComponente($request, true);
        $datos['observaciones'] = $this->marcarModificacion($datos['observaciones'] ?? null);
        $componente = $comida->componentes()->create($this->fotografia($datos) + [
            'orden' => ($comida->componentes()->max('orden') ?? 0) + 1,
            'estado' => 'activo',
        ]);
        $this->recalcularDesde($comida);

        return response()->json(['success' => true, 'message' => 'Componente agregado.', 'data' => $componente->refresh()], 201);
    }

    public function actualizarComponente(Request $request, ComponenteComidaPlan $componente): JsonResponse
    {
        $comida = $componente->comida;
        $this->asegurarEditable($comida->dia->plan);
        $request->merge(array_merge(
            $componente->only([
                'tipo_componente', 'id_alimento', 'id_receta', 'nombre_manual',
                'cantidad', 'unidad', 'calorias', 'proteinas',
                'carbohidratos', 'grasas', 'fibra', 'observaciones',
            ]),
            $request->all()
        ));
        $datos = $this->validarComponente($request, false);
        $base = array_merge($componente->only(['tipo_componente', 'id_alimento', 'id_receta', 'nombre_manual', 'cantidad', 'unidad', 'calorias', 'proteinas', 'carbohidratos', 'grasas', 'fibra', 'observaciones']), $datos);
        $base['observaciones'] = $this->marcarModificacion($base['observaciones'] ?? null);
        $componente->update($this->fotografia($base));
        $this->recalcularDesde($comida);

        return response()->json(['success' => true, 'message' => 'Componente actualizado.', 'data' => $componente->refresh()]);
    }

    public function eliminarComponente(ComponenteComidaPlan $componente): JsonResponse
    {
        $comida = $componente->comida;
        $this->asegurarEditable($comida->dia->plan);
        $componente->delete();
        $this->recalcularDesde($comida);

        return response()->json(['success' => true, 'message' => 'Componente eliminado.']);
    }

    private function validarComponente(Request $request, bool $crear): array
    {
        return $request->validate([
            'tipo_componente' => [$crear ? 'required' : 'sometimes', Rule::in(['alimento', 'receta', 'manual'])],
            'id_alimento' => ['nullable', 'required_if:tipo_componente,alimento', Rule::exists('alimentos', 'id_alimento')->where('estado', 'activo')],
            'id_receta' => ['nullable', 'required_if:tipo_componente,receta', Rule::exists('recetas', 'id_receta')->where('estado', 'activo')],
            'nombre_manual' => ['nullable', 'required_if:tipo_componente,manual', 'string', 'max:150'],
            'cantidad' => ['required', 'numeric', 'gt:0'], 'unidad' => ['required', 'string', 'max:50'],
            'calorias' => ['nullable', 'required_if:tipo_componente,manual', 'numeric', 'min:0'],
            'proteinas' => ['nullable', 'required_if:tipo_componente,manual', 'numeric', 'min:0'],
            'carbohidratos' => ['nullable', 'required_if:tipo_componente,manual', 'numeric', 'min:0'],
            'grasas' => ['nullable', 'required_if:tipo_componente,manual', 'numeric', 'min:0'],
            'fibra' => ['nullable', 'required_if:tipo_componente,manual', 'numeric', 'min:0'],
            'observaciones' => ['nullable', 'string', 'max:1000'],
        ]);
    }

    private function fotografia(array $datos): array
    {
        $tipo = $datos['tipo_componente'];
        $cantidad = (float) ($datos['cantidad'] ?? 1);
        if ($tipo === 'alimento') {
            $alimento = Alimento::query()->where('estado', 'activo')->findOrFail($datos['id_alimento']);
            $factor = $cantidad / max((float) $alimento->cantidad_base, 0.01);
            $datos = array_merge($datos, ['id_receta' => null, 'nombre_manual' => null], $this->nutrientes($alimento, $factor, false));
        } elseif ($tipo === 'receta') {
            $receta = Receta::query()->where('estado', 'activo')->findOrFail($datos['id_receta']);
            $datos = array_merge($datos, ['id_alimento' => null, 'nombre_manual' => null], $this->nutrientes($receta, $cantidad, true));
        } else {
            $datos['id_alimento'] = $datos['id_receta'] = null;
        }
        return $datos;
    }

    private function nutrientes(object $origen, float $factor, bool $totales): array
    {
        $sufijo = fn (string $campo) => $totales ? ($campo === 'fibra' ? 'fibra_total' : "{$campo}_totales") : $campo;
        return collect(['calorias', 'proteinas', 'carbohidratos', 'grasas', 'fibra'])
            ->mapWithKeys(fn ($campo) => [$campo => round((float) $origen->{$sufijo($campo)} * $factor, 2)])->all();
    }

    private function recalcularDesde(ComidaPlanAlimentario $comida): void
    {
        $this->calculadora->recalcularComida($comida);
        $this->calculadora->recalcularDia($comida->dia);
        $this->calculadora->recalcularPlan($comida->dia->plan);
    }

    private function asegurarEditable(PlanAlimentario $plan): void
    {
        if (! in_array($plan->estado_plan, ['sugerido', 'en_revision'], true)) {
            throw ValidationException::withMessages([
                'plan' => 'Este plan ya fue validado y no puede editarse.',
            ]);
        }
    }

    private function marcarModificacion(?string $observaciones): string
    {
        $marca = 'Modificado manualmente por nutricionista.';
        $texto = trim((string) $observaciones);

        return str_contains($texto, $marca) ? $texto : trim($texto.' '.$marca);
    }

    private function detalle(PlanAlimentario $plan): PlanAlimentario
    {
        return $plan->refresh()->load(['recomendacionNutricionalExperta', 'requerimientoNutricional', 'dias.comidas.componentes.alimento', 'dias.comidas.componentes.receta.recetaAlimentos.alimento']);
    }
}
