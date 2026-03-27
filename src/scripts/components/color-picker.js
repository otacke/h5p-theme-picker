import { getAlternativeBaseFromHue, getAlternativeBaseDisplay } from '@services/color.js';
import './color-picker.css';

// TODO: Could be fun to create a complete color picker instead of using native input.

export default class ColorPicker extends HTMLElement {
  /**
   * Lifecycle method to specify observed attributes for component.
   * @returns {Array} List of attribute names to observe for changes.
   */
  static get observedAttributes() {
    return ['default-color', 'button-label', 'type'];
  }

  /**
   * @class
   * @param {object} params Parameters.
   * @param {string} params.id Unique identifier for color picker instance.
   * @param {string} [params.uuid] Unique identifier for color picker instance.
   * @param {string} [params.defaultColor] Initial color value for preview.
   * @param {string} [params.buttonLabel] Accessible label for color picker button.
   * @param {string} [params.type] Type of color picker ('color' or 'hue').
   * @param {object} callbacks Callbacks.
   * @param {function} callbacks.onChange Callback function to call when color changes.
   */
  constructor(params = {}, callbacks = {}) {
    super();

    this.params = {
      ...params,
      defaultColor: this.getAttribute('default-color') ?? params.defaultColor ?? '#000000',
      buttonLabel: this.getAttribute('button-label') ?? params.buttonLabel,
      type: this.getAttribute('type') ?? params.type ?? 'color',
    };
    this.callbacks = callbacks;
    this.callbacks.onChange = this.callbacks.onChange || (() => {});

    this.input = null;
    this.button = null;
    this.preview = null;
    this.dom = null;
    this.value = this.params.defaultColor;

    this.handleInput = this.handleInput.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);

    this.updateDOM(this.params);
  }

  /**
   * Handle input event from color input and update preview and emit change callback.
   * @param {InputEvent} event Input event from color input element.
   */
  handleInput(event) {
    const color = event.target.value;
    this.value = color;
    this.preview.style.setProperty('background-color', color);
    this.callbacks.onChange({ id: this.params.id, color });
  };

  /**
   * Handle click event on color picker button.
   * @param {PointerEvent} event Pointer event from button click.
   */
  handleButtonClick(event) {
    event.preventDefault();
    this.input?.click(); // Relay click to hidden color input to open native color picker dialog.
  };

  /**
   * Cleanup event listeners from input and button elements to prevent memory leaks.
   */
  cleanupListeners() {
    this.input?.removeEventListener('input', this.handleInput);
    this.button?.removeEventListener('click', this.handleButtonClick);
  }

  /**
   * Lifecycle method called when element is added to the DOM. Renders the color picker interface.
   */
  connectedCallback() {
    this.render();
  }

  /**
   * Lifecycle method called when element is removed from the DOM. Cleans up event listeners.
   */
  disconnectedCallback() {
    cleanupListeners();
  }

  /**
   * Get current color value from the preview element.
   * @returns {string} Current color value from the preview element.
   */
  getValue() {
    return this.value;
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

    const keyMap = {
      'default-color': 'defaultColor',
      'button-label': 'buttonLabel',
      type: 'type',
    };

    this.params[keyMap[name] ?? name] = newValue;

    this.updateDOM({
      ...this.params,
      defaultColor: this.getAttribute('default-color') ?? this.params.defaultColor ?? '#000000',
      buttonLabel: this.getAttribute('button-label') ?? this.params.buttonLabel,
      type: this.getAttribute('type') ?? this.params.type ?? 'color',
    });

    this.render();
  }

  /**
   * Lifecycle method to update DOM structure of component.
   * @param {object} params Parameters for building the DOM.
   * @param {string} params.id Unique identifier for color picker instance.
   * @param {string} [params.defaultColor] Initial color value for preview.
   * @param {string} [params.buttonLabel] Accessible label for color picker button.
   * @param {string} [params.type] Type of color picker ('color' or 'hue').
   */
  updateDOM(params = {}) {
    this.cleanupListeners();

    const { dom, input, button, preview } = this.buildDOM(params);

    this.dom = dom;
    this.input = input;
    this.button = button;
    this.preview = preview;
  }

  /**
   * Lifecycle method to render the component. Appends the built DOM structure and styles to the component.
   */
  render() {
    this.replaceChildren(this.dom);
  }

  /**
   * Build DOM.
   * @param {object} params Parameters for building the DOM.
   * @param {string} params.id Unique identifier for color picker instance.
   * @param {string} [params.defaultColor] Initial color value for preview.
   * @param {string} [params.buttonLabel] Accessible label for color picker button.
   * @param {string} [params.type] Type of color picker ('color' or 'hue').
   * @returns {object} Object containing references to created DOM elements: { dom, input, button, preview }.
   */
  buildDOM(params = {}) {
    const dom = document.createElement('div');
    dom.classList.add('h5p-theme-picker-color-picker', params.id);

    let input = null;
    let button = null;
    let preview = null;
    let popover = null;

    if (params.type === 'color') {
      input = document.createElement('input');
      input.type = 'color';
      input.id = params.uuid;
      input.classList.add('h5p-theme-picker-color-picker-input');
      input.setAttribute('tabindex', '-1');
      input.value = params.defaultColor;
      input.addEventListener('input', this.handleInput);
      dom.append(input);
    }

    button = document.createElement('button');
    button.classList.add('h5p-theme-picker-color-picker-button');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', params.buttonLabel);
    if (params.type === 'color') {
      button.addEventListener('click', this.handleButtonClick);
    }
    else if (params.type === 'hue') {
      button.setAttribute('popovertarget', params.uuid);
    }

    dom.append(button);

    preview = document.createElement('div');
    preview.classList.add('h5p-theme-picker-color-picker-preview');
    preview.style.setProperty('background-color', params.defaultColor);
    button.append(preview);

    if (params.type === 'hue') {
      popover = document.createElement('dialog');
      popover.id = params.uuid;
      popover.setAttribute('popover', '');
      popover.classList.add('h5p-theme-picker-color-picker-popover');
      dom.append(popover);

      const sliderHue = document.createElement('input');
      sliderHue.classList.add('h5p-theme-picker-color-picker-slider', 'hue');
      sliderHue.type = 'range';
      sliderHue.min = 0;
      sliderHue.max = 360;
      sliderHue.value = 0;
      sliderHue.addEventListener('input', (event) => {
        const hue = parseFloat(event.target.value);
        const alternativeBase = getAlternativeBaseFromHue(hue);
        const alternativeBaseDisplay = getAlternativeBaseDisplay(alternativeBase);
        preview.style.setProperty('background-color', alternativeBaseDisplay);
        this.callbacks.onChange({ id: params.id, color: alternativeBase });
      });
      popover.append(sliderHue);
    }

    return { dom, input, button, preview };
  }
}

if (!customElements.get('h5p-theme-picker-color-picker')) {
  customElements.define('h5p-theme-picker-color-picker', ColorPicker);
}
