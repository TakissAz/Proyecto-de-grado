import { User, Phone, MapPin, Briefcase, Heart, Calendar } from 'lucide-react';
import Tarjeta from '@/Components/ui/tarjeta';

interface Props {
    sexo: string;
    fechaNacimiento: string;
    edad?: number | null;
    telefono?: string | null;
    direccion?: string | null;
    ocupacion?: string | null;
    estadoCivil?: string | null;
    fechaRegistro?: string | null;
    observaciones?: string | null;
}

export default function PerfilDatosPersonales({
    sexo,
    fechaNacimiento,
    edad,
    telefono,
    direccion,
    ocupacion,
    estadoCivil,
    fechaRegistro,
    observaciones,
}: Props) {
    return (
        <Tarjeta>
            <h3 className="mb-4 text-[14px] font-semibold text-ink dark:text-ink-dark">
                Información personal
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DatoIcono icon={<User size={14} strokeWidth={1.8} />} label="Sexo" valor={sexo} />
                <DatoIcono icon={<Calendar size={14} strokeWidth={1.8} />} label="Fecha nacimiento" valor={fechaNacimiento} />
                <DatoIcono icon={<User size={14} strokeWidth={1.8} />} label="Edad" valor={edad ? `${edad} años` : null} />
                <DatoIcono icon={<Phone size={14} strokeWidth={1.8} />} label="Teléfono" valor={telefono} />
                <DatoIcono icon={<MapPin size={14} strokeWidth={1.8} />} label="Dirección" valor={direccion} />
                <DatoIcono icon={<Briefcase size={14} strokeWidth={1.8} />} label="Ocupación" valor={ocupacion} />
                <DatoIcono icon={<Heart size={14} strokeWidth={1.8} />} label="Estado civil" valor={estadoCivil} />
                <DatoIcono icon={<Calendar size={14} strokeWidth={1.8} />} label="Registrada el" valor={fechaRegistro} />
            </div>

            {observaciones ? (
                <div className="mt-4 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                    <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">
                        Observaciones
                    </p>
                    <p className="mt-1 text-[13px] text-ink dark:text-ink-dark">{observaciones}</p>
                </div>
            ) : null}
        </Tarjeta>
    );
}

function DatoIcono({ icon, label, valor }: { icon: React.ReactNode; label: string; valor?: string | null }) {
    return (
        <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-green/8 text-brand-green-dark dark:bg-brand-green-dark/15 dark:text-brand-green">
                {icon}
            </div>
            <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">
                    {label}
                </p>
                <p className="text-[13px] text-ink dark:text-ink-dark">{valor || '—'}</p>
            </div>
        </div>
    );
}
