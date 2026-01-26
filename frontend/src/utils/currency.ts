/**
 * Currency formatting utilities
 * All prices are in RWF (Rwandan Franc)
 */

export const formatRWF = (amount: number): string => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatRWFSimple = (amount: number): string => {
  return `${amount.toLocaleString('en-RW')} RWF`;
};

