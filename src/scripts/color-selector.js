import ColorPicker from '@components/color-picker.js';
import { emitInternal } from '@services/util.js';
import './color-selector.css';

export default class ColorSelector extends HTMLElement {
  /**
   * @class
   * @param {object} params Parameters.
   * @param {object} params.translations Translations object with a get method for retrieving translated strings.
   * @param {string} [params.customColorButtons] Initial color value for buttons color picker.
   * @param {string} [params.customColorNavigation] Initial color value for navigation color picker.
   * @param {string} [params.customColorAlternative] Initial color value for alternative color picker.
   * @param {string} [params.customColorBackground] Initial color value for background color picker.
   */
  constructor(params = {}) {
    super();

    this.translations = params.translations || {};

    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-theme-picker-color-selector');

    const title = document.createElement('div');
    title.classList.add('h5p-theme-picker-color-selector-title');
    title.innerText = this.translate('color_selector_title');
    this.dom.append(title);

    this.grid = document.createElement('div');
    this.grid.classList.add('h5p-theme-picker-color-selector-grid');
    this.dom.append(this.grid);

    this.pickerButtons = {};

    this.pickerButtons.buttons = this.addPicker('buttons', {
      defaultColor: params.customColorButtons,
      buttonLabel: this.translate('color_selector_buttons_button_aria'),
    }, 'color_selector_buttons_label');

    this.pickerButtons.navigation = this.addPicker('navigation', {
      defaultColor: params.customColorNavigation,
      buttonLabel: this.translate('color_selector_buttons_navigation_aria'),
    }, 'color_selector_navigation_label');

    this.pickerButtons.alternative = this.addPicker('alternative', {
      type: 'hue',
      defaultColor: params.customColorAlternative,
      buttonLabel: this.translate('color_selector_alternative_button_aria'),
    }, 'color_selector_alternative_label');

    this.pickerButtons.background = this.addPicker('background', {
      defaultColor: params.customColorBackground,
      buttonLabel: this.translate('color_selector_background_button_aria'),
    }, 'color_selector_background_label');
  }

  /**
   * Translate a given key using the provided translations object. If no translation is found, returns the key itself.
   * @param {string} key Translation key to look up in the translations object.
   * @returns {string} Translated string corresponding to the key, or the key itself if no translation is found.
   */
  translate(key) {
    if (typeof this.translations?.get === 'function') {
      return this.translations.get(key) ?? key;
    }

    return key;
  }

  /**
   * Add picker to the grid with specified parameters and label.
   * @param {string} id Picker id.
   * @param {object} pickerParams Parameters for the color picker instance.
   * @param {string} labelKey Translation key for picker's label.
   * @returns {ColorPicker} Created color picker instance.
   */
  addPicker(id, pickerParams, labelKey) {
    const uuid = crypto.randomUUID();

    const picker = new ColorPicker(
      { id, uuid, ...pickerParams },
      { onChange: (data) => emitInternal(this, 'change', data) },
    );
    this.grid.append(picker);

    const label = document.createElement('label');
    label.classList.add('h5p-theme-picker-color-selector-picker-label');
    label.setAttribute('for', uuid);
    label.innerText = this.translate(labelKey);
    this.grid.append(label);

    return picker;
  }

  /**
   * Get current color values from all pickers.
   * @returns {object} Object containing current color values from all pickers, keyed by CSS variable name.
   */
  getValues() {
    return {
      '--h5p-theme-main-cta-base': this.pickerButtons.buttons.getValue(),
      '--h5p-theme-secondary-cta-base': this.pickerButtons.navigation.getValue(),
      '--h5p-theme-alternative-base': this.pickerButtons.alternative.getValue(),
      '--h5p-theme-background': this.pickerButtons.background.getValue(),
    };
  }

  /**
   * Lifecycle method called when element is added to the DOM. Renders the color selector interface.
   */
  connectedCallback() {
    this.render();
  }

  /**
   * Toggle visibility of the color selector interface.
   * @param {boolean} visible Whether the color selector should be visible or hidden.
   */
  toggleVisibility(visible) {
    this.dom.classList.toggle('display-none', !visible);
  }

  /**
   * Lifecycle method to update DOM structure of component.
   */
  render() {
    if (!this.contains(this.dom)) {
      this.append(this.dom);
    }
  }
}

if (!customElements.get('h5p-theme-picker-color-selector')) {
  customElements.define('h5p-theme-picker-color-selector', ColorSelector);
}
