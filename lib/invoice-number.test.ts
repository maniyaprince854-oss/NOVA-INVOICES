import { describe, it, expect } from "vitest";
import { financialYearLabel } from "./invoice-number";

describe("financialYearLabel", () => {
  it("returns current-next year when month is on/after FY start", () => {
    expect(financialYearLabel(new Date(2026, 5, 22), 4)).toBe("2026-27"); // June
    expect(financialYearLabel(new Date(2026, 3, 1), 4)).toBe("2026-27"); // April 1
  });

  it("returns previous-current year when month is before FY start", () => {
    expect(financialYearLabel(new Date(2026, 2, 31), 4)).toBe("2025-26"); // March
    expect(financialYearLabel(new Date(2027, 0, 15), 4)).toBe("2026-27"); // January
  });
});
