# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DialSafe Simulator - An educational web-based visualization tool for understanding how 4-disk fixed-conversion dial locks work. This project visualizes the legitimate opening procedures and internal mechanics of safe combination locks commonly used in Japan.

## Architecture

The project is a single-page application built with vanilla HTML/CSS/JavaScript, designed for GitHub Pages deployment:

- **index.html**: Main HTML structure with three tabs (LEARN, SIMULATOR, CHALLENGE)
- **script.js**: Core logic including dial mechanics, disk rotation physics, internationalization (i18n), and challenge mode
- **style.css**: All styling with CSS Grid/Flexbox layouts and animations
- **assets/**: Educational diagrams and photos of actual dial locks

Key components:
- **Dial System**: Simulates a 0-99 dial with drag, keyboard, and button controls
- **Disk Mechanics**: Models 4 disks (3 regular + 1 driving disk) with gates and fence interaction
- **Opening Sequence**: Implements the R(4)→L(3)→R(2)→L(1) unlocking pattern
- **i18n Support**: Full Japanese/English translation system using data-i18n attributes

## Development Commands

```bash
# Run local development server
python -m http.server 8000
# Then open http://localhost:8000

# No build process required - pure vanilla JS/HTML/CSS
# Deploy by pushing to GitHub Pages branch
```

## Testing

Manual testing via browser - no automated test framework. Key areas to verify:
- Dial rotation accuracy (0-99 wrapping)
- Disk engagement mechanics
- Challenge mode random combination generation
- Language switching persistence
- Mobile touch/drag functionality