<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecetaResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id_receta' => $this->id_receta,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'tipo_comida' => $this->tipo_comida,
            'porciones' => $this->porciones,
            'tiempo_preparacion_minutos' => $this->tiempo_preparacion_minutos,
            'preparacion' => $this->preparacion,
            'calorias_totales' => $this->calorias_totales,
            'proteinas_totales' => $this->proteinas_totales,
            'carbohidratos_totales' => $this->carbohidratos_totales,
            'grasas_totales' => $this->grasas_totales,
            'fibra_total' => $this->fibra_total,
            'observaciones' => $this->observaciones,
            'estado' => $this->estado,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'ingredientes' => $this->whenLoaded('recetaAlimentos', function () {
                return $this->recetaAlimentos->map(function ($ra) {
                    return [
                        'id_receta_alimento' => $ra->id_receta_alimento,
                        'id_alimento' => $ra->id_alimento,
                        'alimento_nombre' => $ra->alimento?->nombre,
                        'alimento_grupo' => $ra->alimento?->grupo_alimentario,
                        'cantidad' => $ra->cantidad,
                        'unidad' => $ra->unidad,
                        'calorias_aporte' => $ra->calorias_aporte,
                        'proteinas_aporte' => $ra->proteinas_aporte,
                        'carbohidratos_aporte' => $ra->carbohidratos_aporte,
                        'grasas_aporte' => $ra->grasas_aporte,
                        'fibra_aporte' => $ra->fibra_aporte,
                        'observaciones' => $ra->observaciones,
                        'alimento_disponibilidad_temporal' => $ra->alimento?->disponibilidad_temporal,
                        'alimento_temporada_escasez' => $ra->alimento?->temporada_escasez,
                        'alimento_mensaje_disponibilidad' => $ra->alimento?->mensaje_disponibilidad,
                    ];
                })->values();
            }),
        ];
    }
}
