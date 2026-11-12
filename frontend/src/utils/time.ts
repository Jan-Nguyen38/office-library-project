// "just now", "5 minutes ago", "2 days ago", then a date for anything older than a week
export function timeAgo(date: Date, now = Date.now()) {
    const seconds = Math.round((date.getTime() - now) / 1000);
    const abs = Math.abs(seconds);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (abs < 45) return 'just now';
    if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
    if (abs < 7 * 86400) return rtf.format(Math.round(seconds / 86400), 'day');
    return `on ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}
