export const LANG_RU_RU = {
  indexedDB: {
    unavailable: 'IndexedDB недоступен',
    unsupported:
      'Этот браузер не поддерживает IndexedDB, приложение не сможет сохранять данные.',
  },
  loading: 'Загрузка…',
  appError: {
    title: 'Не удалось запустить приложение',
    hint: 'Сохранённые данные не удалось прочитать или безопасно мигрировать, поэтому запуск остановлен, чтобы не усугубить проблему. Попробуйте перезагрузить страницу или очистить данные сайта, если проблема повторяется.',
    copyStateBtn: 'Скопировать JSON состояния',
    copied: 'Скопировано!',
    stackTraceLabel: 'Стек вызовов',
  },

  title: 'Что приготовить — подбор рецептов по продуктам',

  common: {
    menu: 'Меню',
    edit: 'Редактировать',
    change: 'Изменить',
    cancel: 'Отменить',
    delete: 'Удалить',
    close: 'Закрыть',
    save: 'Сохранить',
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

  mealTypes: {
    breakfast: 'Завтрак',
    lunch: 'Обед',
    dinner: 'Ужин',
    snack: 'Перекус',
  },

  root: {
    title: 'Что приготовить',
    tagline: 'подбор рецептов по тому, что есть в холодильнике',
  },

  recipeList: {
    whatIHave: 'Что у меня есть',
    collapse: 'Свернуть',
    expand: 'Развернуть',
    ingredients: {
      one: 'ингредиент',
      few: 'ингредиента',
      many: 'ингредиентов',
      other: 'ингредиента',
    },
    noIngredientsHint:
      'Продуктов пока нет. Добавьте их во вкладке «Мои продукты» или прямо при создании рецепта.',
    searchPlaceholder: 'Поиск по названию или ингредиенту…',
    noRecipesTitle: 'Пока нет ни одного рецепта',
    noRecipesHint:
      'Добавьте первый рецепт во вкладке «Добавить рецепт» — и он появится здесь.',
    noResultsTitle: 'Ничего не найдено',
    myRecipes: 'Мои рецепты',
    library: 'Библиотека рецептов',
    addToMyRecipes: 'Добавить в мои рецепты',
    libraryLoading: 'Загрузка библиотеки рецептов…',
    libraryEmpty: 'Библиотека рецептов пока пуста.',
    libraryLoadError: 'Не удалось загрузить библиотеку рецептов.',
    libraryDisabled: 'Укажите адрес сервера в Настройках, чтобы использовать библиотеку рецептов.',
    status: {
      canCook: 'Можно готовить',
      missingIngredients: 'Не хватает {count}',
      noIngredients: 'Нет продуктов',
      matchedIngredients: ' · {matched}/{total} есть в наличии',
      warnLowStock: '(мало)',
      dietBlocked: '⚠ Содержит запрещённое: {list}',
      dietBlockedTag: '(запрещено)',
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
      icon: {
        label: 'Иконка',
      },
      tags: {
        label: 'Теги (необязательно)',
        addBtn: 'Добавить тег',
        pick: 'Выберите тег…',
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
      dietBlockedTag: '(запрещено)',
      blockedAccordion: {
        title: 'Запрещённые продукты',
      },
      actions: {
        remove: 'Удалить',
        confirmDelete: 'Вы уверены, что хотите удалить этот продукт?',
        confirmDeleteWhenUsed: {
          one: 'Этот продукт используется в {count} рецепте. При удалении он также будет убран из него. Вы уверены?',
          few: 'Этот продукт используется в {count} рецептах. При удалении он также будет убран из них. Вы уверены?',
          many: 'Этот продукт используется в {count} рецептах. При удалении он также будет убран из них. Вы уверены?',
          other:
            'Этот продукт используется в {count} рецептах. При удалении он также будет убран из них. Вы уверены?',
        },
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
      mealTypes: {
        label: 'Приём пищи',
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
    ingredientsCount: {
      one: '{count} ингредиент',
      few: '{count} ингредиента',
      many: '{count} ингредиентов',
      other: '{count} ингредиента',
    },
    recipesCount: 'Все рецепты ({count})',
    noRecipes: 'Рецептов пока нет.',
  },

  ingredientTags: {
    dairy: 'Молочное',
    egg: 'Яйца',
    gluten: 'Глютен',
    vegetable: 'Овощи',
    meat: 'Мясо',
    pork: 'Свинина',
    beef: 'Говядина',
    poultry: 'Птица',
    fish: 'Рыба',
    shellfish: 'Раки и моллюски',
    nuts: 'Орехи',
    peanut: 'Арахис',
    soy: 'Соя',
    sesame: 'Кунжут',
    alcohol: 'Алкоголь',
    honey: 'Мёд',
    citrus: 'Цитрусовые',
  },

  settings: {
    openMenuBtn: 'Настройки',
    title: 'Настройки',
    tabs: {
      dietary: 'Пищевые ограничения',
      sync: 'Синхронизация',
    },
    dietary: {
      suggestionTitle: 'Подсказка. Нажмите, чтобы активировать.',
      action: {
        label: 'Если рецепт содержит запрещённый ингредиент',
        warn: 'Предупреждать',
        hide: 'Скрывать рецепт',
      },
      blocklistHeading: 'Блок-лист',
      blocklist: {
        label: 'Запрещённые ингредиенты',
        caption: 'Отдельные исключения, не покрытые тегом.',
        addPlaceholder: 'Название ингредиента…',
        addBtn: 'Добавить',
        unknownIngredient: 'Подходящий ингредиент не найден.',
      },
      presets: {
        label: 'Пресеты',
        vegan: 'Веганское',
        vegetarian: 'Вегетарианское',
        'gluten-free': 'Без глютена',
        halal: 'Халяль',
        kosher: 'Кошерное',
        'no-beef': 'Без говядины',
        lent: 'Пост',
        confirmApply: 'Будут заблокированы все ингредиенты с тегами: {list}. Продолжить?',
      },
      blockByTag: {
        label: 'Блокировка по тегу',
        caption: 'Блокирует все ингредиенты с этим тегом — сейчас и в будущем.',
        addBtn: 'Добавить тег',
        pick: 'Выберите тег…',
      },
    },
    sync: {
      serverBaseUrl: {
        label: 'Адрес сервера (Base URL)',
        placeholder: 'https://example.com',
      },
      saved: 'Сохранено.',
      errors: {
        invalidUrl: 'Введите корректный URL, например https://example.com.',
        httpsRequired:
          'Эта страница загружена по HTTPS, поэтому адрес сервера тоже должен быть на HTTPS.',
      },
    },
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
