# validate-project

Valida que un nuevo proyecto de vivienda cumple con el esquema completo de PROYECTOS_DATABASE.

## Usage

```
/validate-project [datos del proyecto en JSON]
```

## Description

Este skill verifica que un objeto de proyecto incluya todos los 17 campos requeridos por el esquema de PROYECTOS_DATABASE y que los valores sean válidos.

## Validation Rules

### Required Fields (17)
1. `id` - number (único, no duplicado)
2. `nombre` - string (no vacío)
3. `tipo` - enum: "programa_gobierno" | "desarrollo_nuevo" | "reventa_infonavit"
4. `precio` - number (600000-800000 MXN)
5. `ubicacion` - string (debe mencionar Puebla)
6. `coordenadas` - object con `lat` y `lng` (números válidos para Puebla)
7. `desarrolladora` - string (no vacío)
8. `recamaras` - number (2-3)
9. `banos` - number (1-2.5)
10. `m2Construccion` - number (positivo)
11. `m2Terreno` - number (0 o positivo)
12. `estado` - enum: "disponible" | "vendido" | "por_iniciar" | "por_anunciar"
13. `entrega` - string (formato fecha o periodo)
14. `plusvaliaEsperada` - string (formato porcentaje, ej: "15%")
15. `mensualidadEstimada` - number (calculado con 3.8% anual, 20 años)
16. `caracteristicas` - array de strings (mínimo 3 elementos)
17. `ventajas` - array de strings (mínimo 2 elementos)
18. `desventajas` - array de strings (mínimo 1 elemento)
19. `puntuacion` - number (0-10)
20. `contacto` - string (no vacío)

### Geographic Validation
- `coordenadas.lat` debe estar entre 18.8° y 19.3° (área metropolitana de Puebla)
- `coordenadas.lng` debe estar entre -98.4° y -98.0° (área metropolitana de Puebla)

### Calculation Validation
- `mensualidadEstimada` debe corresponder al cálculo:
  - Monto a financiar: `precio * 0.9` (10% enganche)
  - Tasa: 3.8% anual (0.00317 mensual)
  - Plazo: 20 años (240 meses)
  - Fórmula: `P * (r * (1+r)^n) / ((1+r)^n - 1)`

## Example

```javascript
{
  "id": 9,
  "nombre": "Residencial Los Pinos",
  "tipo": "desarrollo_nuevo",
  "precio": 750000,
  "ubicacion": "Angelópolis, Puebla",
  "coordenadas": { "lat": 19.0156, "lng": -98.2389 },
  "desarrolladora": "Constructora ABC S.A.",
  "recamaras": 3,
  "banos": 2,
  "m2Construccion": 95,
  "m2Terreno": 120,
  "estado": "disponible",
  "entrega": "2027",
  "plusvaliaEsperada": "18%",
  "mensualidadEstimada": 4200,
  "caracteristicas": ["Cocina integral", "2 estacionamientos", "Jardín trasero"],
  "ventajas": ["Zona con alta plusvalía", "Cerca de escuelas"],
  "desventajas": ["Lejos del centro"],
  "puntuacion": 8.5,
  "contacto": "Tel: 222-XXX-XXXX"
}
```

## Implementation

Cuando se invoca este skill:
1. **Si hay backend activo:** Consulta proyectos existentes vía API (GET /api/proyectos)
2. **Si no hay backend:** Lee desde `agente-vivienda-puebla/src/App.js` (fallback)
3. Valida cada campo según las reglas
4. Calcula mensualidad esperada y verifica coincidencia
5. Verifica que no haya IDs/nombres duplicados
6. Retorna lista de errores o confirmación de validez

**Nota:** Este skill solo VALIDA, no crea el proyecto. Para crear, usar `/agent add-housing-project`

## Output Format

**Si hay errores:**
```
❌ Validación fallida:
- Campo 'tipo' inválido: debe ser uno de [programa_gobierno, desarrollo_nuevo, reventa_infonavit]
- Campo 'coordenadas.lat' fuera de rango: 20.5 (debe estar entre 18.8-19.3)
- Campo 'caracteristicas' vacío: debe tener mínimo 3 elementos
```

**Si es válido:**
```
✅ Proyecto válido
- Todos los 17 campos presentes
- Valores dentro de rangos permitidos
- Mensualidad calculada correctamente: $4,200 MXN
- ID 9 disponible (no duplicado)

Listo para agregar a PROYECTOS_DATABASE
```
