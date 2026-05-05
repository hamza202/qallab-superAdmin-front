export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatNotificationTimeLabel(
  iso: string,
  locale: "ar" | "en",
  tToday: (time: string) => string,
  tYesterday: (time: string) => string,
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const timeStr = d.toLocaleTimeString(locale === "ar" ? "ar-SA" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isSameCalendarDay(d, now)) {
    return tToday(timeStr);
  }

  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (isSameCalendarDay(d, y)) {
    return tYesterday(timeStr);
  }

  return d.toLocaleString(locale === "ar" ? "ar-SA" : "en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
