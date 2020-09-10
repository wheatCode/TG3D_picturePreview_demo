import i18n from '@/i18n/i18n';

export const DateTimeFormatter = new Intl.DateTimeFormat(i18n.locale || 'en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
