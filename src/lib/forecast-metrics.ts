import type { ErrorThresholds } from '@/contracts/dashboard-data';

export type AccuracyTone = 'good' | 'medium' | 'bad';

export const DEFAULT_THRESHOLDS: ErrorThresholds = {
  goodMax: 3,
  mediumMax: 5,
};

export const ceilSignedOneDecimal = (value: number): number => {
  if (!Number.isFinite(value) || value === 0) return 0;
  const absCeil = Math.ceil(Math.abs(value) * 10) / 10;
  return value > 0 ? absCeil : -absCeil;
};

export const formatSigned = (value: number, unit: string) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}${unit}`;
};

export const formatSignedPercentCeil = (value: number) => {
  const rounded = ceilSignedOneDecimal(value);
  return `${rounded >= 0 ? '+' : ''}${rounded.toFixed(1)}%`;
};

export const calcErrorClass = (
  pct: number,
  thresholds: ErrorThresholds = DEFAULT_THRESHOLDS,
): AccuracyTone => {
  const abs = Math.abs(ceilSignedOneDecimal(pct));
  if (abs <= thresholds.goodMax) return 'good';
  if (abs <= thresholds.mediumMax) return 'medium';
  return 'bad';
};

export const getErrorColor = (
  pctAbs: number,
  thresholds: ErrorThresholds = DEFAULT_THRESHOLDS,
  colors: { good: string; medium: string; bad: string } = {
    good: '#3fb950',
    medium: '#ffc107',
    bad: '#f85149',
  },
) => {
  const roundedAbs = Math.ceil(pctAbs * 10) / 10;
  if (roundedAbs <= thresholds.goodMax) return colors.good;
  if (roundedAbs <= thresholds.mediumMax) return colors.medium;
  return colors.bad;
};

export const getAccuracyTone = (accuracy: number): AccuracyTone => {
  if (accuracy >= 97) return 'good';
  if (accuracy >= 95) return 'medium';
  return 'bad';
};
