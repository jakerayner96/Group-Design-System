# Group Design System

The design system extracted from the `plt-app-prototype` React Native app as
plain HTML/CSS — five brands (PLT, Debenhams, boohoo, boohooMAN, Karen
Millen), their exact colours, type, shape rules and components, with no
framework dependency.

## Run the standalone site

Open `index.html` in a browser (or serve the folder: `npx serve .`).
The dock at the bottom switches brands; every component re-themes live.

## Use it in another project

1. Copy `css/tokens.css`, `css/components.css` and `assets/`.
2. Load the Google Fonts line from `index.html`'s `<head>` (Roboto, Geologica,
   Montserrat, Jost, Antonio, Cardo).
3. Put `data-brand="plt|debenhams|boohoo|boohooman|karenmillen"` on `<html>`
   (or any subtree — tokens cascade from wherever the attribute sits).
4. Use the component classes (`.btn .btn--primary`, `.card`, `.size`,
   `.usp-box`, `.seel-banner`, `.pay-btn--black`, …) or just consume the
   custom properties (`var(--cta)`, `var(--font)`, `var(--radius)`, …).

Everything brand-specific is a custom property — there are no hardcoded brand
colours in `components.css` except values that are identical in every brand's
Figma frame (payment-scheme colours, SEEL artwork colours).

## Keeping it in sync with the prototype

`css/tokens.css`, `assets/logos/*.svg` and `js/ds-icons.js` are **generated**:

```
node scripts/extract-tokens.mjs /path/to/plt-app-prototype
```

reads `src/theme/brands.ts` (per-brand colour collections, themselves lifted
exactly from the Group DS Figma), `BrandLogo.tsx`/`PLTLogo.tsx` (wordmarks)
and `dsIcons.ts` (the DS icon set), and rewrites the generated files. Re-run
it whenever the prototype's tokens change; don't edit those files by hand.

## What's in the box

| Piece | Source of truth |
|---|---|
| Colour collections (DS variable names) | Figma `aIHmkCaTy9c5EWOxAGw0So` — PLT 11904-2395, Debenhams 11241-47116, others their Button frames (12681-158518) |
| Type scale + per-brand faces/weights | prototype `typography.ts` / `brands.ts` |
| Buttons (6 types, PLT skin ≠ group skin) | DS Button frames 12681-158518 |
| Payment buttons (exact artwork) | DS 9144-1931, exported assets in `assets/payments/` |
| Product card | DS 5992-10841 |
| Size selector | DS 8942-6191 |
| USP box | DS 3619-10541 |
| USP banner + countdown rules | prototype `UspBar` (red on black, black on light) |
| Free-delivery threshold banner | Figma `BBz64OeCbe5TBmYKbCxvCp` 38-35751 / 38-36504 |
| Deliver+ / SEEL (per-brand banner, bag module, checkout opt-in) | Figma `CQIe2e2c0iagD1T9WjdYsx` per-brand sections (PLT 1529-25556, Debenhams 1529-19109, boohoo 1529-24658, MAN 1529-24155, KM 164-23434), exact lockup artwork in `assets/seel/` |
| Brand wordmarks / app icons | `assets/logos/`, `assets/brand-icons/` |

## Brand rules worth knowing

- **Radius**: PLT and Karen Millen are square (0); Debenhams/boohoo/boohooMAN
  are 4px. The DS Button frames round KM's *buttons* to 4 — hence the separate
  `--radius-button`.
- **Caps**: PLT sets titles/labels in uppercase (`--caps: uppercase`); apply
  the `.caps` utility to anything that should follow the brand's convention.
- **Body weight**: Debenhams reads body copy in Light (300); boohoo/boohooMAN
  in Medium (500). `--w-regular` already encodes this — use font-weight
  variables, never numbers.
- **Primary button label** follows the fill's lightness: black on Debenhams
  aqua and boohoo pink, white elsewhere (already encoded in `components.css`).
