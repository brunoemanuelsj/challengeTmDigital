import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreatePropriedadeDto } from './dto/create-propriedade.dto';
import { UpdatePropriedadeDto } from './dto/update-propriedade.dto';
import { PropriedadesService } from './propriedades.service';

@Controller('propriedades')
export class PropriedadesController {
  constructor(private readonly propriedadesService: PropriedadesService) {}

  @Get()
  findAll(@Query('leadId') leadId?: string) {
    return this.propriedadesService.findAll(leadId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propriedadesService.findOne(id);
  }

  @Post()
  create(@Body() createPropriedadeDto: CreatePropriedadeDto) {
    return this.propriedadesService.create(createPropriedadeDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropriedadeDto: UpdatePropriedadeDto) {
    return this.propriedadesService.update(id, updatePropriedadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propriedadesService.remove(id);
  }
}
