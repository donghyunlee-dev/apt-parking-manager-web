export const maskFin = (finNo: string) => {
  if (finNo.length < 3) return finNo;
  return `${finNo.slice(0, 3)}***`;
};

export const generateFin = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return String(random);
};
