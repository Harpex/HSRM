export const todayIso = () => new Date().toISOString().slice(0, 10);

export const addDays = (date: string, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
};

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(date));

export const weekday = (date: string) =>
  new Intl.DateTimeFormat("tr-TR", { weekday: "short" }).format(new Date(date));

export const weekDates = (anchor = todayIso()) => {
  const date = new Date(anchor);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(date);
    next.setDate(date.getDate() + index);
    return next.toISOString().slice(0, 10);
  });
};
