import { ShieldAlert } from 'lucide-react';
import HistorialGenerico from './Components/HistorialGenerico';

export default function HistorialRestricciones({ paciente, registros }: any) {
    return (
        <HistorialGenerico
            titulo="Historial de restricciones"
            descripcion="Todos los registros de restricciones alimentarias del paciente."
            icono={ShieldAlert}
            colorIcono="text-category-fruits"
            bgIcono="bg-category-fruits/10"
            paciente={paciente}
            registros={registros}
            campos={[
                { key: 'alergias', label: 'Alergias' },
                { key: 'intolerancias', label: 'Intolerancias' },
                { key: 'alimentos_restringidos', label: 'Restringidos' },
                { key: 'alimentos_no_tolerados', label: 'No tolerados' },
                { key: 'alimentos_rechazados', label: 'Rechazados' },
            ]}
        />
    );
}
