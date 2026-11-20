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


The Home cloud now floats gently on a 4.8-second loop, with an independent 3.8-second soft puffing scale on its artwork. Text follows the small translation without scaling or distortion. Motion pauses while pulling fluff or using keyboard focus within the cloud, off-screen and in hidden tabs. Reduced motion disables the ambient loops. Existing highlighter hovers, spinning circles and pullable fluff remain unchanged.


The cloud's ambient motion is more playful: its bob runs over 2.8s with a 25px vertical range, slight sideways drift and a small rebound. Artwork puffs over 2.4s with up to 2.5% squash/stretch and a subtle tilt. Text follows translation only. Interaction, off-screen pauses and reduced-motion handling remain unchanged.


Cloud motion is deliberately soft and buoyant rather than snappy: a 6.2-second smooth drift and 5-second breathing loop. The artwork stays slightly fuller at rest and gently expands vertically, with only a quarter-degree tilt and no sharp rebounds or compressed poses. Text remains undistorted; interaction pauses and reduced-motion support remain intact.


The smooth cloud pace is now 3.6s for drift and 2.9s for puffing. Clicking the painted curved lettering spins that label independently around its circle centre and returns it to its original pose. Clicking the circle still spins the illustration; keyboard activation retains that behaviour. Repeated clicks resume from the current angle and finish on a complete revolution, preserving the original resting position.


The Interests spread now has a static scrapbook composition matching Work 3: layered creative and travel Polaroids, pink plaid and purple paper tapes, seated and standing cutouts, handwritten captions and black doodles. Photo crops, tape masks and positions use the shared 1181 by 840 notebook coordinate space and scale together. New collage pieces have no drag or peel behaviour yet. The pink General tab returns to Education/Skills. Bookmark turns and reopening retain the selected spread; the final turning leaf carries the left Interests artwork while the right spread remains beneath it. Original user assets remain unchanged; web copies use optimized WebP.


Interests Polaroids now cycle independently: click or press Enter/Space on the top photo to flick it out and tuck it behind its stack over 420ms. Only the top photo is interactive; repeated input locks during the flick, and reduced motion swaps immediately. Each stack contains seven populated photos, including supplied sewing, boat and waterfall frames. Photo order survives bookmark turns and reopening. The complete plaid tape SVG replaces the failed mask, the updated standing SVG replaces the original cutout, the seated cutout ends at the centre crease, and the travel stack is 10% larger, 26 design pixels left and 36 pixels lower.


The Interests heading uses the supplied Clocked off title SVG. The seated cutout is shifted a further 20.5 design pixels right with a 34px lower-right crop radius. Travel Polaroids and tape move together 30px right. The standing SVG is 480px tall, shifted left, with its visible feet anchored at design y698 on the lowest blue notebook rule. All dimensions continue to scale with the notebook.


The seated Interests cutout now ends at design x568, just beneath the left edge of the independent spiral. Both lower corners use a subtle 12px radius. Travel Polaroids and purple tape are nudged up together by 12 design pixels.


The sewing, boats and waterfall Polaroids use the original video clips, converted to silent 30fps H.264 MP4 with fast-start metadata and a 720px maximum dimension. HDR travel clips are tone-mapped to BT.709. Poster images remain as fallbacks; video sources load only when a clip is on top. Playback is muted, looping and inline, and pauses during photo flicks, on other spreads, when closed, off-screen, in a hidden tab or with reduced motion. The travel caption uses an explicit 1 line height for equal 24px native baselines; its stack and tape move up another 12 design pixels.


Notebook clips now preload on About entry and seek to their own first decoded frame, replacing the mismatched poster before they are revealed. On a photo cycle, the incoming clip restarts at zero and produces a video frame before its Polaroid is promoted to the top; it keeps playing during the return flick. Outgoing clips pause and reset for the next visit. Browser QA confirmed all three clips were ready and already playing at the exact stack reorder.


Interests tapes and both Froso cutouts now reuse the shared alpha-aware peel/drag interaction. Two independent contained areas follow the left and right paper bounds, so stickers cannot cross the centre crease or leave their page. The photo assets have white silhouette borders; the seated crop keeps gently rounded lower corners. Mouse, touch and keyboard movement share the existing controls, retained positions survive notebook flips/reopening, and the notebook Tidy up resets all four. Turning-leaf copies flatten the live stickers to avoid duplicate peel definitions. The two doodles use separate wiggle/bounce loops while Interests is open and visible, pause off-screen/on other spreads and stop for reduced motion.


The Clocked off, Education, Extracurricular and Skills headings now have white silhouette borders and shared alpha-aware peel/drag behaviour. Heading stickers are constrained to their own paper half and reset with the notebook Tidy up control. A shared printed-copy helper flattens all live stickers for opening and bookmark leaves, preserving moved poses without duplicate peel renderers. The standing cutout shifts 12 design pixels right. General bookmark radii account for its 180-degree rotation so the visible left corners are rounded.


The pink plaid and purple Interests tapes are fixed decorative artwork in their original positions. They have no movable attributes, peel renderer or keyboard drag controls. Photo cutouts and title stickers retain their page-contained interactions.

The blue About crown starts two percentage points further left within the identity composition; its height, size and drag behaviour stay the same.


Internal navigation uses a purple circular page transition inspired by the supplied Brandlos reference. A circle grows from the clicked link (or focused link centre for keyboard activation) over 460ms, covers the document swap, then shrinks over 360ms once destination images, fonts and page resources are ready. Durations are reusable CSS variables in pages.css and the fill resolves from the purple primary. Pointer hover/focus prefetches destination HTML/artwork; clicking starts preloading immediately as well. A small early-head bootstrap carries the full-colour cover across real page loads to avoid a white flash. Direct Home visits/refreshes retain the original loader and stop-motion intro; internal returns skip the redundant loader and start the intro after the circle reveal. All internal anchor links use the same delegated handler, while downloads, new tabs, modified clicks and external links keep native behaviour. Reduced motion uses native navigation, and browser Back/Forward restores interactivity without leaving a cover behind.


Circle navigation now follows the supplied recording in distinct stages: a 70px-radius bubble pops with back-out overshoot for 300ms, then floods over 700ms with a quintic-in curve. Once the destination is ready, it holds for 150ms, collapses to the bubble over 700ms with a quartic-in curve, then grows slightly and disappears over 300ms with back-in overshoot. Native sampled keyframes reproduce these curves without a new animation dependency. Each click randomly selects one of the nine original primary palette colours, excluding the previous choice; the selected colour persists across the document swap. Background loading and reduced-motion behaviour remain unchanged.


Work now contains a placeholder-only reusable case-study scaffold. Introduction combines a square mockup frame, project description, Research/Design boxes and Role/Timeline/Platform/Tools metadata. The chapter rail tracks Introduction, Overview, Research, Design, Testing and Reflection; it becomes a horizontally scrollable chapter bar on smaller screens. A five-card Overview pins and moves horizontally with vertical scrolling on large screens, with arrow and keyboard controls; small screens and reduced motion use a native swipeable row. Remaining sheets provide research evidence/insights, flow/wireframe/UI areas, before-and-after testing, feedback/change rows and reflection placeholders. Styling reuses existing paper texture, palette, fonts, pill buttons, shadows and spacing tokens. Prototype and next-project controls are explicitly disabled until content is supplied. No actual project facts, results or images were added.


Work background now follows the supplied checked/star reference: pale yellow paper, broad translucent sky-blue checks and a repeating hand-drawn pink star mask, all using existing palette tokens. Both background layers stay fixed together. On desktop, the progress rail shifts closer to the left edge independently of the case-study content; wide-screen centring no longer pulls it far inward. Mobile chapter-bar placement is retained.


Work background is softened to the sky-200 tint with translucent purple-100 checks and palette-yellow stars. The overview heading uses plain purple text without a white stroke, and overview cards use a subtle palette frame instead of a white border. The chapter rail and overview introduction now have solid white surfaces so pattern details cannot interfere with reading.


Work background now uses the Lush case-study pale blue token with translucent sky-blue checks; purple is removed from the background pattern. Yellow stars remain. Desktop chapter panels size to their contents with a minimum column width and 12px side padding, keeping the full Introduction highlight inside the border without moving the case-study content.


Work is now the Lush Scrubby case study, populated from the supplied Product Proposal V2, Business Plan and Pitch plus the user’s role/tool clarifications. The confirmed research sample is 22 survey respondents and 5 parent interviews; survey percentages are identified as reported exploratory concept feedback. The case distinguishes individual semester-one research/UX/UI/identity work from the semester-two Product Owner role in group development. No health-compliance, sales, retention or usability-success results were invented; financial projections were not presented as outcomes. The Testing chapter is now labelled Validation to reflect the available evidence. Original UI screens and palette assets replace placeholder visuals, optimized as WebP with full-size image links. The supplied logo preserves the black LUSH letters and blue Scrubby artwork while changing its five black counter fills to the white introduction-panel colour. The live team-app link was verified to reach its public sign-up page; no account was created. Work-scoped blue accents reuse a named Lush blue token and the shared portfolio layout/type/spacing system.

The Lush case study now credits the user’s estimated 90% design contribution. Semester one was individual research and design, while semester two included team screen refinements, added features, user testing and development, with Froso as Product Owner. The brief and personal motivation explain choosing an aligned brand, Lush’s ethics and voice, and enjoying the colorful world of a kids’ app. Original Figma exports replace the blurred hero and gallery images, with full size links. Research includes the original FigJam story map and source boards. The verified USER TEST prototype entry point is 2308:10554, with four scenarios and no invented test results. Seven original characters are shown as a family, with a white outlined Scrubby sticker at the page’s bottom right. Vector exports have only Figma canvas and component set chrome removed. The three original After Effects motion tiles play while visible, have native controls, pause offscreen and honor reduced motion. The live app preview is labeled honestly while authentication needs a production API configuration fix.

Copy preference: human readable text uses commas or natural sentence breaks instead of hyphens or dashes. Keep technical identifiers, source paths and URLs intact.

Lush case study refinement: semester one credits 100% individual research and design, with semester two credited to team tweaks, feature work, testing and development while Froso was Product Owner. The earlier approximate percentage is superseded by this phase specific wording. The supplied 393 by 880 SVG is the home screen. All nine screen presentations use a separate detailed iPhone hardware frame with metal rim, camera, Dynamic Island and side buttons. Scroll to explore uses the Lush blue. Source links match the three URLs supplied by the user, while Figma access permissions remain governed by file sharing settings. Decorative motion tiles autoplay and loop without controls, pointer interactions, fullscreen UI or context menus. The character family is now a circular carousel with drag rotation, snapping, direct selection, arrows and keyboard navigation, keeping one character in focus. The bottom Scrubby signoff section is removed.

The crew now uses a horizontal carousel instead of the circular layout. One large character faces forward, with only its smaller left and right neighbors visible. Character labels, circle backgrounds and the orbit ring are removed. Arrows and the position counter remain, with direct neighbor selection, horizontal dragging, touch swipes, scroll gestures and keyboard controls. Motion uses the established fast, smooth transitions and honors reduced motion for slide changes.

Clicking the front character advances to the next, while either side character moves into focus. The transparent track no longer intercepts clicks on characters positioned behind its plane. Lush mockups now use the user’s original assets from the supplied Lush Scrubby asset folder. The four phone composition is used in the introduction, the finished home and brushing mockups are used directly, and the original transparent iPhone hardware layer is reused around the remaining supplied screen artwork. These replace the generated hardware styling in the visible case study.

The Scrubby sticker on the mockup box stands upright at rest. While visible, it occasionally makes a small squash, bounce and wiggle. Clicking or keyboard activating it triggers a 640ms hop, then returns it to its standing pose. Repeated clicks cannot stack animations, and reduced motion disables both movements.

The corner Scrubby now uses the original vector artwork inline so its two original pupil paths can track the cursor independently. Smooth movement is limited to 12 artwork units around the eye centers, keeping the pupils within the whites. SVG coordinates account for the mascot’s bounce and hop transforms. Eyes return to center when the pointer leaves the window, the window loses focus or the mascot leaves view; reduced motion keeps the eyes centered. The other character artwork is unchanged.

The Lush Scrubby card on the Home case study board is a native link to work.html and uses the shared circle navigation transition. A click or Enter opens the case study. Pulling the card still unpins it, and a drag suppresses navigation. Space or Arrow Down retains the keyboard unpin action. Bring back restores the same working link.

Work in the global navigation now opens the Case Studies board on Home at /#case-studies, from every page and from the mobile menu. The board has an anchor offset below the header, and Home’s loader aligns that destination after assets are ready. The shared circle transition covers the section change. Home and Work selection follows the destination hash, and returning Home clears the board hash. The Lush card continues to open the individual case study at work.html.

Moonlight has a separate layout at moonlight.html. It uses the existing mint case color with navy type, a full width striped hero, the supplied Moonlight phone artwork, conversation details and a torn edge. Horizontal sticky chapter tabs replace Lush’s side rail. Context uses conversation cards, research uses a pinned notes wall, structure uses expandable panels on navy, design uses a varied showcase grid, and testing has comparison spaces followed by reflection. Portfolio fonts, buttons, header, responsive menu and circle navigation are shared. Only the existing workplace community description is treated as confirmed project information; role, timeline, tools, research, design details and outcomes are clearly placeholders. No results, quotes or project methods were invented. The Home board’s Moonlight card links to this page and retains its unpin interaction.


Moonlight copy now uses the final concept brief, business plan, earlier pitches, UX board, UI designs and confirmed individual role. Research is described as desk research, exploratory interviews with people close to Froso and professor feedback, without invented participant counts or usability results. The Evolution chapter explains the shift from scenario training to workplace reflection. HTML and Sass front end scope is limited to the three screens present in the original project archive, with wider features described as design concepts. Academic timing is 2024 to 2025, semester 2. Original mockup and artifact placeholders are retained for user supplied images. UX and UI source links open separately.


Moonlight now uses the supplied 4096 by 3072 PNG composition in the hero and all eight original SVG phone exports in contextual screen galleries. The exports already contain iPhone hardware, so no synthetic frame is added. The main flow shows Home, Story and Comment; additional groups show the composer, SafeSpaces, Account and Manager Insights. On small screens each screen stacks at a readable width with its own caption. Empty architecture and concept comparison boxes are replaced with labelled journey steps and concept summaries. The business context describes the proposed company subscription, optional branding and moderation, without presenting financial forecasts or pilots as achieved results.


Moonlight uses the exact supplied vector logo and a single vector speech bubble in the hero. Its reading navigation is one sticky vertical rail on the left, using mint and brand navy; compact screens keep a numbered vertical rail with accessible chapter labels. Research notes reuse the original Case Studies pin assets. The UX section includes a local screenshot of the original FigJam user map, with full image and board links. Structure details animate height for expansion and collapse, close the previous panel before opening another, support keyboard activation and rapid changes, and skip motion for reduced motion.


Both case studies now include local full export previews for the user map, user journey, information architecture and UI overview. Lush retains its user story map. A shared native dialog provides enlargement, zoom controls, fit, scrolling, Escape dismissal and focus restoration, while direct image links remain the fallback. Moonlight’s rail moves closer to the viewport left edge on desktop. Structure animation uses a gentler 460ms expansion and 360ms collapse; the accordion reserves its tallest content height at each width so the navy section remains fixed during interaction. Home and anonymous comment phone exports use elliptical corner clipping to hide artwork protruding behind their hardware.


Moonlight phone corner clipping is increased to 18% horizontal and 9% vertical radii for Home and anonymous comments. The desktop rail is nudged six pixels right from its previous edge position. The chapter tracker explicitly activates Reflection at the bottom scroll limit, allowing short final sections to finish the navigation and reading meter.


The expanded Moonlight chapter rail now shares the exact horizontal centre of the header logo. Alignment is measured from the rendered logo and responds to viewport and logo resizing; compact mobile navigation retains its narrow left column.


Lush and Moonlight now share a desktop rail alignment helper that places each tracker centre beneath the header logo, with compact navigation keeping its existing responsive layout. Both case study introductions use the same All case studies pill button with a circular left arrow and shared navigation transition back to the Home board.


SNCB Rebrand has its own page at sncb.html, framed explicitly as a redesign of the existing app. The layout uses a perforated ticket hero, overlapping paper cover placeholder, two role based flow panels, a navy heuristic evaluation section and side by side revision spaces. Its route tracker shares the logo centre and reaches Reflection at the bottom. Content is limited to the supplied moodboard, evaluation and high fidelity files: pastel/relaxing/soft style, tour guide ticket purchase for Brussels, tourist ticket viewing and lock screen widget, and documented evaluation recommendations. Role, timeline, final mockups, detailed revision explanations and reflections stay placeholders. Four local source exports open in the shared zoom viewer. The Home SNCB card is a native case study link with its existing unpin/restore behaviour retained.


SNCB copy now incorporates the supplied group pitch and heuristic workbook. The user confirmed that Froso and two classmates collaborated on all parts. Station observations, the six stage group journey and the proposed opportunities are distinguished from the two high fidelity flows and from measured testing results. The workbook identifies Froso as evaluator on 14 November 2025 and supplies the heuristic framework; concrete findings remain sourced to the annotated Figma evaluation. Original pitch observation and journey pages are zoomable evidence. The static moodboard is replaced by the exact original Figma MP4 export, with verified moving frames, muted looping inline playback while visible, a manual pause control and reduced motion support. Final mockup placeholders remain available for user supplied artwork.


SNCB credits now use Froso and two classmates without classmates’ names. Antebas Bold is rendered from the user’s actual installed font asset. Nine original selected screens are composited beneath the supplied transparent iPhone hardware in standalone SVG mockups; cover, guide/tourist journeys, required field comparison and joining confirmation replace the remaining mockup placeholders. Artwork keeps its aspect ratio and is clipped inside the original display. Every displayed mockup opens in the shared zoom viewer.


All eight linked Figma source files were checked in the Figma desktop Share dialogs on 18 November 2026. Public link access is Anyone can view for all three SNCB sources, both Moonlight sources and all three Lush sources. Existing named collaborators retain their separate permissions; no sharing changes were required.

SNCB update, 20 November 2026: the hero’s third phone now shows the tourist group screen. The ticket consists of two paper surfaces that separate along a jagged perforation in proportion to scroll position and rejoin on reverse scrolling, with a horizontal tear on mobile and static presentation for reduced motion. The six journey stages run in a seamless marquee, paused on hover or keyboard focus and static for reduced motion. Phone mockups are noninteractive; research artifact previews retain zoom. The guide and tourist footer lists are removed. Copy identifies professional tour guides and tourists, the first semester of second year, shared work with two classmates and Froso’s individually created motion moodboard, without the evaluation date. Two official SNCB Google Play screenshots appear alongside the student concept, explicitly labelled as current store references rather than archived semester screenshots. Source: https://play.google.com/store/apps/details?hl=en&id=be.sncbnmbs.b2cmobapp . Verified 375, 640, 900 and 1440 pixel layouts without horizontal overflow, reversible tear and reduced motion, all content images loaded, and no hyphens in visible copy.

SNCB refinement, 20 November 2026: the scroll tear now has a travelling tear front, fine irregular paper fibres and a subtle shaded curl. Only the released portion separates, with a small final movement and time based smoothing in both directions. Layout measurements are cached on resize rather than read each animation frame. The comparison now shows the matching journey planner and journey options screens, the latter exported from the user selected Figma node 2117:1377, retaining the full artwork aspect ratios. Official screenshots have rounded visible corners. The explanatory note and store link below the comparison are removed at the user’s request; source attribution remains recorded above. The running journey strip uses two identical groups, each at least as wide as the container, with an exact pixel travel distance and consistent linear speed. Hover and focus no longer pause it. The loop boundary was verified at one millisecond before restart, with text positions differing by only 0.05 pixels of normal travel. Reduced motion retains static content and an intact ticket. Responsive checks passed at 375, 640, 900 and 1440 pixels.

SNCB overview follow up: restored the original supplied iPhone hardware around both redesigned journey screens. Full screenshots retain their aspect ratios and remain noninteractive. Verified the rendered frames and desktop layout.

SNCB overview frame fitting: both redesigned screens now fill the supplied phone display at uniform scale, clipped as a top aligned viewport. This removes side gaps without stretching the screenshots. Verified the rendered artwork and image loading.

SNCB overview bottom navigation fix: both phone composites now use a full width, uniformly scaled content viewport plus a separate bottom navigation crop pinned to the display bottom. The navigation crop uses the same scale as the content, preserving proportions and eliminating side gaps. Only the scrollable middle is clipped. Verified both rendered navigation bars and image loading.

Spotify Rebrand case study, 20 November 2026: added spotify.html and connected the existing Spotify board card as a native case study link while retaining its unpin and restore behavior. The page uses a pink dotted background, an original wordmark and mascot on a record sleeve composition, liner note chapter navigation, a prominent original moodboard, identity and six colour primary palette, original Gaegu typography specimen, zoomable complete brand sheet, three original framed screens and a reflective closing section. Content explicitly identifies this as Froso’s first design assignment, with full branding and only three screens rather than a complete prototype. The moodboard and character are emphasized without presenting the early interface as validated or newly redesigned work. No project date, research result or unconfirmed Adobe application is invented. Original assets exported from Figma file aHWr7fwejbY2i8YFWcUoxK: moodboard 1:1975, wordmark 1:2507, mascot 1:2550, brand sheet 32:176, typography 57:203, Home 1:837, Library 1:753 and Search 1:707. High quality WebP display versions retain native original artwork and original PNG evidence is kept locally for previews. No editable Figma link is exposed. Home and Work link positions were swapped on every page, retaining their destinations and active state, giving Work, About, Home, Contact. Shared tracker alignment now also covers Spotify. Verified all images load, the moodboard viewer opens and closes, the board card completes the existing circle transition, mobile navigation works, tracker reaches 100 percent at Looking back and shares the logo center, and widths from 375 through 1920 pixels do not overflow. All visible website copy was checked for hyphens.

Spotify refinement, 20 November 2026: replaced editorial titles with direct section names, including Spotify Rebrand, The assignment, Moodboard and visual direction, Brand identity, Logo design, Star mascot, Typography, Three screen designs and What I would change today. Tools now explicitly name Adobe Illustrator. The record sleeve uses the original light green secondary brand colour, with the original transparent vector lettering exported from Figma. The vinyl rotates continuously while visible, with moving groove highlights so rotation is perceptible, and pauses offscreen or for reduced motion. The screens section now uses a light blue surface and dark text. All three standalone star mascots use original artwork layers from Figma node 1:2550, with separate moving pupils and their original white highlights. The combined right eye and cheek raster is clipped into stationary cheek and moving pupil layers without modifying the artwork. Pupil movement follows pointer position in local SVG coordinates, interpolates smoothly and resets on pointer exit; visible stars have a gentle idle animation and an accessible click or keyboard hop. Reduced motion disables the idle, hop and pointer response. Added a compact bottom right launcher for the exact user selected YouTube video Xwx2JrspsC0, Harmless, Swing Lynn instrumental, uploaded by Instrumental Only. The official YouTube IFrame API loads only after the visitor opens the player. A visible 338 by 210 pixel video panel offers play, pause and replay, with no automatic playback on page entry. Closing, leaving the page or hiding the document pauses playback. A direct YouTube link remains available if embedded playback fails. One song is selected, so the third control is honestly labelled Replay rather than a nonfunctional Next button. Verified real playback, pause, replay, close, pupil direction changes, star hop, changing vinyl rotation, mobile player fit, no horizontal overflow at 375, 640, 900 and 1440 pixels, and static reduced motion rendering.

Spotify compact music update, 20 November 2026: replaced the YouTube integration with the MP3 explicitly supplied by the user. The corner player is now a compact controls only pill labelled For extra fun, with Swing Lynn as its subtitle, native play and pause plus replay. It loads no video or embedded player. Audio starts only after a visitor presses play, at 2 seconds; replay returns to 2 seconds, while ordinary pause and resume preserve the current time. The audio uses preload none and pauses when leaving the page. Removed all YouTube player loading and panel code. The mascot card now has a 4 pixel primary yellow border with a subtle darker yellow edge. Applied compact, unbroken spacing to the word together in the wordmark description. Verified actual native MP3 playback, pause, resuming at 20 seconds, replay from 2 seconds, absence of iframes, the requested labels, and no horizontal overflow at 375, 640, 900 and 1440 pixels. All visible copy remains free of hyphens.

Spotify vinyl playback sync: vinyl rotation now requires actual audio playback as well as visibility. It starts on the media playing event, stops on pause, end, buffering or error, and resumes after a seek when playback is ready. Pausing preserves the animation angle. Verified initial rest, rotation during playback, identical animation times while paused and continuing from that position on resume.

Spotify playlist update, 20 November 2026: added the user supplied Saturn instrumental by SZA and Tokyo Reggie instrumental by Masayoshi Takanaka after Swing Lynn by Harmless. Swing Lynn now starts at 3 seconds; the two new songs start at their beginnings. The compact player displays the current song name and artist, previous and next controls, elapsed and total time, and a keyboard and pointer accessible seek slider. Previous restarts the current song after its opening seconds and otherwise goes to the previous track; next cycles through the three songs. Skipping preserves the paused or playing state. Playback advances automatically to the next song and stops after the final song. The For extra fun label is now a small hand drawn arrow prompt above the player on page entry and fades away after the first interaction. Vinyl playback synchronization is retained. Audio durations load as metadata without starting playback. Verified actual playback of all three files, the 3 second initial offset, pause, seeking to 42 seconds, restart, previous and next, automatic advance after a song ends, and full artist labels without overflow from 320 through 1440 pixels. Audio seeking was verified with a local HTTP range capable preview server to match production hosting behavior.

Spotify music interaction refinement, 20 November 2026: removed the white text shadow and arrow shadow from the For extra fun hint. The hint has a subtle floating motion and fades permanently for that visit after scrolling more than 24 pixels or interacting. The inactive music player fades and slides away after scrolling more than 96 pixels, returns near the top, and stays available while music plays. Keyboard focused controls remain available. A short feedback grace period lets the pause animation finish before the inactive player hides. Play and pause have a small tap bounce, skip and previous buttons lean in their direction, changed song labels slide in from the corresponding side and rewind gives the timeline a brief backward nudge. Effects cancel prior effects on rapid input and respect reduced motion. Verified initial hint styling and animation, hint dismissal, inactive hiding, playing visibility, pause then hide, skip and previous label effects, rewind timeline feedback and zero interaction animations under reduced motion.

Spotify music player now mirrors the navigation’s scroll direction behavior: 12 pixels of upward travel reveals inactive controls anywhere on the page; downward travel hides them again. Playing controls remain visible. Verified revealing at 880 pixels, playing while scrolling down, pausing, revealing again on upward scroll and hiding again on downward scroll.
