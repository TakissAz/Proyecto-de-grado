import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AgendaCitas from '@/Components/Citas/AgendaCitas';
import ModalCrearCita from '@/Components/Citas/ModalCrearCita';
import type { CitaData, PacienteOption, ProfesionalOption } from '@/Components/Citas/tipos';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    citas: { data: CitaData[]; current_page: number; last_page: number };
    filtros: { fecha?: string; estado?: string; paciente?: string };
    pacientes: PacienteOption[];
    profesional: ProfesionalOption;
    tipoProfesional: string;
}

export default function CitasIndex({ citas, filtros, pacientes, profesional, tipoProfesional }: Props) {
    const [modalAbierto, setModalAbierto] = useState(false);

    return (
        <AuthenticatedLayout title="Calendario">
            <Head title="Calendario" />
            <AgendaCitas
                citas={citas}
                filtros={filtros}
                prefijo="nutricionista"
                onNuevaCita={() => setModalAbierto(true)}
            />

            <ModalCrearCita
                abierto={modalAbierto}
                onCerrar={() => setModalAbierto(false)}
                pacientes={pacientes}
                profesional={profesional}
                tipoProfesional={tipoProfesional}
                rutaStore="/nutricionista/citas"
                rutaBloques="/nutricionista/citas/bloques"
            />
        </AuthenticatedLayout>
    );
}
