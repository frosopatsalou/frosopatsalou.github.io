# Portfolio design system

All shared values live in `styles/tokens.css`. `styles/base.css` defines typography and layout primitives; `styles/components.css` supplies reusable buttons and cards. `styles.css` contains only the loading screen.

## Colours

Every palette family has exactly ten steps: **50, 100, 200, 300, 400, 500, 600, 700, 800, 900**, lightest to darkest. The 500 value is the original supplied hex. Lighter tints and darker shades are generated defaults, ready for refinement against future Figma designs.

| Family | Original | Base token |
|---|---|---|
| fuchsia | `#F00FA9` | `--color-fuchsia-500` |
| rose | `#FC5698` | `--color-rose-500` |
| magenta | `#EB3EE6` | `--color-magenta-500` |
| purple | `#7300ED` | `--color-purple-500` |
| blue | `#546FFA` | `--color-blue-500` |
| sky | `#BFD0EE` | `--color-sky-500` |
| yellow | `#FEFE90` | `--color-yellow-500` |
| lime | `#B7E44B` | `--color-lime-500` |
| pink | `#FF91DC` | `--color-pink-500` |

Use semantic roles (`--color-primary`, `--color-text`, `--color-background`, `--color-border`) for interfaces. Purple is the default primary action; fuchsia is secondary, yellow is accent. All original hues are available independently. Text uses deep neutral, or white on primary purple. Verify contrast when combining other shades; not every colour pair is suitable for small text.

## Typography

- Headings: the actual Cooper LT BT Bold font, weight 700.
- Display names: Winkle Regular, available through `--font-display` and the self-hosted `winkle-regular.ttf`. The two name stickers use outlined vector lettering from this exact font. The supplied font's license is saved alongside it.
- Name sticker borders: 8-unit purple stroke over an 18-unit white stroke, so both outlines remain clearly visible at responsive sizes.
- Hero role sticker: Cooper LT BT Bold Italic, in palette blue with a white sticker border.
- Body, labels and buttons: Avant Garde Bold, weight 700.
- Body: 18px default, 1.6 line height. Button text: 16px, 1.25 line height.
- Fluid heading sizes, a 12�56px fixed type scale, and a fluid display size are provided.
- Font files are self-hosted; no external font service is required.

## Spacing and layout

Figma pixels are CSS pixels. Page padding is **20px on all four sides**, including mobile. Default pill-button padding is **15px top/bottom, 35px left/right**. Margin, padding and gaps share the same `--space-*` scale. Use `.page-shell`, `.stack`, `.cluster`, `.section-stack` and `.card`, or reference their tokens directly. The maximum content width is 1440px; default section gap 80px, content gap 24px, stack gap 16px, card padding 24px.

## Buttons and surfaces

```html
<button class="button">Primary action</button>
<a class="button button--secondary" href="#work">Explore work</a>
<button class="button button--accent">Playground</button>
<button class="button button--outline">Secondary action</button>
<button class="button button--flat">Without shadow</button>
```

Pill radius is the default. Buttons have a 5px drop shadow, hover/pressed states, a visible keyboard focus ring, and a minimum 44px touch target. Native disabled buttons and `aria-disabled="true"` links receive disabled styling; use native buttons for disabled actions. Radius tokens range from 8px to 32px, plus pill/circle. Smaller/larger shadow presets are available. The loader explicitly remains shadow-free.

## Responsive and motion rules

The animation tone is **fun, energetic, fast and snappy**. Keep this direction for future animations: short, punchy timing and crisp changes. The stationery intro uses four held stop-motion poses over 1.2 seconds, starts after loading, and holds the final pose without looping.

Use responsive layouts rather than scaling the entire page. Heading sizes are fluid; page/button padding keeps the requested measured values. Motion duration and easing are tokens. Reduced-motion preferences disable decorative animations and button movement. Component-specific geometry can remain local to that component; shared design values should come from tokens.

The header stays on one line. A ResizeObserver compares the actual logo, navigation and gap widths with the available header width; when they no longer fit, a hamburger disclosure replaces the navigation pill. The menu supports keyboard navigation, Escape to close and return focus, outside-click dismissal, and a scrollable height limit on short screens. Resizing to a wider screen restores the full navigation.

The hero uses three grid rows: face, two names, then role. Both vertical gaps are always the shared 24px spacing token. Widths resize continuously without a 640px hero breakpoint; the face keeps a 190px minimum on standard-height screens so it does not shrink excessively on tablets. Short screens cap the face by available height and reserve header space. Each item remains independently draggable; Tidy up restores these grid positions.

After the stationery intro, the logo/navigation pop into place in 200ms. The separate Froso and Patsalou stickers stamp down at 220ms and 280ms; the role follows at 420ms and the face at 620ms. The entrance finishes at 900ms and holds still. The face is centred above the names, with the role beneath. Reduced-motion preferences reveal the finished composition immediately. Navigation destinations will be enabled as their sections are built; search has been removed. The selected navigation label uses palette yellow and the self-hosted Cooper LT BT Bold Italic font.

Once the entrance finishes, the two names, role, face sticker and stationery can be picked up and dropped independently with mouse, touch or keyboard. All 20 movable objects use one shared peel renderer: the original artwork stays opaque while an animated clip and curved paper back lift a corner over 220ms. There is no flat/peeled image swap or opacity crossfade. Each object's corner is tuned to its silhouette, and the face's original details and proportions are preserved. Releasing reverses the fold; interrupted pickups continue from the current fold amount. Reduced motion applies the final fold state immediately. Drop positions remain for the current visit; refreshing restores the designed composition and replays the intro. The “click me” hint has been removed. Keyboard: Space/Enter picks up and drops, arrows move (Shift for larger steps), Escape cancels.

Peel backs use a gradient perpendicular to the crease, from shaded grey through a white paper highlight, plus a separate blurred shadow beneath the flap. Face, name and ruler folds are deliberately larger. Pointer pickup follows each artwork's alpha silhouette in its transformed SVG coordinate space; transparent image rectangles and the empty space in the header do not block items underneath. The topmost visible artwork takes priority where stickers overlap.

Keep the fold shading subtle: light grey edges, a white highlight, and a soft shadow. All draggable objects, including the face, share the same 1.05 pickup scale and raised shadow, settling to their original size on release. Reduced motion keeps the scale unchanged.

The bottom-right “Tidy up” pill uses Avant Garde Bold and the standard button tokens, with an × icon on the left. It appears only when artwork has moved more than 3px from its original position, and hides again once tidied or returned to place. It returns all movable artwork to the final intro composition in 220ms, including its original stacking order. Reduced motion resets positions immediately.

The hero ends with a full-width irregular torn-paper edge over the existing blue grid sheet, with a white fibre rim and a subtle edge shadow. The edge scales from 48px to 88px tall. `--paper-next-background` controls the exposed surface below the tear, currently the default white, ready to match the next section. The decorative edge has no pointer events and stays below navigation and the Tidy up control.

