# Static-first evidence presentation recipe

Use this recipe when a reader needs to follow a source, transformation, comparison, or
event sequence. It is guidance, not a shared UI package or an animation requirement.

Two product-local implementations demonstrate the reusable boundary: an explanatory
worked example and a verified event transcript. Their domain data, themes, controllers,
and scoring explanations remain local. There is no shared replay or animation engine.
Automated checks of these patterns are not participant evidence of improved engagement.

## Start with a readable document

1. Render the introduction, evidence identity, date, limitations, and navigation on the
   server. A failed client script must leave a useful reading path.
2. Use stable section anchors and ordered content in normal document order. Use native
   `details` and `summary` for optional exact records or explanations.
3. Keep observation, synthetic example, simulation, forecast, and interpretation labels
   visible. A timestamp on an example is fixed; do not refresh it against today's clock.
4. Read authoritative values. Do not build a second scoring or simulation implementation
   to make an explanation easier to animate.
5. A link to exact evidence identifies its version or digest. If bytes no longer match,
   explain the mismatch instead of silently selecting an equivalent-looking record.

## Add only the interaction the task needs

Native links and disclosures need no client component. A replay may need a controller;
keep it behind a product-local client boundary and preserve a static transcript. Domain
state commits independently of transition or animation callbacks. Separate sequence
alignment from elapsed-time synchronization.

Reduced-motion mode is fully static: disable animation, transitions, and smooth
scrolling. A library's reduced-motion setting may disable only some animation classes.
Optional playback must pause on seeking, source changes, end of sequence, hidden page,
or a reduced-motion preference change, and never resume merely because the page returns.

Decorative progressive enhancement must not hide essential text. Feature queries for
scroll timelines are optional; unsupported browsers receive complete visible content. Do
not extract a scroll rail merely because one product uses it. Both pilots must
demonstrate a useful shared behavior before a component is promoted into this starter.

## Review evidence, not spectacle

Record the reader task; evidence authority; local motion role and intensity; static,
keyboard, reduced-motion, and interruption behavior; exact bundle and performance
comparison; participant findings; and missing checks. Roles such as provenance,
continuity, comparison, and progress are vocabulary, not required effects.

Connecting lines cannot turn chronology or correlation into causality. Catalog inclusion
cannot turn a source into an admitted model input. No motion field, library type,
easing, pixel offset, or unchecked domain expression belongs in shared knowledge
metadata.

## Acceptance checklist

- Initial HTML contains essential content with JavaScript blocked.
- Native controls retain keyboard order, visible focus, and non-color state labels.
- A reduced-motion change during interaction stops playback immediately.
- Static projections equal verified artifact records; failure and empty states stay
  distinct and do not borrow demo values.
- No callback is required to commit domain state, no deterministic test makes an
  external request, and no runtime dependency or analytics is added for this recipe.
- Production-build comparisons record exact commits, browser/device settings, five
  comparable runs, CSS and bundle changes, layout shifts, and long tasks. A lab score is
  not field Core Web Vitals evidence; navigation Lighthouse cannot measure INP.
- Cross-browser, zoom, assistive-technology, and consented comprehension work remains
  explicitly incomplete until performed. Preference is not comprehension; dwell time is
  not a success metric.

Use the repository's existing complete gate and both dependency audits. Never relax a
gate because a presentation change is small. Publication and deployment require their
own authorization.

See
[WCAG interaction-animation guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
[Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API),
and the [publication-safety checklist](publication-safety.md).
