async function loadLoot() {
  const lootUrl = 'loot.csv'; // replace with raw GitHub URL
  const historyUrl = 'history.csv'; // replace with raw GitHub URL

  const lootResp = await fetch(lootUrl);
  const lootText = await lootResp.text();
  const lootRows = lootText.trim().split('\n').map(r => r.split(','));

  const historyResp = await fetch(historyUrl);
  const historyText = await historyResp.text();
  const historyItems = historyText;

  const container = document.getElementById('lootContainer');
  lootRows.forEach(row => {
    let [item, next, second, third] = row;
    let obtained = historyItems.includes(item) && historyItems.includes(next);
    let div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `<div class="item-name ${obtained ? 'obtained' : ''}">${item}</div>
                     <div>Next: ${next}</div>
                     <div>2nd: ${second || ''}</div>
                     <div>3rd: ${third || ''}</div>`;
    container.appendChild(div);
  });
}
function filterLoot() {
  let input = document.getElementById('searchBar').value.toLowerCase();
  document.querySelectorAll('.item-card').forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(input) ? '' : 'none';
  });
}
loadLoot();
