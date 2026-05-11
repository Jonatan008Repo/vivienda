const router = require('express').Router();
const { runOnce } = require('../src/agent/runner');

router.post('/run', async (req, res) => {
  try {
    const expectedToken = process.env.AGENT_RUN_TOKEN;
    if (expectedToken && req.headers['x-agent-token'] !== expectedToken) {
      return res.status(401).json({ error: 'No autorizado para ejecutar el agente' });
    }

    const dryRun = String(req.query.dryRun || '').toLowerCase() === 'true';
    const source = req.query.source ? String(req.query.source) : null;
    const result = await runOnce({ trigger: 'http', dryRun, onlySource: source });
    return res.json({ ok: true, ...result });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'Error ejecutando agente',
      detalle: error.message
    });
  }
});

router.get('/diagnostics', async (req, res) => {
  try {
    const expectedToken = process.env.AGENT_RUN_TOKEN;
    if (expectedToken && req.headers['x-agent-token'] !== expectedToken) {
      return res.status(401).json({ error: 'No autorizado para ejecutar diagnostico del agente' });
    }

    const source = req.query.source ? String(req.query.source) : null;
    const result = await runOnce({ trigger: 'diagnostics', dryRun: true, onlySource: source });
    return res.json({ ok: true, ...result });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'Error ejecutando diagnostico del agente',
      detalle: error.message
    });
  }
});

module.exports = router;
