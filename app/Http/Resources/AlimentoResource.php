<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlimentoResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id_alimento' => $this->id_alimento,
            'nombre' => $this->nombre,
            'grupo_alimentario' => $this->grupo_alimentario,
            'unidad_base' => $this->unidad_base,
            'cantidad_base' => $this->cantidad_base,
            'calorias' => $this->calorias,
            'proteinas' => $this->proteinas,
            'carbohidratos' => $this->carbohidratos,
            'grasas' => $this->grasas,
            'fibra' => $this->fibra,
            'indice_glucemico' => $this->indice_glucemico,
            'disponibilidad_temporal' => $this->disponibilidad_temporal,
            'temporada_escasez' => $this->temporada_escasez,
            'mensaje_disponibilidad' => $this->mensaje_disponibilidad,
            'observaciones' => $this->observaciones,
            'estado' => $this->estado,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
