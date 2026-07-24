import { Filter, X } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';

interface Filtros {
    fecha?: string;
    estado?: string;
    paciente?: string;
}

interface Props {
    filtros: Filtros;
    onChange: (f: Filtros) => void;
    onAplicar: () => void;
    onLimpiar: () => void;
}

export default function FiltrosCitas({ filtros, onChange, onAplicar, onLimpiar }: Props) {
    const tieneActivos = Object.values(filtros).some(v => v);

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Estado */}
            <div className="flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 dark:border-surface-border-dark">
                <select
                    value={filtros.estado ?? ''}
                    onChange={e => onChange({ ...filtros, estado: e.target.value })}
                    className="bg-transparent text-[11px] font-medium text-ink outline-none dark:text-ink-dark"
                >
                    <option value="">Todos los estados</option>
                    <option value="programada">Programada</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="atendida">Atendida</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="no_asistio">No asistió</option>
                </select>
            </div>

            {/* Buscar paciente */}
            <div className="flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 dark:border-surface-border-dark">
                <input
                    type="text"
                    value={filtros.paciente ?? ''}
                    onChange={e => onChange({ ...filtros, paciente: e.target.value })}
                    placeholder="Buscar paciente"
                    className="bg-transparent text-[11px] text-ink outline-none w-28 placeholder:text-ink-muted/60 dark:text-ink-dark dark:placeholder:text-ink-muted-dark/60"
                />
            </div>

            {/* Botones */}
            <Boton variante="primary" tamano="xs" onClick={onAplicar}>
                <Filter size={10} strokeWidth={1.8} /> Filtrar
            </Boton>
            {tieneActivos && (
                <Boton variante="ghost" tamano="xs" onClick={onLimpiar}>
                    <X size={10} strokeWidth={1.8} /> Limpiar
                </Boton>
            )}
        </div>
    );
}
