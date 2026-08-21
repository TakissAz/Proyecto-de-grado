import FormularioAntecedentes from './FormularioAntecedentes';
import type { AntecedentesData } from '../../tipos';

interface Props { abierto: boolean; idPaciente: number; antecedentes: AntecedentesData; onCerrar: () => void; }
export default function EditarAntecedentes({ antecedentes, ...props }: Props) {
    return <FormularioAntecedentes {...props} idConsulta={antecedentes.id_consulta_endocrinologica} existente={antecedentes} />;
}
