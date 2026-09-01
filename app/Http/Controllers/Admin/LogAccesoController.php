<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class LogAccesoController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Activity::query()->with('causer.roles')->where('log_name', 'accesos')->where('event', 'inicio_sesion');
        if ($request->filled('buscar')) {
            $buscar = trim($request->string('buscar')->toString());
            $query->where(fn ($q) => $q->whereHas('causer', fn ($u) => $u->where('name', 'ilike', "%{$buscar}%")->orWhere('email', 'ilike', "%{$buscar}%"))->orWhere('properties->ip', 'ilike', "%{$buscar}%"));
        }
        if ($request->filled('rol')) $query->whereHas('causer.roles', fn ($q) => $q->where('roles.nombre', $request->string('rol')));
        if ($request->filled('metodo')) $query->where('properties->metodo', $request->string('metodo'));
        if ($request->filled('desde')) $query->whereDate('created_at', '>=', $request->date('desde'));
        if ($request->filled('hasta')) $query->whereDate('created_at', '<=', $request->date('hasta'));

        $pagina = $query->latest('id')->paginate(20)->withQueryString()->through(fn (Activity $a) => [
            'id' => $a->id,
            'fecha' => $a->created_at?->format('Y-m-d H:i:s'),
            'usuario' => $a->causer ? ['id'=>$a->causer->getKey(),'name'=>$a->causer->name,'email'=>$a->causer->email,'estado'=>$a->causer->estado,'roles'=>$a->causer->roles->pluck('nombre')->values()] : null,
            'ip' => $a->properties?->get('ip'),
            'user_agent' => $a->properties?->get('user_agent'),
            'metodo' => $a->properties?->get('metodo', 'credenciales') ?? 'credenciales',
        ]);

        return Inertia::render('Admin/Accesos/Index', [
            'accesos' => $pagina,
            'filtros' => $request->only(['buscar','rol','metodo','desde','hasta']),
            'resumen' => [
                'hoy' => Activity::where('log_name','accesos')->where('event','inicio_sesion')->whereDate('created_at',today())->count(),
                'ultimos_7_dias' => Activity::where('log_name','accesos')->where('event','inicio_sesion')->where('created_at','>=',now()->subDays(7))->count(),
                'usuarios_7_dias' => Activity::where('log_name','accesos')->where('event','inicio_sesion')->where('created_at','>=',now()->subDays(7))->distinct('causer_id')->count('causer_id'),
            ],
        ]);
    }
}
