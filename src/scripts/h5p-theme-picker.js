import './h5p-theme-picker.css';

import ColorSelector from './color-selector.js';
import Preview from './preview.js';
import Selector from './selector.js';
import SelectorOptions from '@services/selector-options.js';
import Translations from '@services/translations.js';
import { createElement } from '@services/util.js';
import { getHue, getThemeColors } from '@services/color.js';
import polyfillAnchorPositioning from '@oddbird/css-anchor-positioning/fn';

let isAnchorPolyfilled = false;

/**
 * Ensure anchor positioning polyfill is applied if not already. TODO: Remove in 2027.
 */
const ensureAnchorPolyfill = () => {
  if (isAnchorPolyfilled) {
    return;
  }

  polyfillAnchorPositioning();
  isAnchorPolyfilled = true;
};

/**
 * Build DOM.
 * @param {object} params Parameters.
 * @returns {object} DOM elements.
 */
const buildDOM = (params = {}) => {
  const dom = createElement('div', 'h5p-theme-picker');
  const details = createElement('div', 'h5p-theme-picker-details');

  const selector = new Selector({ translations: params.translations, densityAllowed: params.densityAllowed });
  const colorSelector = new ColorSelector({
    translations: params.translations,
    customColorButtons: params.customColorButtons,
    customColorNavigation: params.customColorNavigation,
    customColorAlternative: params.customColorAlternative,
    customColorBackground: params.customColorBackground,
  });
  const preview = new Preview({ translations: params.translations });

  dom.append(selector, details);
  details.append(colorSelector, preview);

  return { dom, selector, colorSelector, preview, details };
};

/**
 * Get boolean attribute value with fallback.
 * @param {HTMLElement} element Element to get attribute from.
 * @param {string} name Attribute name.
 * @param {boolean} fallback Fallback value if attribute is not present.
 * @returns {boolean} Boolean value of attribute or fallback.
 */
const getBooleanAttribute = (element, name, fallback) => {
  if (!element.hasAttribute(name)) {
    return fallback;
  }

  const value = element.getAttribute(name);
  return value === '' || value === 'true';
};

export default class ThemePicker extends HTMLElement {
  /**
   * @class
   * @param {object} params Parameters.
   * @param {string} params.language Language code for translations.
   * @param {object} params.translations Custom translations.
   * @param {boolean} params.presetThemesAllowed Whether preset themes are allowed.
   * @param {boolean} params.customThemesAllowed Whether custom themes are allowed.
   * @param {object} params.customPresets Custom theme presets.
   * @param {boolean} params.densityAllowed Whether density options are allowed.
   * @param {string} params.theme Initial theme name.
   * @param {string} params.density Initial density name.
   * @param {string} params.customColorButtons Initial custom color for buttons.
   * @param {string} params.customColorNavigation Initial custom color for navigation.
   * @param {string} params.customColorAlternative Initial custom color for alternative hue.
   * @param {string} params.customColorBackground Initial custom color for background.
   */
  constructor(params = {}) {
    super();
    this.params = { ...params };

    // TODO: Remove in 2027, browser support should be good by then. See https://caniuse.com/css-anchor-positioning
    ensureAnchorPolyfill();

    this.bindHandlers();
    this.isEventsBound = false;

    this.initialize(params);
  }

  /**
   * Initialize theme picker by setting up translations, options, components, and building the DOM structure.
   * @param {object} params Parameters.
   */
  initialize(params = {}) {
    const config = this.resolveConfig(params);

    this.translations = new Translations(config.language, config.customTranslations);
    this.selectorOptions = new SelectorOptions({
      translations: this.translations,
      presetThemesAllowed: config.presetThemesAllowed,
      customThemesAllowed: config.customThemesAllowed,
      customPresets: config.customPresets,
    });

    const selectedTheme = this.initColors();
    this.initDensity();

    const built = buildDOM({
      translations: this.translations,
      customColorButtons: this.selectedThemeColors['--h5p-theme-main-cta-base'],
      customColorNavigation: this.selectedThemeColors['--h5p-theme-secondary-cta-base'],
      customColorAlternative: this.selectedThemeColors['--h5p-theme-alternative-base'],
      customColorBackground: this.selectedThemeColors['--h5p-theme-background'],
      densityAllowed: config.densityAllowed,
    });

    const { dom, selector, colorSelector, preview, details } = built;
    this.dom = dom;
    this.selector = selector;
    this.colorSelector = colorSelector;
    this.preview = preview;
    this.details = details;

    this.initComponents(selectedTheme);
  }

  /**
   * Resolve config from params + attributes in one place.
   * @param {object} params Raw params.
   * @returns {object} Normalized config.
   */
  resolveConfig(params = {}) {
    return {
      language: this.getAttribute('language') || params.language,
      customTranslations: this.getAttribute('translations') ?? params.translations ?? {},
      customPresets: this.getAttribute('custom-presets') ?? params.customPresets ?? {},
      presetThemesAllowed: getBooleanAttribute(this, 'preset-themes-allowed', params.presetThemesAllowed ?? true),
      customThemesAllowed: getBooleanAttribute(this, 'custom-themes-allowed', params.customThemesAllowed ?? true),
      densityAllowed: getBooleanAttribute(this, 'density-allowed', params.densityAllowed ?? true),
    };
  }

  /**
   * Initialize colors, setting the selected theme and corresponding colors based on params, attributes, or defaults.
   * @returns {object} Selected theme object.
   */
  initColors() {
    const themeOptions = this.selectorOptions.getThemeOptions();
    const firstThemeEntry = themeOptions.entries().next().value;
    if (!firstThemeEntry) {
      throw new Error('ThemePicker: No theme options available.');
    }
    const [firstThemeKey, firstTheme] = firstThemeEntry;
    let selectedTheme;

    this.params.theme = this.params.theme || this.getAttribute('theme-name') || firstThemeKey;

    if (this.params.theme && this.selectorOptions.getThemeOptions().has(this.params.theme)) {
      selectedTheme = this.selectorOptions.getThemeOptions().get(this.params.theme);
    }
    else {
      selectedTheme = firstTheme;
      this.params.theme = firstThemeKey;
    }

    if (this.params.theme === 'custom') {
      this.selectedThemeColors = getThemeColors(
        this.getAttribute('custom-color-buttons') || firstTheme.values['--h5p-theme-main-cta-base'],
        this.getAttribute('custom-color-navigation') || firstTheme.values['--h5p-theme-secondary-cta-base'],
        getHue(this.getAttribute('custom-color-alternative') || firstTheme.values['--h5p-theme-alternative-base']),
        this.getAttribute('custom-color-background') || firstTheme.values['--h5p-theme-background'],
      );
    }
    else {
      this.selectedThemeColors = selectedTheme.values;
    }

    return selectedTheme;
  }

  /**
   * Initialize density, setting it to the value from params, attribute, or first available option, in that order.
   */
  initDensity() {
    const densityOptions = this.selectorOptions.getDensityOptions();
    const firstDensityEntry = densityOptions.entries().next().value;
    if (!firstDensityEntry) {
      throw new Error('ThemePicker: no density options available.');
    }
    const [firstDensityKey] = firstDensityEntry;

    this.params.density = this.params.density || this.getAttribute('density') || firstDensityKey;

    if (this.params.density === 'wide') {
      this.params.density = 'large';
    }
    else if (this.params.density === 'compact') {
      this.params.density = 'small';
    }
    else if (!this.selectorOptions.getDensityOptions().has(this.params.density)) {
      this.params.density = firstDensityKey;
    }
  }

  /**
   * Initialize components.
   * @param {object} selectedTheme Selected theme object to initialize with.
   */
  initComponents(selectedTheme) {
    this.selector.setThemeOptions(this.selectorOptions.getThemeOptions());
    this.selector.setDensityOptions(this.selectorOptions.getDensityOptions());
    this.selector.setActiveTheme(this.params.theme);

    this.selectedDensity = this.params.density;
    this.selector.setActiveDensity(this.params.density);

    this.applyPreviewState({
      themeValues: this.selectedThemeColors,
      themeLabel: selectedTheme.label,
      densityKey: this.selectedDensity,
    });

    this.colorSelector.toggleVisibility(this.params.theme === 'custom');
    this.details.classList.toggle('open', this.params.theme === 'custom');
  }

  /**
   * Get theme values by key.
   * @param {string} key Key of theme.
   * @returns {object} Theme values.
   */
  getThemeValuesByKey(key) {
    if (key === 'custom') {
      const currentColors = this.colorSelector.getValues();

      return getThemeColors(
        currentColors['--h5p-theme-main-cta-base'],
        currentColors['--h5p-theme-secondary-cta-base'],
        getHue(currentColors['--h5p-theme-alternative-base']),
        currentColors['--h5p-theme-background'],
      );
    }

    return this.selectorOptions.getThemeOptions().get(key)?.values ?? {};
  }

  /**
   * Apply preview state in one place to keep theme/density sync consistent.
   * @param {object} params Parameters.
   * @param {object} [params.themeValues] Theme CSS variables.
   * @param {string} [params.themeLabel] Theme label for preview title.
   * @param {string} [params.densityKey] Density key.
   */
  applyPreviewState({
    themeValues = this.selectedThemeColors,
    themeLabel,
    densityKey = this.selectedDensity,
  } = {}) {
    this.preview.setValues(themeValues, themeLabel);
    this.preview.setValues(this.selectorOptions.getDensityOptions().get(densityKey)?.values ?? {});
  }

  /**
   * Lifecycle method called when the element is added to the DOM.
   */
  connectedCallback() {
    this.render();

    if (!this.isEventsBound) {
      this.bindEvents();
    }
  }

  /**
   * Lifecycle method called when the element is removed from the DOM.
   */
  disconnectedCallback() {
    if (!this.isEventsBound) {
      return;
    }

    this.unbindEvents();
  }

  /**
   * Handle theme change.
   * @param {Event} event Theme change event.
   */
  handleThemeChange(event) {
    const key = event?.detail?.key;
    if (!key || !this.selectorOptions.getThemeOptions().has(key)) {
      return;
    }

    const values = this.getThemeValuesByKey(key);

    this.selectedThemeColors = values;

    this.applyPreviewState({
      themeValues: this.selectedThemeColors,
      themeLabel: this.selectorOptions.getThemeOptions().get(key)?.label,
      densityKey: this.selectedDensity,
    });

    this.colorSelector.toggleVisibility(key === 'custom');
    this.details.classList.toggle('open', key === 'custom');

    this.dispatchChangeEvent();
  }

  /**
   * Handle theme preview (user hovers over theme option).
   * @param {Event} event Theme preview event.
   */
  handleThemePreview(event) {
    const key = event?.detail?.key;
    if (!key) {
      return;
    }

    this.applyPreviewState({
      themeValues: this.getThemeValuesByKey(key),
      themeLabel: this.selectorOptions.getThemeOptions().get(key)?.label,
      densityKey: this.selectedDensity,
    });
  }

  /**
   * Handle theme preview reset (user stops hovering over theme option).
   */
  handleThemePreviewReset() {
    this.applyPreviewState();
  }

  /**
   * Handle density change.
   * @param {Event} event Density change event.
   */
  handleDensityChange(event) {
    const key = event?.detail?.key;
    if (!key || !this.selectorOptions.getDensityOptions().has(key)) {
      return;
    }

    this.selectedDensity = key;
    this.applyPreviewState({ densityKey: key });
    this.dispatchChangeEvent();
  }

  /**
   * Handle density preview (user hovers over density option).
   * @param {Event} event Density preview event.
   */
  handleDensityPreview(event) {
    const key = event?.detail?.key;
    if (!key) {
      return;
    }

    this.applyPreviewState({ densityKey: key });
  }

  /**
   * Handle density preview reset (user stops hovering over density option).
   */
  handleDensityPreviewReset() {
    this.applyPreviewState();
  }

  /**
   * Handle color change in custom theme.
   * @param {Event} event Color change event.
   */
  handleColorChange(event) {
    if (!event?.detail?.id || !event?.detail?.color) {
      return;
    }

    const { id, color } = event.detail;

    const sourceColors = {
      buttons: this.selectedThemeColors['--h5p-theme-main-cta-base'],
      navigation: this.selectedThemeColors['--h5p-theme-secondary-cta-base'],
      alternative: this.selectedThemeColors['--h5p-theme-alternative-base'],
      background: this.selectedThemeColors['--h5p-theme-background'],
    };
    sourceColors[id] = color;

    this.selectedThemeColors = getThemeColors(
      sourceColors.buttons,
      sourceColors.navigation,
      getHue(sourceColors.alternative),
      sourceColors.background,
    );

    this.applyPreviewState();
    this.dispatchChangeEvent();
  }

  /**
   * Bind event handlers to the instance to ensure correct `this` context when called as event listeners.
   */
  bindHandlers() {
    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.handleThemePreview = this.handleThemePreview.bind(this);
    this.handleThemePreviewReset = this.handleThemePreviewReset.bind(this);
    this.handleDensityChange = this.handleDensityChange.bind(this);
    this.handleDensityPreview = this.handleDensityPreview.bind(this);
    this.handleDensityPreviewReset = this.handleDensityPreviewReset.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
  }

  /**
   * Unbind event listeners from the selector and color selector components.
   */
  unbindEvents() {
    this.selector.removeEventListener('theme-change', this.handleThemeChange);
    this.selector.removeEventListener('theme-preview', this.handleThemePreview);
    this.selector.removeEventListener('theme-preview-reset', this.handleThemePreviewReset);
    this.selector.removeEventListener('density-change', this.handleDensityChange);
    this.selector.removeEventListener('density-preview', this.handleDensityPreview);
    this.selector.removeEventListener('density-preview-reset', this.handleDensityPreviewReset);
    this.colorSelector.removeEventListener('change', this.handleColorChange);

    this.isEventsBound = false;
  }

  /**
   * Bind event listeners to the selector and color selector components.
   */
  bindEvents() {
    this.selector.addEventListener('theme-change', this.handleThemeChange);
    this.selector.addEventListener('theme-preview', this.handleThemePreview);
    this.selector.addEventListener('theme-preview-reset', this.handleThemePreviewReset);
    this.selector.addEventListener('density-change', this.handleDensityChange);
    this.selector.addEventListener('density-preview', this.handleDensityPreview);
    this.selector.addEventListener('density-preview-reset', this.handleDensityPreviewReset);
    this.colorSelector.addEventListener('change', this.handleColorChange);

    this.isEventsBound = true;
  }

  /**
   * Dispatch a custom event with the current theme and density values when a change occurs.
   */
  dispatchChangeEvent() {
    this.dispatchEvent(new CustomEvent('theme-change', {
      detail: this.getValue(),
      bubbles: true,
      composed: true,
    }));
  }

  /**
   * Get the current selected theme and density values.
   * @returns {object} Current values of theme and density.
   */
  getValue() {
    return {
      theme: this.selector.getActiveTheme(),
      data: {
        colors: this.selectedThemeColors,
        density: this.selectedDensity,
      },
    };
  }

  /**
   * Lifecycle method to render the component's DOM structure.
   */
  render() {
    // if (!this.querySelector(':scope > link[data-theme-picker="main"]')) {
    //   const link = document.createElement('link');
    //   link.dataset.themePicker = 'main';
    //   link.setAttribute('rel', 'stylesheet');
    //   link.setAttribute('href', new URL('./h5p-theme-picker.css?url', import.meta.url).href);
    //   this.append(link);
    // }

    if (!this.contains(this.dom)) {
      this.append(this.dom);
    }
  }
}

if (!customElements.get('h5p-theme-picker')) {
  customElements.define('h5p-theme-picker', ThemePicker);
}
