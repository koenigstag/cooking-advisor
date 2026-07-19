export const LANG_EN_US = {
  indexedDB: {
    unavailable: 'IndexedDB is unavailable',
    unsupported:
      'This browser does not support IndexedDB, the application will not be able to save data.',
  },
  loading: 'Loading…',
  appError: {
    title: 'Could not start the app',
    hint: 'Your saved data could not be read or migrated safely, so the app has been stopped to avoid making things worse. Try reloading, or clearing this site’s data if the problem persists.',
    copyStateBtn: 'Copy state JSON',
    copied: 'Copied!',
    stackTraceLabel: 'Stack trace',
  },
  tabError: {
    title: 'This section couldn’t be displayed',
    hint: 'Something went wrong while rendering this tab. Try switching tabs or reloading the page.',
  },
  cardError: {
    message: 'Couldn’t display this item.',
  },

  title: 'What to Cook — Find Recipes Based on Ingredients',

  common: {
    menu: 'Menu',
    edit: 'Edit',
    change: 'Edit',
    cancel: 'Cancel',
    delete: 'Delete',
    close: 'Close',
    save: 'Save',
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

  mealTypes: {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  },

  root: {
    title: 'What to Cook',
    tagline: 'Find recipes based on what you have in your fridge',
  },

  recipeList: {
    whatIHave: 'What I have',
    collapse: 'Collapse',
    expand: 'Expand',
    ingredients: {
      one: 'ingredient',
      other: 'ingredients',
    },
    noIngredientsHint:
      'No ingredients yet. Add them in the "My Ingredients" tab or directly when creating a recipe.',
    searchPlaceholder: 'Search by name or ingredient…',
    noRecipesTitle: 'No recipes yet',
    noRecipesHint:
      'Add your first recipe in the "Add Recipe" tab — it will appear here.',
    noResultsTitle: 'No results found',
    myRecipes: 'My Recipes',
    library: 'Recipe Library',
    addToMyRecipes: 'Add to My Recipes',
    libraryLoading: 'Loading recipe library…',
    libraryEmpty: 'The recipe library is empty.',
    libraryLoadError: 'Could not load the recipe library.',
    libraryDisabled: 'Set a Server Base URL in Settings to use the recipe library.',
    status: {
      canCook: 'Can cook',
      missingIngredients: 'Missing {count}',
      noIngredients: 'No ingredients',
      matchedIngredients: ' · {matched}/{total} available',
      warnLowStock: '(low stock)',
      dietBlocked: '⚠ Contains blocked: {list}',
      dietBlockedTag: '(blocked)',
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
      icon: {
        label: 'Icon',
      },
      tags: {
        label: 'Tags (optional)',
        addBtn: 'Add tag',
        pick: 'Pick a tag…',
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
      dietBlockedTag: '(blocked)',
      blockedAccordion: {
        title: 'Blocked products',
      },
      actions: {
        remove: 'Remove',
        confirmDelete: 'Are you sure you want to delete this product?',
        confirmDeleteWhenUsed: {
          one: 'This product is used in {count} recipe. Deleting it will also remove it from that recipe. Are you sure?',
          other:
            'This product is used in {count} recipes. Deleting it will also remove it from those recipes. Are you sure?',
        },
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
      mealTypes: {
        label: 'Meal Type',
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
    ingredientsCount: {
      one: '{count} ingredient',
      other: '{count} ingredients',
    },
    recipesCount: 'All Recipes ({count})',
    noRecipes: 'No recipes yet.',
  },

  theme: {
    switchToLight: 'Switch to light theme',
    switchToDark: 'Switch to dark theme',
  },

  ingredientTags: {
    dairy: 'Dairy',
    egg: 'Egg',
    gluten: 'Gluten',
    vegetable: 'Vegetable',
    meat: 'Meat',
    pork: 'Pork',
    beef: 'Beef',
    poultry: 'Poultry',
    fish: 'Fish',
    shellfish: 'Shellfish',
    nuts: 'Nuts',
    peanut: 'Peanut',
    soy: 'Soy',
    sesame: 'Sesame',
    alcohol: 'Alcohol',
    honey: 'Honey',
    citrus: 'Citrus',
  },

  settings: {
    openMenuBtn: 'Settings',
    title: 'Settings',
    tabs: {
      dietary: 'Dietary Restrictions',
      sync: 'Sync',
    },
    dietary: {
      suggestionTitle: 'Suggestion. Click to activate.',
      action: {
        label: 'When a recipe contains a blocked ingredient',
        warn: 'Warn',
        hide: 'Hide the recipe',
      },
      blocklistHeading: 'Blocklist',
      blocklist: {
        label: 'Blocked ingredients',
        caption: 'One-off exceptions not covered by a tag.',
        addPlaceholder: 'Ingredient name…',
        addBtn: 'Add',
        unknownIngredient: 'No matching ingredient found.',
      },
      presets: {
        label: 'Presets',
        vegan: 'Vegan',
        vegetarian: 'Vegetarian',
        'gluten-free': 'Gluten-free',
        halal: 'Halal',
        kosher: 'Kosher',
        'no-beef': 'No Beef',
        lent: 'Lent',
        confirmApply: 'This will block all ingredients tagged: {list}. Continue?',
      },
      blockByTag: {
        label: 'Block by tag',
        caption: 'Blocks every ingredient with this tag, now and in the future.',
        addBtn: 'Add tag',
        pick: 'Pick a tag…',
      },
    },
    sync: {
      serverBaseUrl: {
        label: 'Server Base URL',
        placeholder: 'https://example.com',
      },
      saved: 'Saved.',
      errors: {
        invalidUrl: 'Enter a valid URL, e.g. https://example.com.',
        httpsRequired:
          'This page is loaded over HTTPS, so the server URL must use HTTPS too.',
      },
    },
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
