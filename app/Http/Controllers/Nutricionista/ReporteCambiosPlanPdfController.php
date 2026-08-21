<?php
namespace App\Http\Controllers\Nutricionista;
use App\Http\Controllers\Controller;use App\Models\PlanAlimentario;use App\Services\Nutricion\ReporteCambiosPlanService;use Barryvdh\DomPDF\Facade\Pdf;use Illuminate\Http\Response;
class ReporteCambiosPlanPdfController extends Controller
{
 public function __invoke(PlanAlimentario $plan,ReporteCambiosPlanService $service):Response
 {
  abort_unless(request()->user()?->tieneRol('nutricionista'),403);$plan->loadMissing('paciente');
  $anterior=$plan->paciente?->planesAlimentarios()->whereKeyNot($plan->getKey())->when($plan->fecha_inicio,fn($q)=>$q->where('fecha_inicio','<=',$plan->fecha_inicio))->latest('fecha_inicio')->latest('id_plan_alimentario')->first();
  return Pdf::loadView('pdf.nutricion.reporte-cambios-plan',['planNuevo'=>$plan,'planAnterior'=>$anterior,'paciente'=>$plan->paciente,'reporte'=>$service->generarResumenCambios($plan,$anterior),'profesional'=>request()->user(),'fechaGeneracion'=>now()])->setPaper('a4')->stream("reporte-cambios-plan-{$plan->getKey()}.pdf");
 }
}
