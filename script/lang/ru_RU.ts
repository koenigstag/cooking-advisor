export const LANG_RU_RU = {
  indexedDB: {
    unavailable: 'IndexedDB недоступен',
    unsupported:
      'Этот браузер не поддерживает IndexedDB, приложение не сможет сохранять данные.',
  },
  loading: 'Загрузка…',

  title: 'Что приготовить — подбор рецептов по продуктам',

  common: {
    menu: 'Меню',
    edit: 'Редактировать',
    change: 'Изменить',
    cancel: 'Отменить',
    delete: 'Удалить',
    close: 'Закрыть',
  },

  units: {
    gram: 'г',
    kilogram: 'кг',
    milliliter: 'мл',
    liter: 'л',
    teaspoon: 'ч. л.',
    tablespoon: 'ст. л.',
    piece: 'шт.',
    ounce: 'унц.',
    fluidOunce: 'жид. унц.',
    pound: 'фунт',
    pint: 'пинта',
    quart: 'кварта',
    gallon: 'галлон',
    cup: 'чашка',
    dash: 'капля',
    pinch: 'щепотка',
    fortaste: 'по вкусу',
  },

  nav: {
    recipes: 'Рецепты',
    fridge: 'Мои продукты',
    addRecipe: 'Добавить рецепт',
  },

  root: {
    title: 'Что приготовить',
    tagline: 'подбор рецептов по тому, что есть в холодильнике',
  },

  recipeList: {
    whatIHave: 'Что у меня есть',
    collapse: 'Свернуть',
    expand: 'Развернуть',
    noIngredientsHint:
      'Продуктов пока нет. Добавьте их во вкладке «Мои продукты» или прямо при создании рецепта.',
    searchPlaceholder: 'Поиск по названию…',
    recipesEnding: 'рец.',
    noRecipesTitle: 'Пока нет ни одного рецепта',
    noRecipesHint:
      'Добавьте первый рецепт во вкладке «Добавить рецепт» — и он появится здесь.',
    noResultsTitle: 'Ничего не найдено',
    status: {
      canCook: 'Можно готовить',
      missingIngredients: 'Не хватает {count}',
      noIngredients: 'Нет продуктов',
      matchedIngredients: ' · {matched}/{total} есть в наличии',
      warnLowStock: '(мало)',
    },
    actions: {
      confirmDelete: 'Вы уверены, что хотите удалить этот рецепт?',
    },
  },

  fridge: {
    title: 'Мои продукты',
    actions: {
      addProduct: 'Добавить продукт',
    },
    fields: {
      name: {
        label: 'Название',
        placeholder: 'например, куриное филе',
      },
      amount: {
        label: 'Количество',
        placeholder: 'например, 500',
      },
      unit: {
        label: 'Ед. изм.',
        placeholder: 'г, шт, л…',
      },
    },
    productsList: {
      title: 'Мои продукты ({count})',
      emptyState: {
        title: 'Список пуст',
        hint: 'Добавьте продукты, которые у вас есть — это позволит фильтровать рецепты.',
      },
      ingredient: {
        fields: {
          name: {
            placeholder: 'название',
          },
          quantity: {
            placeholder: 'кол-во',
          },
          unit: {
            placeholder: 'ед.',
          },
        },
      },
      actions: {
        remove: 'Удалить',
        confirmDelete: 'Вы уверены, что хотите удалить этот продукт?',
        confirmDeleteWhenUsed:
          'Этот продукт используется в {count} рецепт(ах). При удалении он также будет убран из них. Вы уверены?',
      },
    },
  },

  addRecipe: {
    editRecipe: 'Редактировать рецепт',
    addRecipe: 'Новый рецепт',
    fields: {
      name: {
        label: 'Название',
        placeholder: 'например, Паста Карбонара',
      },
      description: {
        label: 'Описание / способ приготовления',
        placeholder: 'Короткое описание или шаги приготовления…',
      },
      ingredients: {
        label: 'Ингредиенты',
        fields: {
          name: {
            label: 'продукт',
            placeholder: 'продукт',
          },
          quantity: {
            label: 'количество',
            placeholder: 'кол-во',
          },
          unit: {
            label: 'единица измерения',
            placeholder: 'ед.',
          },
        },
        actions: {
          addRow: '+ добавить ингредиент',
          removeRow: 'Удалить строку',
        },
      },
    },
    actions: {
      saveChanges: 'Сохранить изменения',
      addRecipe: 'Добавить рецепт',
      confirmDelete: 'Вы уверены, что хотите удалить этот рецепт?',
      saveAlert: {
        noIngredients: 'Добавьте хотя бы один ингредиент.',
      },
    },
    ingredientsCount: '{count} ингредиентов',
    recipesCount: 'Все рецепты ({count})',
    noRecipes: 'Рецептов пока нет.',
  },

  exampleData: {
    useBtn: 'Добавить начальные данные',
    hint: 'Добавьте несколько примеров рецептов и продуктов, чтобы посмотреть, как работает приложение.',
    successMessage:
      'Добавлено рецептов: {added}. Холодильник заполнен примерными продуктами.',
    alreadyLoaded: 'Начальные рецепты уже есть в вашем списке.',
  },

  exportImport: {
    openModalBtn: 'Экспорт / импорт рецептов',
    modalTitle: 'Экспорт / импорт рецептов',
    export: {
      title: 'Экспорт',
      description:
        'Скачать все рецепты в один JSON-файл — для бэкапа или переноса на другое устройство.',
      downloadBtn: 'Скачать рецепты',
      defaultError: 'Не удалось экспортировать рецепты. Попробуйте ещё раз.',
    },
    import: {
      title: 'Импорт',
      description:
        'Загрузить JSON-файл, экспортированный этим же приложением. Рецепты с совпадающим названием будут обновлены, остальные — добавлены.',
      uploadBtn: 'Выбрать файл…',
      successMessage:
        'Импорт завершён.\nДобавлено: {added}\nОбновлено (совпало по названию): {replaced}\nПропущено: {skipped}',
      defaultError: 'Не удалось импортировать рецепты. Попробуйте ещё раз.',
      invalidFileFormat:
        'Не удалось прочитать файл: он должен быть в формате JSON, экспортированном этим же приложением.',
    },
  },
};
