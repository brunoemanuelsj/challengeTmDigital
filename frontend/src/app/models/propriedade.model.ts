export interface Propriedade {
  id: string;
  lead_id: string;
  lead_nome?: string;
  nome: string;
  cultura: string;
  area_hectares: number;
  municipio: string;
  estado: string;
  geometria?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePropriedadeDto {
  lead_id: string;
  nome: string;
  cultura?: string;
  area_hectares: number;
  municipio?: string;
  estado?: string;
  geometria?: any;
}

export interface UpdatePropriedadeDto {
  lead_id?: string;
  nome?: string;
  cultura?: string;
  area_hectares?: number;
  municipio?: string;
  estado?: string;
  geometria?: any;
}
