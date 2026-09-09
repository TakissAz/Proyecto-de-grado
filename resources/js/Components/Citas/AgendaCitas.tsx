import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import CalendarioCitas from './CalendarioCitas';
import CentroAgenda from './CentroAgenda';
import ResumenCitasDia from './ResumenCitasDia';
import ListadoCitasMejorado from './ListadoCitasMejorado';
import PanelHorarios from './PanelHorarios';
import type { CitaData } from './tipos';

interface Props {
    citas: { data: CitaData[]; current_page: number; last_page: number; total: number; from: number | null; to: number | null; per_page: number };
    citasAgenda: CitaData[];
    filtros: { fecha?: string; estado?: string; paciente?: string };
    prefijo: 'endocrinologo' | 'nutricionista';
    onNuevaCita?: () => void;
}

export default function AgendaCitas({ citas, citasAgenda, filtros, prefijo, onNuevaCita }: Props) {
    const [filtrosLocales, setFiltrosLocales] = useState(filtros);
    const [fechaVista, setFechaVista] = useState(() => {
        if (filtros.fecha) return filtros.fecha;
        const hoy = new Date();
        return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    });
    const [tabEstado, setTabEstado] = useState(filtros.estado ?? '');

    const citasPorFecha = useMemo(() => {
        return citasAgenda.reduce<Record<string, CitaData[]>>((agrupadas, cita) => {
            (agrupadas[cita.fecha_cita] ??= []).push(cita);
            return agrupadas;
        }, {});
    }, [citasAgenda]);

    const navegarConFiltros = (siguientes: typeof filtrosLocales) => {
        const parametros = Object.fromEntries(Object.entries(siguientes).filter(([, valor]) => valor));
        router.get(`/${prefijo}/citas`, parametros, { preserveState: true });
    };

    const cambiarEstado = (estado: string) => {
        setTabEstado(estado);
        navegarConFiltros({ ...filtrosLocales, estado: estado || undefined });
    };

    const cambiarPagina = (pagina: number) => {
        const parametros = Object.fromEntries(Object.entries(filtrosLocales).filter(([, valor]) => valor));
        router.get(`/${prefijo}/citas`, { ...parametros, estado: tabEstado || undefined, page: pagina }, { preserveState: true, preserveScroll: true });
    };

    return (
        <div className="grid min-h-[calc(100vh-7rem)] w-full min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(760px,1fr)_340px]">
            <main className="card-elevated flex min-w-0 flex-col p-4">
                <CalendarioCitas
                    citasPorFecha={citasPorFecha}
                    fechaSeleccionada={fechaVista}
                    onSelectFecha={setFechaVista}
                />

                <div className="mt-4 flex-1">
                    <ListadoCitasMejorado
                        citas={citas.data}
                        paginacion={{ paginaActual: citas.current_page, ultimaPagina: citas.last_page, total: citas.total, desde: citas.from, hasta: citas.to }}
                        paciente={filtrosLocales.paciente ?? ''}
                        estado={tabEstado}
                        prefijo={prefijo}
                        onPacienteChange={(paciente) => setFiltrosLocales((actuales) => ({ ...actuales, paciente }))}
                        onBuscar={() => navegarConFiltros(filtrosLocales)}
                        onEstadoChange={cambiarEstado}
                        onPaginaChange={cambiarPagina}
                        onNuevaCita={onNuevaCita}
                    />
                </div>
            </main>

            <aside className="grid content-start gap-3 sm:grid-cols-2 xl:sticky xl:top-4 xl:grid-cols-1">
                <div className="card-elevated p-4">
                    <PanelHorarios fecha={fechaVista} citas={citasPorFecha[fechaVista] ?? []} />
                </div>
                <div className="card-elevated p-4">
                    <ResumenCitasDia citas={citasPorFecha[fechaVista] ?? []} fecha={fechaVista} />
                </div>
                <CentroAgenda
                    onNuevaCita={onNuevaCita}
                />
            </aside>
        </div>
    );
}
