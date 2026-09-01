<?php
namespace App\Http\Controllers\Nutricionista;
use App\Http\Controllers\Controller;
use App\Models\DerivacionNutricional;
use App\Services\Endocrinologia\DerivacionNutricionalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
class DerivacionesNutricionalesController extends Controller {
 public function index(Request $request): Response {
  $q=DerivacionNutricional::with(['paciente.diagnosticosPmos','paciente.diagnosticosResistenciaInsulina','endocrinologo:id,name'])->latest('fecha_derivacion');
  if($request->filled('estado'))$q->where('estado',$request->string('estado'));
  if($request->filled('prioridad'))$q->where('prioridad',$request->string('prioridad'));
  return Inertia::render('Nutricionista/Derivaciones/Index',['derivaciones'=>$q->paginate(20)->withQueryString(),'filtros'=>$request->only('estado','prioridad')]);
 }
 public function show(DerivacionNutricional $derivacion, Request $r, DerivacionNutricionalService $s): RedirectResponse { $s->marcarVista($derivacion,$r->user()); return redirect()->route('nutricionista.pacientes.perfil-nutricional',$derivacion->id_paciente); }
 public function marcarVista(DerivacionNutricional $derivacion,Request $r,DerivacionNutricionalService $s): RedirectResponse{$s->marcarVista($derivacion,$r->user());return back()->with('success','Derivación marcada como vista.');}
 public function marcarEnProceso(DerivacionNutricional $derivacion,Request $r,DerivacionNutricionalService $s): RedirectResponse{$s->marcarEnProceso($derivacion,$r->user());return back()->with('success','Atención nutricional iniciada.');}
 public function marcarAtendida(DerivacionNutricional $derivacion,Request $r,DerivacionNutricionalService $s): RedirectResponse{$s->marcarAtendida($derivacion,$r->user());return back()->with('success','Derivación marcada como atendida.');}
}
