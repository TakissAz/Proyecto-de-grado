import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import CalendarioCitas from './CalendarioCitas';
import CentroAgenda from './CentroAgenda';
import ResumenCitasDia from './ResumenCitasDia';
import ListadoCitasMejorado from './ListadoCitasMejorado';
import PanelHorarios from './PanelHorarios';
import type { CitaData } from './tipos';

interface Props {
    citas: { data: CitaData[]; current_page: number; last_page: number };
    filtros: { fecha?: string; estado?: string; paciente?: string };
    prefijo: 'endocrinologo' | 'nutricionista';
    onNuevaCita?: () => void;
}

export default function AgendaCitas({ citas, filtros, prefijo, onNuevaCita }: Props) {
    const [filtrosLocales, setFiltrosLocales] = useState(filtros);
    const [fechaVista, setFechaVista] = useState(() => {
        if (filtros.fecha) return filtros.fecha;
        const hoy = new Date();
        return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    });
    const [tabEstado, setTabEstado] = useState(filtros.estado ?? '');

    const citasPorFecha = useMemo(() => {
        return citas.data.reduce<Record<string, CitaData[]>>((agrupadas, cita) => {
            (agrupadas[cita.fecha_cita] ??= []).push(cita);
            return agrupadas;
        }, {});
    }, [citas.data]);

    const navegarConFiltros = (siguientes: typeof filtrosLocales) => {
        const parametros = Object.fromEntries(Object.entries(siguientes).filter(([, valor]) => valor));
        router.get(`/${prefijo}/citas`, parametros, { preserveState: true });
    };

    const cambiarEstado = (estado: string) => {
        setTabEstado(estado);
        navegarConFiltros({ ...filtrosLocales, estado: estado || undefined });
    };

    return (
        <div className="grid min-h-[calc(100vh-7rem)] w-full min-w-0 grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] xl:grid-cols-[minmax(620px,1fr)_minmax(280px,320px)_minmax(240px,280px)] 2xl:grid-cols-[minmax(700px,1fr)_320px_280px]">
            <main className="card-elevated flex min-w-0 flex-col p-4">
                <CalendarioCitas
                    citasPorFecha={citasPorFecha}
                    fechaSeleccionada={fechaVista}
                    onSelectFecha={setFechaVista}
                />

                <div className="mt-4 flex-1">
                    <ListadoCitasMejorado
                        citas={citas.data}
                        paciente={filtrosLocales.paciente ?? ''}
                        estado={tabEstado}
                        prefijo={prefijo}
                        onPacienteChange={(paciente) => setFiltrosLocales((actuales) => ({ ...actuales, paciente }))}
                        onBuscar={() => navegarConFiltros(filtrosLocales)}
                        onEstadoChange={cambiarEstado}
                        onNuevaCita={onNuevaCita}
                    />
                </div>
            </main>

            <aside className="grid h-full gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-[auto_1fr]">
                <div className="card-elevated h-full p-4">
                    <PanelHorarios fecha={fechaVista} citas={citasPorFecha[fechaVista] ?? []} />
                </div>
                <div className="card-elevated h-full p-4">
                    <ResumenCitasDia citas={citasPorFecha[fechaVista] ?? []} fecha={fechaVista} />
                </div>
            </aside>

            <CentroAgenda
                citas={citasPorFecha[fechaVista] ?? []}
                fecha={fechaVista}
                prefijo={prefijo}
                onNuevaCita={onNuevaCita}
            />
        </div>
    );
}




