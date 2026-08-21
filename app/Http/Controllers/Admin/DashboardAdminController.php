<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\MetricasGeneralesAdminService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardAdminController extends Controller
{
    public function __invoke(MetricasGeneralesAdminService $metricas): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'metricasGenerales' => $metricas->obtenerMetricas(),
        ]);
    }
}
