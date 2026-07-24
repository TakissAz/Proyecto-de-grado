import { Target } from 'lucide-react';
import HistorialGenerico from './Components/HistorialGenerico';

export default function HistorialObjetivos({ paciente, registros }: any) {
    return (
        <HistorialGenerico
            titulo="Historial de objetivos"
            descripcion="Todos los objetivos nutricionales definidos para el paciente."
            icono={Target}
            colorIcono="text-category-others"
            bgIcono="bg-category-others/10"
            paciente={paciente}
            registros={registros}
            campos={[
                { key: 'objetivo_principal', label: 'Objetivo' },
                { key: 'prioridad', label: 'Prioridad' },
                { key: 'enfoque_nutricional', label: 'Enfoque' },
                { key: 'meta_peso', label: 'Meta peso (kg)' },
                { key: 'meta_cintura', label: 'Meta cintura (cm)' },
                { key: 'plazo_semanas', label: 'Plazo (sem.)' },
                { key: 'objetivo_secundario', label: 'Secundario' },
            ]}
        />
    );
}
