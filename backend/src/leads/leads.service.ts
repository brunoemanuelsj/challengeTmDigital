import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { CreateLeadDto } from "./dto/create-lead.dto";
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

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Inserir o lead
      const leadResult = await queryRunner.query(
        `INSERT INTO leads (nome, cpf, email, telefone, status, comentarios) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          createLeadDto.nome,
          createLeadDto.cpf,
          createLeadDto.email,
          createLeadDto.telefone,
          createLeadDto.status,
          createLeadDto.comentarios,
        ]
      );

      const lead = leadResult[0];

      // Inserir propriedades rurais, se fornecidas
      if (createLeadDto.propriedades && createLeadDto.propriedades.length > 0) {
        for (const prop of createLeadDto.propriedades) {
          await queryRunner.query(
            `INSERT INTO propriedades_rurais (lead_id, nome, cultura, area_hectares, municipio, estado) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              lead.id,
              prop.nome,
              prop.cultura,
              prop.area_hectares,
              prop.municipio,
              prop.estado,
            ]
          );
        }
      }

      await queryRunner.commitTransaction();
      return lead;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
