<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

function esc(string $value): string { return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8'); }
function domain(string $table): string {
    if ($table === 'activity_log') return 'Auditoría';
    if (preg_match('/^(users|roles|user_roles|pacientes|sessions|password_reset_tokens)$/', $table)) return 'Identidad';
    if (preg_match('/^(consultas_endocrinologicas|historia_|antecedentes_|evaluaciones_(fisicas_endocrinas|ecograficas)|resultados_|diagnosticos_)/', $table)) return 'Endocrinología';
    if (preg_match('/^(consultas_nutricionales|evaluaciones_nutricionales|habitos_|preferencias_|restricciones_|objetivos_|requerimientos_|reglas_|regla_|recomendaciones_)/', $table)) return 'Nutrición experta';
    if (preg_match('/^(planes_|dias_plan_|comidas_plan_|componentes_|recetas|receta_|alimentos)$/', $table)) return 'Planificación';
    return 'Seguimiento y soporte';
}

$tables = collect(DB::select("select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name"))->pluck('table_name')->all();
$columns = DB::select("select table_name,column_name,data_type,udt_name,is_nullable,character_maximum_length,numeric_precision,numeric_scale,ordinal_position from information_schema.columns where table_schema='public' order by table_name,ordinal_position");
$keys = DB::select("select tc.table_name,kcu.column_name,tc.constraint_type from information_schema.table_constraints tc join information_schema.key_column_usage kcu on tc.constraint_name=kcu.constraint_name and tc.table_schema=kcu.table_schema where tc.table_schema='public' and tc.constraint_type in ('PRIMARY KEY','UNIQUE')");
$fks = DB::select("select tc.table_name,kcu.column_name,ccu.table_name foreign_table_name,ccu.column_name foreign_column_name,rc.delete_rule from information_schema.table_constraints tc join information_schema.key_column_usage kcu on tc.constraint_name=kcu.constraint_name and tc.table_schema=kcu.table_schema join information_schema.constraint_column_usage ccu on ccu.constraint_name=tc.constraint_name and ccu.table_schema=tc.table_schema join information_schema.referential_constraints rc on rc.constraint_name=tc.constraint_name and rc.constraint_schema=tc.table_schema where tc.table_schema='public' and tc.constraint_type='FOREIGN KEY' order by tc.table_name,kcu.ordinal_position");

$byTable=[]; foreach($columns as $c) $byTable[$c->table_name][]=$c;
$keyMap=[]; foreach($keys as $k) $keyMap[$k->table_name][$k->column_name][]=$k->constraint_type==='PRIMARY KEY'?'PK':'UQ';
foreach($fks as $fk) $keyMap[$fk->table_name][$fk->column_name][]='FK';
$groups=['Identidad'=>[],'Endocrinología'=>[],'Nutrición experta'=>[],'Planificación'=>[],'Seguimiento y soporte'=>[],'Auditoría'=>[]];
foreach($tables as $t) $groups[domain($t)][]=$t;

$W=360; $G=112; $X0=52; $Y0=132; $header=44; $row=22; $gap=28; $positions=[]; $columnHeights=[];
foreach(array_values($groups) as $gi=>$list){$x=$X0+$gi*($W+$G);$y=$Y0;foreach($list as $t){$h=$header+count($byTable[$t]??[])*$row+8;$positions[$t]=compact('x','y','h');$y+=$h+$gap;}$columnHeights[]=$y;}
$groupCount=count($groups); $vw=$X0*2+$groupCount*$W+($groupCount-1)*$G; $vh=max($columnHeights)+92;

$svg=[];$svg[]='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '.$vw.' '.$vh.'" role="img" aria-labelledby="fisico-title fisico-desc">';
$svg[]='<title id="fisico-title">Diagrama físico general de PostgreSQL — PMOS</title><desc id="fisico-desc">Las 49 tablas de la base de datos con columnas, tipos, restricciones y relaciones de claves foráneas.</desc>';
$svg[]='<defs><style>.bg{fill:#fff}.domain{font:700 13px Arial,sans-serif;letter-spacing:1.3px;fill:#237c3a}.box{fill:#fff;stroke:#9da9a1;stroke-width:1}.head{fill:#edf7ef;stroke:#237c3a;stroke-width:1.4}.tn{font:700 12px Arial,sans-serif;fill:#17201b}.cn{font:10px Arial,sans-serif;fill:#27332c}.ct{font:9px Consolas,monospace;fill:#68746c}.chip{font:700 8px Consolas,monospace;fill:#237c3a}.alt{fill:#f8faf8}.fk{fill:none;stroke:#6f7c74;stroke-width:.8;opacity:.38}.fk:hover{stroke:#237c3a;stroke-width:2;opacity:1}.foot{font:10px Consolas,monospace;fill:#68746c}</style></defs><rect class="bg" width="100%" height="100%"/>';
foreach(array_keys($groups) as $i=>$name){$x=$X0+$i*($W+$G);$svg[]='<text class="domain" x="'.$x.'" y="92">'.esc(mb_strtoupper($name)).'</text><line x1="'.$x.'" y1="106" x2="'.($x+$W).'" y2="106" stroke="#cfd7d1"/>';}

// FK connectors attach to the exact physical column row.
foreach($fks as $i=>$fk){if(!isset($positions[$fk->table_name],$positions[$fk->foreign_table_name]))continue;$s=$positions[$fk->table_name];$d=$positions[$fk->foreign_table_name];$si=array_search($fk->column_name,array_column($byTable[$fk->table_name],'column_name'),true);$di=array_search($fk->foreign_column_name,array_column($byTable[$fk->foreign_table_name],'column_name'),true);$sy=$s['y']+$header+$si*$row+$row/2;$dy=$d['y']+$header+$di*$row+$row/2;$sx=$s['x'];$dx=$d['x']+$W;if($s['x']<$d['x']){$sx=$s['x']+$W;$dx=$d['x'];}$lane=min($sx,$dx)+abs($dx-$sx)/2+(($i%7)-3)*6;$svg[]='<path class="fk" d="M'.$sx.' '.$sy.' H'.$lane.' V'.$dy.' H'.$dx.'"><title>'.esc($fk->table_name.'.'.$fk->column_name.' → '.$fk->foreign_table_name.'.'.$fk->foreign_column_name.' · ON DELETE '.$fk->delete_rule).'</title></path>';}

foreach($groups as $group=>$list)foreach($list as $t){$p=$positions[$t];$svg[]='<g><rect class="box" x="'.$p['x'].'" y="'.$p['y'].'" width="'.$W.'" height="'.$p['h'].'" rx="5"/><rect class="head" x="'.$p['x'].'" y="'.$p['y'].'" width="'.$W.'" height="'.$header.'" rx="5"/><text class="tn" x="'.($p['x']+12).'" y="'.($p['y']+27).'">public.'.esc($t).'</text>';
foreach($byTable[$t]??[] as $i=>$c){$yy=$p['y']+$header+$i*$row;if($i%2)$svg[]='<rect class="alt" x="'.($p['x']+1).'" y="'.$yy.'" width="'.($W-2).'" height="'.$row.'"/>';$flags=$keyMap[$t][$c->column_name]??[];if($c->is_nullable==='NO'&&!in_array('PK',$flags,true))$flags[]='NN';$type=$c->data_type==='USER-DEFINED'?$c->udt_name:$c->data_type;if($c->character_maximum_length)$type.='('.$c->character_maximum_length.')';if($c->numeric_precision)$type.='('.$c->numeric_precision.($c->numeric_scale!==null?','.$c->numeric_scale:'').')';$svg[]='<text class="cn" x="'.($p['x']+10).'" y="'.($yy+15).'">'.esc($c->column_name).'</text><text class="chip" x="'.($p['x']+210).'" y="'.($yy+15).'">'.esc(implode(' ',array_unique($flags))).'</text><text class="ct" text-anchor="end" x="'.($p['x']+$W-10).'" y="'.($yy+15).'">'.esc($type).'</text>';}$svg[]='</g>';}
$svg[]='<text class="foot" x="52" y="'.($vh-36).'">PK = PRIMARY KEY · FK = FOREIGN KEY · UQ = UNIQUE · NN = NOT NULL · las líneas incluyen ON DELETE en su tooltip</text></svg>';
$svg=implode("\n",$svg);
$css='body{margin:0;background:#fff;color:#17201b;font-family:Arial,sans-serif}main{padding:32px}h1{font:700 34px Georgia,serif;margin:0 0 8px}p{color:#68746c;max-width:900px;line-height:1.5}figure{margin:28px 0;overflow:auto;border:1px solid #cfd7d1;background:#fff}svg{display:block;min-width:2400px;width:100%;height:auto}';
$html='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Diagrama físico general PMOS</title><style>'.$css.'</style></head><body><main><h1>Diagrama físico general de la base de datos</h1><p>Esquema PostgreSQL real del proyecto PMOS: tablas, columnas, tipos, restricciones y claves foráneas. Amplía el navegador para inspeccionar cada relación.</p><figure>'.$svg.'</figure></main></body></html>';
file_put_contents(__DIR__.'/diagrama-fisico-general.svg',$svg);
file_put_contents(__DIR__.'/diagrama-fisico-general.html',$html);
echo count($tables).' tablas · '.count($columns).' columnas · '.count($fks).' claves foráneas'.PHP_EOL;
