import { differenceInCalendarDays, format, isAfter } from 'date-fns';

export const formatDate = (value: string) => format(new Date(value), 'yyyy-MM-dd');

export const calcStatus = (endDate: string) => {
  const expired = isAfter(new Date(), new Date(endDate));
  return expired ? 'expired' : 'active';
};

export const calcDday = (endDate: string) => {
  const diff = differenceInCalendarDays(new Date(endDate), new Date());
  return diff;
};
