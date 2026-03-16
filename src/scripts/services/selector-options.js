import SELECTOR_OPTIONS from '@assets/selector-options.json';
import { MANDATORY_COLOR_VARIABLES, adjustLightnessForContrast } from '@services/color.js';
import { isPlainObject } from '@services/util.js';

/**
 * Normalize constructor params and enforce valid option combinations.
 * @param {object} [params] Parameters
 * @returns {object} Normalized params with defaults applied and valid option combinations enforced.
 */
const normalizeParams = (params = {}) => {
  const safeParams = (params && typeof params === 'object' && !Array.isArray(params)) ? params : {};

  const {
    translations,
    presetThemesAllowed = true,
    customThemesAllowed = true,
    customPresets = {},
  } = safeParams;

  const parsedCustomPresets = parseCustomPresets(customPresets);
  const cleanedCustomPresets = cleanCustomPresets(parsedCustomPresets);

  const hasCustomPresets = Object.keys(cleanedCustomPresets).length > 0;

  let resolvedCustomThemesAllowed = customThemesAllowed;
  if (!resolvedCustomThemesAllowed && !presetThemesAllowed && !hasCustomPresets) {
    console.warn('Custom themes cannot be disabled when no other themes are set.');
    resolvedCustomThemesAllowed = true;
  }

  return {
    translations,
    presetThemesAllowed,
    customThemesAllowed: resolvedCustomThemesAllowed,
    customPresets: cleanedCustomPresets,
  };
};

/**
 * Parse custom theme options.
 * @param {string|object} customPresets Custom theme options.
 * @returns {object} Parsed custom theme options object, or empty object if parsing fails or input is invalid.
 */
const parseCustomPresets = (customPresets) => {
  if (!customPresets) {
    return {};
  }

  if (typeof customPresets === 'object' && !Array.isArray(customPresets)) {
    return customPresets;
  }

  if (typeof customPresets === 'string') {
    try {
      const parsed = JSON.parse(customPresets);
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    }
    catch (error) {
      console.warn('Failed to parse custom theme options, falling back to defaults.', error);
      return {};
    }
  }

  console.warn('Invalid custom theme options format, expected object or JSON string. Falling back to defaults.');
  return {};
};

/**
 * Get cleaned custom theme options with only valid keys and values, ensuring mandatory color variables are present.
 * @param {object} customPresets Custom theme options to clean and validate.
 * @returns {object} Cleaned custom theme options with only valid keys and values, or empty object if no valid options.
 */
const cleanCustomPresets = (customPresets) => {
  const cleanedOptions = {};
  const validColorVariableNames = getValidColorVariableNames();

  for (const [key, option] of Object.entries(customPresets)) {
    if (!key) {
      continue;
    }

    if (!isPlainObject(option)) {
      console.warn(`Invalid custom theme option format for key "${key}", expected object. Option will be ignored.`);
      continue;
    }

    if (!isPlainObject(option.values)) {
      console.warn(`Custom theme option "${key}" is missing a valid "values" property. Option will be ignored.`);
      continue;
    }

    const cleanedValues = {};
    for (const [valueKey, value] of Object.entries(option.values)) {
      if (typeof value === 'string' && validColorVariableNames.has(valueKey)) {
        cleanedValues[valueKey] = value;
      }
    }

    const hasAllMandatoryVariables = MANDATORY_COLOR_VARIABLES.every((variable) => variable in cleanedValues);
    if (!hasAllMandatoryVariables) {
      console.warn(`Custom theme option "${key}" is missing mandatory color variables. Option will be ignored.`);
      continue;
    }

    const backgroundColor = typeof option.backgroundColor === 'string' ? option.backgroundColor : '#ffffff';

    const color = typeof option.color === 'string' ?
      option.color :
      adjustLightnessForContrast(backgroundColor, backgroundColor);

    const label = typeof option.label === 'string' ? option.label : toSentenceCase(key);

    const subLabel = typeof option.subLabel === 'string' ? option.subLabel : '';

    cleanedOptions[key] = { backgroundColor, color, label, subLabel, values: cleanedValues };
  }

  return cleanedOptions;
};

/**
 * Get valid color variable names based on reference theme in selector options.
 * @returns {Set<string>} Set of valid color variable names.
 */
const getValidColorVariableNames = () => {
  const colorVariableNames = new Set();
  const themes = SELECTOR_OPTIONS?.themes ?? {};
  const firstTheme = Object.values(themes)[0];

  if (!firstTheme?.values || typeof firstTheme.values !== 'object') {
    return colorVariableNames;
  }

  for (const valueConfig of Object.keys(firstTheme.values)) {
    colorVariableNames.add(valueConfig);
  }

  return colorVariableNames;
};

/**
 * Capitalize the first letter of a word and make the rest lowercase.
 * @param {string} value Word.
 * @returns {string} Word with first letter capitalized and the rest in lowercase.
 */
const toSentenceCase = (value = '') => {
  return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
};

/**
 * Build options map and apply translated labels when available.
 * @param {object} baseOptions Source options object (key -> option config).
 * @param {object} translations Translations service instance.
 * @param {string} translationPrefix Translation key prefix.
 * @returns {Map<string, object>} Map of options with translated labels.
 */
const buildTranslatedOptionsMap = (baseOptions, translations, translationPrefix) => {
  const optionsMap = new Map();

  for (const [key, option] of Object.entries(baseOptions)) {
    const cloned = { ...option, values: { ...(option.values || {}) } };
    const translationKey = `${translationPrefix}${key}`;

    if (
      typeof translations?.has === 'function' &&
      typeof translations?.get === 'function' &&
      translations.has(translationKey)
    ) {
      cloned.label = translations.get(translationKey);
    }

    optionsMap.set(key, cloned);
  }

  return optionsMap;
};

export default class SelectorOptions {
  /**
   * @class
   * @param {object} params Constructor parameters
   * @param {object} [params.translations] Translations service instance for translating option labels.
   * @param {boolean} [params.presetThemesAllowed] Whether preset themes are allowed.
   * @param {boolean} [params.customThemesAllowed] Whether custom themes are allowed.
   * @param {object|string} [params.customPresets] Custom theme options to add or override preset themes.
   */
  constructor(params = {}) {
    const { translations, presetThemesAllowed, customThemesAllowed, customPresets } = normalizeParams(params);

    this.options = {};

    this.options.theme = buildTranslatedOptionsMap(
      SELECTOR_OPTIONS.themes,
      translations,
      'selector_theme_value_',
    );

    if (!presetThemesAllowed) {
      this.options.theme = new Map(
        [...this.options.theme].filter(([key]) => key === 'custom'),
      );
    }

    for (const [key, option] of Object.entries(customPresets)) {
      this.options.theme.set(key, option);
    }

    // Ensure custom option is deleted or last if applicable
    const customOption = this.options.theme.get('custom');
    this.options.theme.delete('custom');
    if (customThemesAllowed && customOption) {
      this.options.theme.set('custom', customOption);
    }

    this.options.density = buildTranslatedOptionsMap(
      SELECTOR_OPTIONS.densities,
      translations,
      'selector_density_value_',
    );
  }

  /**
   * Get theme options map.
   * @returns {Map<string, object>} Map of theme options.
   */
  getThemeOptions() {
    return this.options.theme;
  }

  /**
   * Get density options map.
   * @returns {Map<string, object>} Map of density options.
   */
  getDensityOptions() {
    return this.options.density;
  }
}
