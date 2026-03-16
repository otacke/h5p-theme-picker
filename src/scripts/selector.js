import { emitInternal } from '@services/util.js';
import './selector.css';

/**
 * Fallback density value when density selection is not allowed or select element is not present.
 */
const FALLBACK_DENSITY = 'large';

/**
 * Build DOM.
 * @param {object} params Parameters.
 * @param {string} params.labelTheme Theme label.
 * @param {string} params.labelDensity Density label.
 * @returns {object} DOM elements.
 */
const buildDOM = (params) => {
  const dom = document.createElement('div');
  dom.classList.add('h5p-theme-picker-selector');

  const suffix = crypto.randomUUID();
  const themeId = `selectTheme-${suffix}`;
  const densityId = `selectDensity-${suffix}`;

  const labelTheme = document.createElement('label');
  labelTheme.classList.add('h5p-theme-picker-label');
  labelTheme.setAttribute('for', themeId);
  labelTheme.innerText = params.translations.get('selector_theme_label') ?? params.labelTheme;
  dom.append(labelTheme);

  const selectTheme = document.createElement('select');
  selectTheme.id = themeId;
  selectTheme.classList.add('h5p-theme-picker-select', 'theme');
  dom.append(selectTheme);

  if (!params.densityAllowed) {
    return { dom, selectTheme, selectDensity: null };
  }

  const labelDensity = document.createElement('label');
  labelDensity.classList.add('h5p-theme-picker-label');
  labelDensity.setAttribute('for', densityId);
  labelDensity.innerText = params.translations.get('selector_density_label') ?? params.labelDensity;
  dom.append(labelDensity);

  const selectDensity = document.createElement('select');
  selectDensity.id = densityId;
  selectDensity.classList.add('h5p-theme-picker-select', 'density');
  dom.append(selectDensity);

  return { dom, selectTheme, selectDensity };
};

export default class Selector extends HTMLElement {
  /**
   * @class
   * @param {object} params Parameters.
   * @param {string} params.labelTheme Theme label.
   * @param {string} params.labelDensity Density label.
   */
  constructor(params = {}) {
    super();

    params.labelTheme = params.labelTheme ?? this.getAttribute('label-theme') ?? 'Theme';
    params.labelDensity = params.labelDensity ?? this.getAttribute('label-density') ?? 'Density';
    params.densityAllowed = params.densityAllowed ??
      (this.hasAttribute('density-allowed') ? this.getAttribute('density-allowed') === 'true' : true);

    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.handleDensityChange = this.handleDensityChange.bind(this);
    this.handleThemePointerEnter = this.handleThemePointerEnter.bind(this);
    this.handleThemePointerLeave = this.handleThemePointerLeave.bind(this);
    this.handleDensityPointerEnter = this.handleDensityPointerEnter.bind(this);
    this.handleDensityPointerLeave = this.handleDensityPointerLeave.bind(this);

    const { dom, selectTheme, selectDensity } = buildDOM(params);
    this.dom = dom;
    this.selectTheme = selectTheme;
    this.selectDensity = selectDensity ?? {};
  }

  /**
   * Lifecycle method called when the element is added to the DOM.
   */
  connectedCallback() {
    this.render();
    this.bindChangeEvents();
  }

  /**
   * Lifecycle method called when the element is removed from the DOM.
   */
  disconnectedCallback() {
    this.unbindChangeEvents();
    this.unbindOptionEvents();
  }

  /**
   * Set theme options.
   * @param {object} themeOptions Theme options.
   * @param {string} themeOptions.label Theme label.
   * @param {string} themeOptions.backgroundColor Theme background color for preview.
   * @param {string} themeOptions.color Theme text color for preview.
   */
  setThemeOptions(themeOptions = new Map()) {
    this.themeOptions = themeOptions;
    this.renderOptions(this.selectTheme, themeOptions, (optionElement, option) => {
      optionElement.style.setProperty('--background-color', option.backgroundColor);
      optionElement.style.setProperty('--color', option.color);
    });
  }

  /**
   * Set density options.
   * @param {object} densityOptions Density options.
   * @param {string} densityOptions.label Density label.
   */
  setDensityOptions(densityOptions = new Map()) {
    this.densityOptions = densityOptions;

    if (!this.selectDensity.getAttribute) {
      return; // Not an HTML element
    }

    this.renderOptions(this.selectDensity, densityOptions);
  }

  /**
   * Render options in a select element.
   * @param {HTMLElement} selectElement Select element to render options in.
   * @param {Map<string, object>} optionsMap Options to render.
   * @param {function} [decorateFn] Optional function to decorate option elements.
   */
  renderOptions(selectElement, optionsMap, decorateFn = null) {
    if (!selectElement) {
      return;
    }

    this.unbindOptionEvents();

    selectElement.innerHTML = '';
    optionsMap.forEach((option, key) => {
      const optionElement = document.createElement('option');
      optionElement.value = key;
      optionElement.textContent = option.label;
      decorateFn?.(optionElement, option);
      selectElement.append(optionElement);
    });

    this.bindOptionEvents();
  }

  /**
   * Set active theme.
   * @param {string} themeName Theme name to set as active.
   */
  setActiveTheme(themeName) {
    this.selectTheme.value = themeName;
  }

  /**
   * Set active density.
   * @param {string} densityName Density name to set as active.
   */
  setActiveDensity(densityName) {
    this.selectDensity.value = densityName;
  }

  /**
   * Get the currently active theme key.
   * @returns {string} Active theme key.
   */
  getActiveTheme() {
    return this.selectTheme.value;
  }

  /**
   * Get the currently active density key.
   * @returns {string} Active density key.
   */
  getActiveDensity() {
    return this.selectDensity.value ?? FALLBACK_DENSITY;
  }

  /**
   * Handle theme change event.
   * @param {Event} event Change event.
   */
  handleThemeChange(event) {
    emitInternal(this, 'theme-change', { key: event.target.value });
  }

  /**
   * Handle density change event.
   * @param {Event} event Change event.
   */
  handleDensityChange(event) {
    emitInternal(this, 'density-change', { key: event.target.value });
  }

  /**
   * Handle pointer enter event on theme option for preview.
   * @param {Event} event Pointer enter event.
   */
  handleThemePointerEnter(event) {
    emitInternal(this, 'theme-preview', { key: event.target.value });
  }

  /**
   * Handle pointer leave event on theme option to reset preview.
   */
  handleThemePointerLeave() {
    emitInternal(this, 'theme-preview-reset');
  }

  /**
   * Handle pointer enter event on density option for preview.
   * @param {Event} event Pointer enter event.
   */
  handleDensityPointerEnter(event) {
    emitInternal(this, 'density-preview', { key: event.target.value });
  }

  /**
   * Handle pointer leave event on density option to reset preview.
   */
  handleDensityPointerLeave() {
    emitInternal(this, 'density-preview-reset');
  }

  /**
   * Unbind change event listeners from the select elements
   */
  unbindChangeEvents() {
    this.selectTheme.removeEventListener('change', this.handleThemeChange);
    this.selectDensity?.removeEventListener?.('change', this.handleDensityChange);
  }

  /**
   * Unbind pointer event listeners from the option elements
   */
  unbindOptionEvents() {
    this.selectTheme.querySelectorAll('option').forEach((option) => {
      option.removeEventListener('pointerenter', this.handleThemePointerEnter);
      option.removeEventListener('pointerleave', this.handleThemePointerLeave);
    });

    this.selectDensity?.querySelectorAll?.('option').forEach((option) => {
      option.removeEventListener('pointerenter', this.handleDensityPointerEnter);
      option.removeEventListener('pointerleave', this.handleDensityPointerLeave);
    });
  }

  /**
   * Bind event listeners to the select elements.
   */
  bindChangeEvents() {
    this.selectTheme.addEventListener('change', this.handleThemeChange);
    this.selectDensity?.addEventListener?.('change', this.handleDensityChange);
  }

  /**
   * Bind pointer event listeners to the option elements for preview functionality.
   */
  bindOptionEvents() {
    this.selectTheme.querySelectorAll('option').forEach((option) => {
      option.addEventListener('pointerenter', this.handleThemePointerEnter);
      option.addEventListener('pointerleave', this.handleThemePointerLeave);
    });

    this.selectDensity?.querySelectorAll?.('option').forEach((option) => {
      option.addEventListener('pointerenter', this.handleDensityPointerEnter);
      option.addEventListener('pointerleave', this.handleDensityPointerLeave);
    });
  }

  /**
   * Lifecycle method to render the component, including loading the stylesheet and appending the DOM elements.
   */
  render() {
    if (!this.contains(this.dom)) {
      this.append(this.dom);
    }
  }
}

if (!customElements.get('h5p-theme-picker-selector')) {
  customElements.define('h5p-theme-picker-selector', Selector);
}
