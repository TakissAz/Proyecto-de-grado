import { Heart } from 'lucide-react';
import HistorialGenerico from './Components/HistorialGenerico';

export default function HistorialPreferencias({ paciente, registros }: any) {
    return (
        <HistorialGenerico
            titulo="Historial de preferencias"
            descripcion="Todos los registros de preferencias alimentarias del paciente."
            icono={Heart}
            colorIcono="text-category-dairy"
            bgIcono="bg-category-dairy/10"
            paciente={paciente}
            registros={registros}
            campos={[
                { key: 'alimentos_preferidos', label: 'Preferidos' },
                { key: 'alimentos_no_preferidos', label: 'No preferidos' },
                { key: 'comidas_preferidas', label: 'Comidas pref.' },
                { key: 'comidas_frecuentes', label: 'Frecuentes' },
                { key: 'preparaciones_preferidas', label: 'Preparaciones' },
                { key: 'sabores_preferidos', label: 'Sabores' },
            ]}
        />
    );
}
