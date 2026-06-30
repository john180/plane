/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { FALLBACK_LANGUAGE, LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from "../constants/language";
import type { TLanguage } from "../types";

type TLanguageDetectionOptions = {
  storedLanguage?: string | null;
  browserLanguages?: readonly (string | null | undefined)[];
};

const SUPPORTED_LANGUAGE_VALUES = SUPPORTED_LANGUAGES.map((language) => language.value);
const SUPPORTED_LANGUAGE_BY_TAG = new Map(
  SUPPORTED_LANGUAGE_VALUES.map((language) => [normalizeLanguageTag(language), language])
);

function normalizeLanguageTag(language: string): string {
  return language.trim().replaceAll("_", "-").toLowerCase();
}

export function isSupportedLanguage(language: string | null | undefined): language is TLanguage {
  if (!language) return false;
  return SUPPORTED_LANGUAGE_BY_TAG.get(normalizeLanguageTag(language)) === language;
}

export function getMatchingSupportedLanguage(language: string | null | undefined): TLanguage | undefined {
  if (!language) return undefined;

  const normalizedLanguage = normalizeLanguageTag(language);
  const exactLanguage = SUPPORTED_LANGUAGE_BY_TAG.get(normalizedLanguage);
  if (exactLanguage) return exactLanguage;

  const languageParts = normalizedLanguage.split("-");
  const languageCode = languageParts[0];
  if (!languageCode) return undefined;

  if (languageCode === "zh") {
    const modifiers = new Set(languageParts.slice(1));
    if (modifiers.has("hant") || modifiers.has("tw") || modifiers.has("hk") || modifiers.has("mo")) return "zh-TW";
    return "zh-CN";
  }

  if (languageCode === "pt") return "pt-BR";
  if (languageCode === "tr") return "tr-TR";
  if (languageCode === "vi") return "vi-VN";
  if (languageCode === "uk") return "ua";

  return SUPPORTED_LANGUAGE_BY_TAG.get(languageCode);
}

export function getPreferredLanguage({
  storedLanguage,
  browserLanguages = [],
}: TLanguageDetectionOptions = {}): TLanguage {
  if (isSupportedLanguage(storedLanguage)) return storedLanguage;

  for (const language of browserLanguages) {
    const supportedLanguage = getMatchingSupportedLanguage(language);
    if (supportedLanguage) return supportedLanguage;
  }

  return FALLBACK_LANGUAGE;
}

export function getBrowserLanguages(): string[] {
  if (typeof navigator === "undefined") return [];

  const languages = Array.isArray(navigator.languages) ? [...navigator.languages] : [];
  if (navigator.language) languages.push(navigator.language);

  return [...new Set(languages)];
}

function getStoredLanguage(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getInitialLanguage(): TLanguage {
  if (typeof window === "undefined") return FALLBACK_LANGUAGE;

  return getPreferredLanguage({
    storedLanguage: getStoredLanguage(),
    browserLanguages: getBrowserLanguages(),
  });
}

export function getBrowserPreferredLanguage(): TLanguage {
  return getPreferredLanguage({ browserLanguages: getBrowserLanguages() });
}
