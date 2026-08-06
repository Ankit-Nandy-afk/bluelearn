import { describe, it, expect } from "vitest";
import { parsePostgresInterval } from "../src/lib/interval";

describe("parsePostgresInterval", () => {
  it("defaults to 48 hours when null or empty", () => {
    expect(parsePostgresInterval(null)).toBe(48 * 60 * 60 * 1000);
    expect(parsePostgresInterval("")).toBe(48 * 60 * 60 * 1000);
    expect(parsePostgresInterval(undefined)).toBe(48 * 60 * 60 * 1000);
  });

  it("parses day formats", () => {
    expect(parsePostgresInterval("2 days")).toBe(2 * 24 * 60 * 60 * 1000);
    expect(parsePostgresInterval("1 day")).toBe(1 * 24 * 60 * 60 * 1000);
    expect(parsePostgresInterval("7 days")).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("parses hour formats", () => {
    expect(parsePostgresInterval("12 hours")).toBe(12 * 60 * 60 * 1000);
    expect(parsePostgresInterval("1 hour")).toBe(1 * 60 * 60 * 1000);
  });

  it("parses HH:MM:SS and HH:MM formats", () => {
    expect(parsePostgresInterval("48:00:00")).toBe(48 * 60 * 60 * 1000);
    expect(parsePostgresInterval("02:30:00")).toBe((2 * 3600 + 30 * 60) * 1000);
    expect(parsePostgresInterval("01:15")).toBe((1 * 3600 + 15 * 60) * 1000);
  });

  it("parses compound formats", () => {
    expect(parsePostgresInterval("2 days 04:00:00")).toBe(
      (2 * 24 + 4) * 60 * 60 * 1000
    );
  });

  it("parses ISO 8601 duration formats", () => {
    expect(parsePostgresInterval("P2D")).toBe(2 * 24 * 60 * 60 * 1000);
    expect(parsePostgresInterval("PT48H")).toBe(48 * 60 * 60 * 1000);
    expect(parsePostgresInterval("P1DT12H")).toBe((24 + 12) * 60 * 60 * 1000);
  });
});
