<?php

namespace App\Services\Nutricion;

use App\Models\Alimento;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class AlimentoService
{
    public function __construct(
        private readonly ClasificadorDisponibilidadAlimentoService $clasificador
    ) {
    }

    public function listar(array $filtros = []): LengthAwarePaginator
    {
        return Alimento::query()
            ->when(! empty($filtros['buscar']), function ($query) use ($filtros) {
                $buscar = trim((string) $filtros['buscar']);

                $query->where(function ($subquery) use ($buscar) {
                    $subquery
                        ->where('nombre', 'ilike', '%' . $buscar . '%')
                        ->orWhere('grupo_alimentario', 'ilike', '%' . $buscar . '%');
                });
            })
            ->when(! empty($filtros['estado']), function ($query) use ($filtros) {
                $query->where('estado', '=', $filtros['estado']);
            })
            ->latest('id_alimento')
            ->paginate(15)
            ->withQueryString();
    }

    public function crear(array $data): Alimento
    {
        $disponibilidad = $this->clasificador->clasificar(
            $data['nombre'],
            $data['grupo_alimentario']
        );

        $data = array_merge($data, $disponibilidad);

        return Alimento::create($data);
    }

    public function actualizar(Alimento $alimento, array $data): Alimento
    {
        $disponibilidad = $this->clasificador->clasificar(
            $data['nombre'] ?? $alimento->nombre,
            $data['grupo_alimentario'] ?? $alimento->grupo_alimentario
        );

        $data = array_merge($data, $disponibilidad);

        $alimento->update($data);

        return $alimento->fresh();
    }

    public function cambiarEstado(Alimento $alimento, string $estado): Alimento
    {
        $alimento->update(['estado' => $estado]);

        return $alimento->fresh();
    }

    public function buscarPorNombre(string $termino): Collection
    {
        return Alimento::query()
            ->where('estado', '=', 'activo')
            ->where('nombre', 'ilike', '%' . trim($termino) . '%')
            ->limit(10)
            ->get();
    }
}
