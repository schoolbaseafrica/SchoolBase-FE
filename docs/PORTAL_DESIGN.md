# SchoolBase portal visual direction

The portal takes its visual cues from the clean spacing, quiet surfaces, rounded
controls, and restrained motion on [Kudi](https://www.kudi.chat/). SchoolBase
keeps each school's own brand colors. Do not copy Kudi's green palette or
marketing content into school workflows.

## Shared rules

- Use the light portal canvas, white cards, thin `--portal-line` borders, and
  generous space between sections. Keep dense records in tables where they are
  easier to scan.
- Use `--accent` and `--primary` for the school's actions and active navigation;
  rely on the runtime school brand rather than hard-coded red values.
- Use the shared `Button`, `Card`, and `Input` components so corners, focus
  states, shadows, and hover feedback stay consistent.
- Use the small `portal-section-label` above a clear page heading. The label
  names the area; the heading names the task or view.
- Add `portal-reveal` only to major sections. `PortalScrollMotion` reveals each
  section once on entry and does not move the layout. Reduced-motion users see
  content immediately. Keep navigation, alerts, and form controls visible.
- Preserve the portal shell's sticky header and sidebar behavior at desktop and
  mobile widths. Avoid a fixed header covering page content.

Review owner, admin, teacher, parent, student, and staff pages together when
changing shared components. Check long names, email addresses, empty states,
tables, and dialogs at narrow widths.
