<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Http\Requests\Nutricion\StoreConsultaNutricionalRequest;
use App\Http\Requests\Nutricion\StoreEvaluacionNutricionalRequest;
use App\Http\Requests\Nutricion\StoreHabitoAlimentarioRequest;
use App\Http\Requests\Nutricion\StoreObjetivoNutricionalRequest;
use App\Http\Requests\Nutricion\StorePreferenciaAlimentariaRequest;
use App\Http\Requests\Nutricion\StoreRestriccionAlimentariaRequest;
use App\Http\Requests\Nutricion\UpdateConsultaNutricionalRequest;
use App\Http\Requests\Nutricion\UpdateEvaluacionNutricionalRequest;
use App\Http\Requests\Nutricion\UpdateHabitoAlimentarioRequest;
use App\Http\Requests\Nutricion\UpdateObjetivoNutricionalRequest;
use App\Http\Requests\Nutricion\UpdatePreferenciaAlimentariaRequest;
use App\Http\Requests\Nutricion\UpdateRestriccionAlimentariaRequest;
use App\Models\ConsultaNutricional;
use App\Models\EvaluacionNutricional;
use App\Models\HabitoAlimentario;
use App\Models\ObjetivoNutricional;
use App\Models\Paciente;
use App\Models\PreferenciaAlimentaria;
use App\Models\RestriccionAlimentaria;
use App\Models\Alimento;
use App\Models\Receta;
use App\Services\Nutricion\PerfilNutricionalService;
use App\Services\Nutricion\RequerimientoNutricionalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PerfilNutricionalController extends Controller
{
    public function __construct(
        private readonly PerfilNutricionalService $service,
        private readonly RequerimientoNutricionalService $requerimientoService,
    ) {}

    public function index(Paciente $paciente): Response
    {
        $ultima = fn (string $relacion, string $fecha, string $id) => $paciente->{$relacion}()
            ->where('estado', true)->latest($fecha)->latest($id)->first();

        return Inertia::render('Nutricionista/Pacientes/PerfilNutricional/Index', [
            'paciente' => $paciente,
            'consulta' => $ultima('consultasNutricionales', 'fecha_consulta', 'id_consulta_nutricional'),
            'evaluacion' => $ultima('evaluacionesNutricionales', 'fecha_evaluacion', 'id_evaluacion_nutricional'),
            'habitos' => $paciente->habitosAlimentarios()->where('estado', true)->latest('id_habito_alimentario')->first(),
            'preferencias' => $paciente->preferenciasAlimentarias()->where('estado', true)->latest('id_preferencia_alimentaria')->first(),
            'restricciones' => $paciente->restriccionesAlimentarias()->where('estado', true)->latest('id_restriccion_alimentaria')->first(),
            'objetivo' => $paciente->objetivosNutricionales()->where('estado', true)->latest('id_objetivo_nutricional')->first(),
            'requerimientoNutricional' => $paciente->requerimientosNutricionales()
                ->where('estado', true)
                ->whereNull('deleted_at')
                ->latest('fecha_calculo')
                ->latest('created_at')
                ->first(),
            'recomendacionExperta' => $this->service
                ->recomendacionExpertaPrincipal($paciente),
            'planAlimentarioPrincipal' => $this->service->planAlimentarioPrincipal($paciente),
            'seguimientoPaciente' => $this->service->seguimientoPaciente($paciente),
            'retroalimentacionesPaciente' => $this->service->historialRetroalimentaciones($paciente),
            'contextoAjustePlan' => $this->service->contextoAjustePlan($paciente),
            'recomendacionExpertaAprobada' => $this->service->recomendacionExpertaAprobada($paciente),
            'puedeGenerarPlanSemanal' => $this->service->recomendacionExpertaAprobada($paciente) !== null,
            'alimentosPlan' => Alimento::query()->where('estado', 'activo')->orderBy('nombre')->limit(200)->get([
                'id_alimento', 'nombre', 'grupo_alimentario', 'unidad_base', 'cantidad_base', 'calorias', 'proteinas', 'carbohidratos', 'grasas', 'fibra',
            ]),
            'recetasPlan' => Receta::query()->where('estado', 'activo')->orderBy('nombre')->limit(200)->get([
                'id_receta', 'nombre', 'tipo_comida', 'porciones', 'calorias_totales', 'proteinas_totales', 'carbohidratos_totales', 'grasas_totales', 'fibra_total',
            ]),
            'opciones' => [
                'nivel_actividad' => ['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'],
                'estado_consulta' => ['abierta', 'en_seguimiento', 'cerrada', 'anulada'],
                'frecuencias' => ['nunca', 'ocasional', 'frecuente', 'diario'],
                'objetivo_principal' => ['perdida_peso', 'mejora_resistencia_insulina', 'control_glucemico', 'mejora_composicion_corporal', 'mantenimiento', 'educacion_nutricional', 'otro'],
                'enfoque_nutricional' => ['bajo_indice_glucemico', 'alto_en_fibra', 'alto_en_proteina', 'control_calorico', 'antiinflamatorio', 'balanceado'],
                'prioridad' => ['baja', 'media', 'alta'],
            ],
        ]);
    }

    public function storeConsulta(StoreConsultaNutricionalRequest $request, Paciente $paciente): RedirectResponse
    {
        $this->service->crearConsulta($paciente, Auth::id(), $request->validated());
        return back()->with('success', 'Consulta nutricional registrada.');
    }
    public function updateConsulta(UpdateConsultaNutricionalRequest $request, Paciente $paciente, ConsultaNutricional $consulta): RedirectResponse
    {
        $this->service->actualizarConsulta($paciente, $consulta, $request->validated());
        return back()->with('success', 'Consulta nutricional actualizada.');
    }
    public function storeEvaluacion(StoreEvaluacionNutricionalRequest $request, Paciente $paciente): RedirectResponse
    {
        $this->service->crearEvaluacion($paciente, Auth::id(), $request->validated());
        return back()->with('success', 'Evaluación nutricional registrada.');
    }
    public function updateEvaluacion(UpdateEvaluacionNutricionalRequest $request, Paciente $paciente, EvaluacionNutricional $evaluacion): RedirectResponse
    {
        $this->service->actualizarEvaluacion($paciente, $evaluacion, $request->validated());
        return back()->with('success', 'Evaluación nutricional actualizada.');
    }
    public function storeHabitos(StoreHabitoAlimentarioRequest $request, Paciente $paciente): RedirectResponse
    {
        $this->service->crearHabito($paciente, Auth::id(), $request->validated());
        return back()->with('success', 'Hábitos alimentarios registrados.');
    }
    public function updateHabitos(UpdateHabitoAlimentarioRequest $request, Paciente $paciente, HabitoAlimentario $habito): RedirectResponse
    {
        $this->service->actualizarHabito($paciente, $habito, $request->validated());
        return back()->with('success', 'Hábitos alimentarios actualizados.');
    }
    public function storePreferencias(StorePreferenciaAlimentariaRequest $request, Paciente $paciente): RedirectResponse
    {
        $this->service->crearPreferencia($paciente, Auth::id(), $request->validated());
        return back()->with('success', 'Preferencias alimentarias registradas.');
    }
    public function updatePreferencias(UpdatePreferenciaAlimentariaRequest $request, Paciente $paciente, PreferenciaAlimentaria $preferencia): RedirectResponse
    {
        $this->service->actualizarPreferencia($paciente, $preferencia, $request->validated());
        return back()->with('success', 'Preferencias alimentarias actualizadas.');
    }
    public function storeRestricciones(StoreRestriccionAlimentariaRequest $request, Paciente $paciente): RedirectResponse
    {
        $this->service->crearRestriccion($paciente, Auth::id(), $request->validated());
        return back()->with('success', 'Restricciones alimentarias registradas.');
    }
    public function updateRestricciones(UpdateRestriccionAlimentariaRequest $request, Paciente $paciente, RestriccionAlimentaria $restriccion): RedirectResponse
    {
        $this->service->actualizarRestriccion($paciente, $restriccion, $request->validated());
        return back()->with('success', 'Restricciones alimentarias actualizadas.');
    }
    public function storeObjetivo(StoreObjetivoNutricionalRequest $request, Paciente $paciente): RedirectResponse
    {
        $this->service->crearObjetivo($paciente, Auth::id(), $request->validated());
        return back()->with('success', 'Objetivo nutricional registrado.');
    }
    public function updateObjetivo(UpdateObjetivoNutricionalRequest $request, Paciente $paciente, ObjetivoNutricional $objetivo): RedirectResponse
    {
        $this->service->actualizarObjetivo($paciente, $objetivo, $request->validated());
        return back()->with('success', 'Objetivo nutricional actualizado.');
    }

    public function calcularRequerimientos(Paciente $paciente): RedirectResponse
    {
        $evaluacion = $this->requerimientoService->obtenerUltimaEvaluacionActiva($paciente);

        if (! $evaluacion) {
            return back()->with('error', 'Debe registrar una evaluación nutricional antes de calcular requerimientos.');
        }

        if ($evaluacion->peso === null || $evaluacion->talla === null) {
            return back()->with('error', 'Peso y talla son necesarios para calcular requerimientos.');
        }

        if ((float) $evaluacion->talla <= 0) {
            return back()->with('error', 'La talla debe ser mayor a cero.');
        }

        try {
            $this->requerimientoService->calcularYCrear($paciente, (int) Auth::id());

            return back()->with('success', 'Requerimientos nutricionales calculados correctamente.');
        } catch (ValidationException) {
            return back()->with('error', 'No se pudieron calcular los requerimientos nutricionales.');
        } catch (Throwable $exception) {
            report($exception);

            return back()->with('error', 'No se pudieron calcular los requerimientos nutricionales.');
        }
    }

    // ─── Historiales ────────────────────────────────────────────────────

    public function historialEvaluaciones(Paciente $paciente): Response
    {
        return Inertia::render('Nutricionista/Pacientes/PerfilNutricional/HistorialEvaluaciones', [
            'paciente' => $paciente,
            'registros' => $paciente->evaluacionesNutricionales()->latest('fecha_evaluacion')->get(),
        ]);
    }

    public function historialHabitos(Paciente $paciente): Response
    {
        return Inertia::render('Nutricionista/Pacientes/PerfilNutricional/HistorialHabitos', [
            'paciente' => $paciente,
            'registros' => $paciente->habitosAlimentarios()->latest('created_at')->get(),
        ]);
    }

    public function historialPreferencias(Paciente $paciente): Response
    {
        return Inertia::render('Nutricionista/Pacientes/PerfilNutricional/HistorialPreferencias', [
            'paciente' => $paciente,
            'registros' => $paciente->preferenciasAlimentarias()->latest('created_at')->get(),
        ]);
    }

    public function historialRestricciones(Paciente $paciente): Response
    {
        return Inertia::render('Nutricionista/Pacientes/PerfilNutricional/HistorialRestricciones', [
            'paciente' => $paciente,
            'registros' => $paciente->restriccionesAlimentarias()->latest('created_at')->get(),
        ]);
    }

    public function historialObjetivos(Paciente $paciente): Response
    {
        return Inertia::render('Nutricionista/Pacientes/PerfilNutricional/HistorialObjetivos', [
            'paciente' => $paciente,
            'registros' => $paciente->objetivosNutricionales()->latest('created_at')->get(),
        ]);
    }
}
