/* ============================= DOM BUILDER HELPER ============================= */
function el(tag, attrs = {}, children = []){
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v])=>{
    if(k === 'class'){ node.className = v; return; }
    if(k === 'text'){ node.textContent = v; return; }
    if(v === false || v === null || v === undefined) return;
    if(v === true){ node.setAttribute(k, ''); return; }
    node.setAttribute(k, v);
  });
  children.forEach(c=>{
    if(c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

/* ============================= INITIAL MARKUP (built via createElement) ============================= */
function buildInitialMarkup(){
  const app = document.getElementById('app');

  // ---- Header ----
  const titleBlock = el('div', {}, [
    el('h1', { text: 'Что приготовить' }),
    el('div', { class: 'tagline', text: 'подбор рецептов по тому, что есть в холодильнике' })
  ]);

  const kebabBtn = el('button', {
    class: 'kebab-btn', id: 'kebabBtn', title: 'Меню',
    'aria-haspopup': 'true', 'aria-expanded': 'false', text: '⋮'
  });
  const dropdownMenu = el('div', { class: 'dropdown-menu', id: 'dropdownMenu', hidden: true }, [
    el('button', { id: 'openIOModalBtn', text: 'Экспорт / импорт рецептов' })
  ]);
  const menuWrap = el('div', { class: 'menu-wrap' }, [kebabBtn, dropdownMenu]);

  const header = el('header', { class: 'top' }, [titleBlock, menuWrap]);

  // ---- Export / import modal ----
  const modalHead = el('div', { class: 'modal-head' }, [
    el('h3', { id: 'ioModalTitle', text: 'Экспорт / импорт рецептов' }),
    el('button', { class: 'modal-close', id: 'ioModalClose', 'aria-label': 'Закрыть', text: '✕' })
  ]);

  const exportBlock = el('div', { class: 'io-block' }, [
    el('h4', { text: 'Экспорт' }),
    el('p', { text: 'Скачать все рецепты в один JSON-файл — для бэкапа или переноса на другое устройство.' }),
    el('button', { class: 'btn', id: 'exportBtn', text: 'Скачать рецепты' })
  ]);

  const importFileInput = el('input', { type: 'file', id: 'importFile', accept: 'application/json' });
  importFileInput.style.display = 'none';
  const importBlock = el('div', { class: 'io-block' }, [
    el('h4', { text: 'Импорт' }),
    el('p', { text: 'Загрузить JSON-файл, экспортированный этим же приложением. Рецепты с совпадающим названием будут обновлены, остальные — добавлены.' }),
    el('button', { class: 'btn secondary', id: 'importBtn', text: 'Выбрать файл…' }),
    importFileInput
  ]);

  const modalBody = el('div', { class: 'modal-body' }, [exportBlock, importBlock]);
  const modalCard = el('div', {
    class: 'modal-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ioModalTitle'
  }, [modalHead, modalBody]);
  const modalOverlay = el('div', { class: 'modal-overlay', id: 'ioModalOverlay', hidden: true }, [modalCard]);

  // ---- Tabs ----
  const nav = el('nav', { class: 'tabs' }, [
    el('button', { 'data-tab': 'recipes', class: 'active', text: 'Рецепты' }),
    el('button', { 'data-tab': 'fridge', text: 'Мои продукты' }),
    el('button', { 'data-tab': 'add', text: 'Добавить рецепт' })
  ]);

  // ---- View root ----
  const main = el('main', { id: 'view' });

  app.append(header, modalOverlay, nav, main);
}

buildInitialMarkup();

/* ============================= DATA LAYER (IndexedDB) ============================= */
const DB_NAME = 'ChefFinderDB';
const DB_VERSION = 1;
const STORE_NAME = 'appState';
const RECORD_KEY = 'main';

let dbInstance = null;

function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e)=>{
      const db = e.target.result;
      if(!db.objectStoreNames.contains(STORE_NAME)){
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}

async function getDB(){
  if(!dbInstance) dbInstance = await openDB();
  return dbInstance;
}

async function loadData(){
  try{
    const db = await getDB();
    return await new Promise((resolve, reject)=>{
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(RECORD_KEY);
      req.onsuccess = ()=> resolve(req.result || { ingredients: [], fridge: {}, recipes: [] });
      req.onerror = ()=> reject(req.error);
    });
  }catch(e){
    console.warn('Не удалось прочитать IndexedDB', e);
    return { ingredients: [], fridge: {}, recipes: [] };
  }
}

let saveQueued = false;
function saveData(){
  // fire-and-forget, but coalesce rapid successive calls onto one microtask
  if(saveQueued) return;
  saveQueued = true;
  queueMicrotask(async ()=>{
    saveQueued = false;
    try{
      const db = await getDB();
      await new Promise((resolve, reject)=>{
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(JSON.parse(JSON.stringify(state)), RECORD_KEY);
        tx.oncomplete = resolve;
        tx.onerror = ()=> reject(tx.error);
      });
    }catch(e){
      console.error('Не удалось сохранить в IndexedDB', e);
    }
  });
}

let state = { ingredients: [], fridge: {}, recipes: [] };
// state.ingredients = [{id, name}]
// state.fridge = { [ingredientId]: { inStock: bool, amount: number|null, unit: string|null } }
// state.recipes = [{id, name, description, items:[{ingredientId, amount, unit}]}]

function uid(){
  return (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2));
}

function findIngredientByName(name){
  const norm = name.trim().toLowerCase();
  return state.ingredients.find(i => i.name.toLowerCase() === norm);
}

function getOrCreateIngredient(name){
  name = name.trim();
  if(!name) return null;
  let ing = findIngredientByName(name);
  if(!ing){
    ing = { id: uid(), name };
    state.ingredients.push(ing);
  }
  return ing;
}

function fridgeEntry(ingredientId){
  return state.fridge[ingredientId] || { inStock:false, amount:null, unit:null };
}

/* ============================= APP STATE ============================= */
let activeTab = 'recipes';
let editingRecipeId = null; // when set, "add" tab is in edit mode
let recipeSearch = '';
let filterOpen = true;

/* ============================= RENDER ROOT ============================= */
const viewEl = document.getElementById('view');

document.querySelectorAll('nav.tabs button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    activeTab = btn.dataset.tab;
    if(activeTab !== 'add') editingRecipeId = null;
    document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.toggle('active', b===btn));
    render();
  });
});

function render(){
  if(activeTab === 'recipes') renderRecipesTab();
  else if(activeTab === 'fridge') renderFridgeTab();
  else if(activeTab === 'add') renderAddTab();
}

/* ============================= MATCHING LOGIC ============================= */
// returns {matched, total, missingList, warnList, status}
function evaluateRecipe(recipe){
  const total = recipe.items.length;
  let matched = 0;
  let missingList = [];
  let warnList = []; // present but amount insufficient / unspecified concern
  recipe.items.forEach(item=>{
    const fe = fridgeEntry(item.ingredientId);
    if(!fe.inStock){
      missingList.push(item);
      return;
    }
    // present. check amount if both specified with same unit
    if(item.amount != null && fe.amount != null && item.unit && fe.unit &&
       item.unit.trim().toLowerCase() === fe.unit.trim().toLowerCase()){
      if(fe.amount + 1e-9 >= item.amount){
        matched++;
      } else {
        warnList.push(item); // not enough
      }
    } else {
      matched++; // presence is enough when we can't compare precisely
    }
  });
  let status = 'none';
  if(total === 0) status = 'none';
  else if(matched === total) status = 'full';
  else if(matched + warnList.length >= total && matched > 0) status = 'partial';
  else if(matched > 0 || warnList.length > 0) status = 'partial';
  else status = 'none';
  return { matched, total, missingList, warnList, status };
}

function ingredientName(id){
  const ing = state.ingredients.find(i=>i.id===id);
  return ing ? ing.name : '—';
}

/* ============================= RECIPES TAB ============================= */
function renderRecipesTab(){
  const hasIngredients = state.ingredients.length > 0;
  const hasRecipes = state.recipes.length > 0;

  let html = '';

  // Filter panel
  html += `<div class="filter-panel">
    <div class="fp-head">
      <h3>Что у меня есть</h3>
      <a id="toggleFilter">${filterOpen ? 'свернуть' : 'развернуть'}</a>
    </div>`;
  if(filterOpen){
    if(!hasIngredients){
      html += `<div class="empty-hint">Продуктов пока нет. Добавьте их во вкладке «Мои продукты» или прямо при создании рецепта.</div>`;
    } else {
      html += `<div class="chip-row" id="filterChips">`;
      state.ingredients.slice().sort((a,b)=>a.name.localeCompare(b.name,'ru')).forEach(ing=>{
        const fe = fridgeEntry(ing.id);
        html += `<span class="chip ${fe.inStock?'on':''}" data-ing="${ing.id}">
          <span class="dot"></span>${escapeHtml(ing.name)}
        </span>`;
      });
      html += `</div>`;
    }
  }
  html += `</div>`;

  // Search + recipe list
  html += `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; gap:10px; flex-wrap:wrap;">
    <input type="text" id="recipeSearch" placeholder="Поиск по названию…" value="${escapeAttr(recipeSearch)}" style="max-width:260px;">
    <span style="font-size:12.5px; color:var(--ink-soft);">${hasRecipes ? state.recipes.length + ' рец.' : ''}</span>
  </div>`;

  if(!hasRecipes){
    html += `<div class="empty-state">
      <div class="display">Пока нет ни одного рецепта</div>
      <p>Добавьте первый рецепт во вкладке «Добавить рецепт» — и он появится здесь.</p>
    </div>`;
    viewEl.innerHTML = html;
    bindRecipesTabEvents();
    return;
  }

  let list = state.recipes.map(r => ({ r, ev: evaluateRecipe(r) }));
  if(recipeSearch.trim()){
    const q = recipeSearch.trim().toLowerCase();
    list = list.filter(x => x.r.name.toLowerCase().includes(q));
  }
  // sort: full match first, then by matched/total ratio desc, then name
  list.sort((a,b)=>{
    const ra = a.ev.total ? a.ev.matched/a.ev.total : 0;
    const rb = b.ev.total ? b.ev.matched/b.ev.total : 0;
    if(rb !== ra) return rb - ra;
    return a.r.name.localeCompare(b.r.name,'ru');
  });

  if(list.length === 0){
    html += `<div class="empty-state"><div class="display">Ничего не найдено</div></div>`;
  } else {
    html += `<div class="recipe-grid">`;
    list.forEach(({r, ev})=>{
      html += renderRecipeCard(r, ev);
    });
    html += `</div>`;
  }

  viewEl.innerHTML = html;
  bindRecipesTabEvents();
}

function renderRecipeCard(recipe, ev){
  const pct = ev.total ? ev.matched/ev.total : 0;
  const fullMatch = ev.status === 'full';
  let statusLabel = '';
  if(ev.status === 'full') statusLabel = `<span class="status-label">Можно готовить</span>`;
  else if(ev.status === 'partial') statusLabel = `<span class="status-label partial">Не хватает ${ev.missingList.length + ev.warnList.length}</span>`;
  else statusLabel = `<span class="status-label none">Нет продуктов</span>`;

  // readiness pips (max 8 shown, else compress)
  let pipsHtml = '';
  const maxPips = 10;
  const n = Math.min(ev.total, maxPips);
  for(let i=0;i<n;i++){
    const filled = i < ev.matched;
    const warn = filled && ev.warnList.length>0 && i >= ev.matched - 0; // simple fill, no per-item warn distinction here
    pipsHtml += `<span class="pip ${filled?'filled':''}"></span>`;
  }

  let ingredientsHtml = '<div class="rc-ingredients">';
  recipe.items.forEach(item=>{
    const fe = fridgeEntry(item.ingredientId);
    const isMissing = !fe.inStock;
    const isWarn = ev.warnList.some(w=>w.ingredientId===item.ingredientId);
    const qtyStr = item.amount!=null ? ` <small>${item.amount}${item.unit?(' '+escapeHtml(item.unit)):''}</small>` : '';
    ingredientsHtml += `<span class="chip readonly ${isMissing?'missing':'on'}">
      <span class="dot"></span>${escapeHtml(ingredientName(item.ingredientId))}${qtyStr}${isWarn?' <small>(мало)</small>':''}
    </span>`;
  });
  ingredientsHtml += '</div>';

  return `<div class="recipe-card ${fullMatch?'full-match':''}">
    <div class="rc-head">
      <h3>${escapeHtml(recipe.name)}</h3>
      <div class="readiness">${pipsHtml}</div>
    </div>
    ${recipe.description ? `<p class="rc-desc">${escapeHtml(recipe.description)}</p>` : ''}
    ${ingredientsHtml}
    <div class="rc-footer">
      ${statusLabel} · ${ev.matched}/${ev.total} есть в наличии
    </div>
    <div class="rc-actions">
      <button data-edit="${recipe.id}">Редактировать</button>
      <button data-del="${recipe.id}">Удалить</button>
    </div>
  </div>`;
}

function bindRecipesTabEvents(){
  const t = document.getElementById('toggleFilter');
  if(t) t.addEventListener('click', ()=>{ filterOpen = !filterOpen; renderRecipesTab(); });

  const chips = document.getElementById('filterChips');
  if(chips){
    chips.querySelectorAll('.chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        const id = chip.dataset.ing;
        const fe = fridgeEntry(id);
        state.fridge[id] = { inStock: !fe.inStock, amount: fe.amount, unit: fe.unit };
        saveData();
        renderRecipesTab();
      });
    });
  }

  const search = document.getElementById('recipeSearch');
  if(search){
    search.addEventListener('input', ()=>{
      recipeSearch = search.value;
      renderRecipesTab();
      // restore focus & caret after re-render
      const s2 = document.getElementById('recipeSearch');
      if(s2){ s2.focus(); s2.setSelectionRange(s2.value.length, s2.value.length); }
    });
  }

  viewEl.querySelectorAll('[data-edit]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      editingRecipeId = btn.dataset.edit;
      activeTab = 'add';
      document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab==='add'));
      render();
    });
  });
  viewEl.querySelectorAll('[data-del]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(confirm('Удалить этот рецепт?')){
        state.recipes = state.recipes.filter(r=>r.id !== btn.dataset.del);
        saveData();
        renderRecipesTab();
      }
    });
  });
}

/* ============================= FRIDGE TAB ============================= */
function renderFridgeTab(){
  let html = `<div class="card">
    <h3 style="margin-top:0;">Добавить продукт</h3>
    <div class="field-row">
      <div class="field" style="flex:2;">
        <label>Название</label>
        <input type="text" id="newIngName" placeholder="например, куриное филе" list="ingSuggestList">
        <datalist id="ingSuggestList">
          ${state.ingredients.map(i=>`<option value="${escapeAttr(i.name)}">`).join('')}
        </datalist>
      </div>
      <div class="field">
        <label>Количество</label>
        <input type="number" id="newIngAmount" placeholder="напр. 500" min="0" step="any">
      </div>
      <div class="field">
        <label>Ед. изм.</label>
        <input type="text" id="newIngUnit" placeholder="г, шт, л…" list="unitSuggestList">
        <datalist id="unitSuggestList">
          <option value="г"><option value="кг"><option value="мл"><option value="л">
          <option value="шт"><option value="ст.л."><option value="ч.л."><option value="по вкусу">
        </datalist>
      </div>
    </div>
    <button class="btn" id="addIngBtn">Добавить</button>
  </div>`;

  html += `<div class="section-title">Мои продукты (${state.ingredients.length})</div>`;

  if(state.ingredients.length === 0){
    html += `<div class="empty-state"><div class="display">Список пуст</div><p>Добавьте продукты, которые у вас есть — это позволит фильтровать рецепты.</p></div>`;
  } else {
    html += `<div class="fridge-list">`;
    state.ingredients.slice().sort((a,b)=>a.name.localeCompare(b.name,'ru')).forEach(ing=>{
      const fe = fridgeEntry(ing.id);
      html += `<div class="fridge-row" data-row="${ing.id}">
        <input type="checkbox" ${fe.inStock?'checked':''} data-stock="${ing.id}">
        <span class="name">${escapeHtml(ing.name)}</span>
        <div class="qty-inputs">
          <input type="number" min="0" step="any" placeholder="кол-во" value="${fe.amount!=null?fe.amount:''}" data-amount="${ing.id}">
          <input type="text" placeholder="ед." value="${fe.unit?escapeAttr(fe.unit):''}" data-unit="${ing.id}">
        </div>
        <button class="del" data-delIng="${ing.id}">Удалить</button>
      </div>`;
    });
    html += `</div>`;
  }

  viewEl.innerHTML = html;
  bindFridgeTabEvents();
}

function bindFridgeTabEvents(){
  const addBtn = document.getElementById('addIngBtn');
  addBtn.addEventListener('click', ()=>{
    const nameInput = document.getElementById('newIngName');
    const amountInput = document.getElementById('newIngAmount');
    const unitInput = document.getElementById('newIngUnit');
    const name = nameInput.value.trim();
    if(!name){ nameInput.focus(); return; }
    const ing = getOrCreateIngredient(name);
    const amount = amountInput.value !== '' ? parseFloat(amountInput.value) : null;
    const unit = unitInput.value.trim() || null;
    state.fridge[ing.id] = { inStock:true, amount, unit };
    saveData();
    renderFridgeTab();
  });

  viewEl.querySelectorAll('[data-stock]').forEach(cb=>{
    cb.addEventListener('change', ()=>{
      const id = cb.dataset.stock;
      const fe = fridgeEntry(id);
      state.fridge[id] = { ...fe, inStock: cb.checked };
      saveData();
    });
  });
  viewEl.querySelectorAll('[data-amount]').forEach(inp=>{
    inp.addEventListener('change', ()=>{
      const id = inp.dataset.amount;
      const fe = fridgeEntry(id);
      const val = inp.value !== '' ? parseFloat(inp.value) : null;
      state.fridge[id] = { ...fe, amount: val, inStock: val!=null ? true : fe.inStock };
      saveData();
      renderFridgeTab();
    });
  });
  viewEl.querySelectorAll('[data-unit]').forEach(inp=>{
    inp.addEventListener('change', ()=>{
      const id = inp.dataset.unit;
      const fe = fridgeEntry(id);
      state.fridge[id] = { ...fe, unit: inp.value.trim() || null };
      saveData();
    });
  });
  viewEl.querySelectorAll('[data-delIng]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.delIng;
      const usedIn = state.recipes.filter(r=>r.items.some(it=>it.ingredientId===id));
      let msg = 'Удалить этот продукт из списка?';
      if(usedIn.length){
        msg = `Этот продукт используется в ${usedIn.length} рецепт(ах). При удалении он также будет убран из них. Продолжить?`;
      }
      if(confirm(msg)){
        state.ingredients = state.ingredients.filter(i=>i.id!==id);
        delete state.fridge[id];
        state.recipes.forEach(r=>{ r.items = r.items.filter(it=>it.ingredientId!==id); });
        saveData();
        renderFridgeTab();
      }
    });
  });
}

/* ============================= ADD / EDIT RECIPE TAB ============================= */
let draftItems = []; // [{ingredientId|null, name, amount, unit}]

function startDraftFromRecipe(recipe){
  if(recipe){
    draftItems = recipe.items.map(it=>({
      ingredientId: it.ingredientId,
      name: ingredientName(it.ingredientId),
      amount: it.amount,
      unit: it.unit
    }));
  } else {
    draftItems = [{ ingredientId:null, name:'', amount:null, unit:null }];
  }
}

function renderAddTab(){
  const editing = editingRecipeId ? state.recipes.find(r=>r.id===editingRecipeId) : null;

  if(draftItems.length === 0 || (editing && draftItems._forId !== editing.id) || (!editing && draftItems._forId !== 'new' && draftItemsNeedsReset())){
    startDraftFromRecipe(editing);
    draftItems._forId = editing ? editing.id : 'new';
  }

  let html = `<div class="card">
    <h3 style="margin-top:0;">${editing ? 'Редактировать рецепт' : 'Новый рецепт'}</h3>
    <div class="field">
      <label>Название</label>
      <input type="text" id="recName" placeholder="например, Паста Карбонара" value="${editing?escapeAttr(editing.name):escapeAttr(draftName||'')}">
    </div>
    <div class="field">
      <label>Описание / способ приготовления</label>
      <textarea id="recDesc" placeholder="Короткое описание или шаги приготовления…">${editing?escapeHtml(editing.description||''):escapeHtml(draftDesc||'')}</textarea>
    </div>

    <label>Ингредиенты</label>
    <div id="ingRows">`;

  draftItems.forEach((item, idx)=>{
    html += `<div class="ing-row" data-idx="${idx}">
      <div class="field">
        <input type="text" placeholder="продукт" value="${escapeAttr(item.name)}" data-role="name" list="ingSuggestList2">
      </div>
      <div class="field">
        <input type="number" min="0" step="any" placeholder="кол-во" value="${item.amount!=null?item.amount:''}" data-role="amount">
      </div>
      <div class="field">
        <input type="text" placeholder="ед." value="${item.unit?escapeAttr(item.unit):''}" data-role="unit" list="unitSuggestList2">
      </div>
      <button class="icon-btn" data-remove="${idx}" title="Удалить строку">✕</button>
    </div>`;
  });

  html += `</div>
    <datalist id="ingSuggestList2">
      ${state.ingredients.map(i=>`<option value="${escapeAttr(i.name)}">`).join('')}
    </datalist>
    <datalist id="unitSuggestList2">
      <option value="г"><option value="кг"><option value="мл"><option value="л">
      <option value="шт"><option value="ст.л."><option value="ч.л."><option value="по вкусу">
    </datalist>
    <button class="btn ghost" id="addRowBtn">+ добавить ингредиент</button>

    <div style="margin-top:18px; display:flex; gap:10px;">
      <button class="btn" id="saveRecipeBtn">${editing?'Сохранить изменения':'Добавить рецепт'}</button>
      ${editing ? `<button class="btn secondary" id="cancelEditBtn">Отменить</button>` : ''}
    </div>
  </div>`;

  html += `<div class="section-title">Все рецепты (${state.recipes.length})</div>`;
  if(state.recipes.length === 0){
    html += `<div class="empty-hint">Рецептов пока нет.</div>`;
  } else {
    html += `<div class="recipe-list-compact">`;
    state.recipes.slice().sort((a,b)=>a.name.localeCompare(b.name,'ru')).forEach(r=>{
      html += `<div class="rlc-row">
        <div>
          <div class="rname">${escapeHtml(r.name)}</div>
          <div class="rmeta">${r.items.length} ингредиент(ов)</div>
        </div>
        <div class="rlc-actions">
          <button data-editc="${r.id}">Изменить</button>
          <button class="danger" data-delc="${r.id}">Удалить</button>
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  viewEl.innerHTML = html;
  bindAddTabEvents(editing);
}

let draftName = '';
let draftDesc = '';
function draftItemsNeedsReset(){ return false; }

function bindAddTabEvents(editing){
  const nameInput = document.getElementById('recName');
  nameInput.addEventListener('input', ()=>{ draftName = nameInput.value; });
  const descInput = document.getElementById('recDesc');
  descInput.addEventListener('input', ()=>{ draftDesc = descInput.value; });

  document.getElementById('addRowBtn').addEventListener('click', ()=>{
    syncDraftFromDOM();
    draftItems.push({ ingredientId:null, name:'', amount:null, unit:null });
    renderAddTab();
  });

  viewEl.querySelectorAll('[data-remove]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      syncDraftFromDOM();
      const idx = parseInt(btn.dataset.remove);
      draftItems.splice(idx,1);
      if(draftItems.length===0) draftItems.push({ ingredientId:null, name:'', amount:null, unit:null });
      renderAddTab();
    });
  });

  document.getElementById('saveRecipeBtn').addEventListener('click', ()=>{
    syncDraftFromDOM();
    const name = nameInput.value.trim();
    if(!name){ nameInput.focus(); return; }
    const items = [];
    draftItems.forEach(it=>{
      const n = (it.name||'').trim();
      if(!n) return;
      const ing = getOrCreateIngredient(n);
      items.push({ ingredientId: ing.id, amount: it.amount, unit: it.unit });
    });
    if(items.length===0){
      alert('Добавьте хотя бы один ингредиент.');
      return;
    }
    if(editing){
      editing.name = name;
      editing.description = descInput.value.trim();
      editing.items = items;
    } else {
      state.recipes.push({
        id: uid(),
        name,
        description: descInput.value.trim(),
        items
      });
    }
    saveData();
    editingRecipeId = null;
    draftName = ''; draftDesc = '';
    draftItems = [{ ingredientId:null, name:'', amount:null, unit:null }];
    draftItems._forId = 'new';
    renderAddTab();
  });

  const cancelBtn = document.getElementById('cancelEditBtn');
  if(cancelBtn){
    cancelBtn.addEventListener('click', ()=>{
      editingRecipeId = null;
      draftName=''; draftDesc='';
      draftItems = [{ ingredientId:null, name:'', amount:null, unit:null }];
      draftItems._forId = 'new';
      renderAddTab();
    });
  }

  viewEl.querySelectorAll('[data-editc]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      editingRecipeId = btn.dataset.editc;
      const r = state.recipes.find(x=>x.id===editingRecipeId);
      startDraftFromRecipe(r);
      draftItems._forId = r.id;
      renderAddTab();
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });
  viewEl.querySelectorAll('[data-delc]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(confirm('Удалить этот рецепт?')){
        state.recipes = state.recipes.filter(r=>r.id!==btn.dataset.delc);
        if(editingRecipeId === btn.dataset.delc) editingRecipeId = null;
        saveData();
        renderAddTab();
      }
    });
  });
}

function syncDraftFromDOM(){
  const rows = viewEl.querySelectorAll('#ingRows .ing-row');
  rows.forEach(row=>{
    const idx = parseInt(row.dataset.idx);
    const name = row.querySelector('[data-role="name"]').value;
    const amountRaw = row.querySelector('[data-role="amount"]').value;
    const unit = row.querySelector('[data-role="unit"]').value;
    if(draftItems[idx]){
      draftItems[idx].name = name;
      draftItems[idx].amount = amountRaw!=='' ? parseFloat(amountRaw) : null;
      draftItems[idx].unit = unit.trim() || null;
    }
  });
}

/* ============================= UTIL ============================= */
function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[m]));
}
function escapeAttr(str){ return escapeHtml(str); }

/* ============================= EXPORT / IMPORT ============================= */
function exportRecipes(){
  if(state.recipes.length === 0){
    alert('Нет ни одного рецепта для экспорта.');
    return;
  }
  const payload = {
    format: 'chef-finder-recipes',
    version: 1,
    exportedAt: new Date().toISOString(),
    recipes: state.recipes.map(r => ({
      name: r.name,
      description: r.description || '',
      items: r.items.map(it => ({
        ingredient: ingredientName(it.ingredientId),
        amount: it.amount,
        unit: it.unit
      }))
    }))
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = `recipes-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importRecipesFromPayload(payload){
  if(!payload || !Array.isArray(payload.recipes)){
    alert('Файл не похож на экспорт рецептов: не найден массив "recipes".');
    return;
  }
  let added = 0, replaced = 0, skipped = 0;
  payload.recipes.forEach(raw=>{
    const name = (raw && raw.name || '').trim();
    if(!name || !Array.isArray(raw.items)){ skipped++; return; }
    const items = [];
    raw.items.forEach(it=>{
      const ingName = (it && (it.ingredient || it.name) || '').trim();
      if(!ingName) return;
      const ing = getOrCreateIngredient(ingName);
      items.push({
        ingredientId: ing.id,
        amount: (it.amount === undefined || it.amount === null || it.amount === '') ? null : Number(it.amount),
        unit: it.unit ? String(it.unit).trim() : null
      });
    });
    if(items.length === 0){ skipped++; return; }

    const existing = state.recipes.find(r => r.name.toLowerCase() === name.toLowerCase());
    if(existing){
      existing.description = raw.description || '';
      existing.items = items;
      replaced++;
    } else {
      state.recipes.push({
        id: uid(),
        name,
        description: raw.description || '',
        items
      });
      added++;
    }
  });
  saveData();
  render();
  alert(`Импорт завершён.\nДобавлено: ${added}\nОбновлено (совпало по названию): ${replaced}\nПропущено: ${skipped}`);
}

function bindIOEvents(){
  const kebabBtn = document.getElementById('kebabBtn');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const openIOModalBtn = document.getElementById('openIOModalBtn');
  const ioModalOverlay = document.getElementById('ioModalOverlay');
  const ioModalClose = document.getElementById('ioModalClose');

  function closeDropdown(){
    dropdownMenu.hidden = true;
    kebabBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleDropdown(){
    const willOpen = dropdownMenu.hidden;
    dropdownMenu.hidden = !willOpen;
    kebabBtn.setAttribute('aria-expanded', String(willOpen));
  }
  kebabBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    toggleDropdown();
  });
  document.addEventListener('click', (e)=>{
    if(!dropdownMenu.hidden && !dropdownMenu.contains(e.target) && e.target !== kebabBtn){
      closeDropdown();
    }
  });

  function openModal(){
    closeDropdown();
    ioModalOverlay.hidden = false;
  }
  function closeModal(){
    ioModalOverlay.hidden = true;
  }
  openIOModalBtn.addEventListener('click', openModal);
  ioModalClose.addEventListener('click', closeModal);
  ioModalOverlay.addEventListener('click', (e)=>{
    if(e.target === ioModalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      closeModal();
      closeDropdown();
    }
  });

  document.getElementById('exportBtn').addEventListener('click', exportRecipes);
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  importBtn.addEventListener('click', ()=> importFile.click());
  importFile.addEventListener('change', ()=>{
    const file = importFile.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const payload = JSON.parse(reader.result);
        importRecipesFromPayload(payload);
        closeModal();
      }catch(e){
        alert('Не удалось прочитать файл: он должен быть в формате JSON, экспортированном этим же приложением.');
        console.error(e);
      }
      importFile.value = '';
    };
    reader.readAsText(file);
  });
}

/* ============================= INIT ============================= */
draftItems = [{ ingredientId:null, name:'', amount:null, unit:null }];
draftItems._forId = 'new';

async function init(){
  if(!window.indexedDB){
    viewEl.innerHTML = `<div class="empty-state"><div class="display">IndexedDB недоступен</div><p>Этот браузер не поддерживает IndexedDB, приложение не сможет сохранять данные.</p></div>`;
    return;
  }
  viewEl.innerHTML = `<div class="empty-state"><div class="display">Загрузка…</div></div>`;
  try{
    state = await loadData();
  }catch(e){
    console.error(e);
    state = { ingredients: [], fridge: {}, recipes: [] };
  }
  bindIOEvents();
  render();
}
init();