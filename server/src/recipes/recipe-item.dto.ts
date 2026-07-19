import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SupportedLang } from './recipe.entity';

const SUPPORTED_LANGS: SupportedLang[] = ['ru', 'en'];

export class RecipeItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsNumber()
  amount!: number | null;

  @IsOptional()
  @IsString()
  unit!: string | null;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  items!: RecipeItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mealTypes?: string[];

  @IsIn(SUPPORTED_LANGS)
  lang!: SupportedLang;
}
