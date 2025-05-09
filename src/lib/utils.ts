import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDisplayId = (saleId: string, saleDate: string | Date): string => {
  const dateObj = typeof saleDate === 'string' ? new Date(saleDate) : saleDate;
  const datePart = dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '');
  const sequencePart = saleId.substring(saleId.length - 4).toUpperCase();
  return `${datePart}-${sequencePart}`;
};
