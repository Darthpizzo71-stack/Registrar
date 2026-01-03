# Public Assets Directory

This directory contains static assets that are served at the root URL.

## Logo File

Place your Registrar logo file here as:
- `registrar-logo.png` (recommended)
- Or `registrar-logo.svg` (if you have an SVG version)

The logo should be:
- High resolution (at least 200px height recommended)
- Transparent background (PNG with alpha channel)
- Optimized for web use

The logo is used in:
- Header navigation (Layout component) - displayed at 40px height
- Home page welcome section - displayed at 64px height

## File Format

The logo is referenced as `/registrar-logo.png` in the code. If you use a different filename or format, update the `src` attribute in:
- `src/components/Layout.tsx`
- `src/pages/Home.tsx`

