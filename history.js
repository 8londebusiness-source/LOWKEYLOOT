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
  row.push(field); rows.push(row);
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
const pick = (obj, keys) => {
  for(const k of keys){ if(obj[k] !== undefined && String(obj[k]).trim() !== '') return String(obj[k]).trim(); }
  return '';
};

const HIST_CSV_URL = 'history.csv';

function toDate(r){
  return pick(r, ['datetime','Date','date','Timestamp']);
}

async function loadHistory(){
  const text = await fetch(HIST_CSV_URL).then(r=>r.text());
  const rows = parseCSV(text);

  rows.sort((a,b)=> new Date(toDate(b)) - new Date(toDate(a)));

  const cont = document.getElementById('historyContainer');
  cont.innerHTML = '';

  rows.forEach(r=>{
    const item = pick(r, ['item','Item','full_name','Full Name']);
    const player = pick(r, ['player','Player']).split('-')[0];
    const date = toDate(r);
    const icon = pick(r, ['icon_url','Icon URL','image_url','Image URL']);

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
