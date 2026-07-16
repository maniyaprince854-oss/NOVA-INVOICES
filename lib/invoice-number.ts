export function financialYearLabel(date: Date, fyStartMonth = 4): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  const startYear = month >= fyStartMonth ? year : year - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");

  return `${startYear}-${endYearShort}`;
}
