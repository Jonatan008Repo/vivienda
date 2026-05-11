# Claude Customizaciones - Agente Vivienda Puebla

Este directorio contiene configuraciones y customizaciones para Claude Code específicas del proyecto.

## 📁 Estructura

```
.claude/
├── settings.json              # Configuración, hooks y permisos
├── skills/
│   └── validate-project.md    # Skill de validación de proyectos
└── agents/
    ├── setup-backend.md       # ⭐ Crear backend completo (Nivel 3)
    └── add-housing-project.md # Agregar proyectos vía API
```

## ⚠️ IMPORTANTE: Orden de Ejecución

**PRIMERO** debes crear el backend antes de usar las otras customizaciones:

```bash
# 1️⃣ PRIMERO: Crear backend (Nivel 3)
/agent setup-backend

# 2️⃣ DESPUÉS: Agregar proyectos vía API
/agent add-housing-project
```

## 🛠️ Skills Disponibles

### `/validate-project`
Valida que un objeto de proyecto cumple con el esquema completo de PROYECTOS_DATABASE.

**Uso:**
```javascript
/validate-project {
  "id": 9,
  "nombre": "Nuevo Proyecto",
  // ... resto de campos
}
```

**Validaciones:**
- ✅ 17 campos requeridos presentes
- ✅ Tipos de datos correctos
- ✅ Coordenadas GPS válidas para Puebla
- ✅ Mensualidad calculada correctamente (3.8% anual, 20 años)
- ✅ ID único (no duplicado)
- ✅ Enums válidos (tipo, estado)

## 🤖 Agentes Disponibles

### 1. `/agent setup-backend` ⭐ EJECUTAR PRIMERO
Crea el backend completo (Nivel 3) con Node.js + Express + MongoDB.

**Implementa:**
- 🗄️ MongoDB (Atlas o local)
- 🚀 API REST completa (CRUD proyectos)
- 📦 Modelos Mongoose con validación
- 🔌 CORS configurado para frontend
- 📊 Migración de datos existentes (8 proyectos)
- ⚙️ Scripts de desarrollo (nodemon)

**Tiempo estimado:** 30-45 minutos  
**Resultado:** Backend corriendo en `http://localhost:5000`

### 2. `/agent add-housing-project`
Asistente interactivo para agregar proyectos vía API REST.

**Prerequisito:** Backend debe estar corriendo (usar `/agent setup-backend` primero)

**Características:**
- 📝 Recopilación guiada de información
- 🧮 Cálculo automático de mensualidad
- 📍 Validación de coordenadas GPS
- ✅ Validación completa del esquema
- 🌐 POST request al backend API
- 🔄 Actualización automática del frontend

**Cálculos automáticos:**
- Mensualidad estimada (3.8% anual, 20 años)
- Puntuación base (si no se proporciona)
- ID asignado por MongoDB

## 🪝 Hooks Configurados

### pre-commit
Previene commits accidentales al archivo duplicado `agente-vivienda-puebla.jsx`.

**Comportamiento:**
Si intentas hacer commit del archivo raíz, verás:
```
❌ ERROR: Intento de modificar archivo duplicado

El archivo agente-vivienda-puebla.jsx en la raíz es un DUPLICADO.
Por favor, modifica agente-vivienda-puebla/src/App.js en su lugar.

Referencia: CLAUDE.md sección "Pending Architectural Decisions"
```

**Desactivar temporalmente:**
```bash
git commit --no-verify -m "mensaje"
```

## 🔐 Permisos Configurados

Comandos pre-autorizados (no requieren confirmación):

**Bash:**
- `cd agente-vivienda-puebla` - Navegar al directorio CRA
- `npm start` - Servidor de desarrollo
- `npm test` - Ejecutar tests
- `npm run build` - Build de producción

**Read:**
- `agente-vivienda-puebla/**/*` - Leer archivos del proyecto
- `CLAUDE.md` - Documentación principal
- `GUIA_PROYECTO_COMPLETO.md` - Roadmap de escalamiento

## 📝 Ejemplo Completo: De Cero a API

```bash
# 1. Crear backend (Nivel 3)
/agent setup-backend

# Backend se creará en:
# backend/
# ├── models/Proyecto.js
# ├── routes/proyectos.js
# ├── server.js
# └── .env

# 2. Verificar que el backend funciona
curl http://localhost:5000/api/proyectos
# → Retorna 8 proyectos migrados

# 3. Agregar nuevo proyecto
/agent add-housing-project

# 4. Verificar en el navegador
# http://localhost:3000 → Frontend carga desde API
```

## ⚠️ Notas Importantes

### Validar un proyecto antes de agregarlo
```
/validate-project { "id": 9, "nombre": "...", ... }
```

### Agregar un proyecto interactivamente
```
/agent add-housing-project
```

### Ver hooks activos
```
cat .claude/settings.json
```

### Modificar permisos
Edita `.claude/settings.json` y agrega entradas a `permissions.allow`:
```json
{
  "tool": "Bash",
  "pattern": "npm install",
  "reason": "Instalar dependencias"
}
```

## 🔄 Actualizar Customizaciones

Para actualizar skills o agents:
1. Edita el archivo `.md` correspondiente en `skills/` o `agents/`
2. Los cambios son efectivos inmediatamente (no requiere reinicio)

## 📚 Referencias

- [CLAUDE.md](../CLAUDE.md) - Documentación principal del proyecto
- [GUIA_PROYECTO_COMPLETO.md](../GUIA_PROYECTO_COMPLETO.md) - Roadmap de evolución
- [Esquema de datos](../CLAUDE.md#proyectos_database-schema) - Estructura completa de proyectos

## ⚠️ Notas Importantes

1. **No modificar `agente-vivienda-puebla.jsx`**: El hook de pre-commit previene esto
2. **Siempre ejecutar tests**: Después de agregar proyectos (`npm test`)
3. **Validar mensualidad**: El cálculo debe usar 3.8% anual, 20 años, 10% enganche
4. **Coordenadas GPS**: Deben estar en rango de Puebla (lat: 18.8-19.3, lng: -98.4 a -98.0)
