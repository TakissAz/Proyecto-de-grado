<?php
namespace App\Http\Requests\Nutricion;
class StoreConsultaNutricionalRequest extends BasePerfilNutricionalRequest { protected function seccion(): string { return 'consulta'; } }
