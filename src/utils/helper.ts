import { CalendarDate } from "@internationalized/date";

export const formatDate = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date input. Please provide a valid Date object.");
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
};

export const formatTime = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date input. Please provide a valid Date object.");
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleTimeString("en-US", options);
}

export const dateToDateValue = (date: Date) => {
  if (date) {
    return new CalendarDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    );
  }
  return null;
};


export const capitalizeToUppercase = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}