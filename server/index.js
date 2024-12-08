import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Lista predefinida de agentes
const agents = [
  {
    id: 'safety-agent',
    name: 'Agente de Seguridad',
    description: 'Especializado en seguridad y prevención de riesgos laborales',
    status: 'active',
    capabilities: ['Análisis de riesgos', 'Recomendaciones de seguridad', 'Protocolos de emergencia']
  },
  {
    id: 'legal-agent',
    name: 'Agente Legal',
    description: 'Experto en legislación laboral y normativas',
    status: 'active',
    capabilities: ['Asesoría legal', 'Normativas laborales', 'Derechos y obligaciones']
  }
];

// Endpoint para listar agentes
app.get('/api/agents', (req, res) => {
  try {
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener un agente específico
app.get('/api/agents/:id', (req, res) => {
  try {
    const agent = agents.find(a => a.id === req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para el chat con un agente
app.post('/api/agents/:id/chat', (req, res) => {
  try {
    const { id } = req.params;
    const { prompt } = req.body;

    // Simular una respuesta del agente
    const response = {
      text: `Respuesta simulada del agente ${id} al prompt: ${prompt}`,
      timestamp: new Date().toISOString(),
      agentId: id
    };

    res.json(response);
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener el estado de un agente
app.get('/api/agents/:id/status', (req, res) => {
  try {
    const agent = agents.find(a => a.id === req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    res.json({ status: agent.status });
  } catch (error) {
    console.error('Error fetching agent status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
