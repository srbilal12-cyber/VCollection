/**
 * Currency utilities for PKR formatting across V Collection
 */

export const formatPKR = (amount: number): string => {
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
};

export const formatPKRShort = (amount: number): string => {
  return `PKR ${Math.round(amount).toLocaleString('en-PK')}`;
};
