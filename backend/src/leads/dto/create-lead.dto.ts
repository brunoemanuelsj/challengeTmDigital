export class CreatePropriedadeDto {
  nome: string;
  cultura: string;
  area_hectares: number;
  municipio: string;
  estado: string;
}

export class CreateLeadDto {
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  status: string;
  comentarios?: string;
  propriedades?: CreatePropriedadeDto[];
}
