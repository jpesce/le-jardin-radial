import { describe, it, expect } from "vitest";
import { resolveLang, get, interpolate, SUPPORTED, DEFAULT_LANG } from "./I18nContext.jsx";

describe("resolveLang", () => {
  it("returns fr for root path", () => {
    expect(resolveLang("/")).toBe("fr");
  });

  it("returns fr for /fr", () => {
    expect(resolveLang("/fr")).toBe("fr");
  });

  it("returns en for /en", () => {
    expect(resolveLang("/en")).toBe("en");
  });

  it("returns default for unsupported language", () => {
    expect(resolveLang("/de")).toBe("fr");
  });

  it("returns default for garbage path", () => {
    expect(resolveLang("/ksjahdfkjdhsaf")).toBe("fr");
  });

  it("reads only the first path segment", () => {
    expect(resolveLang("/en/some/other/path")).toBe("en");
  });

  it("returns default for empty string", () => {
    expect(resolveLang("")).toBe("fr");
  });
});

describe("get", () => {
  const obj = {
    simple: "hello",
    nested: { deep: { value: "found" } },
    array: [1, 2, 3],
    seasons: { spring: { name: "printemps", range: "mar – mai" } },
  };

  it("retrieves a top-level key", () => {
    expect(get(obj, "simple")).toBe("hello");
  });

  it("retrieves a nested key with dot notation", () => {
    expect(get(obj, "nested.deep.value")).toBe("found");
  });

  it("retrieves nested objects", () => {
    expect(get(obj, "seasons.spring")).toEqual({ name: "printemps", range: "mar – mai" });
  });

  it("returns an array value", () => {
    expect(get(obj, "array")).toEqual([1, 2, 3]);
  });

  it("returns undefined for missing key", () => {
    expect(get(obj, "missing")).toBeUndefined();
  });

  it("returns undefined for missing nested key", () => {
    expect(get(obj, "nested.missing.deep")).toBeUndefined();
  });

  it("returns undefined for path through non-object", () => {
    expect(get(obj, "simple.foo")).toBeUndefined();
  });
});

describe("interpolate", () => {
  it("replaces a single variable", () => {
    expect(interpolate("hello {name}", { name: "world" })).toBe("hello world");
  });

  it("replaces multiple variables", () => {
    expect(interpolate("{a} and {b}", { a: "one", b: "two" })).toBe("one and two");
  });

  it("keeps placeholder for missing variable", () => {
    expect(interpolate("hello {name}", {})).toBe("hello {name}");
  });

  it("returns string unchanged when no vars provided", () => {
    expect(interpolate("hello world")).toBe("hello world");
  });

  it("returns string unchanged when vars is undefined", () => {
    expect(interpolate("hello {name}", undefined)).toBe("hello {name}");
  });

  it("returns non-string values as-is", () => {
    const arr = ["jan", "feb"];
    expect(interpolate(arr, { foo: "bar" })).toBe(arr);
  });

  it("returns number as-is", () => {
    expect(interpolate(42, { x: "y" })).toBe(42);
  });
});

describe("constants", () => {
  it("SUPPORTED includes fr and en", () => {
    expect(SUPPORTED).toEqual(["fr", "en"]);
  });

  it("DEFAULT_LANG is fr", () => {
    expect(DEFAULT_LANG).toBe("fr");
  });
});
