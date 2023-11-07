const date = new Date();

const datesOfMonth = (year, month) => {
  const dateList = [];

  const currentDate = date.getUTCDate();
  const currentMonth = date.getUTCMonth() + 1;
  const daysPerMonth =
    currentMonth == month ? currentDate : new Date(year, month, 0).getDate();

  for (let i = 0; i < daysPerMonth; i++) {
    const monthPadStart = month.toString().padStart(2, '0');
    const dayPadStart = (i + 1).toString().padStart(2, '0');
    dateList.push(`${year}-${monthPadStart}-${dayPadStart}`);
  }

  return dateList;
};

export default datesOfMonth;
