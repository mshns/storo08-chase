const date = new Date();

const archivDate = new Date(date.setUTCDate(date.getUTCDate() - 1))
  .toISOString()
  .slice(0, 10);

export default archivDate;
