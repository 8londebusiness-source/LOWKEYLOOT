// --- Robust CSV parsing (handles quotes, commas, CRLF) ---
function csvToRows(text){
  const rows=[]; let row=[], field='', inQuotes=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch === '"'){
      if(inQuotes && text[i+1] === '"'){ field+='"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if(ch === ',' && !inQuotes){
      row.push(field); field='';
    } else if((ch === '\n' || ch === '\r') && !inQuotes){
      if(ch === '\r' && text[i+1] === '\n') i++;
      row.push(field); rows.push(row); row=[]; field='';
    } else {
      field += ch;
    }
  }
  // push last field/row
  row.push(field); rows.push(row);
  // filter empty rows
  return rows.filter(r => r.some(c => (c||'').trim().length));
}
function parseCSV(text){
  const rows = csvToRows(text);
  const headers = rows.shift().map(h=>h.trim());
  return rows.map(cols => {
    const o = {};
    headers.forEach((h,idx)=> o[h] = (cols[idx]||'').trim());
    return o;
  });
}
const norm = s => (s||'').toLowerCase().replace(/[\[\]"']/g,'').trim();
const pick = (obj, keys) => {
  for(const k of keys){ if(obj[k] !== undefined && String(obj[k]).trim() !== '') return String(obj[k]).trim(); }
  return '';
};

const LOOT_CSV = 'loot.csv';
const HIST_CSV = 'history.csv';

async function loadLoot(){
  const [lootTxt, histTxt] = await Promise.all([
    fetch(LOOT_CSV).then(r=>r.text()),
    fetch(HIST_CSV).then(r=>r.text())
  ]);
  const loot = parseCSV(lootTxt);
  const hist = parseCSV(histTxt);

  // Build "item|player" set from history
  const receivedSet = new Set(hist.map(r => {
    const item = pick(r, ['item','Item','full_name','Full Name']);
    const playerRaw = pick(r, ['player','Player']);
    const player = playerRaw.split('-')[0];
    return norm(item)+'|'+norm(player);
  }));

  const cont = document.getElementById('lootContainer');
  cont.innerHTML = '';

  loot.forEach(r => {
    const item = pick(r, ['full_name','Full Name','item','Item']);
    const icon = pick(r, ['icon_url','Icon URL','image_url','Image URL']);
    const next1 = pick(r, ['next1','Next','next_player','Next Assigned To','Next Assigned To:']);
    const next2 = pick(r, ['next2','2nd','Second','2nd:','Second:']);
    const next3 = pick(r, ['next3','3rd','Third','3rd:','Third:']);
    const already = item && next1 && receivedSet.has(norm(item)+'|'+norm(next1));

    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <img class="icon" src="${icon || 'https://static.icy-veins.com/images/classic/icons/inv_misc_questionmark.jpg'}" alt="">
      <div class="card-body">
        <div class="name">${item || '(unknown item)'}</div>
        <div class="meta">
          <div>Next: <span class="${already ? 'obtained':''}">${next1 || '—'}</span></div>
          <div>2nd: ${next2 || '—'}</div>
          <div>3rd: ${next3 || '—'}</div>
        </div>
      </div>`;
    cont.appendChild(card);
  });
}

function filterLoot(){
  const q = (document.getElementById('searchBar').value||'').toLowerCase();
  document.querySelectorAll('#lootContainer .item-card').forEach(card=>{
    card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

loadLoot();
