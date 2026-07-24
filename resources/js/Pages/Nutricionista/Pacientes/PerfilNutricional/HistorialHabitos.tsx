import { UtensilsCrossed } from 'lucide-react';
import HistorialGenerico from './Components/HistorialGenerico';

export default function HistorialHabitos({ paciente, registros }: any) {
    return (
        <HistorialGenerico
            titulo="Historial de hábitos"
            descripcion="Todos los registros de hábitos alimentarios del paciente."
            icono={UtensilsCrossed}
            colorIcono="text-brand-orange"
            bgIcono="bg-brand-orange/10"
            paciente={paciente}
            registros={registros}
            campos={[
                { key: 'comidas_por_dia', label: 'Comidas/día' },
                { key: 'consumo_agua_litros', label: 'Agua (L)' },
                { key: 'consumo_azucar', label: 'Azúcar' },
                { key: 'consumo_ultraprocesados', label: 'Ultraprocesados' },
                { key: 'consumo_frituras', label: 'Frituras' },
                { key: 'consumo_bebidas_azucaradas', label: 'Beb. azucaradas' },
                { key: 'frecuencia_frutas_verduras', label: 'Frutas/verduras' },
                { key: 'horarios_regulares', label: 'Horarios regulares' },
                { key: 'consume_desayuno', label: 'Desayuna' },
                { key: 'cena_tardia', label: 'Cena tarde' },
                { key: 'ansiedad_por_comida', label: 'Ansiedad' },
                { key: 'hambre_nocturna', label: 'Hambre nocturna' },
            ]}
        />
    );
}
