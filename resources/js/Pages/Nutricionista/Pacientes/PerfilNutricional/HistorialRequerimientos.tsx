import { Calculator } from 'lucide-react';
import HistorialGenerico from './Components/HistorialGenerico';

export default function HistorialRequerimientos({ paciente, registros }: any) {
    return (
        <HistorialGenerico
            tipoHistorial="requerimientos"
            titulo="Historial de requerimientos nutricionales"
            descripcion="Compara cada estimación, los datos usados como referencia y el efecto de los recálculos sobre la energía y los macronutrientes."
            icono={Calculator}
            colorIcono="text-brand-green-dark dark:text-brand-green"
            bgIcono="bg-brand-green/10"
            paciente={paciente}
            registros={registros}
            camposGrafico={['calorias_objetivo', 'tmb', 'get', 'peso_referencia']}
            campos={[
                { key: 'calorias_objetivo', label: 'Calorías objetivo' },
                { key: 'tmb', label: 'TMB (kcal)' },
                { key: 'get', label: 'GET (kcal)' },
                { key: 'ajuste_calorico', label: 'Ajuste (kcal)' },
                { key: 'peso_referencia', label: 'Peso referencia (kg)' },
                { key: 'talla_referencia', label: 'Talla referencia (m)' },
                { key: 'nivel_actividad', label: 'Actividad' },
                { key: 'factor_actividad', label: 'Factor actividad' },
                { key: 'proteinas_diarias', label: 'Proteínas (g)' },
                { key: 'carbohidratos_diarios', label: 'Carbohidratos (g)' },
                { key: 'grasas_diarias', label: 'Grasas (g)' },
                { key: 'fibra_diaria', label: 'Fibra (g)' },
                { key: 'metodo_calculo', label: 'Método utilizado' },
            ]}
        />
    );
}
