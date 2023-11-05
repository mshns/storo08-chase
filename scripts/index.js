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
  rakeCurrent.textContent = item.rake.current;
  tr.append(rakeCurrent);

  const rakePrevious = document.createElement('td');
  rakePrevious.textContent = item.rake.previous;
  tr.append(rakePrevious);

  tableBody.append(tr);
};

fetch('http://localhost:5000/chase')
  .then((response) => response.json())
  .then((data) => data.map((item) => renderTableData(item)));

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
            rake: {
              current: 0,
              previous: 0,
            },
          }),
        });
      });
    });
});

add.addEventListener('submit', (event) => {
  event.preventDefault();

  Promise.all([
    fetch('http://localhost:5000/chase').then((response) => response.json()),
    fetch(`http://localhost:5000/hands?date=${date.value}`)
      .then((response) => response.json())
      .then((data) => data.data),
  ]).then(([chaseList, rakeList]) => {
    rakeList.map((rakeItem) => {
      const index = chaseList.findIndex(
        (chaseItem) => rakeItem.nickname === chaseItem.nickname
      );

      if (index >= 0) {
        fetch(`http://localhost:5000/chase/${chaseList[index]._id}`, {
          method: 'PATCH',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            rake: {
              current:
                chaseList[index].rake.current + rakeItem.rake + rakeItem.fees,
              previous: 0,
            },
          }),
        });
      } else {
        fetch(`http://localhost:5000/chase`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            player_identificator: rakeItem.player_identificator,
            username: rakeItem.username,
            rake: {
              current: rakeItem.rake + rakeItem.fees,
              previous: 0,
            }
          }),
        });
      }
    });
  }).then(() => console.log('update'));
});
