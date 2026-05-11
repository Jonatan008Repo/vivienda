const router = require('express').Router();
const Proyecto = require('../models/Proyecto');

// GET /api/proyectos - Listar todos con filtros opcionales
router.get('/', async (req, res) => {
  try {
    const { precioMin, precioMax, tipo, recamaras, estado } = req.query;
    const query = {};

    if (precioMin || precioMax) {
      query.precio = {};
      if (precioMin) query.precio.$gte = Number(precioMin);
      if (precioMax) query.precio.$lte = Number(precioMax);
    }
    if (tipo) query.tipo = tipo;
    if (recamaras) query.recamaras = Number(recamaras);
    if (estado) query.estado = estado;

    const proyectos = await Proyecto.find(query).sort({ puntuacion: -1 });
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyectos', detalle: error.message });
  }
});

// GET /api/proyectos/:id - Obtener uno por ID
router.get('/:id', async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyecto', detalle: error.message });
  }
});

// POST /api/proyectos - Crear nuevo proyecto
router.post('/', async (req, res) => {
  try {
    const proyecto = new Proyecto(req.body);
    await proyecto.save();
    res.status(201).json(proyecto);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear proyecto', detalle: error.message });
  }
});

// PUT /api/proyectos/:id - Actualizar proyecto existente
router.put('/:id', async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar proyecto', detalle: error.message });
  }
});

// DELETE /api/proyectos/:id - Eliminar proyecto
router.delete('/:id', async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndDelete(req.params.id);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json({ message: 'Proyecto eliminado correctamente', proyecto });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar proyecto', detalle: error.message });
  }
});

module.exports = router;
