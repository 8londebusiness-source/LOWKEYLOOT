const HIST_CSV_URL = 'history.csv';

function parseCSV(text){
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(',').map(h=>h.trim());
  return lines.filter(Boolean).map(line=>{
    const cols = line.split(',');
    const o={}; headers.forEach((h,i)=>o[h]=(cols[i]||'').trim());
    return o;
  });
}
function toDate(r){
  return r.datetime || r.Date || r.date || '';
}

async function loadHistory(){
  const text = await fetch(HIST_CSV_URL).then(r=>r.text());
  const rows = parseCSV(text);

  rows.sort((a,b)=> new Date(toDate(b)) - new Date(toDate(a))); // most recent first

  const cont = document.getElementById('historyContainer');
  cont.innerHTML = '';

  rows.forEach(r=>{
    const item = r.item || r.Item;
    const player = (r.player || r.Player || '').split('-')[0];
    const date = toDate(r);
    const icon = r.icon_url || r['Icon URL'] || '';

    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <img class="icon" src="${icon || 'https://static.icy-veins.com/images/classic/icons/inv_misc_questionmark.jpg'}" alt="">
      <div class="card-body">
        <div class="name">${item}</div>
        <div class="tags">
          <span class="tag received-badge">Received</span>
          <span class="tag obtained">${player}</span>
          ${date ? `<span class="tag">${date}</span>`:''}
        </div>
      </div>`;
    cont.appendChild(card);
  });
}

function filterHistory(){
  const q = (document.getElementById('historySearch').value||'').toLowerCase();
  document.querySelectorAll('#historyContainer .item-card').forEach(card=>{
    card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

loadHistory();
