import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Lead } from "./lead.entity";

type LeadWithArea = Lead & { total_area: number };

@Injectable()
export class LeadsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<LeadWithArea[] | null> {
    const rows = await this.dataSource.query(`
      SELECT 
        l.*, 
        COALESCE(SUM(p.area_hectares), 0) as total_area
      FROM leads l
      LEFT JOIN propriedades_rurais p ON l.id = p.lead_id
      GROUP BY l.id, l.nome, l.cpf, l.email, l.telefone, l.status, l.comentarios, l.created_at, l.updated_at
      ORDER BY l.created_at DESC
    `);
    return rows ?? null;
  }
}
