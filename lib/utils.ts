import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeRemaining(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return `${mins}:${sec.toString().padStart(2, "0")}`;
}
