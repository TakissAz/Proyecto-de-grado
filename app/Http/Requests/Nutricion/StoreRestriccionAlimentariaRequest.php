<?php
namespace App\Http\Requests\Nutricion;
class StoreRestriccionAlimentariaRequest extends BasePerfilNutricionalRequest { protected function seccion(): string { return 'restricciones'; } }
