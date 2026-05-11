# Agente Vivienda Puebla

React-based housing search application for Puebla, Mexico. Currently an MVP with 8 embedded housing projects targeting $600k-$800k MXN price range.

**Current State:** Local MVP (Level 1)
**Architecture:** Create React App (not Vite)
**Working Directory:** `agente-vivienda-puebla/`

## Development

```bash
cd agente-vivienda-puebla
npm start        # Dev server → http://localhost:3000
npm test         # Jest tests
npm run build    # Production build → /build
```

## Project Structure

```
agente-vivienda-puebla/        # Active CRA project ✅
├── src/
│   ├── App.js                 # Main component (989 lines) + PROYECTOS_DATABASE
│   ├── App.css
│   ├── index.js
│   └── index.css
├── public/
│   └── index.html
└── package.json               # Dependencies

agente-vivienda-puebla.jsx     # ⚠️ DUPLICATE - see "Pending Decisions"
```

## ⚠️ Pending Architectural Decisions

### File Duplication
- **Issue:** `agente-vivienda-puebla.jsx` (root) is identical to `agente-vivienda-puebla/src/App.js`
- **Impact:** Updates must be made in two places, creating maintenance burden
- **Options:**
  1. ✅ Delete root `.jsx`, use only CRA structure (recommended)
  2. Keep root `.jsx` as standalone reference/demo
  3. Set up symlink (not recommended for Windows)
- **Recommendation:** Option 1 - delete root file, maintain single source of truth in `src/App.js`

### Scaling Path
Project has a roadmap for evolution documented in `GUIA_PROYECTO_COMPLETO.md`:
- **Level 1:** Current local React app ✅ (you are here)
- **Level 2:** Advanced features (LocalStorage, Google Maps, PDF export, advanced calculator)
- **Level 3:** Full-stack (Node.js + Express backend, MongoDB, authentication)
- **Level 4:** Production deployment (Vercel/Railway/Heroku/DigitalOcean)

See [GUIA_PROYECTO_COMPLETO.md](../../../Downloads/GUIA_PROYECTO_COMPLETO.md) for detailed implementation guides for each level.

## PROYECTOS_DATABASE Schema

8 projects embedded in `src/App.js` (lines 5-297). Each follows this structure:

```javascript
{
  id: number,                        // Unique identifier (1-8)
  nombre: string,                    // Project name
  tipo: string,                      // "programa_gobierno" | "desarrollo_nuevo" | "reventa_infonavit"
  precio: number,                    // Price in MXN (600000-795000)
  ubicacion: string,                 // Address/area in Puebla
  coordenadas: {                     // GPS coordinates
    lat: number,                     // Latitude (ready for map integration - Level 2)
    lng: number                      // Longitude
  },
  desarrolladora: string,            // Developer/builder name
  recamaras: number,                 // Number of bedrooms (2-3)
  banos: number,                     // Number of bathrooms (1-2.5)
  m2Construccion: number,            // Construction area in m²
  m2Terreno: number,                 // Land area in m² (0 for apartments)
  estado: string,                    // "disponible" | "vendido" | "por_iniciar" | "por_anunciar"
  entrega: string,                   // Delivery date/period (e.g., "2026-2027")
  plusvaliaEsperada: string,         // Expected appreciation (e.g., "15%")
  mensualidadEstimada: number,       // Estimated monthly payment in MXN
  caracteristicas: string[],         // Features list (array of strings)
  ventajas: string[],                // Advantages (array of strings)
  desventajas: string[],             // Disadvantages (array of strings)
  puntuacion: number,                // Score rating (0-10)
  contacto: string                   // Contact information
}
```

**Key for AI:**
- `coordenadas` field is ready for Google Maps integration (see Level 2 in roadmap)
- `tipo` drives UI badge colors and filtering logic
- `estado` controls availability display and filtering
- All 8 projects are in range $600k-$800k MXN

## Tech Stack

**Core:**
- `react`: ^19.2.6
- `react-dom`: ^19.2.6
- `react-scripts`: 5.0.1 (Create React App)
- `lucide-react`: ^1.14.0 (icon library)

**Testing:**
- `@testing-library/react`: ^16.3.2
- `@testing-library/jest-dom`: ^6.9.1
- `@testing-library/user-event`: ^13.5.0

**Styling:**
Inline Tailwind CSS utility classes (no separate config file, no build step for Tailwind)

**Full dependency list:** See [package.json](agente-vivienda-puebla/package.json)

## Component Features

The main `App.js` component includes:

- **3 Main Views:**
  - Search view with filterable project cards
  - Comparison view (max 3 projects side-by-side)
  - Resources view (useful links and contacts)

- **Filtering System:**
  - Price range (min/max)
  - Project type (government programs, new developments, resale)
  - Bedrooms (2 or 3)
  - Status (available, sold, coming soon, future)

- **Mortgage Calculator:**
  - 3.8% annual interest rate
  - 20-year term default
  - Displays monthly payment estimate

- **State Management:**
  - React hooks (`useState`, `useMemo`)
  - Local component state (no Redux/Context)
  - No persistence (Level 2 will add LocalStorage)

## AI Agent Guidelines

**Critical Rules:**

1. **Always work in CRA directory:** `cd agente-vivienda-puebla` before any operations
2. **Single source of truth:** `src/App.js` is the canonical file (ignore root `.jsx` duplicate)
3. **Before adding features:** Check if it belongs to Level 2+ in roadmap to avoid premature optimization
4. **Data modifications:** Update `PROYECTOS_DATABASE` in `src/App.js` only (lines 5-297)
5. **Testing:** Run `npm test` before committing changes
6. **Build verification:** Run `npm run build` to ensure production build works

**When adding new projects to database:**
- Follow the schema exactly (all 17 fields required)
- Ensure `id` is unique and sequential
- Validate `coordenadas` are valid GPS coordinates for Puebla
- Keep `tipo` as one of the 3 valid enum values
- Add realistic `caracteristicas`, `ventajas`, `desventajas` arrays

## Key Files

- `src/App.js` - Main component + PROYECTOS_DATABASE (989 lines)
- `src/App.css` - Component styles (if any custom CSS)
- `package.json` - Dependencies and scripts
- `public/index.html` - HTML template

## Documentation & References

**Project Documentation:**
- [CRA README](agente-vivienda-puebla/README.md) - Create React App standard documentation
- [Project Roadmap](../../../Downloads/GUIA_PROYECTO_COMPLETO.md) - Evolution guide (Levels 1-4)
- [Root README](README.md) - Currently minimal, needs expansion

**External Documentation:**
- [React 19 docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [lucide-react icons](https://lucide.dev)
- [Create React App](https://create-react-app.dev/docs/getting-started)

## Next Steps (Post-CLAUDE.md Creation)

Consider these improvements:
1. Resolve file duplication (delete `agente-vivienda-puebla.jsx`)
2. Move `GUIA_PROYECTO_COMPLETO.md` from Downloads to project root
3. Update root `README.md` with actual project description
4. Add `.env.example` if environment variables are introduced in Level 2+
5. Create custom skill for adding projects to database with validation
