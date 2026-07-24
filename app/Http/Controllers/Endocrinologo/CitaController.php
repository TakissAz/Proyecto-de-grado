<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\CitaController as BaseCitaController;
use App\Services\Citas\AgendaCitaService;

class CitaController extends BaseCitaController
{
    public function __construct(AgendaCitaService $agendaService)
    {
        parent::__construct($agendaService, 'endocrinologo');
    }
}
