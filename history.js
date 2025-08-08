async function loadHistory() {
  const url = 'history.csv'; // replace with raw GitHub URL
  const resp = await fetch(url);
  const text = await resp.text();
  const rows = text.trim().split('\n').map(r => r.split(','));
  const container = document.getElementById('historyContainer');
  rows.forEach(row => {
    let [item, player] = row;
    let div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `<div class="item-name">${item}</div><div>${player}</div>`;
    container.appendChild(div);
  });
}
function filterHistory() {
  let input = document.getElementById('searchBar').value.toLowerCase();
  document.querySelectorAll('.item-card').forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(input) ? '' : 'none';
  });
}
loadHistory();
