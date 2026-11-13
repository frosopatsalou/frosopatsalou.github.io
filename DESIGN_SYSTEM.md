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

Once the entrance finishes, the two names, role, face sticker and stationery can be picked up and dropped independently with mouse, touch or keyboard. All 37 movable objects (20 on Home, 5 in the About introduction, and 12 in the notebook section) use the shared drag renderer. The four About hand-drawn decorations opt out of peeling with data-peel="false"; the face retains its peel. Other stickers use one shared peel renderer: the original artwork stays opaque while an animated clip and curved paper back lift a corner over 220ms. There is no flat/peeled image swap or opacity crossfade. Each object's corner is tuned to its silhouette, and the face's original details and proportions are preserved. Releasing reverses the fold; interrupted pickups continue from the current fold amount. Reduced motion applies the final fold state immediately. Drop positions remain for the current visit; refreshing restores the designed composition and replays the intro. The “click me” hint has been removed. Keyboard: Space/Enter picks up and drops, arrows move (Shift for larger steps), Escape cancels.

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


The About paragraph keeps Avant Garde Regular with a subtle 0.15px weight reinforcement, preserving its wrapping and alignment. The name tag is now static: no draggable role, pickup state, peel renderer or Tidy up membership. Its original ribbon artwork is split into a separate vector layer, anchored at the attachment beside the tag hole. Mouse/touch pulling elastically deforms only this layer, then a damped spring restores it. Arrow keys tug; Enter/Space flick; Escape resets. Reduced motion returns immediately on release.


The Home cloud sentence now uses Cooper LT BT Bold with tighter 0.015em tracking. The three curved skill labels retain Winkle, with palette dark pink/fuchsia (#F00FA9) fills and a thick rounded 12px white outline. The cloud's measured-height logic still contains the text on narrow screens.

The hand-drawn flower has been removed from About. Its face sticker uses a much larger fold (top crease at 38%, right edge at 65%); original face details remain in the source. Notebook page leaves are hidden during their stagger delays and use forward-only animation fill, preventing them from flashing over the closed cover before the first flip starts.


The cloud now uses Cooper LT BT Bold Italic and expands to 1480px wide / up to 560px tall. Skill labels use 2.2px tracking on a larger 128-unit-radius arc, with circles up to 310px; below 900px they stack so lettering remains readable. The 12px white outline and dark-pink fill remain.

Notebook cover folds are calibrated against the clover's visible cut area at rendered size. Alpha-aware corner selection avoids folding transparent corners of irregular stickers. The paper back uses a reflected alpha silhouette of the actual cut artwork, with reflection calculated for each image's aspect ratio. Every cover sticker, including its label, has a visible peel of approximately the clover's physical size. Other page drag and peel behaviours are unchanged.


Skill labels are slightly larger (26px, 23.5px for the longest label) with 2.8px letter spacing, on 138-unit-radius arcs within a padded SVG viewBox. Circles grow to 340px and the row gap grows to 80px, with 40px gaps when stacked. Narrow-screen circles fit within 84vw so the white outline remains visible.


Home's Case Studies Overview follows the cloud section and its existing pink paper tear. A lavender grid surrounds a peach corkboard with a brown frame, a pink Cooper heading, and six pinned cards. Project backgrounds use reusable tokens for #E5F3FF, #B8FFC6, #A0B7DD, #F0AACE, #F2785C and a #0E49F4-to-white radial gradient. Original vector logos and pins remain SVG; six embedded-raster mockups are rendered at 4x and compressed to transparent WebP (under 300 KB combined). Cards use three columns on desktop, two below 800px and one below 540px. Project titles and captions remain accessible HTML. Case study links and new animations are reserved for later work.


Case Studies uses the supplied vector heading asset. The board frame is 40px at desktop size (16px on mobile), and its background grid is an SVG tile with rounded dashed strokes in #AB5CFF. Moon, SNCB and Visual Identity artwork have individually balanced lettering scales. Card headings use positive 0.015em tracking and 8px of space before descriptions.


Case-study cards pivot from the stationary pin on hover with a snappy 180ms lift and alternating 3-degree tilt. Pulling down 52px detaches the paper into a 1150ms drifting fall/fade. Pins and slot dimensions stay fixed; only after the fade completes does a palette-purple Bring back pill appear. Restore fades the card in over 300ms. Short pulls and pointer cancellation settle the card without removing it. Mouse, touch and keyboard (Enter/Space/Arrow Down) are supported, with focus transferred to the restore button and back. Reduced motion uses brief fades instead of tilting/falling. State is scoped per card and resets naturally on page refresh.


The updated Case Studies title SVG is a draggable sticker using the existing shared peel renderer and input controls. Its reflected alpha fold preserves the supplied white cut outline. A container-sized drag area confines the complete title to the clear strip above the pinned cards; it cannot cover the cards or leave the board. A ResizeObserver reclamps its position after viewport changes. The title does not join the hero Tidy up scope.


Case Studies includes nine loose decoration stickers around the frame: two pink plaid tapes, blue and purple tapes, two scalloped papers, and three pins. Original supplied art is retained, with white sticker borders and the shared alpha-aware peel/drag controls. Decorations move within the section while the title retains its restricted top-strip bounds. A section-local X Tidy up pill appears after a sticker moves or a card falls. It resets all section stickers and fades back fallen cards, safely cancelling any in-flight fall without delayed removal. It hides once the section is restored.


The loose board decorations are now replaced by four existing stationery paper clips, a blue/lime ruler, a magenta/purple stapler, and the supplied pencil with a white sticker border. All retain shared peel/drag and section-local Tidy up behaviour. The earlier tapes, scalloped papers and decorative pins are removed.


The board ruler now sits at a stronger crooked angle and crosses the bottom edge. The pencil is clean vector artwork in palette yellow, fuchsia/rose and sky/slate with a white cut outline. Its alpha-aware peel is placed at the visible lower-left tip (62/42 fold), avoiding the cropped eraser end.


The About notebook now opens to an Education and Skills spread using the supplied heading and software-logo SVG assets. Editable HTML covers the university, relevant coursework and International Design Bootcamp in France. The pink scribble, Canva image and Vue logo come from the exact Figma nodes where no matching local asset existed. The existing pages, cover motion and independent spiral remain unchanged. Content is hidden and inert until the opening sequence finishes, and hides again before closing, preventing flashes. Layout uses the existing 1181 x 840 spread coordinates so the content scales with the paper. The Interests bookmark is present visually; its second spread and page-flip interaction are reserved for the next step.


The notebook page artwork now comes from the user's updated straight-line book open SVG. Its two page halves retain the shared hinge animation and separate always-visible binding. Interior artwork stays rendered under the cover and turning leaves; left-page content rotates with the paper instead of fading in after opening. Coursework is anchored into separate ruled bands, and the bootcamp starts below the final line. The app collage is inset to 86% about its centre so all logos sit comfortably within the pink scribble.


Notebook app stickers sit 18 design pixels higher. Vue uses the supplied complete white-app SVG once, without a duplicated logo or second rotation. The bootcamp block shifts right 16px while retaining its right boundary. Body text uses 0.025em tracking, 0.03em word spacing and disables kerning/ligatures for consistent letter spacing. During opening a blank right-page underlay stays below the flipping leaves until the last leaf begins at 630ms, so Skills is revealed only by the final turn rather than showing between every flip.


Turning notebook leaves now carry printed Education backs, matching the final left page and eliminating the blank-back handoff before it lands. Notebook body copy uses the existing bold Avant Garde weight. All 21 app tiles are shared alpha-aware peel stickers within an inset drag area contained inside the pink scribble; their original collage poses are preserved. Apps are interactive only while the notebook is open, return with the notebook section's Tidy up control and retain their positions across closing/reopening. Cover stickers remain interactive only while closed. Canva's existing rounded/rotated tile appearance is preserved in a self-contained SVG for accurate peeling.


Only the final opening leaf now carries the Education print; the earlier leaves remain blank. The underlying stationary Education content stays covered until the final leaf lands at 1150ms, handing off without a late appearance. Paragraph weight returns to Avant Garde Regular while school/category/bootcamp labels retain bold. Body copy increases by roughly 1px at native spread size, with tighter internal paragraph gaps where needed to preserve the ruled bands.


Printed page backs explicitly reset font-style: normal: their structural i wrappers previously italicised inherited paragraphs during turning. The open and moving print now share identical typography. Cover, scene, page and binding transforms share hinge duration/easing variables and dedicated compositor layers. Closing is 840ms with a softer easing curve, and completion follows the CSS duration plus 40ms rather than the previous fixed 500ms. Opening pace and final-flip-only content remain unchanged.


The Creative/Strategy block explicitly uses 1.35 line height on both the turning leaf and final spread. Previously its printed copy inherited 24px from the structural leaf instead of the spread's 20.25px, shifting the Strategy line during the final handoff.


The notebook has two preserved spreads: Education/Skills and a blank Interests spread. The pink Interests bookmark turns a single leaf forward over 680ms; the blue Education bookmark reverses the turn. The moving front carries a flattened view of the live app positions and the back remains blank. The independent spiral stays visible above the leaf. Interactions lock during turns, focus moves to the destination bookmark, and reduced motion switches immediately. Closing/reopening retains the selected spread and app sticker positions; refresh starts at Education. The Interests pages remain empty until their design is supplied.


The sixth Home case-study card now showcases Scroll World instead of Visual Identity. It uses the supplied desktop mockup, a palette-yellow background, blue vertical Scroll/World lettering and the provided scroll-adventure description. The optimized transparent WebP preserves the source mockup. Existing pin hover, fall/restore, and section Tidy up interactions apply automatically to the replacement card.
