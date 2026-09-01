<?php
namespace App\Http\Controllers\Notificaciones;
use App\Http\Controllers\Controller;
use App\Models\NotificacionInterna;
use App\Services\Notificaciones\NotificacionInternaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
class NotificacionInternaController extends Controller {
 public function index(Request $r):Response{return Inertia::render('Notificaciones/Index',['listadoNotificaciones'=>$r->user()->notificacionesInternas()->latest()->paginate(25)]);}
 public function marcarComoLeida(NotificacionInterna $notificacion,Request $r,NotificacionInternaService $s):RedirectResponse{$s->marcarComoLeida($notificacion,$r->user());return $notificacion->url_destino?redirect($notificacion->url_destino):back();}
 public function marcarTodasComoLeidas(Request $r,NotificacionInternaService $s):RedirectResponse{$s->marcarTodasComoLeidas($r->user());return back()->with('success','Notificaciones marcadas como leídas.');}
}
