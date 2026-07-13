import React from 'react';
import { t } from '../lang/index';
import { saveData } from '../database';
import { fridgeEntry, getOrCreateIngredient } from '../ingredient';
import { units } from '../options';
import { stateStore } from '../store/store';

export const FridgeTab = () => {
  const [name, setName] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [unit, setUnit] = React.useState('');

  const handleAddProduct = () => {
    const ing = getOrCreateIngredient(name);
    if (!ing) return;

    const amountValue = amount !== '' ? parseFloat(amount) : null;
    const unitValue = unit.trim() || null;
    stateStore.setFridgeEntry(ing.id, {
      inStock: true,
      amount: amountValue,
      unit: unitValue,
    });
    saveData();
  };

  const handleInStockChange = (ingId: string) => {
    const fe = fridgeEntry(ingId);
    stateStore.setFridgeEntry(ingId, { ...fe, inStock: !fe.inStock });
    saveData();
  };

  const handleAmountChange = (ingId: string, value: string) => {
    const fe = fridgeEntry(ingId);
    const amountValue = value !== '' ? parseFloat(value) : null;
    stateStore.setFridgeEntry(ingId, {
      ...fe,
      amount: amountValue,
      inStock: amountValue != null ? true : fe.inStock,
    });
    saveData();
  };

  const handleUnitChange = (ingId: string, value: string) => {
    const fe = fridgeEntry(ingId);
    stateStore.setFridgeEntry(ingId, { ...fe, unit: value.trim() || null });
    saveData();
  };

  const handleRemoveProduct = (ingId: string) => {
    const usedIn = window.state.recipes.filter((r) =>
      r.items.some((it) => it.ingredientId === ingId)
    );
    let msg = t('fridge.productsList.actions.confirmDelete');
    if (usedIn.length) {
      msg = t('fridge.productsList.actions.confirmDeleteWhenUsed', {
        count: usedIn.length,
      });
    }
    if (confirm(msg)) {
      window.state.ingredients = window.state.ingredients.filter(
        (i) => i.id !== ingId
      );
      delete window.state.fridge[ingId];
      window.state.recipes.forEach((r) => {
        r.items = r.items.filter((it) => it.ingredientId !== ingId);
      });
      saveData();
    }
  };

  return (
    <React.Fragment>
      <div className='card'>
        <h3 style={{ marginTop: '0' }}>{t('fridge.title')}</h3>
        <div className='field-row'>
          <div className='field' style={{ flex: '2' }}>
            <label>{t('fridge.fields.name.label')}</label>
            <input
              type='text'
              id='newIngName'
              placeholder={t('fridge.fields.name.placeholder')}
              list='ingSuggestList'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <datalist id='ingSuggestList'>
              {window.state.ingredients.map((i) => (
                <option key={i.id} value={i.name} />
              ))}
            </datalist>
          </div>
          <div className='field'>
            <label>{t('fridge.fields.amount.label')}</label>
            <input
              type='number'
              id='newIngAmount'
              placeholder={t('fridge.fields.amount.placeholder')}
              min={0}
              step='any'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className='field'>
            <label>{t('fridge.fields.unit.label')}</label>
            <input
              type='text'
              id='newIngUnit'
              placeholder={t('fridge.fields.unit.placeholder')}
              list='unitSuggestList'
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
            <datalist id='unitSuggestList'>
              {units.map((u) => (
                <option key={u} value={t(`units.${u}`)} />
              ))}
            </datalist>
          </div>
        </div>
        <button className='btn' id='addIngBtn' onClick={handleAddProduct}>
          {t('fridge.actions.addProduct')}
        </button>
      </div>
      <div className='section-title'>
        {t('fridge.productsList.title', {
          count: window.state.ingredients.length,
        })}
      </div>
      {window.state.ingredients.length === 0 ? (
        <div className='empty-state'>
          <div className='display'>
            {t('fridge.productsList.emptyState.title')}
          </div>
          <p>{t('fridge.productsList.emptyState.hint')}</p>
        </div>
      ) : (
        <div className='fridge-list'>
          {window.state.ingredients
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
            .map((ing) => {
              const fe = fridgeEntry(ing.id);
              return (
                <div className='fridge-row' data-row={ing.id} key={ing.id}>
                  <input
                    type='checkbox'
                    checked={fe.inStock}
                    onChange={() => handleInStockChange(ing.id)}
                  />
                  <span className='name'>{ing.name}</span>
                  <div className='qty-inputs'>
                    <input
                      type='number'
                      min={0}
                      step='any'
                      placeholder={t(
                        'fridge.productsList.ingredient.fields.quantity.placeholder'
                      )}
                      value={fe.amount != null ? fe.amount : ''}
                      onChange={(e) =>
                        handleAmountChange(ing.id, e.target.value)
                      }
                    />
                    <input
                      type='text'
                      placeholder={t(
                        'fridge.productsList.ingredient.fields.unit.placeholder'
                      )}
                      value={fe.unit ? fe.unit : ''}
                      onChange={(e) => handleUnitChange(ing.id, e.target.value)}
                    />
                  </div>
                  <button
                    className='del'
                    data-deling={ing.id}
                    onClick={() => handleRemoveProduct(ing.id)}
                  >
                    {t('fridge.productsList.actions.remove')}
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </React.Fragment>
  );
};
