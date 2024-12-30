import { CalendarDate, Time, ZonedDateTime } from "@internationalized/date";
import { TimeInputValue } from "@nextui-org/react";

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

export const capitalizeToUppercase = (str: string): string => {
  if (!str) return "";
  return str
    .split("_") // Split by underscore
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(" "); // Join with spaces
};

export const formatTimeInputValue = (time: TimeInputValue): string => {
  if (time instanceof ZonedDateTime) {
    const hours = String(time.hour).padStart(2, "0");
    const minutes = String(time.minute).padStart(2, "0");
    return `${hours}:${minutes}`;
  } else if (time instanceof Time) {
    const hours = String(time.hour).padStart(2, "0");
    const minutes = String(time.minute).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  throw new Error("Invalid TimeInputValue format");
};

export const parseTimeInputValue = (timeStr: string): TimeInputValue => {
  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error("Invalid time string format. Expected 'HH:MM'.");
  }

  return new Time(hours, minutes);
};

export const joinEnums = (enums: string[]): string => {
  if (!Array.isArray(enums) || enums.length === 0) {
    return "";
  }

  const capitalizedEnums = enums.map(capitalizeToUppercase);

  if (capitalizedEnums.length === 1) {
    return capitalizedEnums[0]!;
  }

  return `${capitalizedEnums.join(", ")}`;
};
