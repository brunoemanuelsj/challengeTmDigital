export class Propriedade {
  id: string;
  lead_id: string;
  lead_nome?: string;
  nome: string;
  cultura: string;
  area_hectares: number;
  municipio: string;
  estado: string;
  geometria?: any; // GeoJSON ou WKT
  created_at: Date;
  updated_at: Date;
}
