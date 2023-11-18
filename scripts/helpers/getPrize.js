const getPrize = (rake) => {
  if (rake < 1000) return 0;
  if (rake < 1500) return 50;
  if (rake < 2000) return 75;
  if (rake < 3000) return 100;
  if (rake < 4000) return 150;
  if (rake < 5000) return 200;
  if (rake < 6000) return 250;
  if (rake < 8000) return 300;
  if (rake < 10000) return 400;
  if (rake < 12000) return 500;
  if (rake < 15000) return 600;
  return Math.floor(rake / 2500) * 125;
};

export default getPrize;
