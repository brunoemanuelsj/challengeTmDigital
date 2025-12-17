import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
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

  @Put(":id")
  async update(@Param("id") id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return await this.leadsService.update(id, updateLeadDto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return await this.leadsService.delete(id);
  }
}
