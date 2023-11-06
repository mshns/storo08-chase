import steps from './steps.js';

const tableBody = document.querySelector('.table-body');
const form = document.querySelector('.form');
const year = document.querySelector('.year');
const month = document.querySelector('.month');
const requestMonth = document.querySelector('.request-month');
const rakeTotal = document.querySelector('.rake-total');

const renderTableData = (item) => {
  const tr = document.createElement('tr');

  const id = document.createElement('td');
  id.textContent = item.player_identificator;
  tr.append(id);

  const username = document.createElement('td');
  username.textContent = item.username;
  tr.append(username);

  const rakeCurrent = document.createElement('td');
  rakeCurrent.textContent = item.rake;
  tr.append(rakeCurrent);

  const rakeBackCurrent = document.createElement('td');
  rakeBackCurrent.textContent = steps(item.rake);
  tr.append(rakeBackCurrent);

  tableBody.append(tr);
};

const date = new Date();
year.value = date.getUTCFullYear();
month.value = date.getUTCMonth() + 1;

const dateOfMonth = (year, month) => {
  const dayList = [];

  const currentDate = date.getUTCDate();
  const currentMonth = date.getUTCMonth() + 1;
  const daysPerMonth =
    currentMonth == month ? currentDate : new Date(year, month, 0).getDate();

  for (let i = 0; i < daysPerMonth; i++) {
    const monthPadStart = month.toString().padStart(2, '0');
    const dayPadStart = (i + 1).toString().padStart(2, '0');
    dayList.push(`${year}-${monthPadStart}-${dayPadStart}`);
  }

  return dayList;
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  tableBody.innerHTML = 'Загрузка данных...';

  const dateList = dateOfMonth(year.value, month.value);

  const requestList = dateList.map((date) => {
    const url = `http://localhost:5000/hands?date=${date}`;

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
        .filter((item) => item.rake >= 1000)
        .sort((a, b) => b.rake - a.rake)
        .map((item) => {
          renderTableData(item);
          rakeTotalCount += steps(item.rake);
        });
      rakeTotal.textContent = rakeTotalCount;
    });
});
