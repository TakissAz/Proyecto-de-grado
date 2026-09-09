import { Heart } from 'lucide-react';
import HistorialGenerico from './Components/HistorialGenerico';

export default function HistorialPreferencias({ paciente, registros }: any) {
    return (
        <HistorialGenerico
            tipoHistorial="preferencias"
            titulo="Evolución de preferencias alimentarias"
            descripcion="Consulta qué gustos se incorporaron o retiraron en cada valoración y cómo cambió el perfil alimentario de la paciente."
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
