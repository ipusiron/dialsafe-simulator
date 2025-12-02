# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DialSafe Simulator - An educational web-based visualization tool for understanding how 4-disk fixed-conversion dial locks work. This project visualizes the legitimate opening procedures and internal mechanics of safe combination locks commonly used in Japan.

## Architecture

Single-page application built with vanilla HTML/CSS/JavaScript for GitHub Pages deployment (no build process):

- **index.html**: Main structure with two tabs (LEARN, SIMULATOR)
- **script.js**: Core logic (~1300 lines) containing dial mechanics, disk physics, i18n, and demo patterns
- **style.css**: Styling with CSS Grid/Flexbox, dark/light themes via CSS custom properties
- **assets/**: Educational diagrams and photos of actual dial locks

### Key State Management (script.js)

The `state` object manages all simulation state:
- `value`: Current dial position (0-99)
- `wheels[]`: Array of 4 disk objects with `gate`, `tsuku` (pin), and `position` properties
- `combo`: Correct combination array (e.g., `[94, 30, 84, 13]`)
- `stepIndex`: Current step in the 4-step unlock sequence
- `dir`/`passes`: Direction and pass count for step validation

### Disk Mechanics

The driving disk connects directly to the dial. Other disks engage through pin (tsuku) collision detection in `driveDisks()`. Gates must align at position 50 for the fence to drop (checked in `checkFence()` with `FENCE_TOL` tolerance).

### i18n System

Translations stored in `I18N` object with `ja`/`en` keys. `applyI18n()` applies translations to elements with `data-i18n` attributes. Language persists via localStorage.

## Development Commands

```bash
# Run local development server
python -m http.server 8000
# Then open http://localhost:8000

# No build process - pure vanilla JS/HTML/CSS
# Deploy by pushing to GitHub Pages branch
```

## Testing

Manual browser testing. Key verification areas:
- Dial rotation accuracy (0-99 wrapping)
- Disk engagement via tsuku collision
- Demo patterns (5 patterns showing success/failure cases)
- Language/theme switching persistence