# LLMUI - Sistema de Búsqueda Web para LLM Local

Sistema de chat inteligente que integra tu LLM local de Ollama con búsqueda web en tiempo real, permitiéndote programar con información actualizada de internet.

## Modos de Uso

### 🌐 Servidor Web (Interfaz Gráfica)
Interfaz web moderna con chat interactivo y panel de resultados de búsqueda.

```bash
npm start
# Abre http://localhost:3000
```

### 💻 CLI (Línea de Comandos) - **NUEVO**
Asistente de programación con capacidad de ejecutar código y manipular archivos.

```bash
npm run cli
```

**¡El CLI puede ejecutar código Python, JavaScript y Bash directamente!**

Ver [CLI_README.md](CLI_README.md) para documentación completa del CLI.

## Características

### Servidor Web
- 🤖 **Integración con Ollama**: Usa tu modelo LLM local
- 🔍 **Búsqueda Web**: Búsqueda automática en internet usando SerpAPI
- 💬 **Chat Interactivo**: Interfaz web moderna y responsive
- 📊 **Resultados en Tiempo Real**: Visualiza los resultados de búsqueda junto con las respuestas

### CLI (Modo Consola)
- ⚡ **Ejecución de Código**: JavaScript, Python, Bash
- 📁 **Manejo de Archivos**: Crear, leer, modificar archivos
- 🔍 **Búsqueda Web Integrada**: Información actualizada durante la programación
- 🎯 **Proyectos Completos**: Crea aplicaciones multi-archivo
- 🛠️ **Debugging Interactivo**: Prueba y corrige código en tiempo real

## Requisitos Previos

1. **Node.js** (versión 18 o superior)
2. **Ollama** instalado y corriendo
   - Descarga desde: https://ollama.ai
   - Instala un modelo: `ollama pull llama2` (o el modelo que prefieras)

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
```

3. Configuración del archivo `.env`:
```env
# Host de Ollama (por defecto localhost)
OLLAMA_HOST=http://localhost:11434

# Modelo a usar (cualquier modelo que tengas instalado en Ollama)
OLLAMA_MODEL=llama2

# OPCIONAL: SerpAPI para búsquedas más completas
# Si no lo configuras, usará DuckDuckGo (gratis, sin límites)
SERPAPI_KEY=tu_clave_aqui

# Puerto del servidor
PORT=3000
```

## Uso

### Iniciar el servidor

```bash
# Modo normal
npm start

# Modo desarrollo (con auto-reload)
npm run dev
```

El servidor estará disponible en: http://localhost:3000

### Verificar que Ollama esté corriendo

```bash
# En otra terminal
ollama serve
```

### Probar modelos disponibles

```bash
# Ver modelos instalados
ollama list

# Descargar nuevos modelos
ollama pull llama2
ollama pull codellama
ollama pull mistral
```

## API Endpoints

### POST `/api/chat`
Chat con el LLM y búsqueda web opcional.

```javascript
// Request
{
  "message": "¿Cómo usar async/await en JavaScript?",
  "useSearch": true  // opcional, default: true
}

// Response
{
  "response": "Respuesta del LLM...",
  "searchResults": [...],  // resultados de búsqueda si los hay
  "usedSearch": true
}
```

### POST `/api/search`
Búsqueda web directa sin el LLM.

```javascript
// Request
{
  "query": "JavaScript async await tutorial"
}

// Response
{
  "results": [
    {
      "title": "...",
      "snippet": "...",
      "url": "..."
    }
  ]
}
```

### GET `/api/status`
Verificar estado de Ollama y modelos disponibles.

```javascript
// Response
{
  "status": "ok",
  "models": [...],
  "currentModel": "llama2"
}
```

## Opciones de Búsqueda Web

### 1. DuckDuckGo (Gratis)
Por defecto, el sistema usa la API gratuita de DuckDuckGo. No requiere configuración adicional.

**Ventajas:**
- Completamente gratis
- Sin límites de uso
- No requiere API key

**Limitaciones:**
- Resultados más limitados que Google
- Menos contexto en algunos casos

### 2. SerpAPI (Recomendado para uso intensivo)
Para mejores resultados, puedes usar SerpAPI.

1. Regístrate en: https://serpapi.com/
2. Obtén tu API key (100 búsquedas gratis/mes)
3. Agrégala al archivo `.env`:
```env
SERPAPI_KEY=tu_clave_aqui
```

**Ventajas:**
- Resultados de Google
- Más precisos y completos
- Mejor para consultas complejas

## Ejemplos de Uso

### Preguntas de Programación
```
Usuario: ¿Cuál es la última versión de React y sus nuevas características?
Sistema: [Busca en web] → [Procesa con LLM] → Respuesta actualizada
```

### Resolver Errores
```
Usuario: Tengo un error "Cannot read property of undefined" en mi código React
Sistema: [Busca soluciones] → [Analiza con LLM] → Solución con ejemplos
```

### Aprender Nuevas Tecnologías
```
Usuario: ¿Cómo empezar con Next.js 14?
Sistema: [Busca documentación] → [Genera tutorial] → Guía paso a paso
```

## Troubleshooting

### Error: "No se pudo conectar con Ollama"
- Verifica que Ollama esté corriendo: `ollama serve`
- Comprueba el puerto en `.env` (default: 11434)

### Error: "Modelo no encontrado"
- Lista modelos disponibles: `ollama list`
- Descarga el modelo: `ollama pull llama2`
- Verifica el nombre en `.env`

### Búsquedas no funcionan
- DuckDuckGo debería funcionar sin configuración
- Si usas SerpAPI, verifica tu API key y cuota

### El servidor no inicia
- Verifica que el puerto 3000 esté libre
- Instala dependencias: `npm install`
- Revisa el archivo `.env`

## Modelos Recomendados

Para programación:
- **codellama**: Especializado en código
- **llama2**: Bueno para propósito general
- **mistral**: Rápido y preciso
- **dolphin-mixtral**: Excelente para código

Instalar un modelo:
```bash
ollama pull codellama
```

Luego actualizar `.env`:
```env
OLLAMA_MODEL=codellama
```

## Personalización

### Cambiar el prompt del sistema
Edita `server.js` línea 112:
```javascript
const systemPrompt = `Tu prompt personalizado aquí...`;
```

### Modificar número de resultados de búsqueda
Edita `server.js` línea 57 para DuckDuckGo o línea 84 para SerpAPI:
```javascript
.slice(0, 10)  // Cambiar de 5 a 10 resultados
```

## Tecnologías Utilizadas

- **Backend**: Node.js, Express
- **LLM**: Ollama
- **Búsqueda**: DuckDuckGo API / SerpAPI
- **Frontend**: HTML, CSS, JavaScript vanilla

## Contribuir

¡Las contribuciones son bienvenidas! Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

MIT

## Soporte

Si encuentras problemas:
1. Revisa la sección de Troubleshooting
2. Verifica que Ollama esté corriendo
3. Comprueba los logs del servidor
4. Abre un issue en GitHub

---

¡Disfruta programando con tu asistente LLM potenciado con búsqueda web!
