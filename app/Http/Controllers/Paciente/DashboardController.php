<?php

namespace App\Http\Controllers\Paciente;

use App\Http\Controllers\Controller;
use App\Services\Paciente\PortalPacienteService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, PortalPacienteService $portal): Response
    {
        return Inertia::render('Paciente/Dashboard', $portal->obtenerDashboard($request->user()));
    }
}
