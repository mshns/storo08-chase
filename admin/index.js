import { datesOfMonth, prize, renderData } from '../scripts/helpers/index.js';

const form = document.querySelector('.form');
const year = document.querySelector('.year');
const month = document.querySelector('.month');
const tableBody = document.querySelector('.table-body');
const message = document.querySelector('.message');

const reportDownload = document.querySelector('.report');
const report = [];
let reportTitle = `Выплаты storo08 Race Chase за ${month.value}-${year.value}`;

const renderWhole = document.querySelector('.whole');
const wholeList = [];

const date = new Date();
year.value = date.getUTCFullYear();
month.value = date.getUTCMonth() + 1;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  message.textContent = 'Загрузка данных. Пожалуйста, подождите.';
  reportDownload.setAttribute('disabled', true);
  renderWhole.setAttribute('disabled', true);

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
      report.length = 0;
      wholeList.length = 0;

      return chaseList;
    })
    .then((data) => {
      let rakeTotalCount = 0;
      reportTitle = `Выплаты storo08 Race Chase за ${month.value}-${year.value}`;
      report.push(reportTitle, '');
      wholeList.push(...data);

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
      renderWhole.removeAttribute('disabled');
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

renderWhole.addEventListener('click', () => {
  tableBody.innerHTML = '';
  wholeList
    .filter((item) => item.rake > 0)
    .sort((a, b) => b.rake - a.rake)
    .map((item) => tableBody.append(renderData(item)));
});
