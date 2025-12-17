import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { LeadsService } from "./leads.service";

@Controller("leads")
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async getAll() {
    return await this.leadsService.findAll();
  }

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto) {
    return await this.leadsService.create(createLeadDto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return await this.leadsService.delete(id);
  }
}
