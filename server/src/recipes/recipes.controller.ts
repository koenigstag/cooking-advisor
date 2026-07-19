import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateRecipeDto } from './recipe-item.dto';
import { LibraryRecipe } from './recipe.entity';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  findAll(): Promise<LibraryRecipe[]> {
    return this.recipesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateRecipeDto): Promise<LibraryRecipe> {
    return this.recipesService.create(dto);
  }
}
