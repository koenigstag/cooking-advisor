import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateRecipeDto } from './recipe-item.dto';
import { LibraryRecipe, SupportedLang } from './recipe.entity';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  findAll(@Query('lang') lang?: SupportedLang): Promise<LibraryRecipe[]> {
    return this.recipesService.findAll(lang);
  }

  @Post()
  create(@Body() dto: CreateRecipeDto): Promise<LibraryRecipe> {
    return this.recipesService.create(dto);
  }
}
