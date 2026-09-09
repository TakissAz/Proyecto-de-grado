<?php

namespace App\Http\Controllers\Paciente;

use App\Http\Controllers\Controller;
use App\Services\Paciente\PortalPacienteService;
use App\Services\Paciente\SeguimientoSintomasPacienteService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly PortalPacienteService $portal) {}

    public function dashboard(Request $request): Response
    {
        $data = $this->portal->obtenerDashboard($request->user());

        return Inertia::render('Paciente/Dashboard', [
            'paciente' => $data['paciente'],
            'planAlimentario' => $data['planAlimentario'],
            'resumenAdherencia' => $data['resumenAdherencia'],
            'progresoPaciente' => $data['progresoPaciente'],
            'listaCompras' => $data['listaCompras'],
            'seguimientoSintomas' => $data['seguimientoSintomas'],
            'citasPaciente' => $data['citasPaciente'],
            'historialPlanes' => $data['historialPlanes'],
            'retroalimentaciones' => $data['retroalimentaciones'],
        ]);
    }

    public function miPlan(Request $request): Response
    {
        $data = $this->portal->obtenerDashboard($request->user());

        return Inertia::render('Paciente/MiPlan', [
            'paciente' => $data['paciente'],
            'planAlimentario' => $data['planAlimentario'],
            'resumenAdherencia' => $data['resumenAdherencia'],
            'seguimientoSintomas' => $data['seguimientoSintomas'],
        ]);
    }

    public function seguimiento(Request $request): Response
    {
        $data = $this->portal->obtenerDashboard($request->user());
        $paciente = $request->user()->paciente()->first();

        return Inertia::render('Paciente/Seguimiento', [
            'paciente' => $data['paciente'],
            'planAlimentario' => $data['planAlimentario'],
            'resumenAdherencia' => $data['resumenAdherencia'],
            'progresoPaciente' => $data['progresoPaciente'],
            'seguimientoSintomas' => $data['seguimientoSintomas'],
            'historialProgreso' => $paciente ? $this->portal->progresoHistorial($paciente) : [],
        ]);
    }

    public function progreso(Request $request): Response
    {
        $data = $this->portal->obtenerDashboard($request->user());
        $paciente = $request->user()->paciente()->first();
        return Inertia::render('Paciente/Progreso', [
            'paciente' => $data['paciente'],
            'progresoPaciente' => $data['progresoPaciente'],
            'historialProgreso' => $paciente ? $this->portal->progresoHistorial($paciente) : [],
        ]);
    }

    public function sintomas(Request $request, SeguimientoSintomasPacienteService $sintomas): Response
    {
        $data = $this->portal->obtenerDashboard($request->user());
        $paciente = $request->user()->paciente()->first();
        return Inertia::render('Paciente/Sintomas', [
            'paciente' => $data['paciente'],
            'seguimientoSintomas' => $data['seguimientoSintomas'],
            'historialSintomas' => $paciente ? $sintomas->obtenerHistorialPaginado($paciente) : null,
        ]);
    }

    public function listaCompras(Request $request): Response
    {
        $data = $this->portal->obtenerDashboard($request->user());
        return Inertia::render('Paciente/ListaCompras', ['paciente' => $data['paciente'], 'planAlimentario' => $data['planAlimentario'], 'listaCompras' => $data['listaCompras']]);
    }

    public function orientacion(Request $request): Response
    {
        $data = $this->portal->obtenerDashboard($request->user());

        return Inertia::render('Paciente/Orientacion', [
            'paciente' => $data['paciente'],
            'planAlimentario' => $data['planAlimentario'],
            'retroalimentaciones' => $data['retroalimentaciones'],
        ]);
    }

    public function historial(Request $request): Response
    {
        $data = $this->portal->obtenerDashboard($request->user());

        return Inertia::render('Paciente/Historial', [
            'paciente' => $data['paciente'],
            'historialPlanes' => $data['historialPlanes'],
        ]);
    }

    public function citas(Request $request): Response
    {
        $data = $this->portal->obtenerDashboard($request->user());

        return Inertia::render('Paciente/Citas', [
            'paciente' => $data['paciente'],
            'citasPaciente' => $data['citasPaciente'],
        ]);
    }

    public function compras(Request $request): Response
    {
        $data = $this->portal->obtenerDashboard($request->user());

        return Inertia::render('Paciente/Compras', [
            'paciente' => $data['paciente'],
            'listaCompras' => $data['listaCompras'],
        ]);
    }
}
