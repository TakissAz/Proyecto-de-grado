import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BotonLink } from '@/Components/ui/boton';
import FormularioRegla, { type ReglaNutricional } from './FormularioRegla';

export default function Edit({ regla }: { regla: ReglaNutricional }) {
  return <AuthenticatedLayout title="Editar regla nutricional"><Head title={`Editar ${regla.codigo}`} /><div className="mx-auto max-w-6xl space-y-4"><BotonLink href="/nutricionista/reglas-nutricionales" variante="ghost"><ArrowLeft size={14} /> Volver a reglas</BotonLink><FormularioRegla regla={regla} /></div></AuthenticatedLayout>;
}
