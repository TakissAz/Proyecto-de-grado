import FormularioAntecedentes from './FormularioAntecedentes';

interface Props { abierto: boolean; idPaciente: number; idConsulta: number | null; onCerrar: () => void; }
export default function CrearAntecedentes(props: Props) { return <FormularioAntecedentes {...props} />; }
