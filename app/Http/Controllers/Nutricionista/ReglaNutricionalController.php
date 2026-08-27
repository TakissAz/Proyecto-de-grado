<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Http\Requests\Nutricion\ReglaNutricionalRequest;
use App\Models\ReglaNutricional;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReglaNutricionalController extends Controller
{
    public function index(Request $request): Response
    {
        $buscar = trim((string) $request->input('buscar', ''));
        $tipo = (string) $request->input('tipo', '');

        return Inertia::render('Nutricionista/ReglasNutricionales/Index', [
            'reglas' => ReglaNutricional::query()
                ->where('estado', true)
                ->when($buscar, fn ($query) => $query->where(fn ($subquery) => $subquery
                    ->where('codigo', 'ilike', "%{$buscar}%")
                    ->orWhere('nombre', 'ilike', "%{$buscar}%")))
                ->when($tipo, fn ($query) => $query->where('tipo_regla', $tipo))
                ->orderByDesc('prioridad')
                ->orderBy('codigo')
                ->paginate(12)
                ->withQueryString(),
            'filtros' => ['buscar' => $buscar, 'tipo' => $tipo],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Nutricionista/ReglasNutricionales/Create');
    }

    public function store(ReglaNutricionalRequest $request): RedirectResponse
    {
        ReglaNutricional::query()->create($this->datosModelo($request->validated()));

        return redirect()->route('nutricionista.reglas-nutricionales.index')
            ->with('success', 'Regla nutricional creada correctamente.');
    }

    public function edit(ReglaNutricional $reglaNutricional): Response
    {
        return Inertia::render('Nutricionista/ReglasNutricionales/Edit', ['regla' => $reglaNutricional]);
    }

    public function update(ReglaNutricionalRequest $request, ReglaNutricional $reglaNutricional): RedirectResponse
    {
        $reglaNutricional->update($this->datosModelo($request->validated()));

        return redirect()->route('nutricionista.reglas-nutricionales.index')
            ->with('success', 'Regla nutricional actualizada correctamente. Los cálculos anteriores conservan su trazabilidad.');
    }

    private function datosModelo(array $datos): array
    {
        $valor = trim((string) ($datos['condicion_valor'] ?? ''));
        $operador = $datos['condicion_operador'];
        $condicion = $operador === 'default' ? null : match ($operador) {
            'in', 'not_in' => array_values(array_filter(array_map('trim', explode(',', $valor)))),
            '>', '>=', '<', '<=' => [(float) $valor],
            default => [$valor],
        };

        $mapa = [
            'ajuste_calorico' => 'ajuste_calorico',
            'porcentaje_proteinas' => 'porcentaje_proteinas',
            'porcentaje_carbohidratos' => 'porcentaje_carbohidratos',
            'porcentaje_grasas' => 'porcentaje_grasas',
            'fibra_diaria' => 'fibra_diaria',
            'calorias_minimas' => 'calorias_minimas',
            'observacion_resultado' => 'observacion',
        ];
        $resultado = [];
        foreach ($mapa as $entrada => $salida) {
            if (! blank($datos[$entrada] ?? null)) {
                $resultado[$salida] = $entrada === 'observacion_resultado' ? $datos[$entrada] : (float) $datos[$entrada];
            }
        }

        return [
            'codigo' => strtoupper($datos['codigo']),
            'nombre' => $datos['nombre'],
            'tipo_regla' => $datos['tipo_regla'],
            'condicion_campo' => $datos['condicion_campo'],
            'condicion_operador' => $operador,
            'condicion_valor' => $condicion,
            'resultado' => $resultado,
            'prioridad' => $datos['prioridad'],
            'descripcion' => $datos['descripcion'] ?? null,
            'fuente' => $datos['fuente'] ?? null,
            'estado' => true,
        ];
    }
}
