<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Services\Nutricion\AlimentoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlimentoBusquedaController extends Controller
{
    public function __construct(
        private readonly AlimentoService $alimentoService
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $termino = $request->input('q', '');

        if (strlen(trim($termino)) < 2) {
            return response()->json([]);
        }

        $alimentos = $this->alimentoService->buscarPorNombre($termino);

        return response()->json(
            $alimentos->map(fn ($alimento) => [
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
            ])->values()
        );
    }
}
