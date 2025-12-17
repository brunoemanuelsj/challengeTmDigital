import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
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

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Construir query de atualização dinamicamente
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateLeadDto.nome !== undefined) {
        fields.push(`nome = $${paramIndex++}`);
        values.push(updateLeadDto.nome);
      }
      if (updateLeadDto.cpf !== undefined) {
        fields.push(`cpf = $${paramIndex++}`);
        values.push(updateLeadDto.cpf);
      }
      if (updateLeadDto.email !== undefined) {
        fields.push(`email = $${paramIndex++}`);
        values.push(updateLeadDto.email);
      }
      if (updateLeadDto.telefone !== undefined) {
        fields.push(`telefone = $${paramIndex++}`);
        values.push(updateLeadDto.telefone);
      }
      if (updateLeadDto.status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(updateLeadDto.status);
      }
      if (updateLeadDto.comentarios !== undefined) {
        fields.push(`comentarios = $${paramIndex++}`);
        values.push(updateLeadDto.comentarios);
      }

      // Atualizar updated_at
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const updateQuery = `
        UPDATE leads 
        SET ${fields.join(', ')} 
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await queryRunner.query(updateQuery, values);

      await queryRunner.commitTransaction();
      return result[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Deletar propriedades rurais associadas primeiro
      await queryRunner.query(
        `DELETE FROM propriedades_rurais WHERE lead_id = $1`,
        [id]
      );

      // Deletar o lead
      const result = await queryRunner.query(
        `DELETE FROM leads WHERE id = $1`,
        [id]
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
