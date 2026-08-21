<?php
namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;use App\Models\PlanAlimentario;use App\Services\Nutricion\CicloPlanAlimentarioService;use Carbon\Carbon;use DomainException;use Illuminate\Http\RedirectResponse;use Illuminate\Http\Request;

class CicloPlanAlimentarioController extends Controller
{
 public function finalizarYGenerar(Request $request,PlanAlimentario $plan,CicloPlanAlimentarioService $ciclo):RedirectResponse
 {
  abort_unless($request->user()?->tieneRol('nutricionista'),403);$datos=$request->validate(['fecha_inicio'=>['nullable','date'],'observacion_finalizacion'=>['nullable','string','max:1000']]);
  try{$ciclo->finalizarYGenerarSiguiente($plan,$request->user(),isset($datos['fecha_inicio'])?Carbon::parse($datos['fecha_inicio']):null,$datos['observacion_finalizacion']??null);}
  catch(DomainException $e){return back()->withErrors(['plan'=>$e->getMessage()]);}
  return back()->with('success','Plan finalizado y nueva planificación generada correctamente.');
 }
}
