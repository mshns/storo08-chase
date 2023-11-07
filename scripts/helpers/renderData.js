import prize from './prize.js';

const renderData = (item) => {
  const tr = document.createElement('tr');

  const id = document.createElement('td');
  id.textContent = item.player_identificator;
  tr.append(id);

  const username = document.createElement('td');
  username.textContent = item.username;
  tr.append(username);

  const rake = document.createElement('td');
  rake.textContent = item.rake.toFixed(2);
  tr.append(rake);

  const rakeBackCurrent = document.createElement('td');
  rakeBackCurrent.textContent = prize(item.rake);
  tr.append(rakeBackCurrent);

  return tr;
};

export default renderData;
