<?php

namespace App\Services\Nutricion;

use App\Models\Alimento;
use App\Models\Receta;
use App\Models\RecetaAlimento;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class RecetaService
{
    public function listar(array $filtros = []): LengthAwarePaginator
    {
        return Receta::query()
            ->when(! empty($filtros['buscar']), function ($query) use ($filtros) {
                $buscar = trim((string) $filtros['buscar']);

                $query->where(function ($subquery) use ($buscar) {
                    $subquery
                        ->where('nombre', 'ilike', '%' . $buscar . '%')
                        ->orWhere('tipo_comida', 'ilike', '%' . $buscar . '%');
                });
            })
            ->when(! empty($filtros['estado']), function ($query) use ($filtros) {
                $query->where('estado', '=', $filtros['estado']);
            })
            ->latest('id_receta')
            ->paginate(15)
            ->withQueryString();
    }

    public function cargar(Receta $receta): Receta
    {
        return $receta->load(['recetaAlimentos.alimento']);
    }

    public function crear(array $data): Receta
    {
        return DB::transaction(function () use ($data) {
            $ingredientes = $data['ingredientes'] ?? [];
            unset($data['ingredientes']);

            $receta = Receta::create($data);

            foreach ($ingredientes as $ingrediente) {
                $this->crearIngrediente($receta, $ingrediente);
            }

            $receta->recalcularTotales();

            return $this->cargar($receta);
        });
    }

    public function actualizar(Receta $receta, array $data): Receta
    {
        return DB::transaction(function () use ($receta, $data) {
            $ingredientes = $data['ingredientes'] ?? [];
            unset($data['ingredientes']);

            $receta->update($data);

            $this->sincronizarIngredientes($receta, $ingredientes);

            $receta->recalcularTotales();

            return $this->cargar($receta->fresh());
        });
    }

    public function cambiarEstado(Receta $receta, string $estado): Receta
    {
        $receta->update(['estado' => $estado]);

        return $receta->fresh();
    }

    private function crearIngrediente(Receta $receta, array $ingrediente): RecetaAlimento
    {
        $alimento = Alimento::findOrFail($ingrediente['id_alimento']);

        $aportes = $this->calcularAportes($alimento, $ingrediente['cantidad']);

        return RecetaAlimento::create([
            'id_receta' => $receta->id_receta,
            'id_alimento' => $ingrediente['id_alimento'],
            'cantidad' => $ingrediente['cantidad'],
            'unidad' => $ingrediente['unidad'],
            'calorias_aporte' => $aportes['calorias_aporte'],
            'proteinas_aporte' => $aportes['proteinas_aporte'],
            'carbohidratos_aporte' => $aportes['carbohidratos_aporte'],
            'grasas_aporte' => $aportes['grasas_aporte'],
            'fibra_aporte' => $aportes['fibra_aporte'],
            'observaciones' => $ingrediente['observaciones'] ?? null,
        ]);
    }

    private function sincronizarIngredientes(Receta $receta, array $ingredientes): void
    {
        $idsEnviados = collect($ingredientes)
            ->pluck('id_receta_alimento')
            ->filter()
            ->toArray();

        // Eliminar ingredientes que ya no están
        $receta->recetaAlimentos()
            ->whereNotIn('id_receta_alimento', $idsEnviados)
            ->delete();

        foreach ($ingredientes as $ingrediente) {
            if (! empty($ingrediente['id_receta_alimento'])) {
                // Actualizar existente
                $recetaAlimento = RecetaAlimento::find($ingrediente['id_receta_alimento']);

                if ($recetaAlimento) {
                    $alimento = Alimento::findOrFail($ingrediente['id_alimento']);
                    $aportes = $this->calcularAportes($alimento, $ingrediente['cantidad']);

                    $recetaAlimento->update([
                        'id_alimento' => $ingrediente['id_alimento'],
                        'cantidad' => $ingrediente['cantidad'],
                        'unidad' => $ingrediente['unidad'],
                        'calorias_aporte' => $aportes['calorias_aporte'],
                        'proteinas_aporte' => $aportes['proteinas_aporte'],
                        'carbohidratos_aporte' => $aportes['carbohidratos_aporte'],
                        'grasas_aporte' => $aportes['grasas_aporte'],
                        'fibra_aporte' => $aportes['fibra_aporte'],
                        'observaciones' => $ingrediente['observaciones'] ?? null,
                    ]);
                }
            } else {
                // Crear nuevo
                $this->crearIngrediente($receta, $ingrediente);
            }
        }
    }

    private function calcularAportes(Alimento $alimento, float $cantidad): array
    {
        if ($alimento->cantidad_base <= 0) {
            return [
                'calorias_aporte' => 0,
                'proteinas_aporte' => 0,
                'carbohidratos_aporte' => 0,
                'grasas_aporte' => 0,
                'fibra_aporte' => 0,
            ];
        }

        $factor = $cantidad / $alimento->cantidad_base;

        return [
            'calorias_aporte' => round($alimento->calorias * $factor, 2),
            'proteinas_aporte' => round($alimento->proteinas * $factor, 2),
            'carbohidratos_aporte' => round($alimento->carbohidratos * $factor, 2),
            'grasas_aporte' => round($alimento->grasas * $factor, 2),
            'fibra_aporte' => round(($alimento->fibra ?? 0) * $factor, 2),
        ];
    }
}
