import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePropriedadeDto } from './dto/create-propriedade.dto';
import { UpdatePropriedadeDto } from './dto/update-propriedade.dto';
import { Propriedade } from './propriedades.entity';

@Injectable()
export class PropriedadesService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(leadId?: string): Promise<Propriedade[]> {
    let query = `
      SELECT 
        p.id,
        p.lead_id,
        l.nome as lead_nome,
        p.nome,
        p.cultura,
        p.area_hectares,
        p.municipio,
        p.estado,
        ST_AsGeoJSON(p.geometria) as geometria,
        p.created_at,
        p.updated_at
      FROM propriedades_rurais p
      LEFT JOIN leads l ON p.lead_id = l.id
    `;
    
    const params: any[] = [];
    
    if (leadId) {
      query += ' WHERE p.lead_id = $1';
      params.push(leadId);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const rows = await this.dataSource.query(query, params);
    
    // Parse geometria JSON
    return rows.map((row: any) => ({
      ...row,
      geometria: row.geometria ? JSON.parse(row.geometria) : null,
    }));
  }

  async findOne(id: string): Promise<Propriedade> {
    const rows = await this.dataSource.query(
      `SELECT 
        p.id,
        p.lead_id,
        l.nome as lead_nome,
        p.nome,
        p.cultura,
        p.area_hectares,
        p.municipio,
        p.estado,
        ST_AsGeoJSON(p.geometria) as geometria,
        p.created_at,
        p.updated_at
      FROM propriedades_rurais p
      LEFT JOIN leads l ON p.lead_id = l.id
      WHERE p.id = $1`,
      [id]
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Propriedade com ID ${id} não encontrada`);
    }

    const propriedade = rows[0];
    return {
      ...propriedade,
      geometria: propriedade.geometria ? JSON.parse(propriedade.geometria) : null,
    };
  }

  async create(createPropriedadeDto: CreatePropriedadeDto): Promise<Propriedade> {
    const { lead_id, nome, cultura, area_hectares, municipio, estado, geometria } = createPropriedadeDto;
    
    let geometriaWKT: string | null = null;
    if (geometria) {
      // Se geometria for um objeto GeoJSON, converter para WKT
      if (typeof geometria === 'object' && geometria.type === 'Polygon') {
        const coordinates = geometria.coordinates[0];
        const points = coordinates.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(',');
        geometriaWKT = `POLYGON((${points}))`;
      } else if (typeof geometria === 'string') {
        geometriaWKT = geometria;
      }
    }

    const query = geometriaWKT
      ? `INSERT INTO propriedades_rurais (lead_id, nome, cultura, area_hectares, municipio, estado, geometria)
         VALUES ($1, $2, $3, $4, $5, $6, ST_GeomFromText($7, 4326))
         RETURNING id, lead_id, nome, cultura, area_hectares, municipio, estado, 
                   ST_AsGeoJSON(geometria) as geometria, created_at, updated_at`
      : `INSERT INTO propriedades_rurais (lead_id, nome, cultura, area_hectares, municipio, estado)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, lead_id, nome, cultura, area_hectares, municipio, estado, 
                   ST_AsGeoJSON(geometria) as geometria, created_at, updated_at`;

    const params = geometriaWKT
      ? [lead_id, nome, cultura, area_hectares, municipio, estado, geometriaWKT]
      : [lead_id, nome, cultura, area_hectares, municipio, estado];

    const result = await this.dataSource.query(query, params);
    const propriedade = result[0];
    
    return {
      ...propriedade,
      geometria: propriedade.geometria ? JSON.parse(propriedade.geometria) : null,
    };
  }

  async update(id: string, updatePropriedadeDto: UpdatePropriedadeDto): Promise<Propriedade> {
    // Verificar se a propriedade existe
    await this.findOne(id);

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updatePropriedadeDto.lead_id !== undefined) {
      updates.push(`lead_id = $${paramIndex++}`);
      params.push(updatePropriedadeDto.lead_id);
    }

    if (updatePropriedadeDto.nome !== undefined) {
      updates.push(`nome = $${paramIndex++}`);
      params.push(updatePropriedadeDto.nome);
    }

    if (updatePropriedadeDto.cultura !== undefined) {
      updates.push(`cultura = $${paramIndex++}`);
      params.push(updatePropriedadeDto.cultura);
    }

    if (updatePropriedadeDto.area_hectares !== undefined) {
      updates.push(`area_hectares = $${paramIndex++}`);
      params.push(updatePropriedadeDto.area_hectares);
    }

    if (updatePropriedadeDto.municipio !== undefined) {
      updates.push(`municipio = $${paramIndex++}`);
      params.push(updatePropriedadeDto.municipio);
    }

    if (updatePropriedadeDto.estado !== undefined) {
      updates.push(`estado = $${paramIndex++}`);
      params.push(updatePropriedadeDto.estado);
    }

    if (updatePropriedadeDto.geometria !== undefined) {
      let geometriaWKT: string | null = null;
      if (updatePropriedadeDto.geometria) {
        if (typeof updatePropriedadeDto.geometria === 'object' && updatePropriedadeDto.geometria.type === 'Polygon') {
          const coordinates = updatePropriedadeDto.geometria.coordinates[0];
          const points = coordinates.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(',');
          geometriaWKT = `POLYGON((${points}))`;
        } else if (typeof updatePropriedadeDto.geometria === 'string') {
          geometriaWKT = updatePropriedadeDto.geometria;
        }
      }
      updates.push(`geometria = ST_GeomFromText($${paramIndex++}, 4326)`);
      params.push(geometriaWKT);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updates.length === 1) {
      // Apenas updated_at foi adicionado, nada para atualizar
      return this.findOne(id);
    }

    params.push(id);
    const query = `
      UPDATE propriedades_rurais 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, lead_id, nome, cultura, area_hectares, municipio, estado, 
                ST_AsGeoJSON(geometria) as geometria, created_at, updated_at
    `;

    const result = await this.dataSource.query(query, params);
    const propriedade = result[0];
    
    return {
      ...propriedade,
      geometria: propriedade.geometria ? JSON.parse(propriedade.geometria) : null,
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.dataSource.query(
      'DELETE FROM propriedades_rurais WHERE id = $1',
      [id]
    );

    if (result[1] === 0) {
      throw new NotFoundException(`Propriedade com ID ${id} não encontrada`);
    }
  }
}
