<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Http\Requests\Nutricion\StoreAlimentoRequest;
use App\Http\Requests\Nutricion\UpdateAlimentoRequest;
use App\Http\Resources\AlimentoResource;
use App\Models\Alimento;
use App\Services\Nutricion\AlimentoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlimentoController extends Controller
{
    public function __construct(
        private readonly AlimentoService $alimentoService
    ) {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Nutricionista/Alimentos/Index', [
            'alimentos' => AlimentoResource::collection(
                $this->alimentoService->listar($request->only(['buscar', 'estado']))
            ),
            'filtros' => [
                'buscar' => $request->input('buscar', ''),
                'estado' => $request->input('estado', ''),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Nutricionista/Alimentos/Create');
    }

    public function store(StoreAlimentoRequest $request): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $alimento = $this->alimentoService->crear($request->validated());

        // Si la petición es AJAX (modal inline desde recetas), devolver JSON
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'id_alimento' => $alimento->id_alimento,
                'nombre' => $alimento->nombre,
                'grupo_alimentario' => $alimento->grupo_alimentario,
                'unidad_base' => $alimento->unidad_base,
                'cantidad_base' => $alimento->cantidad_base,
                'calorias' => $alimento->calorias,
                'proteinas' => $alimento->proteinas,
                'carbohidratos' => $alimento->carbohidratos,
                'grasas' => $alimento->grasas,
                'fibra' => $alimento->fibra,
                'disponibilidad_temporal' => $alimento->disponibilidad_temporal,
            ], 201);
        }

        return redirect()
            ->route('nutricionista.alimentos.index')
            ->with('success', 'Alimento creado correctamente.');
    }

    public function edit(Alimento $alimento): Response
    {
        return Inertia::render('Nutricionista/Alimentos/Edit', [
            'alimento' => new AlimentoResource($alimento),
        ]);
    }

    public function update(UpdateAlimentoRequest $request, Alimento $alimento): RedirectResponse
    {
        $this->alimentoService->actualizar($alimento, $request->validated());

        return redirect()
            ->route('nutricionista.alimentos.index')
            ->with('success', 'Alimento actualizado correctamente.');
    }

    public function activar(Alimento $alimento): RedirectResponse
    {
        $this->alimentoService->cambiarEstado($alimento, 'activo');

        return back()->with('success', 'Alimento activado correctamente.');
    }

    public function inactivar(Alimento $alimento): RedirectResponse
    {
        $this->alimentoService->cambiarEstado($alimento, 'inactivo');

        return back()->with('success', 'Alimento inactivado correctamente.');
    }
}
