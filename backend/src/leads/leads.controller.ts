import { Controller, Get } from '@nestjs/common';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get('one')
  async getOne() {
    return this.leadsService.findOne();
  }
}
