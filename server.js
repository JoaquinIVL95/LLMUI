import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración de Ollama
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';

// Función para buscar en la web usando múltiples fuentes
async function searchWeb(query) {
  try {
    console.log('🔍 Buscando en Google Custom Search (sin API key)...');

    // Usar SearXNG público (motor de búsqueda meta que agrega resultados)
    // Esta es una instancia pública, gratis y sin límites
    const searxInstances = [
      'https://searx.be',
      'https://search.bus-hit.me',
      'https://searx.tiekoetter.com'
    ];

    for (const instance of searxInstances) {
      try {
        const response = await axios.get(`${instance}/search`, {
          params: {
            q: query,
            format: 'json',
            language: 'es',
            time_range: 'year'
          },
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.data && response.data.results && response.data.results.length > 0) {
          console.log(`✅ Encontrados ${response.data.results.length} resultados de ${instance}`);

          return response.data.results.slice(0, 5).map(result => ({
            title: result.title || 'Sin título',
            snippet: result.content || result.title || '',
            url: result.url || ''
          }));
        }
      } catch (err) {
        console.log(`⚠️ Instancia ${instance} falló, intentando siguiente...`);
        continue;
      }
    }

    // Si SearXNG falla, intentar DuckDuckGo Instant Answer como fallback
    console.log('📡 Intentando DuckDuckGo Instant Answer...');
    const ddgResponse = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json',
        no_html: 1,
        skip_disambig: 1
      }
    });

    const results = [];

    if (ddgResponse.data.Abstract) {
      results.push({
        title: ddgResponse.data.Heading || 'Resultado de DuckDuckGo',
        snippet: ddgResponse.data.Abstract,
        url: ddgResponse.data.AbstractURL || ''
      });
    }

    if (ddgResponse.data.RelatedTopics) {
      ddgResponse.data.RelatedTopics.slice(0, 4).forEach(topic => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.substring(0, 100),
            snippet: topic.Text,
            url: topic.FirstURL
          });
        }
      });
    }

    if (results.length > 0) {
      console.log(`✅ DuckDuckGo devolvió ${results.length} resultados`);
    } else {
      console.log('⚠️ No se encontraron resultados en ninguna fuente');
    }

    return results;
  } catch (error) {
    console.error('❌ Error en búsqueda web:', error.message);
    return [];
  }
}

// Función para buscar usando SerpAPI (si está configurado)
async function searchWebSerpAPI(query) {
  if (!process.env.SERPAPI_KEY) {
    return null;
  }

  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: query,
        api_key: process.env.SERPAPI_KEY,
        engine: 'google',
        num: 5
      }
    });

    if (response.data.organic_results) {
      return response.data.organic_results.map(result => ({
        title: result.title,
        snippet: result.snippet,
        url: result.link
      }));
    }

    return [];
  } catch (error) {
    console.error('Error en SerpAPI:', error.message);
    return null;
  }
}

// Función para consultar a Ollama
async function queryOllama(prompt, systemPrompt = null) {
  try {
    console.log('🤖 Enviando prompt a Ollama...');
    console.log('📝 Modelo:', OLLAMA_MODEL);
    console.log('📄 Prompt length:', prompt.length, 'caracteres');

    const startTime = Date.now();

    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 500,  // Limitar a 500 tokens para respuestas más rápidas
        top_k: 40,
        top_p: 0.9
      }
    }, {
      timeout: 120000, // 2 minutos de timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Respuesta recibida en ${duration}s`);
    console.log('📏 Respuesta length:', response.data.response?.length || 0, 'caracteres');

    return response.data.response;
  } catch (error) {
    console.error('❌ Error al consultar Ollama:', error.message);
    if (error.response) {
      console.error('📋 Respuesta del servidor:', error.response.data);
    }
    throw new Error('No se pudo conectar con Ollama. ¿Está corriendo?');
  }
}

// Endpoint principal: chat con búsqueda web
app.post('/api/chat', async (req, res) => {
  try {
    console.log('\n🔔 Nueva solicitud de chat recibida');
    const { message, useSearch = true } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Se requiere un mensaje' });
    }

    console.log('💬 Mensaje del usuario:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
    console.log('🔍 Usar búsqueda:', useSearch);

    let context = '';
    let searchResults = [];

    // Determinar si necesita búsqueda web
    if (useSearch) {
      console.log('🌐 Realizando búsqueda web...');

      // Intentar SerpAPI primero, luego DuckDuckGo
      searchResults = await searchWebSerpAPI(message);
      if (searchResults === null) {
        console.log('📡 Usando DuckDuckGo (SerpAPI no configurado)');
        searchResults = await searchWeb(message);
      } else {
        console.log('📡 Usando SerpAPI');
      }

      if (searchResults.length > 0) {
        console.log(`✅ ${searchResults.length} resultados de búsqueda encontrados`);
        context = '\n\nINFORMACIÓN DE BÚSQUEDA WEB:\n';
        searchResults.forEach((result, index) => {
          context += `\n[${index + 1}] ${result.title}\n${result.snippet}\nURL: ${result.url}\n`;
        });
      } else {
        console.log('⚠️ No se encontraron resultados de búsqueda');
      }
    }

    // Prompt del sistema para programación con búsqueda web
    const systemPrompt = `Eres un asistente de programación experto y conciso. Da respuestas directas y claras. Cuando tengas información de búsqueda web, úsala y cita las fuentes. Proporciona ejemplos de código solo cuando sea necesario.`;

    const fullPrompt = `${message}${context}`;

    const response = await queryOllama(fullPrompt, systemPrompt);

    console.log('📤 Enviando respuesta al cliente\n');

    res.json({
      response,
      searchResults: searchResults.length > 0 ? searchResults : null,
      usedSearch: searchResults.length > 0
    });

  } catch (error) {
    console.error('❌ Error en /api/chat:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para búsqueda directa
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Se requiere una consulta' });
    }

    let results = await searchWebSerpAPI(query);
    if (results === null) {
      results = await searchWeb(query);
    }

    res.json({ results });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para verificar estado de Ollama
app.get('/api/status', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_HOST}/api/tags`);
    res.json({
      status: 'ok',
      models: response.data.models,
      currentModel: OLLAMA_MODEL
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Ollama no está disponible. Asegúrate de que esté corriendo.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Ollama host: ${OLLAMA_HOST}`);
  console.log(`🤖 Modelo: ${OLLAMA_MODEL}`);
  console.log(`🔍 API de búsqueda: ${process.env.SERPAPI_KEY ? 'SerpAPI' : 'DuckDuckGo (gratis)'}`);
});
