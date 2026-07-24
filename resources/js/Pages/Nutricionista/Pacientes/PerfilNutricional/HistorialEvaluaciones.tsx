import { Scale } from 'lucide-react';
import HistorialGenerico from './Components/HistorialGenerico';

export default function HistorialEvaluaciones({ paciente, registros }: any) {
    return (
        <HistorialGenerico
            titulo="Historial de evaluaciones"
            descripcion="Todos los registros de evaluación nutricional (antropometría y composición corporal)."
            icono={Scale}
            colorIcono="text-brand-green-dark dark:text-brand-green"
            bgIcono="bg-brand-green/10"
            paciente={paciente}
            registros={registros}
            campoFecha="fecha_evaluacion"
            campos={[
                { key: 'fecha_evaluacion', label: 'Fecha' },
                { key: 'peso', label: 'Peso (kg)' },
                { key: 'talla', label: 'Talla (m)' },
                { key: 'imc', label: 'IMC', destacar: (v: any) => v && Number(v) >= 25 },
                { key: 'circunferencia_cintura', label: 'Cintura (cm)' },
                { key: 'circunferencia_cadera', label: 'Cadera (cm)' },
                { key: 'indice_cintura_cadera', label: 'ICC' },
                { key: 'porcentaje_grasa', label: 'Grasa (%)' },
                { key: 'masa_muscular', label: 'M. muscular (kg)' },
                { key: 'nivel_actividad', label: 'Actividad' },
            ]}
        />
    );
}
