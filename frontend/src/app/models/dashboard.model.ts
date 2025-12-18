export interface LeadByStatus {
  status: string;
  count: number;
}

export interface LeadByMunicipio {
  municipio: string;
  count: number;
}

export interface PriorityLead {
  id: string;
  nome: string;
  cpf: string;
  status: string;
  totalArea: number;
}

export interface PropertyStats {
  totalPropriedades: number;
  areaTotal: number;
  areaMedia: number;
}

export interface DashboardStats {
  totalLeads: number;
  leadsByStatus: LeadByStatus[];
  leadsByMunicipio: LeadByMunicipio[];
  priorityLeads: PriorityLead[];
  propertyStats: PropertyStats;
}
