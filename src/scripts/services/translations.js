import TRANSLATIONS from '@assets/translations.json';
import { objectToArray } from '@services/util.js';

/** @constant {string} FALLBACK_ENGLISH ISO 639 langage code of fallback language (en). */
const FALLBACK_ENGLISH = 'en';

/**
 * Get resolved language code to use for translations.
 * @param {string} requestedLanguage ISO 639 language code (e.g. 'en', 'fr', 'es').
 * @returns {string} Resolved language code that is either requested language or fallback English code.
 */
const resolveLanguage = (requestedLanguage) => {
  if (typeof requestedLanguage !== 'string') {
    return FALLBACK_ENGLISH;
  }

  const lower = requestedLanguage.toLowerCase();
  return TRANSLATIONS[lower] ? lower : FALLBACK_ENGLISH;
};

/**
 * Parse custom translations from a JSON string or object, ensuring it is a valid object.
 * @param {string|object} customTranslations Custom translations as JSON string or object.
 * @returns {object} Parsed custom translations object, or empty object if parsing fails or input is invalid.
 */
const parseCustomTranslations = (customTranslations) => {
  if (!customTranslations) {
    return {};
  }

  if (typeof customTranslations === 'object' && !Array.isArray(customTranslations)) {
    return customTranslations;
  }

  if (typeof customTranslations === 'string') {
    try {
      const parsed = JSON.parse(customTranslations);
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    }
    catch (error) {
      console.warn('Failed to parse custom translations, falling back to defaults.', error);
      return {};
    }
  }

  return {};
};

/**
 * Remove invalid translations that are not present in the fallback English translations or have non-string values.
 * @param {object} translations Object containing translation key-value pairs to be cleaned.
 * @returns {object} Cleaned translations object containing only valid keys and string values.
 */
const removeInvalidTranslations = (translations) => {
  const validKeys = new Set(Object.keys(TRANSLATIONS[FALLBACK_ENGLISH] || {}));
  const cleanedTranslations = {};

  for (const [key, value] of Object.entries(translations)) {
    if (validKeys.has(key) && typeof value === 'string') {
      cleanedTranslations[key] = value;
    }
    else {
      console.warn(`Invalid translation key or value: ${key}. This key will be ignored.`);
    }
  }

  return cleanedTranslations;
};

export default class Translations {
  /**
   * @class
   * @param {string} [language] ISO 639 language code (e.g. 'en', 'fr', 'es').
   * @param {string} [customTranslations] JSON string or object containing custom translations to override defaults.
   */
  constructor(language = FALLBACK_ENGLISH, customTranslations = {}) {
    const requestedLanguage = resolveLanguage(language);
    const customLanguage = removeInvalidTranslations(parseCustomTranslations(customTranslations));

    const fallbackRequestedLanguage = TRANSLATIONS[requestedLanguage] ?? {};
    const fallbackEnglish = TRANSLATIONS[FALLBACK_ENGLISH] ?? {};

    // Priority: custom > requested > English fallback
    const merged = { ...fallbackEnglish, ...fallbackRequestedLanguage, ...customLanguage };

    this.translations = new Map(objectToArray(merged));
  }

  /**
   * Get the translation for a given key.
   * @param {string} key Translation key.
   * @returns {string} Translated string, or message indicating missing translation.
   */
  get(key) {
    if (typeof key !== 'string' || !this.has(key)) {
      return `Missing translation for key: ${key}`;
    }

    return this.translations.get(key);
  }

  /**
   * Determine if a translation exists for a given key.
   * @param {string} key Translation key.
   * @returns {boolean} True if translation exists, false otherwise.
   */
  has(key) {
    return this.translations.has(key);
  }
}
