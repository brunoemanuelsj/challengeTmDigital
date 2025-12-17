import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Lead } from './lead.entity';

@Injectable()
export class LeadsService {
  constructor(private readonly dataSource: DataSource) {}

  // Executa somente uma consulta SELECT direta ao banco.
  async findOne(): Promise<Lead | null> {
    const rows = await this.dataSource.query('SELECT * FROM leads LIMIT 1');
    return (rows && rows[0]) ?? null;
  }
}
