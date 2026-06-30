/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { describe, expect, it } from "vitest";
import { getPreferredLanguage } from "./language-detector";

describe("getPreferredLanguage", () => {
  it("prefers a valid stored language over browser languages", () => {
    expect(getPreferredLanguage({ storedLanguage: "de", browserLanguages: ["fr-CA"] })).toBe("de");
  });

  it("ignores an invalid stored language", () => {
    expect(getPreferredLanguage({ storedLanguage: "nl", browserLanguages: ["fr-CA"] })).toBe("fr");
  });

  it("falls back regional language tags to supported base locales", () => {
    expect(getPreferredLanguage({ browserLanguages: ["fr-CA"] })).toBe("fr");
  });

  it("maps Portuguese browser languages to Portuguese Brazil", () => {
    expect(getPreferredLanguage({ browserLanguages: ["pt"] })).toBe("pt-BR");
    expect(getPreferredLanguage({ browserLanguages: ["pt-PT"] })).toBe("pt-BR");
  });

  it("maps Turkish browser languages to the supported Turkish locale", () => {
    expect(getPreferredLanguage({ browserLanguages: ["tr"] })).toBe("tr-TR");
  });

  it("maps Vietnamese browser languages to the supported Vietnamese locale", () => {
    expect(getPreferredLanguage({ browserLanguages: ["vi"] })).toBe("vi-VN");
  });

  it("maps Ukrainian browser languages to the existing app locale", () => {
    expect(getPreferredLanguage({ browserLanguages: ["uk"] })).toBe("ua");
    expect(getPreferredLanguage({ browserLanguages: ["uk-UA"] })).toBe("ua");
  });

  it("maps traditional Chinese browser languages to Traditional Chinese", () => {
    expect(getPreferredLanguage({ browserLanguages: ["zh-Hant"] })).toBe("zh-TW");
    expect(getPreferredLanguage({ browserLanguages: ["zh-TW"] })).toBe("zh-TW");
    expect(getPreferredLanguage({ browserLanguages: ["zh-HK"] })).toBe("zh-TW");
  });

  it("maps simplified Chinese browser languages to Simplified Chinese", () => {
    expect(getPreferredLanguage({ browserLanguages: ["zh"] })).toBe("zh-CN");
    expect(getPreferredLanguage({ browserLanguages: ["zh-CN"] })).toBe("zh-CN");
    expect(getPreferredLanguage({ browserLanguages: ["zh-Hans"] })).toBe("zh-CN");
  });

  it("falls back to English for unsupported browser languages", () => {
    expect(getPreferredLanguage({ browserLanguages: ["nl-NL"] })).toBe("en");
  });
});
