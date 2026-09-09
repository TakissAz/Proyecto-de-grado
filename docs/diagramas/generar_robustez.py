"""Genera el documento de robustez; ejecutar desde cualquier directorio."""
from pathlib import Path
from html import escape as e

# Caso, actor, interfaz, control, entidad consultada, entidad persistida,
# resultado, alternativa, explicación y fuente verificable.
CASES = [
    ('Ejecutar evaluación experta PMOS', 'Endocrinólogo', 'Perfil clínico / Diagnóstico PMOS', 'Ejecutar y persistir / evaluación experta', 'Diagnóstico PMOS / y datos clínicos', 'Diagnóstico PMOS / con resultado experto', 'Resultado y / explicación experta', 'Error de ejecución / o servicio no disponible', 'Parte de un diagnóstico existente. El control agrupa el controlador y el orquestador que consulta el servicio experto; la validación profesional se representa en el caso siguiente.', 'app/Http/Controllers/SistemaExperto/EjecutarSistemaExpertoController.php'),
    ('Validar resultado experto PMOS', 'Endocrinólogo', 'Validación del / resultado experto', 'Validar decisión / y registrar autor', 'Diagnóstico PMOS', 'Diagnóstico PMOS / validado', 'Confirmación de / aprobación o rechazo', 'Datos de validación / incorrectos', 'El profesional elige aprobado o rechazado y puede registrar una observación. Se guardan su identificador y la fecha. Rechazar es una decisión válida, no un error de validación.', 'app/Http/Controllers/SistemaExperto/ValidarResultadoExpertoController.php'),
    ('Derivar paciente a nutrición', 'Endocrinólogo', 'Formulario de / derivación', 'Validar y gestionar / derivación', 'Paciente y / derivaciones previas', 'Derivación / nutricional', 'Derivación creada / o pendiente existente', 'Prioridad o datos / inválidos', 'Se registra motivo y prioridad. Si ya existe una derivación pendiente, vista o en proceso, se reutiliza. La notificación interna posterior queda fuera de este caso resumido.', 'app/Http/Controllers/Endocrinologo/DerivacionNutricionalController.php'),
    ('Registrar evaluación nutricional', 'Nutricionista', 'Formulario de / evaluación nutricional', 'Validar y registrar / evaluación', 'Paciente', 'Evaluación / nutricional', 'Perfil nutricional / actualizado', 'Datos de evaluación / inválidos', 'Representa el alta de una evaluación, no la edición ni el registro completo del perfil. El formulario se valida mediante StoreEvaluacionNutricionalRequest y se guarda mediante PerfilNutricionalService.', 'app/Http/Controllers/Nutricionista/PerfilNutricionalController.php'),
    ('Generar plan alimentario semanal', 'Nutricionista', 'Recomendación / nutricional experta', 'Comprobar requisitos / y generar plan', 'Paciente y / recomendación experta', 'Plan alimentario / días y comidas', 'Detalle del / plan generado', 'Requisitos o fecha / no válidos', 'La recomendación debe estar aprobada o validada y la paciente debe ser elegible. La fecha opcional debe ser desde mañana. El generador agrupa selección y armado de comidas; aprobar o activar el plan es otro caso de uso.', 'app/Http/Controllers/Nutricionista/PlanAlimentarioController.php'),
    ('Registrar seguimiento de comida', 'Paciente', 'Formulario de / seguimiento de comida', 'Validar pertenencia / y guardar seguimiento', 'Comida del plan / de la paciente', 'Seguimiento / de comida', 'Confirmación del / seguimiento guardado', 'Datos, acceso o / fecha no permitidos', 'Se verifica la paciente vinculada, la pertenencia de la comida, el estado aprobado o activo del plan y las restricciones de fecha. La notificación posterior al guardado se omite para mantener el foco.', 'app/Http/Controllers/Paciente/SeguimientoComidaController.php'),
]

def label(x, y, value, size=16):
    return '<text text-anchor="middle" font-size="%s">%s</text>' % (size, ''.join(f'<tspan x="{x}" y="{y+i*20}">{e(t)}</tspan>' for i,t in enumerate(value.split(' / '))))

def node(kind, x, y, name):
    if kind == 'actor':
        shape = f'<circle cx="{x}" cy="{y-24}" r="8"/><path d="M{x},{y-16} V{y+12} M{x-16},{y-4} H{x+16} M{x},{y+12} l-16,20 M{x},{y+12} l16,20"/>'
    else:
        shape = f'<circle cx="{x}" cy="{y}" r="24"/>'
        if kind == 'boundary':
            shape += f'<path d="M{x-40},{y-20} V{y+20} M{x-40},{y} H{x-24}"/>'
        elif kind == 'control':
            shape += f'<path d="M{x},{y-24} l12,-8 M{x},{y-24} l12,8"/>'
        else:
            shape += f'<path d="M{x-24},{y+28} H{x+24}"/>'
    return f'<g fill="white" stroke="#222" stroke-width="1.2">{shape}</g>'+label(x,y+56,name)

def edge(path):
    return f'<path d="{path}" fill="none" stroke="#555" stroke-width="1.2"/>'

def diagram(i,c):
    title,actor,ui,ctrl,read,write,result,error,note,source=c
    slug=f'robustez-{i}'
    out=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 680" role="img" aria-labelledby="{slug}-title {slug}-desc"><title id="{slug}-title">{e(title)}</title><desc id="{slug}-desc">{e(actor)} interactúa con la interfaz; el control consulta y guarda entidades y comunica el resultado o una alternativa.</desc>'
    out+='<defs>'+''.join(f'<marker id="{slug}-{m}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#555"/></marker>' for m in ('arrow','arrow-accent','arrow-link'))+'</defs><rect width="1200" height="680" fill="white"/>'
    out+=label(600,40,title,24)
    # Relaciones de colaboración: sin flechas temporales ni enlaces actor-entidad.
    for p in ('M112,312 H248','M312,312 H536','M584,312 H976','M560,288 V144','M576,332 H704 Q712,332 712,340 V488 Q712,496 720,496 H976','M544,332 H424 Q416,332 416,340 V488 Q416,496 408,496 H312'):
        out+=edge(p)
    for x,y,t in ((176,292,'solicita'),(424,292,'procesa'),(800,292,'guarda'),(824,476,'presenta'),(344,476,'informa')):
        out+=f'<rect x="{x-48}" y="{y-16}" width="96" height="24" fill="white"/>'+label(x,y,t,12)
    for kind,x,y,name in [('actor',96,312,actor),('boundary',288,312,ui),('control',560,312,ctrl),('entity',560,120,read),('entity',1000,312,write),('boundary',1000,496,result),('boundary',288,496,error)]:
        out+=node(kind,x,y,name)
    out+='<path d="M48,600 H1152" stroke="#ccc"/>'
    for k,x,name in [('actor',144,'Actor'),('boundary',400,'Interfaz'),('control',672,'Control'),('entity',944,'Entidad')]:
        out+=f'<g transform="translate({x},632) scale(.5)">'+node(k,0,0,'')+'</g>'+label(x+80,640,name,12)
    return out+'</svg>'

def main():
    body='''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PMOS · Diagramas de robustez</title><style>
    *{box-sizing:border-box}body{margin:0;color:#222;background:white;font-family:Arial,Helvetica,sans-serif}main{max-width:1248px;margin:auto;padding:32px 24px}h1{font-size:28px}p{line-height:1.6}nav{display:flex;gap:16px;flex-wrap:wrap;padding:16px 0}a{color:#333}section{margin:40px 0 64px;break-inside:avoid}svg{width:100%;height:auto}figure{margin:0}figcaption{text-align:center;font-size:14px;font-weight:bold}.note{font-size:14px;max-width:960px;margin:24px auto 0}.source{font-size:12px;overflow-wrap:anywhere;color:#555}header{border-bottom:1px solid #ccc;padding-bottom:24px}@page{size:A4 landscape;margin:12mm}@media print{main{padding:0}header{display:none}section{margin:0;break-after:page}section:last-child{break-after:auto}svg{max-height:158mm}.note{margin-top:12px;font-size:11px}.source{font-size:9px}}
    </style></head><body><main><header><h1>Diagramas de robustez · Sistema PMOS</h1><p>Seis casos de uso principales, elaborados a partir del código del proyecto. Estilo académico monocromático siguiendo la referencia proporcionada. Formato horizontal de 1200 × 680; listo para imprimir en A4 horizontal.</p><p>El actor utiliza una <b>interfaz</b> (círculo con barra lateral); el <b>control</b> (círculo con marca de flecha) coordina la operación; la <b>entidad</b> (círculo subrayado) representa información del dominio. Las líneas indican colaboración, no una secuencia temporal. Los mensajes y resultados son interfaces conceptuales; pueden aparecer dentro de la misma pantalla.</p><p>Abstracción: los controles agrupan validación, controladores y servicios. Se omiten autenticación común, campos individuales y operaciones secundarias. Las entidades agrupadas o repetidas representan roles de lectura y escritura, no tablas nuevas. Esta selección no es un inventario completo de todos los módulos.</p><nav>'''
    body+=''.join(f'<a href="#caso-{i}">{i:02d}. {e(c[0])}</a>' for i,c in enumerate(CASES,1))+'</nav></header>'
    for i,c in enumerate(CASES,1):
        body+=f'<section id="caso-{i}"><figure>{diagram(i,c)}<figcaption>DIAGRAMA DE ROBUSTEZ {i:02d}: {e(c[0])}.<br>Fuente: Elaboración propia.</figcaption></figure><p class="note">{e(c[8])}</p><p class="note source">Base de implementación: {e(c[9])}</p></section>'
    body+='</main></body></html>'
    Path(__file__).with_name('diagramas-robustez-pmos.html').write_text(body,encoding='utf-8')

if __name__ == '__main__':
    main()
