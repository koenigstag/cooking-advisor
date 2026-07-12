export const LANG_EN_US = {
  indexedDB: {
    unavailable: 'IndexedDB is unavailable',
    unsupported:
      'This browser does not support IndexedDB, the application will not be able to save data.',
  },
  loading: 'Loading…',

  title: 'What to Cook — Find Recipes Based on Ingredients',

  common: {
    menu: 'Menu',
    edit: 'Edit',
    change: 'Edit',
    cancel: 'Cancel',
    delete: 'Delete',
    close: 'Close',
  },

  units: {
    gram: 'g',
    kilogram: 'kg',
    milliliter: 'ml',
    liter: 'l',
    teaspoon: 'tsp',
    tablespoon: 'tbsp',
    piece: 'pc',
    ounce: 'oz',
    fluidOunce: 'fl oz',
    pound: 'lb',
    pint: 'pt',
    quart: 'qt',
    gallon: 'gal',
    cup: 'cup',
    dash: 'dash',
    pinch: 'pinch',
    fortaste: 'to taste',
  },

  nav: {
    recipes: 'Recipes',
    fridge: 'My Products',
    addRecipe: 'Add Recipe',
  },

  root: {
    title: 'What to Cook',
    tagline: 'Find recipes based on what you have in your fridge',
  },

  recipeList: {
    whatIHave: 'What I have',
    collapse: 'Collapse',
    expand: 'Expand',
    noIngredientsHint:
      'No ingredients yet. Add them in the "My Ingredients" tab or directly when creating a recipe.',
    searchPlaceholder: 'Search by name…',
    recipesEnding: 'recipes',
    noRecipesTitle: 'No recipes yet',
    noRecipesHint:
      'Add your first recipe in the "Add Recipe" tab — it will appear here.',
    noResultsTitle: 'No results found',
    status: {
      canCook: 'Can cook',
      missingIngredients: 'Missing {count}',
      noIngredients: 'No ingredients',
      matchedIngredients: ' · {matched}/{total} available',
      warnLowStock: '(low stock)',
    },
    actions: {
      confirmDelete: 'Are you sure you want to delete this recipe?',
    },
  },

  fridge: {
    title: 'My Products',
    actions: {
      addProduct: 'Add Product',
    },
    fields: {
      name: {
        label: 'Name',
        placeholder: 'e.g., Chicken Breast',
      },
      amount: {
        label: 'Amount',
        placeholder: 'e.g., 500',
      },
      unit: {
        label: 'Unit',
        placeholder: 'g, pcs, l…',
      },
    },
    productsList: {
      title: 'My Products ({count})',
      emptyState: {
        title: 'List is empty',
        hint: 'Add the products you have — this will allow filtering recipes.',
      },
      ingredient: {
        fields: {
          name: {
            placeholder: 'name',
          },
          quantity: {
            placeholder: 'qty.',
          },
          unit: {
            placeholder: 'unit',
          },
        },
      },
      actions: {
        remove: 'Remove',
        confirmDelete: 'Are you sure you want to delete this product?',
        confirmDeleteWhenUsed:
          'This product is used in {count} recipe(s). Deleting it will also remove it from those recipes. Are you sure?',
      },
    },
  },

  addRecipe: {
    editRecipe: 'Edit Recipe',
    addRecipe: 'New Recipe',
    fields: {
      name: {
        label: 'Name',
        placeholder: 'e.g., Carbonara Pasta',
      },
      description: {
        label: 'Description / Cooking Method',
        placeholder: 'Short description or cooking steps…',
      },
      ingredients: {
        label: 'Ingredients',
        fields: {
          name: {
            label: 'Product',
            placeholder: 'Product',
          },
          quantity: {
            label: 'Quantity',
            placeholder: 'Qty.',
          },
          unit: {
            label: 'Unit',
            placeholder: 'Unit',
          },
        },
        actions: {
          addRow: '+ Add Ingredient',
          removeRow: 'Remove Row',
        },
      },
    },
    actions: {
      saveChanges: 'Save Changes',
      addRecipe: 'Add Recipe',
      confirmDelete: 'Are you sure you want to delete this recipe?',
      saveAlert: {
        noIngredients: 'Please add at least one ingredient.',
      },
    },
    ingredientsCount: '{count} ingredients',
    recipesCount: 'All Recipes ({count})',
    noRecipes: 'No recipes yet.',
  },

  exportImport: {
    openModalBtn: 'Export / Import Recipes',
    modalTitle: 'Export / Import Recipes',
    export: {
      title: 'Export',
      description:
        'Download all recipes in a single JSON file — for backup or transfer to another device.',
      downloadBtn: 'Download Recipes',
      defaultError: 'Failed to export recipes. Please try again.',
    },
    import: {
      title: 'Import',
      description:
        'Upload a JSON file exported by this app. Recipes with matching names will be updated, others will be added.',
      uploadBtn: 'Choose File…',
      successMessage:
        'Import completed.\nAdded: {added}\nUpdated (matched by name): {replaced}\nSkipped: {skipped}',
      defaultError: 'Failed to import recipes. Please try again.',
      invalidFileFormat:
        'Failed to read file: it must be a JSON file exported by this app.',
    },
  },
};
