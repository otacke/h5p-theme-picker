import Color from 'color';

/** @constant {number} DEFAULT_TARGET_CONTRAST_RATIO Contrast ratio better than recommended 4.5. (H5P Group) */
const DEFAULT_TARGET_CONTRAST_RATIO = 4.6;

/** @constant {number} DEFAULT_LIGHTNESS_ADJUSTMENT_STEP Step to increase/decrease lightness by when adjusting. */
const DEFAULT_LIGHTNESS_ADJUSTMENT_STEP = 0.1;

/** @constant {number} DEFAULT_CONTRAST_TOLERANCE Acceptable contrast ratio delta when adjusting lightness. */
const DEFAULT_CONTRAST_TOLERANCE = 0.01;

/** @constant {number} FAILSAFE_COUNTER_LIMIT Maximum number of iterations before giving up. */
const FAILSAFE_COUNTER_LIMIT = 1000;

/** @constant {number} SRGB_BREAKPOINT Breakpoint for sRGB transfer function. */
const SRGB_BREAKPOINT = 0.04045;

/** @constant {number} SRGB_GAMMA Gamma value for sRGB color space. */
const SRGB_GAMMA = 2.4;

/** @constant {number} SRGB_LINEAR_SEGMENT_SCALE_FACTOR Scale factor for linear segment of sRGB transfer function. */
const SRGB_LINEAR_SEGMENT_SCALE_FACTOR = 12.92;

/** @constant {number} SRGB_TRANSFER_FUNCTION_CONSTANT Constant for sRGB transfer function. */
const SRGB_TRANSFER_FUNCTION_CONSTANT = 1.055;

/** @constant {number} SRGB_TRANSFER_FUNCTION_OFFSET Offset for sRGB transfer function. */
const SRGB_TRANSFER_FUNCTION_OFFSET = 0.055;

/** @constant {number} LINEAR_LIGHT_BREAKPOINT Breakpoint for linear lightness in contrast calculations. */
const LINEAR_LIGHT_BREAKPOINT = 0.0031308;

/** @constant {number} ALTERNATIVE_BASE_SATURATION Saturation for alternative base color. (H5P Group) */
const ALTERNATIVE_BASE_SATURATION = 60;

/** @constant {number} ALTERNATIVE_BASE_LIGHTNESS Lightness for alternative base color. (H5P Group) */
const ALTERNATIVE_BASE_LIGHTNESS = 96;

/** @constant {number} ALTERNATIVE_BASE_LIGHTNESS_DISPLAY Lightness for alt. base color in picker. (H5P Group) */
const ALTERNATIVE_BASE_LIGHTNESS_DISPLAY = 85;

/** @constant {string[]} MANDATORY_COLOR_VARIABLES List of mandatory CSS variables for themes. */
export const MANDATORY_COLOR_VARIABLES = [
  '--h5p-theme-main-cta-base',
  '--h5p-theme-main-cta-light',
  '--h5p-theme-main-cta-dark',
  '--h5p-theme-contrast-cta',
  '--h5p-theme-contrast-cta-light',
  '--h5p-theme-contrast-cta-white',
  '--h5p-theme-contrast-cta-dark',
  '--h5p-theme-secondary-cta-base',
  '--h5p-theme-secondary-cta-light',
  '--h5p-theme-secondary-cta-dark',
  '--h5p-theme-secondary-contrast-cta',
  '--h5p-theme-secondary-contrast-cta-hover',
  '--h5p-theme-background',
  '--h5p-theme-alternative-base',
  '--h5p-theme-alternative-light',
  '--h5p-theme-alternative-dark',
  '--h5p-theme-alternative-darker',
];

/** @constant {object} FIXED_THEME_COLORS CSS variables with fixed color values that are not derived from user input. */
const FIXED_THEME_COLORS = {
  // Technically not fixed, but not documented and H5P.com also uses these fixed values.
  '--h5p-theme-stroke-1': '#101729',
  '--h5p-theme-stroke-2': '#354054',
  '--h5p-theme-stroke-3': '#737373',
  // Fixed colors
  '--h5p-theme-ui-base': '#ffffff',
  '--h5p-theme-text-primary': '#101729',
  '--h5p-theme-text-secondary': '#354054',
  '--h5p-theme-text-third': '#737373',
  '--h5p-theme-feedback-correct-main': '#256D1D',
  '--h5p-theme-feedback-correct-secondary': '#f3fcf0',
  '--h5p-theme-feedback-correct-third': '#cff1c2',
  '--h5p-theme-feedback-incorrect-main': '#a13236',
  '--h5p-theme-feedback-incorrect-secondary': '#faf0f4',
  '--h5p-theme-feedback-incorrect-third': '#f6dce7',
  '--h5p-theme-feedback-neutral-main': '#E6C81D',
  '--h5p-theme-feedback-neutral-secondary': '#5E4817',
  '--h5p-theme-feedback-neutral-third': '#F0EBCB',
};

/**
 * Adjust lightness of color towards lighter or darker to achieve target contrast ratio against contrast color.
 * @param {string} baseColor Base hex color to adjust.
 * @param {string} contrastColor Hex color to compare contrast against.
 * @param {number} targetContrast Target contrast ratio to achieve.
 * @param {number} lightnessAdjustmentStep Step to increase/decrease lightness by in each iteration.
 * @param {number} direction Direction to adjust lightness (1 for lighter, -1 for darker).
 * @returns {object} Object containing the adjusted color and the final contrast from target.
 */
const adjustTowardContrast = (baseColor, contrastColor, targetContrast, lightnessAdjustmentStep, direction) => {
  let counter = FAILSAFE_COUNTER_LIMIT;
  let adjustedColor = baseColor;
  let contrastDelta = Number.POSITIVE_INFINITY;
  let contrast = adjustedColor.contrast(contrastColor);
  while (counter > 0) {
    const newLightness = adjustedColor.lightness() + direction * lightnessAdjustmentStep;
    if (newLightness < 0 || newLightness > 100) {
      break; // Stop if lightness goes out of bounds
    }

    const nextLightness = Math.max(0, Math.min(newLightness, 100));

    adjustedColor = adjustedColor.lightness(nextLightness);
    contrastDelta = Math.abs(adjustedColor.contrast(contrastColor) - targetContrast);

    if (contrastDelta < DEFAULT_CONTRAST_TOLERANCE) {
      break; // Stop if we are within the acceptable contrast tolerance
    }

    counter--;
  }

  contrast = adjustedColor.contrast(contrastColor);

  return { color: adjustedColor, contrast: contrast };
};

/**
 * Build main CTA color variants based on base button color, including contrast variants for white and dark backgrounds.
 * @param {string} buttons Hexadecimal color string for main buttons to derive colors from.
 * @returns {object} Object containing CSS variables for main CTA colors.
 */
const buildMainCtaColors = (buttons) => {
  const contrastCtaWhite = adjustLightnessForContrast(buttons, '#ffffff');

  return {
    '--h5p-theme-main-cta-base': buttons,
    // eslint-disable-next-line no-magic-numbers
    '--h5p-theme-main-cta-light': changeLightnessByFactor(buttons, 1.1), // WRONGLY DOCUMENTED BY H5P GROUP
    // eslint-disable-next-line no-magic-numbers
    '--h5p-theme-main-cta-dark': changeLightnessByFactor(buttons, 0.9), // WRONGLY DOCUMENTED BY H5P GROUP
    '--h5p-theme-contrast-cta': adjustLightnessForContrast(buttons, buttons),
    // eslint-disable-next-line no-magic-numbers
    '--h5p-theme-contrast-cta-light': mixWithTransparentOnBackground(buttons, 90),
    '--h5p-theme-contrast-cta-white': contrastCtaWhite,
    '--h5p-theme-contrast-cta-dark': adjustLightnessForContrast(buttons, '#282836'),
  };
};

/**
 * Build secondary CTA color variants based on navigation color, including contrast variant for white background.
 * @param {string} navigation Hexadecimal color string for navigation to derive colors from.
 * @param {string} contrastCtaWhite Hexadecimal color string for contrast CTA on white background to derive color from.
 * @returns {object} Object containing CSS variables for secondary CTA colors.
 */
const buildSecondaryCtaColors = (navigation, contrastCtaWhite) => ({
  '--h5p-theme-secondary-cta-base': navigation,
  // eslint-disable-next-line no-magic-numbers
  '--h5p-theme-secondary-cta-light': changeLightnessByFactor(navigation, 1.1), // WRONGLY DOCUMENTED BY H5P GROUP
  // eslint-disable-next-line no-magic-numbers
  '--h5p-theme-secondary-cta-dark': changeLightnessByFactor(navigation, 0.9), // WRONGLY DOCUMENTED BY H5P GROUP
  '--h5p-theme-secondary-contrast-cta': adjustLightnessForContrast(navigation, navigation), // WRONGLY DOCUMENTED, TOO
  '--h5p-theme-secondary-contrast-cta-hover': adjustLightnessForContrast(navigation, contrastCtaWhite),
});

/**
 * Change hue of color while keeping saturation and lightness the same.
 * @param {string} colorHex Hexadecimal color string.
 * @param {number} hue New hue value (0-360).
 * @returns {string} Hexadecimal color string with changed hue.
 */
const changeHue = (colorHex, hue) => {
  // eslint-disable-next-line no-magic-numbers
  hue = ((hue % 360) + 360) % 360;
  const color = Color(colorHex);
  return color.hue(hue).hex();
};

/**
 * Change lightness of color by multiplying it with factor.
 * @param {string} colorHex Hexadecimal color string.
 * @param {number} lightnessFactor Factor to multiply lightness with.
 * @returns {string} Hexadecimal color string with changed lightness.
 */
const changeLightnessByFactor = (colorHex, lightnessFactor) => {
  const color = Color(colorHex);
  return color.lightness(color.lightness() * lightnessFactor).hex();
};

/**
 * Convert linear light (luminance) value to sRGB color component.
 * @param {number} c Color component in linear light (0-1).
 * @returns {number} sRGB color component (0-1).
 */
const linearToSrgb = (c) => (
  c <= LINEAR_LIGHT_BREAKPOINT ?
    SRGB_LINEAR_SEGMENT_SCALE_FACTOR * c :
    SRGB_TRANSFER_FUNCTION_CONSTANT * (c ** (1 / SRGB_GAMMA)) - SRGB_TRANSFER_FUNCTION_OFFSET
);

/**
 * Mix a color with a transparent version of itself on a given background to simulate the effect of transparency.
 * By default same as "color-mix(in srgb, var(--h5p-theme-main-cta-base), transparent 90%)" in CSS
 * @param {string} hexColor Hexadecimal color string to mix.
 * @param {number} [transparentPercent] Percentage of transparency to apply (0-100).
 * @param {string} [backgroundHex] Hexadecimal color string of the background to mix on.
 * @returns {string} Hexadecimal color string of the mixed color.
 */
const mixWithTransparentOnBackground = (hexColor, transparentPercent = 90, backgroundHex = '#ffffff') => {
  const clampedTransparent = Math.max(0, Math.min(100, transparentPercent));
  const alpha = (1 - clampedTransparent / 100) * Color(hexColor).alpha();

  // eslint-disable-next-line no-magic-numbers
  const foreground = Color(hexColor).rgb().array().map((value) => value / 255);
  // eslint-disable-next-line no-magic-numbers
  const background = Color(backgroundHex).rgb().array().map((value) => value / 255);

  // eslint-disable-next-line no-magic-numbers
  const out = [0, 1, 2].map((i) => {
    const foregroundLinear = srgbToLinear(foreground[i]);
    const backgroundLinear = srgbToLinear(background[i]);
    const outLin = foregroundLinear * alpha + backgroundLinear * (1 - alpha);
    // eslint-disable-next-line no-magic-numbers
    return Math.round(Math.max(0, Math.min(1, linearToSrgb(outLin))) * 255);
  });

  return Color.rgb(out[0], out[1], out[2]).hex();
};

/**
 * Convert sRGB color component to linear light (luminance) value.
 * @param {number} c Color component in sRGB space (0-1).
 * @returns {number} Linear light value (0-1).
 */
const srgbToLinear = (c) => (
  c <= SRGB_BREAKPOINT ?
    c / SRGB_LINEAR_SEGMENT_SCALE_FACTOR :
    ((c + SRGB_TRANSFER_FUNCTION_OFFSET) / SRGB_TRANSFER_FUNCTION_CONSTANT) ** SRGB_GAMMA
);

/**
 * Adjust lightness of a color towards lighter or darker to achieve a target contrast ratio against another color.
 * @param {string} hexColor1 Hexadecimal color string of the color to adjust.
 * @param {string} hexColor2 Hexadecimal color string of the contrast color to compare against.
 * @param {object} options Options for adjustment.
 * @param {number} [options.targetContrast] Target contrast ratio to achieve.
 * @param {number} [options.lightnessAdjustmentStep] Step to increase/decrease lightness by in each iteration.
 * @returns {string} Hexadecimal color string of the adjusted color that meets the target contrast ratio.
 */
export const adjustLightnessForContrast = (hexColor1, hexColor2, options = {}) => {
  const targetContrast = options.targetContrast ?? DEFAULT_TARGET_CONTRAST_RATIO;
  const lightnessAdjustmentStep = options.lightnessAdjustmentStep || DEFAULT_LIGHTNESS_ADJUSTMENT_STEP;

  const color1 = Color(hexColor1);
  const color2 = Color(hexColor2);

  const lighter = adjustTowardContrast(color1, color2, targetContrast, lightnessAdjustmentStep, 1);
  const darker = adjustTowardContrast(color1, color2, targetContrast, lightnessAdjustmentStep, -1);

  return (darker.contrast > lighter.contrast) ? darker.color.hex() : lighter.color.hex();
};

/**
 * Get alternative base color for display in picker which only allows to choose hue. Used by H5P Group.
 * @param {string} colorHex Hexadecimal color string to get hue from for deriving alternative base color.
 * @returns {string} Hexadecimal color string of the alternative base color for display in picker.
 */
export const getAlternativeBaseDisplay = (colorHex) => {
  const alternativeHue = getHue(colorHex);
  return Color.hsl( alternativeHue, ALTERNATIVE_BASE_SATURATION, ALTERNATIVE_BASE_LIGHTNESS_DISPLAY).hex();
};

/**
 * Get alternative base color derived from hue by using fixed saturation and lightness values used by H5P Group.
 * @param {number} hue Hue value (0-360) to derive alternative base color from.
 * @returns {string} Hexadecimal color string of the alternative base color.
 */
export const getAlternativeBaseFromHue = (hue) => {
  return Color.hsl(hue, ALTERNATIVE_BASE_SATURATION, ALTERNATIVE_BASE_LIGHTNESS).hex();
};

/**
 * Get hue value (0-360) from a hexadecimal color string.
 * @param {string} colorHex Hexadecimal color string to extract hue from.
 * @returns {number} Hue value (0-360) extracted from the color.
 */
export const getHue = (colorHex) => {
  const color = Color(colorHex);
  const hsl = color.hsl().array();
  return hsl[0];
};

/**
 * Get full set of theme colors derived from 4 core input values.
 * @param {string} buttons Hexadecimal color string for main buttons to derive main CTA colors from.
 * @param {string} navigation Hexadecimal color string for navigation to derive secondary CTA colors from.
 * @param {number} alternativeHue Hue value (0-360) to derive alternative base color and its variants from.
 * @param {string} background Hexadecimal color string for background to use in CSS variable.
 * @returns {object} Object containing CSS variables for the full set of theme colors.
 */
export const getThemeColors = (buttons, navigation, alternativeHue, background) => {
  const mainCta = buildMainCtaColors(buttons);
  const secondaryCta = buildSecondaryCtaColors(navigation, mainCta['--h5p-theme-contrast-cta-white']);

  return {
    '--h5p-theme-background': background,
    '--h5p-theme-alternative-base': getAlternativeBaseFromHue(alternativeHue), // NOT DOCUMENTED
    '--h5p-theme-alternative-light': changeHue('#f8f9fe', alternativeHue),
    '--h5p-theme-alternative-dark': changeHue('#dcdffa', alternativeHue),
    '--h5p-theme-alternative-darker': changeHue('#ced1ee', alternativeHue),
    ...mainCta,
    ...secondaryCta,
    ...FIXED_THEME_COLORS,
  };
};
