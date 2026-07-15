interface Props {
    mensaje: string;
    descripcion?: string;
}

export function EstadoVacio({ mensaje, descripcion }: Props) {
    return (
        <div className="text-center py-12 px-4">
            <p className="text-base-content/60 font-medium text-sm">{mensaje}</p>
            {descripcion ? <p className="text-base-content/40 text-xs mt-1">{descripcion}</p> : null}
        </div>
    );
}
