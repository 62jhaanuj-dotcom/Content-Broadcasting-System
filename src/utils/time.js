const isWithinRange = (start, end) => {
  const now = new Date();
  return new Date(start) <= now && new Date(end) >= now;
};

const getCurrentMinute = () => {
  return Math.floor(Date.now() / 60000);
};

module.exports = { isWithinRange, getCurrentMinute };