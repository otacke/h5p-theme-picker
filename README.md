# H5P Theme Picker
A custom element for selecting an H5P-style theme and density. H5P.com has one, but H5P Group did not release the code, so users of other H5P integrations have know how to override the theme manually.


## Basic usage
Add h5p-theme-picker as a dependency to your project (with npm)
```bash
npm install h5p-theme-picker
```
Note that I have not yet put this up on `npmjs.org` and that I am not sure if I will. So, receiving updates will require you to repeat that install process manually.


## Instantiation
Loading the JavaScript will depend on how your project is set up. If you want to load it in an HTML directly, you'd need to add a `<script>` tag in your page's head pointing to the right path.
```html
<script type="module" src="./node_modules/h5p-theme-picker/dist/index.js" defer></script>
```
You may want to add a cache buster.

Normally, you'd load your own script anyway that then can import the theme picker:
```JavaScript
import 'h5p-theme-picker';
```

```html
<h5p-theme-picker></h5p-theme-picker>
```


### Attributes
| Attribute                | Purpose                                                                          |             |
|--------------------------|----------------------------------------------------------------------------------|-------------|
| theme-name               | Key (name) of theme to be displayed. `custom` has special meaning.               | recommended |
| density                  | Name of density to be used: ['large'|'medium'|'small'].                          | recommended |
| custom-color-buttons     | Hexadecimal main color for buttons. Used if `theme-name` is `custom`.            | recommended |
| custom-color-navigation  | Hexadecimal color for navigation buttons. Used if `theme-name` is `custom`.      | recommended |
| custom-color-alternative | Hexadecimal alternative color. Used if `theme-name` is `custom`.                 | recommended |
| custom-color-background  | Hexadecimal color for background. Used if `theme-name` is `custom`.              | recommended |
| language                 | ISO 639 language code to specify the requested language to use.                  | recommended |
| translations             | Stringified JSON object with translation to use. [See details](#translations).   | optional    |
| preset-themes-allowed    | Determine whether inbuilt presets are shown: [`true`\|`false`] (default: `true`). | optional    |
| custom-themes-allowed    | Determine whether custom themes can be set: [`true`\|`false`] (default: `true`).  | optional    |
| density-allowed          | Determine whether the density can be set: [`true`\|`false`] (default: `true`).    | optional    |
| custom-presets           | Stringified JSON object with custom preset. [See details](#custom-presets).      | optional    |

If you don't use HTML (or other markup interpreters like JSX) but construct the DOM element, you can pass the attributes to the constructor, but they are expected to be in _camelcase_, e.g.

```JavaScript
import H5PThemePicker from 'h5p-theme-picker';

const pickerDOM = new H5PThemePicker({
  themeName: 'daylight',
  density: 'large',
});
```

#### theme-name
The theme picker offers some inbuilt themes to choose from: 'daylight', 'lavender', 'mint', and 'sunset'. If no `theme-name` is specified, the picker will use the first one that it finds to start with ('daylight'). In the common use case scenario (choosing a global theme for all H5P contents), it is recommended to set `theme-name` to the previously chosen name of the theme.
If the `theme-name` is set to `custom`, it means that the picker should start with the the custom theme mode which allows to create a theme based on four basic colors. In the common use case scenario (choosing a global theme for all H5P contents), when `custom` is used, it is recommended to set `custom-color-buttons`, `custom-color-navigation`, `custom-color-alternative` and `custom-color-background` to the respective value that was previously chosen.

#### density
The theme picker offers three densities that H5P uses internally: 'large' (shown as 'Wide'), 'medium', and 'small' (shown as 'Compact'). If no `density` is specified, the picker will use `large` to start with. In the common use case scenario (choosing a global theme for all H5P contents), it is recommended to set `density` to the previously chosen density.

#### custom-color-buttons
The `custom-color-buttons` attribute specifies the hexadecimal color which H5P uses as the primary color, e.g. for buttons. It should be set if the `theme-name` is set to `custom`.

#### custom-color-navigation
The `custom-color-navigation` attribute specifies the hexadecimal color which H5P uses for navigational elements. It should be set if the `theme-name` is set to `custom`.

#### custom-color-alternative
The `custom-color-buttons` attribute specifies the hexadecimal color which H5P uses as an alternative color, e.g. used for the background of elements such as blanks or draggables. It should be set if the `theme-name` is set to `custom`.

#### custom-color-background
The `custom-color-background` attribute specifies the hexadecimal color which H5P uses for backgrounds of some containers, e.g in DialogCards or Question Set. It should be set if the `theme-name` is set to `custom`. 

#### language
The `language` attribute expects an ISO 639 language code (e.g. `en` or `de`) to set the theme picker to the respective language. If no translations for that language are available (pull requests are welcome), then the picker will fall back to English.

#### translations
The `translations` attribute can be used to make the picker use custom translations. The value is expected to be a stringified JSON object. A full custom translation object could look like:

```json
{
  "selector_theme_label": "Theme",
  "selector_theme_value_daylight": "Daylight (default)",
  "selector_theme_value_lavender": "Lavender",
  "selector_theme_value_mint": "Mint",
  "selector_theme_value_sunset": "Sunset",
  "selector_theme_value_custom": "Custom Theme",
  "selector_density_label": "Density",
  "selector_density_value_large": "Wide (default)",
  "selector_density_value_medium": "Medium",
  "selector_density_value_small": "Compact",
  "color_selector_title": "Define theme colors",
  "color_selector_buttons_label": "Buttons",
  "color_selector_buttons_button_aria": "Pick main color, e.g. for buttons",
  "color_selector_navigation_label": "Navigation",
  "color_selector_navigation_button_aria": "Pick secondary color for navigation buttons",
  "color_selector_alternative_label": "Alternative",
  "color_selector_alternative_button_aria": "Pick alternative hue as contrast to main color",
  "color_selector_background_label": "Background",
  "color_selector_background_button_aria": "Pick color for the background",
  "preview_preview_label_prefix": "Preview:"
}
```
If the `translations` attribute is incomplete, the missing values will be filled up with the translations available for the requested language according to the `language` tag or, if these are not available, with the English fallback values.

#### preset-themes-allowed
The `preset-themes-allowed` attribute can be set to `false` in order to not offer the inbuilt presets. This can make sense if you want to use the picker to create custom themes only, or if you want to supply your own themes for being selected.

#### custom-themes-allowed
The `custom-themes-allowed` attribute can be set to `false` in order to not offer to create custom themes. This can make sense if you want to use the picker for predefined sets only. Note that this setting will be ignored if no predefined sets are available.

#### density-allowed
The `density-allowed` attribute can be set to `false` in order to not offer the select field for the density. This can make sense if you want to use the picker to select the colors only.

#### custom-presets
The `custom-presets` attribute can be used to use the picker with custom presets to choose from. The value is expected to be a stringified JSON object which could like like:

```json
{
  "daylight": {
    "label": "Daylight (default)",
    "subLabel": "WCAG 2.0 AA",
    "backgroundColor": "rgb(249, 251, 255)",
    "color": "rgb(0, 111, 191)",
    "values": {
      "--h5p-theme-ui-base": "#FFFFFF",
      "--h5p-theme-text-primary": "#101729",
      "--h5p-theme-text-secondary": "#354054",
      "--h5p-theme-text-third": "#737373",
      "--h5p-theme-stroke-1": "#C7D7EF",
      "--h5p-theme-stroke-2": "#E7EDF6",
      "--h5p-theme-stroke-3": "#F6F7FA",
      "--h5p-theme-feedback-correct-main": "#256D1D",
      "--h5p-theme-feedback-correct-secondary": "#f3fcf0",
      "--h5p-theme-feedback-correct-third": "#cff1c2",
      "--h5p-theme-feedback-incorrect-main": "#a13236",
      "--h5p-theme-feedback-incorrect-secondary": "#faf0f4",
      "--h5p-theme-feedback-incorrect-third": "#f6dce7",
      "--h5p-theme-feedback-neutral-main": "#E6C81D",
      "--h5p-theme-feedback-neutral-secondary": "#5E4817",
      "--h5p-theme-feedback-neutral-third": "#F0EBCB",
      "--h5p-theme-main-cta-base": "#006FBF",
      "--h5p-theme-secondary-cta-base": "#202122",
      "--h5p-theme-alternative-base": "#F1F5FB",
      "--h5p-theme-background": "#F9FBFF",
      "--h5p-theme-focus": "#006FBF",
      "--h5p-theme-main-cta-light": "#007CD6",
      "--h5p-theme-main-cta-dark": "#005FA3",
      "--h5p-theme-contrast-cta": "#EBF7FF",
      "--h5p-theme-contrast-cta-white": "#006FBF",
      "--h5p-theme-contrast-cta-light": "color-mix(in srgb, var(--h5p-theme-main-cta-base), transparent 90%)",
      "--h5p-theme-contrast-cta-dark": "#0597FF",
      "--h5p-theme-secondary-cta-light": "#222324",
      "--h5p-theme-secondary-cta-dark": "#1F1F20",
      "--h5p-theme-secondary-contrast-cta": "#E3E9F1",
      "--h5p-theme-secondary-contrast-cta-hover": "#FFFFFF",
      "--h5p-theme-alternative-light": "#F7F9FD",
      "--h5p-theme-alternative-dark": "#DBE5F5",
      "--h5p-theme-alternative-darker": "#C7D7EF"
    }
  }
}
```
The top level key `"daylight"` corresponds with the `theme-name` option. You can add more then one, of course. The value for that key specifies the theme parameters:
- `"label"`: Label that will be used as the option label in the select field.
- `"subLabel"`: Optional sub label that currently is not used, but may be in the future. H5P.com uses it for extra informaton on the theme inside the custom select field.
- `"backgroundColor"`: Optional background color for the select field to give an idea of what to expect from the theme. Commonly the `alternative` color.
- `"color"`: Optional color for the select field to give an idea of what to expect from the theme. Commonly the primary `buttons` color.
- `"values"`: Object with the custom CSS properties that H5P uses for theming colors. [See H5P Group's variabe documentation](https://github.com/h5p/h5p-components/blob/master/Documentation/other-commonalities/variables.md) for the custom CSS properties for colors - hopefully updated by now.


## Getting the values
The whole idea of the picker is for you to be able to get the selected values. You can either obtain them actively or listen to `change` events to get `event.detail` update whenever any of the selected value changes:

The values that you receive will look like:
```JSON
{
  "theme": "lavender",
  "data": {
    "colors": {
      "--h5p-theme-alternative-base": "#f3edff",
      "--h5p-theme-alternative-dark": "#e8d9ff",
      "--h5p-theme-alternative-darker": "#ddc7ff",
      "--h5p-theme-alternative-light": "#f8f5ff",
      "--h5p-theme-background": "#F3EEFA",
      "--h5p-theme-contrast-cta": "#ffffff",
      "--h5p-theme-contrast-cta-dark": "#A983E2",
      "--h5p-theme-contrast-cta-light": "color-mix(in srgb, var(--h5p-theme-main-cta-base), transparent 90%)",
      "--h5p-theme-contrast-cta-white": "#834DD5",
      "--h5p-theme-feedback-correct-main": "#256D1D",
      "--h5p-theme-feedback-correct-secondary": "#f3fcf0",
      "--h5p-theme-feedback-correct-third": "#cff1c2",
      "--h5p-theme-feedback-incorrect-main": "#a13236",
      "--h5p-theme-feedback-incorrect-secondary": "#faf0f4",
      "--h5p-theme-feedback-incorrect-third": "#f6dce7",
      "--h5p-theme-feedback-neutral-main": "#E6C81D",
      "--h5p-theme-feedback-neutral-secondary": "#5E4817",
      "--h5p-theme-feedback-neutral-third": "#F0EBCB",
      "--h5p-theme-focus": "#F1EBFA",
      "--h5p-theme-main-cta-base": "#834DD5",
      "--h5p-theme-main-cta-dark": "#692EC2",
      "--h5p-theme-main-cta-light": "#8347DD",
      "--h5p-theme-secondary-contrast-cta": "#F3F1F5",
      "--h5p-theme-secondary-contrast-cta-hover": "#ffffff",
      "--h5p-theme-secondary-cta-base": "#000000",
      "--h5p-theme-secondary-cta-dark": "#311B50",
      "--h5p-theme-secondary-cta-light": "#333333",
      "--h5p-theme-stroke-1": "#ead8f6",
      "--h5p-theme-stroke-2": "#E7EDF6",
      "--h5p-theme-stroke-3": "#F6F7FA",
      "--h5p-theme-text-primary": "#101729",
      "--h5p-theme-text-secondary": "#1b1346",
      "--h5p-theme-text-third": "#737373",
      "--h5p-theme-ui-base": "#FFFFFF"    
    },
    "density": "large",
  }
}
```
[See H5P Group's variabe documentation](https://github.com/h5p/h5p-components/blob/master/Documentation/other-commonalities/variables.md) for the custom CSS properties for colors - hopefully updated by now.

### Call `getValues`
```JavaScript
<script type="module">
  const picker = document.querySelector('h5p-theme-picker');
  /*
   * Or, if you constructed it yourself, e.g.
   * const picker = new H5PThemePicker({});
   */
  const pickerValues = picker.getValues();
</script>
```

### Listen to `theme-change` event
```JavaScript
<script type="module">
  const picker = document.querySelector('h5p-theme-picker');
  /*
   * Or, if you constructed it yourself, e.g.
   * const picker = new H5PThemePicker({});
   */
  picker.addEventListener('theme-change', (event) => {
    console.log(event.detail);
  });
</script>
```

## Applying the values
You probably want to apply the values, so they can be used in your own H5P integration. The exact steps required will depend on your approach.

### Applying colors
H5P core as of version 1.28 will put a default set of custom CSS properties for colors (and other variables) into the `:root` pseudo-class of the content, so to the `<html>` tag.

The simplest way would be to pass the colors as part of the `H5PIntegration` object that you pass to H5P anyway. Note that the `--h5p-theme-` prefix would need to be removed for `H5PIntegration` and `useCustomVariables` would need to be set to `true` or `false`. Unfortunately, H5P.com runs a custom version of H5P's core, and the openly available version does not support passing the colors (or the four base colors and the `useCustomVariables` flag) via H5PIntegration.

An alternative way to achieve the same is to load an extra CSS file inside (after the other H5P CSS files). Note that this CSS needs to be applied inside H5P's iframe context. If you just load it in your page, that will not have an effect (except for the few H5P content types that do not use an iframe). The file needs to contain the key/value pairs of the colors that you received from the picker, e.g.
```css
:root {
  --h5p-theme-alternative-base: #f3edff;
  --h5p-theme-alternative-dark: #e8d9ff;
  --h5p-theme-alternative-darker: #ddc7ff;
  --h5p-theme-alternative-light: #f8f5ff;
  --h5p-theme-background: #F3EEFA;
  --h5p-theme-contrast-cta: #ffffff;
  --h5p-theme-contrast-cta-dark: #A983E2;
  --h5p-theme-contrast-cta-light: color-mix(in srgb, var(--h5p-theme-main-cta-base), transparent 90%);
  --h5p-theme-contrast-cta-white: #834DD5;
  --h5p-theme-feedback-correct-main: #256D1D;
  --h5p-theme-feedback-correct-secondary: #f3fcf0;
  --h5p-theme-feedback-correct-third: #cff1c2;
  --h5p-theme-feedback-incorrect-main: #a13236;
  --h5p-theme-feedback-incorrect-secondary: #faf0f4;
  --h5p-theme-feedback-incorrect-third: #f6dce7;
  --h5p-theme-feedback-neutral-main: #E6C81D;
  --h5p-theme-feedback-neutral-secondary: #5E4817;
  --h5p-theme-feedback-neutral-third: #F0EBCB;
  --h5p-theme-focus: #F1EBFA;
  --h5p-theme-main-cta-base: #834DD5;
  --h5p-theme-main-cta-dark: #692EC2;
  --h5p-theme-main-cta-light: #8347DD;
  --h5p-theme-secondary-contrast-cta: #F3F1F5;
  --h5p-theme-secondary-contrast-cta-hover: #ffffff;
  --h5p-theme-secondary-cta-base: #000000;
  --h5p-theme-secondary-cta-dark: #311B50;
  --h5p-theme-secondary-cta-light: #333333;
  --h5p-theme-stroke-1: #ead8f6;
  --h5p-theme-stroke-2: #E7EDF6;
  --h5p-theme-stroke-3: #F6F7FA;
  --h5p-theme-text-primary: #101729;
  --h5p-theme-text-secondary: #1b1346;
  --h5p-theme-text-third: #737373;
  --h5p-theme-ui-base: #FFFFFF;
}
```
How that's done will depend on how your H5P integration works. If you want to do this in an H5P integration that supports H5P's hooks, you can also [use the `alter_styles` hook](https://h5p.org/documentation/for-developers/visual-changes) to load the CSS file.

### Applying density
H5P core as of version 1.28 already provides dedicated classes for the three inbuilt density settings. They are applied by setting either the class `h5p-large`, `h5p-medium` or `h5p-small` on the element with the `.h5p-content` class.

If your working on your own H5P integration, you can simply pass the density as part of the `H5PIntegration` object that you pass to H5P anyway.

```json
{
  "H5PIntegration": {
    "theme": {
      "density": "large"
    }
  }
}
```

Alternatively, you could load extra JavaScript to the H5P iframe that sets `H5PIntegration.theme.density` before the content is initialized, right when the document leaves the `loading` `readyState`.
If that is tricky or as a fallback, you could achieve the same by selecting the `.h5p-content` element after the content was initialized and set/remove the additional `h5p-large` or `h5p-medium` or `h5p-small` class as required. Keep in mind that you need to resize the instance afterwards to avoid visual glitches. That may be visible, so you might also want to hide the content until that resize is done.

For loading that extra JavaScript, ensure to load it into the H5P iframe context. If you are working on an H5P integration that supports H5P's hooks, you can [use the `alter_styles` hook](https://h5p.org/documentation/for-developers/visual-changes) to load the CSS file.

## Known issues
### Does not use shadow DOM (yet)
I'd have loved to use the shadow DOM, but that broke CSS anchor positioning that I use for aligning the hue picker when choosing custom colors. And I didn't have the energy to find a workaround (and I'd not want to create the logic JavaScript, hey it's in CSS now and it's great!).
- Consequence: CSS may spill over from the host, and it in fact did for a common WordPress theme. If you integrate the theme picker, make sure to check whether there are some overly general selectors like `select` that cause trouble.
- Consequence 2: I did not have to come up with a way to override the style declarations in case you don't like them :-)
