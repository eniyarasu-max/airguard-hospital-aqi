---
name: Clinical Aerometrics
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#006948'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855d'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-numeric-lg:
    fontFamily: JetBrains Mono
    fontSize: 36px
    fontWeight: '300'
    lineHeight: 40px
  label-numeric-md:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 24px
  label-instrument:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  label-ui:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an ultra-refined medical-grade visual environment engineered for critical air quality monitoring, bio-contaminant telemetry, and hospital HVAC diagnostics. The audience encompasses clinical engineers, infection control epidemiologists, surgical facility directors, and ICU charge nurses who require instantaneous, unambiguous comprehension of vital atmospheric metrics. 

The aesthetic synthesizes high-fidelity clinical skeuomorphism with luminous medical glassmorphism. It evokes absolute sterility, pneumatic precision, calm authority, and technological mastery. Translucent frosted substrates interact with ambient atmospheric refraction, while precision-machined aluminum tactile surfaces ground the telemetry readouts in tangible, physical instrumentation.

## Colors

The foundation relies on an ultra-clean clinical light mode. Luminous background fields mimic laminar cleanroom air and sterilized glass, accented by surgical-grade diagnostic status indicators.

- **Canvas & Substrates:** The root canvas is a soft clinical slate (`#F4F7FB`), energized with subtle localized fluid gradients in pale azure (`#E0F2FE`), soft cyan (`#E6FFFA`), and light sterile lavender (`#F1F5FD`) to produce prismatic refraction behind frosted surfaces.
- **Glass Surfaces:** Milky frosted glass tiers built with `rgba(255, 255, 255, 0.72)` to `rgba(255, 255, 255, 0.88)` offering high opacity contrast against the canvas while retaining luminous translucency.
- **Primary & Secondary Accents:** Deep Medical Teal (`#0D9488`) governs primary controls, safe operational states, and authoritative telemetry. Aerometric Cyan (`#0284C7`) indicates active laminar airflow, positive pressure zones, and real-time gas dispersion.
- **Telemetry & Status Palette:**
  - Sterile Emerald (`#059669`): ISO-rated pure air, active HEPA/ULPA filtration, negative pressure containment secure.
  - Clinical Amber (`#D97706`): VOC threshold warning, filter saturation threshold approaching, ACH (Air Changes per Hour) dip.
  - Surgical Alert Red (`#DC2626`): Bio-hazard breach, differential pressure failure, pathogen containment loss.
- **Text & Contrast Tiers:** Deep Slate (`#0F172A`) for critical readouts and display typography; Slate Neutral (`#334155`) for structural labels and parameters; Cool Atmospheric Slate (`#64748B`) for technical metadata and sensor identifiers.

## Typography

Typography prioritizes sub-second scan speeds under high-stress clinical conditions. 

- **Primary Display (Plus Jakarta Sans):** Geometric yet friendly, lending an authoritative, sterile, modern feel to room names, facility hierarchies, and module titles.
- **General Interface (Inter):** Applied across all descriptive text, operational settings, alert descriptions, and tables for neutral clarity and optical legibility at micro scales.
- **Telemetry Readouts (JetBrains Mono):** Reserved for quantitative environmental measurements (e.g., Pa pressure differentials, PPM counts, PM2.5 concentrations, ACH values). The clean, thin, monospaced numeric tabular lining guarantees zero visual jitter during rapid real-time updates.

## Layout & Spacing

The layout is structured around an adaptive 12-column clinical dashboard grid engineered to accommodate dense telemetry matrices alongside macro floorplan representations.

- **Desktop (1280px+):** 12 columns with 24px (`1.5rem`) gutters and 40px (`2.5rem`) outer canvas margins. Left/Right docks display tactile control pods and zone status summaries, while center viewports house real-time airflow maps.
- **Tablet (768px - 1279px):** 8 columns with 20px (`1.25rem`) gutters and 24px (`1.5rem`) canvas margins. Side pods collapse into tactile horizontal toolbars.
- **Mobile (< 768px):** 4 columns with 16px (`1rem`) gutters and 16px (`1rem`) outer margins. Critical diagnostic metrics collapse into vertical stacked cards with persistent floating alarm headers.
- **Internal Padding:** Data modules adhere to a strict 4px metric grid, using `space-md` for standard card interiors and `space-xs` for tight telemetry indicators.

## Elevation & Depth

Visual hierarchy is constructed through a fusion of translucent clinical glass and skeuomorphic instrumentation depth:

1. **Base Environmental Floor (Ground):** `#F4F7FB` base canvas containing luminous diffuse gradient orbs representing ambient air currents (`blur(80px)`).
2. **Clinical Glass Substrates (Elevation 1):** 
   - Surface: `rgba(255, 255, 255, 0.78)` backdropped by `backdrop-filter: blur(16px) saturate(180%)`.
   - Borders: 1px continuous hairline using `rgba(255, 255, 255, 0.95)` at the top edge transitioning to `rgba(226, 232, 240, 0.6)` at the lower edge.
   - Specular Highlight: Top inner bevel using `inset 0 1px 0 0 rgba(255, 255, 255, 1.0)`.
   - Ambient Drop Shadow: `0 8px 32px -4px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)`.
3. **Debossed Sensor Wells & Tracks (Recessed):**
   - Sliders, gauge wells, and inset readouts use an inner shadow `inset 0 2px 4px rgba(15, 23, 42, 0.08), inset 0 1px 2px rgba(15, 23, 42, 0.06)` combined with a subtle white bottom highlight (`inset 0 -1px 0 rgba(255, 255, 255, 0.9)`).
4. **Machined Tactile Elements (Elevation 2):**
   - Knobs, toggles, and push buttons feature polished aluminum and platinum styling via linear metallic gradients (`linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 100%)`).
   - Shadows: Dual-cast soft drop shadows `0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.06)` paired with a physical bottom bevel `0 1px 0 #CBD5E1`.
5. **Luminescent Diode (LED) Indicators:**
   - Active status LEDs use small, crisp radial cores (`#FFFFFF`) with vivid outer rings and a dual-stage specular glow (`0 0 8px [ColorHex], 0 0 2px [ColorHex]`) engineered to maintain full chromatic saturation on high-brightness white substrates.

## Shapes

The design uses standard rounded geometry (`0.5rem` / `8px` base, `1rem` / `16px` for containers) to communicate ergonomic safety, architectural cleanliness, and modern medical equipment housings. Micro components such as chips, status badges, and toggle pins use complete pill caps to visually segregate atomic indicators from functional structural panels.

## Components

### 1. Tactile & Glass Buttons
- **Primary Action (Tactile Medical Teal):** Solid gradient `linear-gradient(180deg, #0D9488 0%, #0F766E 100%)`, top specular hairline highlight (`inset 0 1px 0 rgba(255, 255, 255, 0.35)`), outer shadow `0 2px 4px rgba(13, 148, 136, 0.25)`. Text is pure white with high-contrast legibility.
- **Secondary (Brushed Platinum):** Aluminum/platinum surface with `linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)`, 1px border `#CBD5E1`, crisp slate text `#0F172A`. On active press, transforms from raised state to recessed inner shadow (`inset 0 1px 3px rgba(15, 23, 42, 0.15)`).

### 2. Physical Toggle Switches & Rotary Dials
- **Toggles:** Deep debossed track with dark clinical fill (`#E2E8F0`) and inner ambient shadow. The tactile thumb is an extruded platinum cylinder (`#FFFFFF` to `#E2E8F0`) with a central active indicator LED (Emerald for active sterilization, Slate for standby).
- **Telemetry Dials:** Circular brushed-metal dials displaying etched degree marks (`#94A3B8`). Active telemetry arcs glow in aerometric cyan or clinical amber with sub-millimeter needle markers.

### 3. Glassmorphic Telemetry Cards
- **Structure:** Translucent milky panels with frosted backdrops (`blur(16px)`), framed with crisp dual-tone border gradients.
- **Header:** Features room designation (`Plus Jakarta Sans 600`), live ISO cleanliness rating badge, and isolated status LED.
- **Metric Core:** Prominent monospaced value in `JetBrains Mono` flanked by physical baseline debossed sparklines tracking pressure drift, particulate count, and humidity.

### 4. Chips & Micro-Pills
- Compact indicators featuring pure white backgrounds with 1px border tint matching their respective diagnostic status. Text rendered in bold uppercase `JetBrains Mono 11px`.
- High-priority state chips feature an animated slow-breathing pulse ring around their embedded LED core.

### 5. Input Fields & Calibration Selectors
- Recessed design with an inset shadow (`inset 0 1.5px 3px rgba(15, 23, 42, 0.06)`), pristine white interior, and dark slate input text.
- Focus state activates an atmospheric teal ring (`0 0 0 3px rgba(13, 148, 136, 0.18)`) and brightens the hairline border to `#0D9488`.

### 6. Surgical Alert Banners
- Raised frosted panels overlaid with a translucent alert wash (`rgba(220, 38, 38, 0.08)`).
- Left edge defined by a solid 4px tactile Surgical Red rail, paired with high-contrast warning text and immediate purge override controls.