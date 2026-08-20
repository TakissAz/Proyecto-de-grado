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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PlanAlimentarioController extends Controller
{
    public function __construct(
        private readonly GeneradorPlanSemanalService $generador,
        private readonly CalculadoraTotalesPlanAlimentarioService $calculadora,
        private readonly PerfilNutricionalService $perfil,
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
        $datos = $request->validate(['fecha_inicio' => ['nullable', 'date']]);
        if (! in_array($recomendacion->estado_validacion_experta, ['aprobado', 'validado'], true)) {
            throw ValidationException::withMessages([
                'recomendacion' => 'Solo se puede generar el plan desde una recomendación aprobada o validada.',
            ]);
        }
        /** @var User $usuario */
        $usuario = Auth::user();
        $plan = $this->generador->generarDesdeRecomendacion($recomendacion, $usuario, $datos);

        return response()->json(['success' => true, 'message' => 'Plan semanal generado correctamente.', 'data' => $this->detalle($plan)], 201);
    }

    public function show(PlanAlimentario $plan): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->detalle($plan)]);
    }

    public function actualizarEstado(Request $request, PlanAlimentario $plan): JsonResponse
    {
        $datos = $request->validate([
            'estado_plan' => ['required', Rule::in(['en_revision', 'aprobado', 'rechazado', 'activo', 'finalizado'])],
            'observaciones' => ['nullable', 'string', 'max:2000'],
        ]);
        $this->asegurarEditable($plan);

        if ($datos['estado_plan'] === 'aprobado') {
            $plan->load('dias.comidas.componentes');
            if ($plan->dias->isEmpty()
                || $plan->dias->contains(fn ($dia) => $dia->comidas->isEmpty())
                || $plan->dias->flatMap->comidas->contains(fn ($comida) => $comida->componentes->isEmpty())) {
                throw ValidationException::withMessages(['estado_plan' => 'No se puede aprobar un plan sin días, comidas y componentes.']);
            }
        }

        $plan->update([
            'estado_plan' => $datos['estado_plan'],
            'observaciones' => $datos['observaciones'] ?? $plan->observaciones,
            'fecha_aprobacion' => $datos['estado_plan'] === 'aprobado' ? now() : $plan->fecha_aprobacion,
            'aprobado_por' => $datos['estado_plan'] === 'aprobado' ? Auth::id() : $plan->aprobado_por,
        ]);

        return response()->json(['success' => true, 'message' => 'Estado del plan actualizado.', 'data' => $this->detalle($plan)]);
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
        return $plan->refresh()->load(['recomendacionNutricionalExperta', 'requerimientoNutricional', 'dias.comidas.componentes.alimento', 'dias.comidas.componentes.receta']);
    }
}
