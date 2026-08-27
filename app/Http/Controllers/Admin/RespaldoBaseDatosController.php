<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\RespaldoBaseDatosService;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Http\RedirectResponse;
use RuntimeException;

class RespaldoBaseDatosController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/BaseDatos/Index', [
            'motor' => config('database.connections.'.config('database.default').'.driver'),
            'baseDatos' => config('database.connections.'.config('database.default').'.database'),
        ]);
    }

    public function descargar(RespaldoBaseDatosService $respaldos): BinaryFileResponse|RedirectResponse
    {
        try {
            $respaldo = $respaldos->generar();
        } catch (RuntimeException $e) {
            return redirect()->route('admin.base-datos.index')->with('error', $e->getMessage());
        }

        activity('respaldos_base_datos')
            ->causedBy(auth()->user())
            ->withProperties(['archivo' => $respaldo['nombre']])
            ->log('El administrador descargó un respaldo de la base de datos.');

        return response()->download($respaldo['ruta'], $respaldo['nombre'], [
            'Content-Type' => 'application/octet-stream',
            'Cache-Control' => 'no-store, private',
        ])->deleteFileAfterSend(true);
    }
}
