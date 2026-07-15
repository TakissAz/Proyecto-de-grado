interface Props {
    alertas: string[];
}

export function ListaAlertasPmos({ alertas }: Props) {
    if (alertas.length === 0) return null;

    return (
        <div className="alert alert-info text-xs py-2">
            <div>
                <p className="font-bold mb-1">Datos faltantes para completar evaluación:</p>
                {alertas.map((a, i) => <p key={i} className="text-base-content/70">- {a}</p>)}
            </div>
        </div>
    );
}
