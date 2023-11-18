import { datesOfMonth, getPrize } from './helpers/index.js';

const form = document.querySelector('.form');
const login = document.querySelector('.login');
const year = document.querySelector('.year');
const month = document.querySelector('.month');
const message = document.querySelector('.message');

const date = new Date();
year.value = date.getUTCFullYear();
month.value = date.getUTCMonth() + 1;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  message.textContent = 'Загрузка данных...';

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

      return chaseList;
    })
    .then((chaseList) => {
      const player = chaseList.find(
        (item) => item.username.toLowerCase() === login.value.toLowerCase()
      );

      if (player) {
        message.textContent = '';

        const rake = document.createElement('div');
        rake.classList.add('chase');
        rake.textContent = `Набрано рейка: $${player.rake.toFixed(2)}`;
        message.append(rake);

        const prizeChase = document.createElement('div');
        prizeChase.classList.add('chase');
        prizeChase.textContent = `Chase выплата: $${getPrize(player.rake)}`;
        message.append(prizeChase);
      } else {
        message.textContent = 'Игрок не найден. Проверьте введённый Login.';
      }
    })
    .catch(() => {
      message.textContent = 'Что-то пошло не так. Попробуйте снова.';
    });
});
