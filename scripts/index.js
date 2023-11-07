import { datesOfMonth, prize, renderData } from './helpers/index.js';

const tableBody = document.querySelector('.table-body');
const form = document.querySelector('.form');
const year = document.querySelector('.year');
const month = document.querySelector('.month');
const requestMonth = document.querySelector('.request-month');
const rakeTotal = document.querySelector('.rake-total');

const date = new Date();
year.value = date.getUTCFullYear();
month.value = date.getUTCMonth() + 1;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  tableBody.innerHTML = 'Загрузка данных...';

  const dateList = datesOfMonth(year.value, month.value);

  const requestList = dateList.map((date) => {
    const url = `https://twister-races.onrender.com/hands?date=${date}`;

    return fetch(url)
      .then((response) => response.json())
      .then((data) => data.data);
  });

  Promise.all(requestList)
    .then((data) => {
      console.log(data);
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
      requestMonth.textContent = `за ${month.value}-${year.value}`;

      return chaseList;
    })
    .then((data) => {
      let rakeTotalCount = 0;
      data
        .filter((item) => item.rake >= 1000 && item.username != 'sanchess08')
        .sort((a, b) => b.rake - a.rake)
        .map((item) => {
          tableBody.append(renderData(item));
          rakeTotalCount += prize(item.rake);
        });
      rakeTotal.textContent = rakeTotalCount;
    });
});
