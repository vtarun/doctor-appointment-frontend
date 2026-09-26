import type { AvailabilityWindow, AvailabilityWindowInput } from "@/features/availability/types";
import axios from "axios";

export const calculateAge = (dateOfBirth: string) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const birthdayHasNotOccurred =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());

  if (birthdayHasNotOccurred) {
    age -= 1;
  }

  return age;
};

export const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatConsultationType = (
  type: "IN_PERSON" | "VIDEO",
) => {
  return type === "IN_PERSON" ? "In person" : "Video";
};

export const pad = (value: number) => String(value).padStart(2, '0');

export const toDateInputValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
};

export const getUtcDayRange = (selectedDate: string) => {
  const from = new Date(`${selectedDate}T00:00:00`);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return {from: from.toISOString(), to: to.toISOString()};
};

export const toUtcWindow = (date: string, startTime: string, endTime: string) => ({
  startTime: new Date(`${date}T${startTime}:00`).toISOString(),
  endTime: new Date(`${date}T${endTime}:00`).toISOString()
});


export const formatWindow = (window: AvailabilityWindow) => {
  const options: Intl.DateTimeFormatOptions = {hour: '2-digit', minute: '2-digit'};
  return `${new Date(window.startTime).toLocaleTimeString([], options)}–${new Date(window.endTime).toLocaleTimeString([], options)}`;
};

export const getErrorMessage = (error: unknown) => {
  if(axios.isAxiosError(error)){
    return error.response?.data?.error ?? error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong';
};