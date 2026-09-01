<?php
namespace App\Http\Controllers\Endocrinologo;
use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Services\Endocrinologia\DerivacionNutricionalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
class DerivacionNutricionalController extends Controller {
 public function store(Request $request, Paciente $paciente, DerivacionNutricionalService $service): RedirectResponse {
  $data=$request->validate(['motivo_derivacion'=>'nullable|string|max:1000','prioridad'=>'required|in:baja,normal,alta']);
  $d=$service->derivarPaciente($paciente,$request->user(),$data['motivo_derivacion']??null,$data['prioridad']);
  return back()->with('success',$d->getAttribute('derivacion_preexistente') ? 'La paciente ya cuenta con una derivación nutricional pendiente.' : 'Paciente derivada a nutrición correctamente.');
 }
}
