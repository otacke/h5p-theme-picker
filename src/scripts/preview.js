import { createElement } from './services/util.js';
import './preview.css';

/**
 * @constant {Set<string>} VALID_PREVIEW_THEME_VARIABLES Set of CSS variables used in preview.
 * Note that this is not an exhaustive list of all CSS variables used used be theming, it's only those that are used,
 * to generate the preview mockup.
 */
const VALID_PREVIEW_THEME_VARIABLES = new Set([
  '--h5p-theme-main-cta-base',
  '--h5p-theme-contrast-cta',
  '--h5p-theme-secondary-cta-base',
  '--h5p-theme-secondary-contrast-cta',
  '--h5p-theme-alternative-base',
  '--h5p-theme-alternative-dark',
  '--h5p-theme-alternative-light',
  '--h5p-theme-background',
  '--h5p-theme-ui-base',
  '--h5p-theme-text-primary',
  '--h5p-theme-spacing-xl',
  '--h5p-theme-spacing-l',
  '--h5p-theme-spacing-m',
  '--h5p-theme-spacing-s',
  '--h5p-theme-spacing-xs',
  '--h5p-theme-spacing-xxs',
  '--h5p-theme-font-size-xxl',
  '--h5p-theme-font-size-xl',
  '--h5p-theme-font-size-l',
  '--h5p-theme-font-size-m',
  '--h5p-theme-font-size-s',
  '--h5p-theme-scaling',
]);

/**
 * Build DOM structure for preview.
 * @param {object} params Paramters.
 * @param {object} params.translations Translations object.
 * @returns {object} Object containing DOM elements.
 */
const buildDOM = (params = {}) => {
  const dom = createElement('div', 'h5p-theme-picker-preview');
  const label = createElement('div', 'h5p-theme-picker-preview-label');

  const text = (typeof params?.translations?.get === 'function')
    ? (params.translations.get('preview_preview_label_prefix') ?? 'preview_preview_label_prefix')
    : 'preview_preview_label_prefix';
  label.textContent = text;

  dom.append(label);
  dom.append(buildMockup());

  return { dom, label };
};

/**
 * Build mockup structure for preview.
 * @returns {HTMLElement} Mockup element.
 */
const buildMockup = () => {
  const mockup = createElement('div', 'h5p-theme-picker-preview-mockup');
  const main = createElement('div', 'h5p-theme-picker-preview-mockup-main');

  main.append(createMultiChoiceBox());
  main.append(createDragTextBox());

  mockup.append(main);
  mockup.append(createFooter());

  return mockup;
};

/**
 * Build "Multiple Choice" box structure for preview.
 * @returns {HTMLElement} Multi-choice box element.
 */
const createMultiChoiceBox = () => {
  const box = createElement('div', 'h5p-theme-picker-preview-mockup-box', 'multi-choice');

  const innerMain = createElement('div', 'h5p-theme-picker-preview-mockup-inner-main');
  innerMain.append(createElement('div', 'h5p-theme-picker-preview-mockup-bar'));
  innerMain.append(createElement('div', 'h5p-theme-picker-preview-mockup-blank'));
  innerMain.append(createElement('div', 'h5p-theme-picker-preview-mockup-blank'));
  innerMain.append(createElement('div', 'h5p-theme-picker-preview-mockup-blank'));

  box.append(innerMain);
  box.append(createMainButtonFooter());

  return box;
};

/**
 * Create footer with main button for mockup.
 * @returns {HTMLElement} Footer element.
 */
const createMainButtonFooter = () => {
  const footer = createElement('div', 'h5p-theme-picker-preview-mockup-inner-footer');
  footer.append(createElement('div', 'h5p-theme-picker-preview-mockup-button', 'main'));

  return footer;
};

/**
 * Create "Drag the Words" box structure for preview.
 * @returns {HTMLElement} Drag-text box element.
 */
const createDragTextBox = () => {
  const box = createElement('div', 'h5p-theme-picker-preview-mockup-box', 'drag-text');
  const innerMain = createElement('div', 'h5p-theme-picker-preview-mockup-inner-main');

  const textContainer = createElement('div', 'h5p-theme-picker-preview-mockup-text-container');
  textContainer.append(createTextRow('h5p-theme-picker-preview-mockup-blank', 'h5p-theme-picker-preview-mockup-bar'));
  textContainer.append(createTextRow('h5p-theme-picker-preview-mockup-bar', 'h5p-theme-picker-preview-mockup-blank'));
  textContainer.append(createTextRow('h5p-theme-picker-preview-mockup-blank', 'h5p-theme-picker-preview-mockup-bar'));

  const draggableContainer = createElement('div', 'h5p-theme-picker-preview-mockup-draggable-container');
  draggableContainer.append(createElement('div', 'h5p-theme-picker-preview-mockup-draggable'));
  draggableContainer.append(createElement('div', 'h5p-theme-picker-preview-mockup-draggable'));
  draggableContainer.append(createElement('div', 'h5p-theme-picker-preview-mockup-draggable'));

  innerMain.append(textContainer);
  innerMain.append(draggableContainer);

  box.append(innerMain);
  box.append(createMainButtonFooter());

  return box;
};

/**
 * Ceate a row with text and bar for mockup.
 * @param {string} leftClass CSS class for left element.
 * @param {string} rightClass CSS class for right element.
 * @returns {HTMLElement} Row element.
 */
const createTextRow = (leftClass, rightClass) => {
  const row = createElement('div', 'h5p-theme-picker-preview-mockup-text-row');
  row.append(createElement('div', leftClass));
  row.append(createElement('div', rightClass));

  return row;
};

/**
 * Create footer with secondary buttons for mockup.
 * @returns {HTMLElement} Footer element.
 */
const createFooter = () => {
  const footer = createElement('div', 'h5p-theme-picker-preview-mockup-footer');
  footer.append(createElement('div', 'h5p-theme-picker-preview-mockup-button', 'secondary'));
  footer.append(createElement('div', 'h5p-theme-picker-preview-mockup-button', 'secondary'));

  return footer;
};

export default class Preview extends HTMLElement {
  /**
   * Observed attributes for the preview component.
   * @returns {string[]} Array of observed attribute names.
   */
  static get observedAttributes() {
    return ['theme-name'];
  }

  /**
   * @class
   * @param {object} params Parameters for the preview component.
   * @param {object} params.translations Translations object.
   */
  constructor(params = {}) {
    super();

    const { dom, label } = buildDOM(params);
    this.dom = dom;
    this.label = label;
  }

  /**
   * Lifecycle method called when the component is connected to the DOM. Renders the component.
   */
  connectedCallback() {
    this.render();
  }

  /**
   * Lifecycle method called when observed attributes change. Updates internal parameters and re-renders the component.
   * @param {string} name Name of the changed attribute.
   * @param {boolean|number|string} oldValue Old value of the changed attribute.
   * @param {boolean|number|string} newValue New value of the changed attribute.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    if (name === 'theme-name') {
      if (newValue == null) {
        this.label.removeAttribute('data-theme-name');
      }
      else {
        this.label.setAttribute('data-theme-name', newValue);
      }
    }
  }

  /**
   * Set CSS variable values for the preview component.
   * @param {object} themeVariables Object containing CSS variable key-value pairs.
   * @param {string} themeName Name of the theme being previewed.
   */
  setValues(themeVariables = {}, themeName) {
    if (typeof themeName === 'string') {
      this.setAttribute('theme-name', themeName);
    }
    else if (themeName == null) {
      this.removeAttribute('theme-name');
    }

    Object.entries(themeVariables).forEach(([key, value]) => {
      if (VALID_PREVIEW_THEME_VARIABLES.has(key)) {
        this.style.setProperty(key, value);
      }
    });
  }

  /**
   * Lifecycle method called when the component is disconnected from the DOM. Cleans up event listeners.
   */
  render() {
    if (!this.contains(this.dom)) {
      this.append(this.dom);
    }
  }
}

if (!customElements.get('h5p-theme-picker-preview')) {
  customElements.define('h5p-theme-picker-preview', Preview);
}
