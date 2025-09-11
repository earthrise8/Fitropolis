// Minimal demo JS — local-only demo features and placeholders
// Replace or extend with real API calls and full feature logic.

// Year inserts for footer
document.addEventListener('DOMContentLoaded', () => {
  const year = new Date().getFullYear();
  [...document.querySelectorAll('#year,#year-2,#year-3,#year-4,#year-5')].forEach(el => { if (el) el.textContent = year; });

  initPantryDemo();
  initRecipeForm();
  initScannerDemo();
});

/* -------------------------
   Pantry demo: localStorage
   ------------------------- */
function initPantryDemo(){
  const form = document.getElementById('add-item-form');
  if (!form) return;
  const nameInput = document.getElementById('item-name');
  const qtyInput = document.getElementById('item-qty');
  const expiryInput = document.getElementById('item-expiry');
  const list = document.getElementById('pantry-list');

  function loadPantry(){
    const raw = localStorage.getItem('fittropolis_pantry');
    return raw ? JSON.parse(raw) : [];
  }
  function savePantry(items){
    localStorage.setItem('fittropolis_pantry', JSON.stringify(items));
    renderPantry();
  }
  function addItem(item){
    const items = loadPantry();
    items.push(item);
    savePantry(items);
  }
  function removeItem(idx){
    const items = loadPantry();
    items.splice(idx,1);
    savePantry(items);
  }
  function renderPantry(){
    const items = loadPantry();
    if(!list) return;
    list.innerHTML = '';
    if(items.length === 0){
      list.innerHTML = '<p class="muted">Your pantry is empty. Scan items or add them here to get started.</p>';
      return;
    }
    items.forEach((it, idx) => {
      const div = document.createElement('div');
      div.className = 'pantry-item';
      const left = document.createElement('div');
      left.innerHTML = `<strong>${escapeHtml(it.name)}</strong><div class="muted">Qty: ${it.qty} ${it.expiry ? '| Expires: '+it.expiry : ''}</div>`;
      const right = document.createElement('div');
      const del = document.createElement('button');
      del.className = 'btn';
      del.style.background = '#ef4444';
      del.textContent = 'Remove';
      del.addEventListener('click', ()=> {
        removeItem(idx);
      });
      right.appendChild(del);
      div.appendChild(left);
      div.appendChild(right);
      list.appendChild(div);
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    addItem({
      name: nameInput.value.trim(),
      qty: qtyInput.value || 1,
      expiry: expiryInput.value || null,
      addedAt: new Date().toISOString()
    });
    nameInput.value = '';
    qtyInput.value = 1;
    expiryInput.value = '';
  });

  renderPantry();
}

/* -------------------------
   Recipe form demo (UI)
   ------------------------- */
function initRecipeForm(){
  const form = document.getElementById('recipe-form');
  if(!form) return;
  const result = document.getElementById('recipe-result');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    result.innerHTML = '<p class="muted">Generating recipe... (demo)</p>';
    // Demo: read pantry from localStorage and create a sample recipe.
    const pantry = JSON.parse(localStorage.getItem('fittropolis_pantry') || '[]');

    // In production: POST to your server -> server calls LLM + nutrition model -> returns recipe JSON
    // Example request payload:
    // { goal: 'lose', useExpiring: true, pantry: [...] }

    // Demo result:
    await new Promise(r => setTimeout(r, 800)); // simulate latency
    const ingredients = pantry.slice(0,3).map(it => it.name) || ['Chicken breast','Broccoli','Olive oil'];
    result.innerHTML = `
      <article class="card">
        <h3>Demo: Quick ${document.getElementById('user-goal').value} recipe</h3>
        <p><strong>Ingredients:</strong> ${ingredients.join(', ')}</p>
        <p><strong>Estimated macros:</strong> ~ 34g protein / 12g fat / 18g carbs</p>
        <ol>
          <li>Prep ingredients</li>
          <li>Cook to taste</li>
          <li>Serve and enjoy — log this meal to your journal</li>
        </ol>
      </article>
    `;
  });
}

/* -------------------------
   Scanner demo (UI)
   ------------------------- */
function initScannerDemo(){
  const startBtn = document.getElementById('start-scan');
  if(!startBtn) return;
  startBtn.addEventListener('click', async () => {
    // This demo does not implement a real scanner.
    // For real barcode scanning:
    // - Use html5-qrcode (https://github.com/mebjas/html5-qrcode)
    // - Or QuaggaJS for more control (https://serratus.github.io/quaggaJS/)
    // - Or use the Web Barcode Detector API in supported browsers.
    // Once a barcode value is obtained: fetch product metadata from an API (e.g. OpenFoodFacts, custom DB).
    alert('Demo scanner clicked. Integrate a barcode library and the camera API to enable scanning.');
  });

  const imageUpload = document.getElementById('image-upload');
  if(imageUpload){
    imageUpload.addEventListener('change', async (ev) => {
      const file = ev.target.files[0];
      if(!file) return;
      const preview = document.getElementById('image-result');
      preview.innerHTML = '<p class="muted">Uploading image and requesting AI identification... (demo)</p>';

      // In production: upload to server / cloud bucket and call an AI vision model (e.g., a vision endpoint)
      // Example:
      // const form = new FormData(); form.append('image', file);
      // fetch('/api/vision', { method:'POST', body: form })

      await new Promise(r => setTimeout(r, 900)); // simulate
      preview.innerHTML = `<div class="card"><strong>Demo identification:</strong> Looks like <em>Greek yogurt</em> (confidence 78%)</div>`;
    });
  }
}

/* -------------------------
   Utilities
   ------------------------- */
function escapeHtml(str = ''){
  return String(str).replace(/[&<>"'`=\/]/g, function(s){ return ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#47;','`':'&#96;','=':'&#61;'
  })[s]; });
}
