import { datesOfMonth, prize, renderData } from '../scripts/helpers/index.js';
import archivDate from '../scripts/constants/archiveDate.js';

const form = document.querySelector('.form');
const year = document.querySelector('.year');
const month = document.querySelector('.month');
const tableBody = document.querySelector('.table-body');
const message = document.querySelector('.message');

const reportDownload = document.querySelector('.report');
const report = [];
let reportTitle = `Выплаты storo08 Race Chase за ${month.value}-${year.value}`;

const date = new Date();
year.value = date.getUTCFullYear();
month.value = date.getUTCMonth() + 1;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  message.textContent = 'Загрузка данных. Пожалуйста, подождите.';
  reportDownload.setAttribute('disabled', true);

  const dateList = datesOfMonth(year.value, month.value);

  const requestList = dateList.map((date) => {
    const url =
      archivDate > date
        ? `https://storo08.ru/chase/data/${date}.json`
        : `https://twister-races.onrender.com/hands?date=${date}`;

    return fetch(url)
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
      report.length = 0;

      return chaseList;
    })
    .then((data) => {
      let rakeTotalCount = 0;
      reportTitle = `Выплаты storo08 Race Chase за ${month.value}-${year.value}`;
      report.push(reportTitle, '');

      data
        .filter((item) => item.rake >= 1000 && item.username != 'sanchess08')
        .sort((a, b) => b.rake - a.rake)
        .map((item) => {
          tableBody.append(renderData(item));
          rakeTotalCount += prize(item.rake);
          report.push(`${item.username} - ${prize(item.rake)}`);
        });

      message.textContent = `Общая сумма Chase выплат: ${rakeTotalCount}`;
      reportDownload.removeAttribute('disabled');
    })
    .catch(() => {
      tableBody.innerHTML = 'Что-то пошло не так. Попробуйте снова.';
    });
});

reportDownload.addEventListener('click', () => {
  const element = document.createElement('a');
  const file = new Blob([report.join('\n')], {
    type: 'text/plain;charset=UTF-8',
  });
  element.href = URL.createObjectURL(file);
  element.download = `${reportTitle}.txt`;
  document.body.appendChild(element);
  element.click();
  element.remove();
});
