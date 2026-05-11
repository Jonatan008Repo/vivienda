# add-housing-project

Agente especializado en agregar nuevos proyectos de vivienda vía API REST con validación automática.

## Purpose

Este agente automatiza el proceso completo de agregar un nuevo proyecto de vivienda:
1. Recopila información del proyecto
2. Calcula mensualidad estimada automáticamente
3. Valida coordenadas GPS para Puebla
4. Valida esquema completo (17 campos)
5. Envía POST request al backend API
6. Actualiza el frontend para reflejar el nuevo proyecto

## Prerequisites

**IMPORTANTE:** Este agente requiere que el backend esté funcionando primero.

Si el backend no existe, el agente puede:
1. Detectar que no hay backend activo
2. Ofrecer crear el backend completo (Nivel 3) usando `GUIA_PROYECTO_COMPLETO.md`
3. O proceder solo si el backend ya está corriendo en `http://localhost:5000`

## Usage

```
/agent add-housing-project
```

El agente solicitará interactivamente:
- Nombre del proyecto
- Tipo de proyecto (programa_gobierno/desarrollo_nuevo/reventa_infonavit)
- Precio
- Ubicación en Puebla
- Desarrolladora
- Características físicas (recámaras, baños, m²)
- Estado y fecha de entrega
- Plusvalía esperada
- Características, ventajas y desventajas
- Contacto

## Automated Calculations

### 1. Mensualidad Estimada
```javascript
// Automático - no requiere input del usuario
const principal = precio * 0.9; // 10% enganche
const tasaMensual = 0.038 / 12; // 3.8% anual
const numPagos = 20 * 12; // 20 años
const mensualidad = principal * (tasaMensual * Math.pow(1 + tasaMensual, numPagos)) /
                    (Math.pow(1 + tasaMensual, numPagos) - 1);
```

### 2. ID Secuencial
Lee todos los proyectos existentes y asigna el siguiente ID disponible (max(ids) + 1)

### 3. Puntuación Inicial
Si no se proporciona, calcula puntuación base:
- Precio en rango objetivo (+2 pts)
- Estado "disponible" (+1 pt)
- 3 recámaras (+1 pt)
- Plusvalía >15% (+1 pt)
- Base: 5 pts

## GPS Coordinates Assistance

Si el usuario no conoce las coordenadas exactas, el agente puede:
1. Sugerir buscar en Google Maps
2. Validar que estén en rango de Puebla (lat: 18.8-19.3, lng: -98.4 a -98.0)
3. Proporcionar referencias de zonas conocidas:
   - Centro Histórico: ~19.041, -98.206
   - Angelópolis: ~19.016, -98.239
   - Lomas de Angelópolis: ~19.026, -98.254
   - San Manuel: ~19.002, -98.237

## Validation Steps

Antes de insertar, valida:
- [x] 17 campos completos
- [x] Tipos correctos (number, string, array)
- [x] Enums válidos (tipo, estado)
- [x] Coordenadas en rango Puebla
- [x] Arrays no vacíos (caracteristicas: ≥3, ventajas: ≥2, desventajas: ≥1)
- [x] Precio en rango $600k-$800k MXN
- [x] ID único
- [x] Mensualidad calculada correctamente

## Backend Operations

### 1. Verificar Backend
```bash
curl http://localhost:5000/api/proyectos/health
```

Si no responde → Ofrecer crear backend completo (Nivel 3)

### 2. Crear Proyecto (POST)
```bash
POST http://localhost:5000/api/proyectos
Content-Type: application/json

{
  "nombre": "Residencial Valle Verde",
  "tipo": "desarrollo_nuevo",
  "precio": 720000,
  // ... resto de campos
}
```

### 3. Verificar Creación (GET)
```bash
GET http://localhost:5000/api/proyectos/{id}
```

### 4. Actualizar Frontend
Si el frontend aún usa datos embebidos, sugerir migrar a consumir la API:
- Modificar `src/App.js` para usar `fetch()` o `axios`
- Eliminar `PROYECTOS_DATABASE` hardcodeado
- Implementar `useEffect` para cargar proyectos al montar

## Example Interaction

```
Usuario: /agent add-housing-project

Agente: Voy a ayudarte a agregar un nuevo proyecto de vivienda.

📝 Nombre del proyecto:
Usuario: Residencial Valle Verde

Agente:
🏘️ Tipo de proyecto:
1. programa_gobierno (Programas gubernamentales como Infonavit)
2. desarrollo_nuevo (Desarrollos nuevos privados)
3. reventa_infonavit (Propiedades de reventa)

Usuario: 2

Agente: 💰 Precio (MXN):
Usuario: 720000

[... continúa recopilando datos ...]

Agente:
✅ Validación completada
📊 Resumen del proyecto:
- Nombre: Residencial Valle Verde
- Precio: $720,000 MXN
- Mensualidad estimada: $4,032 MXN (calculada automáticamente)
- ID asignado: 9
- Coordenadas validadas: ✓ Dentro de Puebla

¿Deseas agregar este proyecto a la base de datos? (s/n)

Usuario: s

Agente:
✨ Proyecto agregado exitosamente
🌐 API Response: 201 Created
📊 ID asignado por MongoDB: 507f1f77bcf86cd799439011
🔗 URL del proyecto: http://localhost:5000/api/proyectos/507f1f77bcf86cd799439011

Base de datos ahora contiene 9 proyectos.
Refrescando frontend...
```

## Error Handling

Si ocurre un error durante el proceso:
- Reversión automática de cambios
- Mensaje claro del problema
- Sugerencias de corrección

## Post-Addition

Después de agregar un proyecto:
1. Confirma número total de proyectos
2. Sugiere ejecutar `npm start` para ver el nuevo proyecto
3. Recuerda hacer commit de los cambios
