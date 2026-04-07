import { describe, it, expect } from "vitest";
import { parseMonths, bloomRange, firstBloomStart } from "./months.js";

// Helper: create monthStates from a simple state map
const states = (obj) => parseMonths(obj);

describe("bloomRange", () => {
  it("normal range", () => {
    expect(bloomRange(states({ "1-4": "dormant", "5-10": "blooming", "11-12": "dormant" })))
      .toBe("may–oct");
  });

  it("wrap-around merges into single range", () => {
    expect(bloomRange(states({ "1-3": "blooming", "4-11": "dormant", "12": "blooming" })))
      .toBe("dec–mar");
  });

  it("multiple separate ranges", () => {
    expect(bloomRange(states({ "1-2": "dormant", "3-5": "blooming", "6-8": "dormant", "9-11": "blooming", "12": "dormant" })))
      .toBe("mar–may, sep–nov");
  });

  it("single month", () => {
    expect(bloomRange(states({ "1-5": "dormant", "6": "blooming", "7-12": "dormant" })))
      .toBe("jun");
  });

  it("all year blooming", () => {
    expect(bloomRange(states({ "1-12": "blooming" })))
      .toBe("jan–dec");
  });

  it("no blooming", () => {
    expect(bloomRange(states({ "1-12": "dormant" })))
      .toBe("");
  });

  it("wrap-around with multiple ranges", () => {
    expect(bloomRange(states({ "1-2": "blooming", "3-5": "dormant", "6-8": "blooming", "9-11": "dormant", "12": "blooming" })))
      .toBe("jun–aug, dec–feb");
  });

  it("single month wrap-around", () => {
    expect(bloomRange(states({ "1": "dormant", "2-11": "dormant", "12": "blooming" })))
      .toBe("dec");
  });

  it("two single months", () => {
    expect(bloomRange(states({ "1": "blooming", "2-5": "dormant", "6": "blooming", "7-12": "dormant" })))
      .toBe("jun, jan");
  });
});

describe("firstBloomStart", () => {
  it("normal range returns first month", () => {
    expect(firstBloomStart(states({ "1-4": "dormant", "5-10": "blooming", "11-12": "dormant" })))
      .toBe(4); // May (index 4)
  });

  it("wrap-around returns start of wrapped range", () => {
    // dec–mar: bloom in Jan,Feb,Mar,Dec → first bloom starts in Dec (index 11)
    expect(firstBloomStart(states({ "1-3": "blooming", "4-11": "dormant", "12": "blooming" })))
      .toBe(11);
  });

  it("all year returns 0", () => {
    expect(firstBloomStart(states({ "1-12": "blooming" })))
      .toBe(0);
  });

  it("no blooming returns 12", () => {
    expect(firstBloomStart(states({ "1-12": "dormant" })))
      .toBe(12);
  });
});
