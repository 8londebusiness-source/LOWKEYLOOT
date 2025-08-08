const LOOT_CSV = 'loot.csv';
const HIST_CSV = 'history.csv';

function parseCSV(text){
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(',').map(h=>h.trim());
  return lines.filter(Boolean).map(line=>{
    const cols = line.split(','); // works for your data (no quoted commas)
    const o = {}; headers.forEach((h,i)=> o[h] = (cols[i]||'').trim());
    return o;
  });
}
const norm = s => (s||'').toLowerCase().replace(/[\[\]"']/g,'').trim();

async function loadLoot(){
  const [lootTxt, histTxt] = await Promise.all([
    fetch(LOOT_CSV).then(r=>r.text()),
    fetch(HIST_CSV).then(r=>r.text())
  ]);
  const loot = parseCSV(lootTxt);
  const hist = parseCSV(histTxt);

  // Build a set of "item|player" that have already received (from history)
  const itemKey = r => (norm(r.Item)||norm(r.item)) + '|' + (norm((r.Player||r.player||'').split('-')[0]));
  const receivedSet = new Set(hist.map(itemKey));

  const cont = document.getElementById('lootContainer');
  cont.innerHTML = '';

  loot.forEach(r=>{
    const item = r.full_name || r.item || r.Item;
    const icon = r.icon_url || r['Icon URL'] || '';
    const next1 = r.next1 || r['Next'] || r.next_player || '';
    const next2 = r.next2 || r['2nd'] || '';
    const next3 = r.next3 || r['3rd'] || '';

    const already = receivedSet.has(norm(item)+'|'+norm(next1));

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
