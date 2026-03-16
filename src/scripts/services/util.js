/**
 * Conveniently create an element with optional class names.
 * @param {string} tag Tag name of the element to create.
 * @param  {...string} classNames Optional class names to add to created element.
 * @returns {HTMLElement} Created element with specified tag and class names.
 */
export const createElement = (tag, ...classNames) => {
  const element = document.createElement(tag);
  if (classNames.length > 0) {
    element.classList.add(...classNames);
  }

  return element;
};

/**
 * Emit event without bubbling or crossing shadow DOM boundaries.
 * @param {HTMLElement} target Element to dispatch the event on.
 * @param {string} type Type of the event to emit.
 * @param {object} detail Optional detail object to include in the event.
 */
export const emitInternal = (target, type, detail = {}) => {
  target.dispatchEvent(new CustomEvent(type, {
    detail,
    bubbles: false,
    composed: false,
  }));
};

/**
 * Determine if a value is a plain object (not null, of type 'object', and not an array).
 * @param {object} value Value to check.
 * @returns {boolean} True if the value is a plain object, false otherwise.
 */
export const isPlainObject = (value) => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Convert an object into an array of [key, value] pairs.
 * @param {object} obj Object to convert into an array.
 * @returns {Array} Array of [key, value] pairs from the object.
 */
export const objectToArray = (obj) => {
  return Object.keys(obj || {}).map((key) => [key, obj[key]]);
};

