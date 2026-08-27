import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BotonLink } from '@/Components/ui/boton';
import FormularioRegla from './FormularioRegla';

export default function Create() {
  return <AuthenticatedLayout title="Nueva regla nutricional"><Head title="Nueva regla nutricional" /><div className="mx-auto max-w-6xl space-y-4"><BotonLink href="/nutricionista/reglas-nutricionales" variante="ghost"><ArrowLeft size={14} /> Volver a reglas</BotonLink><FormularioRegla /></div></AuthenticatedLayout>;
}
