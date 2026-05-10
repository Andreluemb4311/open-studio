# Design

## Visual Direction

Open Studio uses a dark premium product interface inspired by a cinematic creative studio. The dashboard reference in `docs/telaDashboard.png` is the current visual source of truth: narrow icon sidebar, slim top header, editorial serif hero, abstract magenta and violet glass forms, restrained cards, and a large amount of negative space.

## Color

Primary background: `#0C0D12`

Sidebar background: `#0A0A0B`

Surface stack: `#0E1018`, `#11131C`, `#151722`

Borders: `rgba(255,255,255,0.06)` to `rgba(255,255,255,0.10)`

Primary text: `#F5F2F4`

Secondary text: `#A0A3AD`, `#8D91A0`

Muted text: `#5F6472`

Accent: `#D06FA7`, `#E18CBC`

Secondary accent: `#9B6CFF`

Glow: `rgba(208,111,167,0.20)`

Use magenta for selection, icon emphasis, small links, focus states, and subtle glow only. It should not dominate the screen.

## Typography

UI uses the existing Inter setup through `next/font/google`. Product labels, card titles, buttons, navigation, and metadata stay in Inter or the project sans stack.

The dashboard hero uses an editorial serif with italic emphasis for the final phrase. Prefer `Cormorant Garamond`, `Playfair Display`, `Fraunces`, or a close fallback. If no additional font is loaded, use a refined serif fallback stack scoped to the hero only.

Hero heading target: 58px to 72px on desktop, tight line-height around 1.0, white body phrase and magenta italic emphasis.

## Layout

Desktop shell:

- Sidebar: 92px to 96px wide, fixed left, full height.
- Header: 84px to 90px tall, fixed to the content area, subtle bottom border.
- Main content: starts after the header and sidebar, with generous left padding near 150px on wide screens.
- Hero visual zone: around 380px tall.
- Quick actions: four cards in one row.
- Lower grid: three recent project cards on the left, activity panel on the right.

Large desktop should preserve the reference composition. Medium screens may reduce title size and gaps. Mobile may stack sections.

## Components

Sidebar uses linear lucide icons with 1.5px stroke. Active state uses a dark rounded item, magenta icon, subtle glow, and a very thin magenta selection mark. Logo uses `/logo.png`.

Header uses the title `Open Studio`, a compact search field with `Buscar...`, a `⌘ K` badge, and a notification bell with a magenta dot.

Cards use dark translucent surfaces, thin borders, soft inner highlight, and restrained hover states: slight border brightening, small upward motion, and a subtle magenta shadow.

Project thumbnails are CSS-built abstract visuals, not screenshots. They should keep the same mood as the reference: copper geometry, dark blue sphere, and magenta/copper orb composition.

## Motion

Motion is short and functional. Hover transitions should run around 180ms to 220ms with ease-out. Do not add page-load choreography.
