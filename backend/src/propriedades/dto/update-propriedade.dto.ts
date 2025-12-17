import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdatePropriedadeDto {
  @IsUUID()
  @IsOptional()
  lead_id?: string;

  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  cultura?: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  area_hectares?: number;

  @IsString()
  @IsOptional()
  municipio?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsOptional()
  geometria?: any; // GeoJSON ou WKT string
}
