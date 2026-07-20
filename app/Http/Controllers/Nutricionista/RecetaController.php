<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Http\Requests\Nutricion\StoreRecetaRequest;
use App\Http\Requests\Nutricion\UpdateRecetaRequest;
use App\Http\Resources\AlimentoResource;
use App\Http\Resources\RecetaResource;
use App\Models\Alimento;
use App\Models\Receta;
use App\Services\Nutricion\RecetaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecetaController extends Controller
{
    public function __construct(
        private readonly RecetaService $recetaService
    ) {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Nutricionista/Recetas/Index', [
            'recetas' => RecetaResource::collection(
                $this->recetaService->listar($request->only(['buscar', 'estado']))
            ),
            'filtros' => [
                'buscar' => $request->input('buscar', ''),
                'estado' => $request->input('estado', ''),
            ],
            'alimentos' => Alimento::where('estado', 'activo')
                ->orderBy('nombre')
                ->get(['id_alimento', 'nombre', 'grupo_alimentario', 'unidad_base', 'cantidad_base', 'calorias', 'proteinas', 'carbohidratos', 'grasas', 'fibra', 'disponibilidad_temporal']),
        ]);
    }

    public function create(): Response
    {
        $alimentos = Alimento::where('estado', 'activo')
            ->orderBy('nombre')
            ->get(['id_alimento', 'nombre', 'grupo_alimentario', 'unidad_base', 'cantidad_base', 'calorias', 'proteinas', 'carbohidratos', 'grasas', 'fibra', 'disponibilidad_temporal']);

        return Inertia::render('Nutricionista/Recetas/Create', [
            'alimentos' => $alimentos,
        ]);
    }

    public function store(StoreRecetaRequest $request): RedirectResponse
    {
        $this->recetaService->crear($request->validated());

        return redirect()
            ->route('nutricionista.recetas.index')
            ->with('success', 'Receta creada correctamente.');
    }

    public function show(Request $request, Receta $receta): Response|\Illuminate\Http\JsonResponse
    {
        $recetaResource = new RecetaResource($this->recetaService->cargar($receta));

        if ($request->wantsJson()) {
            return response()->json($recetaResource);
        }

        return Inertia::render('Nutricionista/Recetas/Show', [
            'receta' => $recetaResource,
        ]);
    }

    public function edit(Receta $receta): Response
    {
        $alimentos = Alimento::where('estado', 'activo')
            ->orderBy('nombre')
            ->get(['id_alimento', 'nombre', 'grupo_alimentario', 'unidad_base', 'cantidad_base', 'calorias', 'proteinas', 'carbohidratos', 'grasas', 'fibra', 'disponibilidad_temporal']);

        return Inertia::render('Nutricionista/Recetas/Edit', [
            'receta' => new RecetaResource($this->recetaService->cargar($receta)),
            'alimentos' => $alimentos,
        ]);
    }

    public function update(UpdateRecetaRequest $request, Receta $receta): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $this->recetaService->actualizar($receta, $request->validated());

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Receta actualizada correctamente.']);
        }

        return redirect()
            ->route('nutricionista.recetas.index')
            ->with('success', 'Receta actualizada correctamente.');
    }

    public function activar(Receta $receta): RedirectResponse
    {
        $this->recetaService->cambiarEstado($receta, 'activo');

        return back()->with('success', 'Receta activada correctamente.');
    }

    public function inactivar(Receta $receta): RedirectResponse
    {
        $this->recetaService->cambiarEstado($receta, 'inactivo');

        return back()->with('success', 'Receta inactivada correctamente.');
    }
}
