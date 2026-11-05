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

The header is fixed outside the masked paper sections. After the entrance it hides on downward scrolling and returns after 12px of upward movement; it is visible near the top and when keyboard users press Tab. Hidden navigation is inert, and an open menu closes when the header hides. The header stays on one line. A ResizeObserver compares the actual logo, navigation and gap widths with the available header width; when they no longer fit, a hamburger disclosure replaces the navigation pill. The menu supports keyboard navigation, Escape to close and return focus, outside-click dismissal, and a scrollable height limit on short screens. Resizing to a wider screen restores the full navigation.

The hero uses three grid rows: face, two names, then role. Both vertical gaps are always the shared 24px spacing token. Widths resize continuously without a 640px hero breakpoint; the face keeps a 190px minimum on standard-height screens so it does not shrink excessively on tablets. Short screens cap the face by available height and reserve header space. Each item remains independently draggable; Tidy up restores these grid positions.

After the stationery intro, the logo/navigation pop into place in 200ms. The separate Froso and Patsalou stickers stamp down at 220ms and 280ms; the role follows at 420ms and the face at 620ms. The entrance finishes at 900ms and holds still. The face is centred above the names, with the role beneath. Reduced-motion preferences reveal the finished composition immediately. Navigation destinations will be enabled as their sections are built; search has been removed. The selected navigation label uses palette yellow and the self-hosted Cooper LT BT Bold Italic font.

Once the entrance finishes, the two names, role, face sticker and stationery can be picked up and dropped independently with mouse, touch or keyboard. All 39 movable objects (20 on Home, 7 in the About introduction, and 12 in the notebook section) use the shared drag renderer. The six About doodles/name tag opt out of peeling with data-peel="false"; the face retains its peel. Other stickers use one shared peel renderer: the original artwork stays opaque while an animated clip and curved paper back lift a corner over 220ms. There is no flat/peeled image swap or opacity crossfade. Each object's corner is tuned to its silhouette, and the face's original details and proportions are preserved. Releasing reverses the fold; interrupted pickups continue from the current fold amount. Reduced motion applies the final fold state immediately. Drop positions remain for the current visit; refreshing restores the designed composition and replays the intro. The “click me” hint has been removed. Keyboard: Space/Enter picks up and drops, arrows move (Shift for larger steps), Escape cancels.

Peel backs use a gradient perpendicular to the crease, from shaded grey through a white paper highlight, plus a separate blurred shadow beneath the flap. Face, name and ruler folds are deliberately larger. Pointer pickup follows each artwork's alpha silhouette in its transformed SVG coordinate space; transparent image rectangles and the empty space in the header do not block items underneath. The topmost visible artwork takes priority where stickers overlap.

Keep the fold shading subtle: light grey edges, a white highlight, and a soft shadow. All draggable objects, including the face, share the same 1.05 pickup scale and raised shadow, settling to their original size on release. Reduced motion keeps the scale unchanged.

The bottom-right “Tidy up” pill uses Avant Garde Bold and the standard button tokens, with an × icon on the left. It appears only when artwork has moved more than 3px from its original position, and hides again once tidied or returned to place. It returns all movable artwork to the final intro composition in 220ms, including its original stacking order. Reduced motion resets positions immediately.

The hero fills the complete initial viewport. A 64–100px connector follows it, so the full-width paper tear appears only as the visitor scrolls down. A mask cuts the blue grid sheet into an irregular edge with white fibres, exposing the pink star pattern behind it. The grid texture continues across the hero and connector without a separate image seam. The decorative edge has no pointer events.

The value proposition section uses `--color-value-background` (pink 400), a tiled fuchsia star pattern and the supplied hand-drawn cloud, exported as an 85KB transparent WebP. The original remains in the user's asset folder. The sentence ends “more intuitive, and definitely less boring.” Its three highlights (human, intuitive, definitely less boring) retain their fuchsia, blue and purple text colours. On hover or keyboard focus, a slightly irregular palette-yellow highlighter stroke sweeps behind the phrase from left to right over 220ms. It retracts on exit. The neon glow has been removed; reduced motion applies the marker instantly. The sentence uses continuous 22–40px fluid sizing without a 640px font jump. Its line wrappers flow naturally, and a ResizeObserver reserves cloud height from the rendered sentence height, keeping a safe inner margin. On mobile, overlapping cloud impressions keep the original texture proportions around the wrapped sentence.

The illustrated skill buttons are labelled “UX Research & Strategy,” “UI & Visual Design,” and “Front-end & Back-end Development.” Their curved Winkle labels use black with a white outline. Letters follow the arc at natural widths, with no textLength or glyph scaling. The development label uses 21px text; the others use 23px. Labels stay fixed while only the circular artwork spins on each activation. Repeated clicks continue smoothly from the current rotation. Long labels use a vertical button arrangement on narrow screens.

Pressing and dragging the cloud pulls a cluster of three glossy puffs from the supplied fluff artwork. The original chalk outline remains, with a low-opacity glossy white/lavender interior. A small backdrop displacement and light blur make the underlying text and stars visible through the glass with gentle refraction; a prefixed blur provides a fallback. Puffs follow the pointer, then drift downward and fade over roughly 2.3–2.7 seconds on release; finished puffs are removed and concurrent puffs are capped at 18. Mouse, touch and keyboard activation are supported. Reduced motion uses short fades/brightness changes instead of spinning or falling, and applies the hover highlighter without a transition. Horizontal overflow is disabled globally and all scrollbars are hidden, while vertical wheel, touch and keyboard scrolling remain enabled. The fixed fluff layer clips particles to the viewport.


The pink star-paper section ends in its own full-width masked torn edge with white fibres, ready to overlap the next section. Its pattern continues into the connector without a seam.

## About notebook

The notebook below the About introduction uses a full-width lime gingham background with a closed purple notebook centred over four movable stationery items. The stage includes an extra connector-height so the fully scrolled section shows a complete viewport of gingham with no torn edge above it. It sits beneath the pink section's torn edge; paper layers use descending z-index values so each tear reveals the next background.

The supplied flattened cover was separated into the base cover, spiral and A Work in Progress label. Seven illustrated stickers are exported as lightweight transparent WebPs; originals remain unchanged in the user's folder. The cover, sticker board and spiral remain separate DOM layers. The cover hinge is at 5.34% from the left, with `data-notebook-state="closed"`. A narrow accessible button on the right edge opens the cover, followed by three staggered page flips, settling on the supplied open-book SVG in 1.45 seconds. States progress from closed to opening to open, with no loop. An on-cover yellow edge tab opens from the right, then moves to the left edge of the open cover to close it. There is no external button. The book uses a constant camera and fixed dimensions in every state. The cover slides to its hinge and rotates, with three 520ms page flips staggered after the cover. Opening settles at 1200ms, closing at 500ms, without resizing or zooming. The original spiral is an independent cropped vector layer above the turning pages and remains visible throughout. The lined spread removes its baked-in spiral so the binding is drawn only once. Closing restores cover sticker interaction. Cover stickers become inert while the book is open; stationery remains draggable. Reduced motion opens immediately. Future controls marked `data-notebook-control` are excluded from pickup detection.

The shared drag engine uses `data-drag-area` to calculate local drag coordinates and `data-tidy-scope` to keep each section's reset independent. Notebook stickers have their own size container, with `data-drag-contain="true"` and a 2% `data-drag-inset`, keeping the complete sticker inside the purple cover. The four loose stationery items use the hero's partially cropped edge behaviour. Both sections keep mouse, touch, keyboard, smooth peel and conditional Tidy up interactions. Clicks through a blank part of the notebook cannot pick up stationery hidden behind it; picked-up stationery can be placed over the book.


## About introduction and navigation

The navigation uses separate static pages: index.html (hero + cloud only), about.html (introduction + notebook), work.html, and contact.html. Work and Contact contain their page headings while their content awaits design. Navigation links fade/lift out in 160ms; interior content lifts in over 280ms. Reduced motion navigates immediately. The hamburger and scroll-direction header work on every page. Legacy Home #about/#work/#contact links redirect to the corresponding page.

About uses the explicit background token --color-about-background (#FFFFD3) with sky dots, the supplied bunny portrait badge, kissy sticker, crown positioned above the sticker, the original gift tag and handdrawn flower.svg. Paragraphs use the self-hosted Avant Garde Regular face at weight 400. The note has a softly irregular native SVG border. The three-line doodle sits below the border with a 20–25px gap. Yellow paper continues into a full-width masked tear that reveals the notebook's gingham background. The introduction stacks below 700px.


About decorations now use the shared drag-and-peel renderer, including the face, name tag, crown, flower, three-line doodle and two individually extracted stars. The badge retains its photo but the stars are separate vector assets, initially placed at their original badge-relative coordinates. Desktop positions follow the reference's 1440 × 1024 composition; below 900px the badge and introduction stack. A ResizeObserver supplies pixel drag units for the responsive About area, keeping pointer movement accurate despite content-driven mobile height. The About Tidy up control only resets these seven stickers. Notebook movement remains separately scoped.


The About crown is larger and lower; the three-line doodle is further right. About uses the same 14px crossed-line SVG icon in Tidy up as the other sections. Hand-drawn decorations and the name tag retain pickup/move/drop and conditional Tidy up, with no corner fold; only the face sticker peels in this section.


The notebook's right page, turning leaves and cover now share a single scene translation, so their hinge moves together from the first frame. The binding follows the identical transform in a separate foreground layer to stay visible above 3D leaves. The former clip-path spread reveal and approximate 47%-wide background crops are removed. Native page-left.svg and page-right.svg each crop exactly 590.5 × 840 units; flipping leaves use these as front/back faces and occupy exactly half the spread, matching the final left page without a late stretch or artwork swap. Perspective is softened to 2500px; opening/closing durations are unchanged.


## Bunny ID card interaction

On arriving at About, the bunny badge drops from above over 760ms, then swings from the original strap anchor (59.1% across its top). The card and its two stars share a hanging wrapper; stars retain independent dragging. The About text enters separately so it does not shift the strap anchor.

Mouse and touch users can pull the card sideways with pointer capture and release into a damped pendulum swing, limited to 0.48 radians each way. The spring uses elapsed-time integration so rendering throttling does not slow its pace, and updates only the card transform. Motion settles to the original layout, pauses when a star is picked up, and stops off-screen or when the tab is hidden. Enter/Space and arrow keys nudge the card; Escape settles it. Reduced motion skips the automatic drop/swing. Returning through browser history replays the arrival.


The bunny strap and card are separate original vector layers. Pulling downward moves only the payload (card plus stars) while scaling the pink strap from its fixed top; the photo/card retain their proportions. Vertical pull softens near a responsive 125–180px limit. Release adds an independent damped vertical spring, so the card slings above its resting position and bounces back, while sideways swing continues. Arrow Down can pull the card and key release slings it. Reduced motion returns immediately on release. The entrance drop now lasts 760ms.


The About entrance now carries its drop momentum into the vertical elastic spring instead of applying a sideways swing impulse. The 760ms drop briefly stretches the strap, rebounds upward, then settles vertically; manual sideways tugging remains available.


About spacing is tighter: desktop intro height uses 90svh / 66vw with a compact tablet adjustment; mobile spacing between the badge, identity and note is reduced. The notebook section now sizes to the book height plus the torn connector and 80px breathing room instead of reserving another whole viewport, removing the large mobile gap. The first About Tidy up control keeps its raised bottom offset (64px desktop, 40px tablet, 32px mobile) and the original 20px right page padding.


For side-by-side About layouts, the introduction is now bottom-anchored to the visible pink bunny card edge (source artwork y=809.127), excluding the stars beneath it. This keeps the note border aligned with the card despite section-height changes. The three-line doodle follows the note. Mobile restores its previous badge-to-introduction and identity-to-note spacing; notebook gap and Tidy up placement remain unchanged.


Wide-screen About layouts crop 24–180px from the top according to the composition center and viewport height. The card and note move together within a preserved layout height, retaining their bottom alignment while reducing blank strap space. Smaller layouts keep their existing top spacing to avoid crowding the header.
