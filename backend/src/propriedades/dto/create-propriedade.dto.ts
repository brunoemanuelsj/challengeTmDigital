import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePropriedadeDto {
  @IsUUID()
  @IsNotEmpty()
  lead_id: string;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  cultura?: string;

  @IsNumber()
  @Min(0.01)
  area_hectares: number;

  @IsString()
  @IsOptional()
  municipio?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsOptional()
  geometria?: any; // GeoJSON ou WKT string
}
