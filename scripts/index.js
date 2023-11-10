import { datesOfMonth, renderData } from './helpers/index.js';

const tableBody = document.querySelector('.table-body');
const form = document.querySelector('.form');
const login = document.querySelector('.login');
const year = document.querySelector('.year');
const month = document.querySelector('.month');

const date = new Date();
year.value = date.getUTCFullYear();
month.value = date.getUTCMonth() + 1;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  tableBody.innerHTML = 'Загрузка данных...';

  const dateList = datesOfMonth(year.value, month.value);

  const requestList = dateList.map((date) => {
    return fetch(`https://twister-races.onrender.com/chase/${date}.json`)
      .then((response) => response.json())
      .then((data) => data.data);
  });

  Promise.all(requestList)
    .then((data) => {
      const chaseList = [];

      data.map((dailyRakeList) => {
        dailyRakeList.map((player) => {
          const index = chaseList.findIndex(
            (chaseListItem) =>
              player.player_identificator === chaseListItem.player_identificator
          );

          if (index < 0) {
            chaseList.push({
              player_identificator: player.player_identificator,
              username: player.username,
              rake: player.rake + player.fees,
            });
          } else {
            const rakeCount = chaseList[index].rake + player.rake + player.fees;
            chaseList[index].rake = rakeCount;
          }
        });
      });

      tableBody.innerHTML = '';

      return chaseList;
    })
    .then((data) => {
      data
        .filter(
          (item) => item.username.toLowerCase() === login.value.toLowerCase()
        )
        .map((item) => {
          tableBody.append(renderData(item));
        });
    })
    .catch(() => {
      tableBody.innerHTML = 'Что-то пошло не так. Попробуйте снова.';
    });
});
