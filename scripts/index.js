import steps from './steps.js'

const wrapper = document.querySelector('.wrapper');
const tableBody = document.querySelector('.table-body');
const reset = document.querySelector('.reset');
const add = document.querySelector('.add');
const date = document.querySelector('.date');

const renderTableData = (item) => {
  const tr = document.createElement('tr');

  const id = document.createElement('td');
  id.textContent = item.player_identificator;
  tr.append(id);

  const username = document.createElement('td');
  username.textContent = item.username;
  tr.append(username);

  const rakeCurrent = document.createElement('td');
  rakeCurrent.textContent = item.rake_current;
  tr.append(rakeCurrent);

  const rakeBackCurrent = document.createElement('td');
  rakeBackCurrent.textContent = steps(item.rake_current);
  tr.append(rakeBackCurrent);

  const rakePrevious = document.createElement('td');
  rakePrevious.textContent = item.rake_previous;
  tr.append(rakePrevious);

  const rakeBackPrevious = document.createElement('td');
  rakeBackPrevious.textContent = steps(item.rake_previous);
  tr.append(rakeBackPrevious);

  tableBody.append(tr);
};

fetch('http://localhost:5000/chase')
  .then((response) => response.json())
  .then((data) => {
    let rakeBackTotal = 0;

    data
      .filter((item) => item.rake_current >= 1000)
      .sort((a, b) => b.rake_current - a.rake_current)
      .map((item) => {
        renderTableData(item);
        rakeBackTotal += steps(item.rake_current);
      });

    return rakeBackTotal;
  })
  .then((rakeBackTotal) => console.log('Общая сумма рейкбека за октябрь: ' + rakeBackTotal.toFixed(2)));

add.addEventListener('submit', (event) => {
  event.preventDefault();

  Promise.all([
    fetch('http://localhost:5000/chase').then((response) => response.json()),
    fetch(`http://localhost:5000/hands?date=${date.value}`)
      .then((response) => response.json())
      .then((data) => data.data),
  ])
    .then(([chaseList, rakeList]) => {
      rakeList.map((rakeItem) => {
        const index = chaseList.findIndex(
          (chaseItem) =>
            rakeItem.player_identificator === chaseItem.player_identificator
        );

        if (index < 0) {
          fetch(`http://localhost:5000/chase`, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              player_identificator: rakeItem.player_identificator,
              username: rakeItem.username,
              rake_current: Number((rakeItem.rake + rakeItem.fees).toFixed(2)),
              rake_previous: 0,
            }),
          });
        } else {
          const rakeCount =
            chaseList[index].rake_current + rakeItem.rake + rakeItem.fees;

          fetch(`http://localhost:5000/chase/${chaseList[index]._id}`, {
            method: 'PATCH',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              rake_current: Number(rakeCount.toFixed(2)),
            }),
          });
        }
      });
    })
    .then(() => console.log('updated'));
});

reset.addEventListener('click', () => {
  fetch('http://localhost:5000/chase')
    .then((response) => response.json())
    .then((data) => {
      data.map((item) => {
        fetch(`http://localhost:5000/chase/${item._id}`, {
          method: 'PATCH',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            rake_current: 0,
          }),
        });
      });
    })
    .then(() => console.log('updated'));
});
