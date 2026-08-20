<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Models\PlanAlimentario;
use App\Services\Nutricion\ExplicacionComponentePlanService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class ReportePlanAlimentarioPdfController extends Controller
{
    public function __invoke(
        PlanAlimentario $plan,
        ExplicacionComponentePlanService $explicador
    ): Response {
        abort_unless(request()->user()?->tieneRol('nutricionista'), 403);

        $plan->loadMissing([
            'paciente.user', 'nutricionista', 'aprobador',
            'recomendacionNutricionalExperta.validadorExperto',
            'requerimientoNutricional',
            'dias.comidas.componentes.receta.alimentos',
            'dias.comidas.componentes.alimento',
        ]);

        $recomendacion = $plan->recomendacionNutricionalExperta;
        $hechos = $recomendacion?->hechos_utilizados ?? [];
        $dias = max((int) ($plan->duracion_dias ?: $plan->dias->count()), 1);
        $resumen = collect([
            ['nombre' => 'Calorías', 'unidad' => 'kcal', 'objetivo' => (float) $plan->calorias_objetivo * $dias, 'planificado' => (float) $plan->calorias_totales],
            ['nombre' => 'Proteínas', 'unidad' => 'g', 'objetivo' => (float) $plan->proteinas_objetivo * $dias, 'planificado' => (float) $plan->proteinas_totales],
            ['nombre' => 'Carbohidratos', 'unidad' => 'g', 'objetivo' => (float) $plan->carbohidratos_objetivo * $dias, 'planificado' => (float) $plan->carbohidratos_totales],
            ['nombre' => 'Grasas', 'unidad' => 'g', 'objetivo' => (float) $plan->grasas_objetivo * $dias, 'planificado' => (float) $plan->grasas_totales],
            ['nombre' => 'Fibra', 'unidad' => 'g', 'objetivo' => (float) $plan->fibra_objetivo * $dias, 'planificado' => (float) $plan->fibra_total],
        ])->map(function (array $fila): array {
            $fila['diferencia'] = $fila['planificado'] - $fila['objetivo'];
            $fila['porcentaje'] = $fila['objetivo'] > 0 ? ($fila['diferencia'] / $fila['objetivo']) * 100 : 0;
            $fila['alerta'] = $fila['objetivo'] > 0 && abs($fila['porcentaje']) > 15;
            return $fila;
        });

        $componentes = $plan->dias->flatMap->comidas->flatMap->componentes;
        foreach ($componentes as $componente) {
            $componente->setAttribute('explicacion_pdf', $explicador->extraer($componente->observaciones));
        }

        $datos = [
            'plan' => $plan,
            'paciente' => $plan->paciente,
            'nutricionista' => $plan->nutricionista,
            'recomendacion' => $recomendacion,
            'requerimiento' => $plan->requerimientoNutricional,
            'hechos' => $hechos,
            'fechaGeneracion' => now(),
            'resumen' => $resumen,
            'datosClinicos' => $this->datosClinicos($hechos),
            'datosNutricionales' => $this->datosNutricionales($hechos, $recomendacion),
            'contextoAlimentario' => $this->contextoAlimentario($hechos),
            'componentesManuales' => $componentes->where('tipo_componente', 'manual')->count(),
            'repeticiones' => $componentes->filter(fn ($c): bool => ($c->explicacion_pdf['advertencias'] ?? []) !== [])->count(),
            'desviaciones' => $resumen->where('alerta', true),
        ];

        return Pdf::loadView('pdf.nutricion.reporte-plan-alimentario', $datos)
            ->setPaper('a4')
            ->stream("reporte-plan-alimentario-{$plan->getKey()}.pdf");
    }

    private function datosClinicos(array $h): array
    {
        return [
            'PMOS confirmado' => $this->siNoEstudio($this->dato($h, ['diagnostico_pmos.diagnostico_confirmado', 'diagnostico_pmos_confirmado'])),
            'Fenotipo PMOS' => $this->dato($h, ['diagnostico_pmos.fenotipo_pmos', 'fenotipo_pmos']),
            'Severidad clínica' => $this->dato($h, ['diagnostico_pmos.severidad_clinica', 'severidad_clinica']),
            'Riesgo metabólico' => $this->dato($h, ['diagnostico_pmos.riesgo_metabolico', 'riesgo_metabolico']),
            'RI confirmada' => $this->siNoEstudio($this->dato($h, ['diagnostico_resistencia_insulina.resistencia_confirmada', 'resistencia_insulina_confirmada'])),
            'Grado RI' => $this->dato($h, ['diagnostico_resistencia_insulina.grado_resistencia', 'grado_resistencia']),
            'HOMA-IR' => $this->dato($h, ['diagnostico_resistencia_insulina.homa_ir', 'homa_ir']),
            'QUICKI' => $this->dato($h, ['diagnostico_resistencia_insulina.quicki', 'quicki']),
            'Riesgo de diabetes' => $this->dato($h, ['diagnostico_resistencia_insulina.riesgo_diabetes', 'riesgo_diabetes']),
            'Riesgo cardiometabólico' => $this->dato($h, ['diagnostico_resistencia_insulina.riesgo_cardiometabolico', 'riesgo_cardiometabolico']),
        ];
    }

    private function datosNutricionales(array $h, mixed $r): array
    {
        return [
            'Peso' => $this->dato($h, ['evaluacion_nutricional.peso', 'peso']),
            'Talla' => $this->dato($h, ['evaluacion_nutricional.talla', 'talla']),
            'IMC' => $this->dato($h, ['evaluacion_nutricional.imc', 'imc']),
            'Circunferencia de cintura' => $this->dato($h, ['evaluacion_nutricional.circunferencia_cintura', 'circunferencia_cintura']),
            'Actividad física' => $this->dato($h, ['evaluacion_nutricional.nivel_actividad', 'nivel_actividad']),
            'Objetivo nutricional' => $this->dato($h, ['objetivo_nutricional.objetivo_principal', 'objetivo_principal']),
            'Calorías sugeridas' => $r?->calorias_sugeridas,
            'Proteínas sugeridas' => $r?->proteinas_porcentaje !== null ? $r->proteinas_porcentaje.'%' : null,
            'Carbohidratos sugeridos' => $r?->carbohidratos_porcentaje !== null ? $r->carbohidratos_porcentaje.'%' : null,
            'Grasas sugeridas' => $r?->grasas_porcentaje !== null ? $r->grasas_porcentaje.'%' : null,
            'Fibra sugerida' => $r?->fibra_sugerida,
        ];
    }

    private function contextoAlimentario(array $h): array
    {
        $campos = [
            'Alergias' => ['restricciones_alimentarias.alergias', 'alergias'],
            'Intolerancias' => ['restricciones_alimentarias.intolerancias', 'intolerancias'],
            'Alimentos restringidos' => ['restricciones_alimentarias.alimentos_restringidos', 'alimentos_restringidos'],
            'Alimentos no tolerados' => ['restricciones_alimentarias.alimentos_no_tolerados', 'alimentos_no_tolerados'],
            'Alimentos rechazados' => ['restricciones_alimentarias.alimentos_rechazados', 'alimentos_rechazados'],
            'Alimentos preferidos' => ['preferencias_alimentarias.alimentos_preferidos', 'alimentos_preferidos'],
            'Comidas preferidas' => ['preferencias_alimentarias.comidas_preferidas', 'comidas_preferidas'],
            'Preparaciones preferidas' => ['preferencias_alimentarias.preparaciones_preferidas', 'preparaciones_preferidas'],
            'Sabores preferidos' => ['preferencias_alimentarias.sabores_preferidos', 'sabores_preferidos'],
        ];
        $resultado = collect($campos)->mapWithKeys(fn (array $rutas, string $etiqueta): array => [
            $etiqueta => $this->lista($this->dato($h, $rutas)),
        ])->all();
        $resultado['Hábitos relevantes'] = $this->habitos($h);
        return $resultado;
    }

    private function habitos(array $h): array
    {
        $habitos = [];
        foreach (['cena_tardia' => 'Cena tardía', 'ansiedad_por_comida' => 'Ansiedad por comida', 'hambre_nocturna' => 'Hambre nocturna'] as $campo => $texto) {
            if ($this->dato($h, ["habitos_alimentarios.{$campo}", $campo]) === true) $habitos[] = $texto;
        }
        foreach (['consumo_azucar' => 'Consumo de azúcar', 'consumo_ultraprocesados' => 'Consumo de ultraprocesados', 'consumo_bebidas_azucaradas' => 'Bebidas azucaradas'] as $campo => $texto) {
            $valor = $this->dato($h, ["habitos_alimentarios.{$campo}", $campo]);
            if ($valor !== null && $valor !== '') $habitos[] = "{$texto}: {$valor}";
        }
        return $habitos;
    }

    private function dato(array $datos, array $rutas): mixed
    {
        foreach ($rutas as $ruta) {
            $valor = data_get($datos, $ruta);
            if ($valor !== null) return $valor;
        }
        return null;
    }

    private function lista(mixed $valor): array
    {
        if (is_array($valor)) return array_values(array_filter($valor, fn ($v) => filled($v)));
        if (! filled($valor)) return [];
        return array_values(array_filter(array_map('trim', preg_split('/[,;\r\n]+/u', (string) $valor) ?: [])));
    }

    private function siNoEstudio(mixed $valor): string
    {
        return $valor === null ? 'En estudio' : ((bool) $valor ? 'Sí' : 'No');
    }
}
