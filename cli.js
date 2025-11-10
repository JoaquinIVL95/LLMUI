import readline from 'readline';
import axios from 'axios';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const execAsync = promisify(exec);

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';
const SERPAPI_KEY = process.env.SERPAPI_KEY;
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || './workspace';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Crear directorio de trabajo si no existe
async function ensureWorkspace() {
  try {
    await fs.mkdir(WORKSPACE_DIR, { recursive: true });
  } catch (error) {
    // Directorio ya existe
  }
}

// Función para buscar en web
async function searchWeb(query) {
  try {
    if (SERPAPI_KEY) {
      log('🔍 Buscando en web...', 'cyan');
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: query,
          api_key: SERPAPI_KEY,
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
    }
    return [];
  } catch (error) {
    log(`Error en búsqueda: ${error.message}`, 'red');
    return [];
  }
}

// Ejecutar código
async function executeCode(code, language = 'javascript') {
  log(`\n⚡ Ejecutando código ${language}...`, 'yellow');

  try {
    let result;
    const filename = path.join(WORKSPACE_DIR, `temp_${Date.now()}`);

    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        await fs.writeFile(`${filename}.js`, code);
        result = await execAsync(`node "${filename}.js"`);
        await fs.unlink(`${filename}.js`);
        break;

      case 'python':
      case 'py':
        await fs.writeFile(`${filename}.py`, code);
        result = await execAsync(`python "${filename}.py"`);
        await fs.unlink(`${filename}.py`);
        break;

      case 'bash':
      case 'sh':
        result = await execAsync(code);
        break;

      default:
        throw new Error(`Lenguaje no soportado: ${language}`);
    }

    log('✅ Resultado:', 'green');
    console.log(result.stdout);
    if (result.stderr) {
      log('⚠️ Errores:', 'yellow');
      console.log(result.stderr);
    }

    return {
      success: true,
      stdout: result.stdout,
      stderr: result.stderr
    };
  } catch (error) {
    log(`❌ Error al ejecutar: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
      stderr: error.stderr
    };
  }
}

// Crear/escribir archivo
async function writeFile(filepath, content) {
  try {
    const fullPath = path.join(WORKSPACE_DIR, filepath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content);
    log(`✅ Archivo creado: ${fullPath}`, 'green');
    return { success: true, path: fullPath };
  } catch (error) {
    log(`❌ Error al crear archivo: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Leer archivo
async function readFile(filepath) {
  try {
    const fullPath = path.join(WORKSPACE_DIR, filepath);
    const content = await fs.readFile(fullPath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    log(`❌ Error al leer archivo: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Listar archivos
async function listFiles(dir = '.') {
  try {
    const fullPath = path.join(WORKSPACE_DIR, dir);
    const files = await fs.readdir(fullPath, { withFileTypes: true });
    return {
      success: true,
      files: files.map(f => ({
        name: f.name,
        isDirectory: f.isDirectory()
      }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Consultar a Ollama con herramientas
async function queryOllama(prompt, conversationHistory = []) {
  try {
    const systemPrompt = `Eres un asistente de programación. Tienes estas herramientas:

HERRAMIENTAS:
1. Buscar en web:
   [SEARCH_WEB: tu consulta]

2. Ejecutar código:
   [EXECUTE_CODE:javascript]
   console.log("hola");
   [/EXECUTE_CODE]

3. Crear archivo:
   [WRITE_FILE:nombre.js]
   const x = 1;
   [/WRITE_FILE]

4. Leer archivo:
   [READ_FILE:nombre.js]

5. Listar archivos:
   [LIST_FILES:.]

EJEMPLOS:
Usuario: "Haz un script fibonacci en js"
Tú: [EXECUTE_CODE:javascript]
let a=0,b=1;
for(let i=0;i<10;i++){console.log(a);let c=a+b;a=b;b=c;}
[/EXECUTE_CODE]

Usuario: "Crea archivo hello.js"
Tú: [WRITE_FILE:hello.js]
console.log("Hello World");
[/WRITE_FILE]

REGLAS:
- USA LAS HERRAMIENTAS directamente, sin explicar antes
- NO uses markdown code blocks (\`\`\`), usa las herramientas
- Respuestas breves y directas`;

    log('🤖 Consultando a Ollama...', 'magenta');

    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: 0.3,  // Más determinístico
        num_predict: 800,  // Respuestas más cortas
        top_p: 0.9,
        repeat_penalty: 1.1,
        stop: ['<think>', '</think>']  // Evitar thinking tags
      }
    }, {
      timeout: 120000
    });

    return response.data.response;
  } catch (error) {
    log(`❌ Error al consultar Ollama: ${error.message}`, 'red');
    throw error;
  }
}

// Procesar respuesta del LLM y ejecutar herramientas
async function processResponse(response, userInput = '') {
  let processedResponse = response;
  let toolsUsed = false;

  // Eliminar tags de thinking del modelo qwen3
  processedResponse = processedResponse.replace(/<think>[\s\S]*?<\/think>/gi, '');
  processedResponse = processedResponse.replace(/^.*?thinking:.*?$/gmi, '');
  processedResponse = processedResponse.trim();

  // Debug: mostrar respuesta raw
  if (process.env.DEBUG === 'true') {
    log('\n[DEBUG] Respuesta raw:', 'yellow');
    console.log(response);
    log('[DEBUG] Fin respuesta raw\n', 'yellow');
  }

  // DETECCIÓN INTELIGENTE: Si el modelo usa markdown en lugar de las herramientas
  // Detectar si está intentando crear un archivo
  const createFileIntent = /(?:crear|crea|escribe|escribir|haz|hacer|generar)\s+(?:un\s+)?archivo\s+(\S+)/i;
  const userWantsFile = createFileIntent.test(userInput) || /\.js|\.py|\.html|\.css/.test(userInput);

  // Si hay código en markdown y el usuario pidió un archivo, convertirlo
  if (userWantsFile) {
    const markdownCodeMatch = response.match(/```(\w+)?\n([\s\S]+?)```/);
    if (markdownCodeMatch) {
      const language = markdownCodeMatch[1] || 'javascript';
      const code = markdownCodeMatch[2].trim();

      // Extraer nombre de archivo del input del usuario primero
      let filename = 'output';
      const userFilenameMatch = userInput.match(/(?:archivo|file)\s+[`']?(\S+\.\w+)[`']?/i);
      if (userFilenameMatch) {
        filename = userFilenameMatch[1];
      } else {
        // Buscar en la respuesta del modelo
        const responseFilenameMatch = response.match(/[`']?(\S+\.\w+)[`']?/);
        if (responseFilenameMatch) {
          filename = responseFilenameMatch[1];
        } else if (language === 'javascript' || language === 'js') {
          filename = 'script.js';
        } else if (language === 'python' || language === 'py') {
          filename = 'script.py';
        } else if (language === 'html') {
          filename = 'index.html';
        } else if (language === 'css') {
          filename = 'styles.css';
        }
      }

      log(`\n💡 Detecté que quieres crear ${filename}`, 'cyan');

      // Crear el archivo automáticamente
      const result = await writeFile(filename, code);

      if (result.success) {
        log(`✅ Archivo creado en: ${result.path}`, 'green');

        // Preguntar si quiere ejecutarlo
        if (language === 'javascript' || language === 'js' || language === 'python' || language === 'py') {
          log(`\n💡 Para ejecutarlo escribe: ejecuta ${filename}`, 'yellow');
          log(`   O desde tu terminal: node workspace/${filename}`, 'yellow');
        }

        processedResponse = `He creado el archivo ${filename} con el siguiente código:\n\n${code}\n\n✅ Guardado en: ${result.path}`;
        toolsUsed = true;
      }
    }
  }

  // Comando especial: ejecutar archivo
  if (userInput.match(/^(ejecuta?r?|corre?r?|run)\s+(\S+)/i)) {
    const execMatch = userInput.match(/^(ejecuta?r?|corre?r?|run)\s+(\S+)/i);
    if (execMatch) {
      const filename = execMatch[2];
      const readResult = await readFile(filename);

      if (readResult.success) {
        const ext = filename.split('.').pop();
        const langMap = { js: 'javascript', py: 'python', sh: 'bash' };
        const language = langMap[ext] || 'javascript';

        const execResult = await executeCode(readResult.content, language);

        processedResponse = execResult.success
          ? `Resultado de ejecutar ${filename}:\n\n${execResult.stdout}`
          : `Error al ejecutar ${filename}:\n${execResult.error}`;

        toolsUsed = true;
        return { processedResponse, toolsUsed };
      }
    }
  }

  // Buscar web
  const searchMatch = response.match(/\[SEARCH_WEB:\s*(.+?)\]/);
  if (searchMatch) {
    toolsUsed = true;
    const query = searchMatch[1].trim();
    const results = await searchWeb(query);

    let searchContext = '\n\nRESULTADOS DE BÚSQUEDA:\n';
    results.forEach((r, i) => {
      searchContext += `${i + 1}. ${r.title}\n${r.snippet}\nURL: ${r.url}\n\n`;
    });

    processedResponse = processedResponse.replace(searchMatch[0], searchContext);
  }

  // Ejecutar código - regex más flexible
  const codeMatch = response.match(/\[EXECUTE_CODE:(\w+)\][\s\n]*([\s\S]+?)[\s\n]*\[\/EXECUTE_CODE\]/i);
  if (codeMatch) {
    toolsUsed = true;
    const language = codeMatch[1];
    const code = codeMatch[2].trim();

    log(`\n⚡ Ejecutando ${language}...`, 'cyan');

    const result = await executeCode(code, language);

    let resultText = result.success
      ? `\nSalida:\n${result.stdout}${result.stderr ? '\nWarnings:\n' + result.stderr : ''}`
      : `\nError:\n${result.error}`;

    processedResponse = processedResponse.replace(codeMatch[0], resultText);
  }

  // Escribir archivo - regex más flexible
  const writeMatch = response.match(/\[WRITE_FILE:(.+?)\][\s\n]*([\s\S]+?)[\s\n]*\[\/WRITE_FILE\]/i);
  if (writeMatch) {
    toolsUsed = true;
    const filepath = writeMatch[1].trim();
    const content = writeMatch[2].trim();

    log(`\n📝 Creando archivo: ${filepath}`, 'cyan');

    const result = await writeFile(filepath, content);

    const resultText = result.success
      ? `\n✅ Archivo guardado en: ${result.path}`
      : `\n❌ Error: ${result.error}`;

    processedResponse = processedResponse.replace(writeMatch[0], resultText);
  }

  // Leer archivo
  const readMatch = response.match(/\[READ_FILE:(.+?)\]/);
  if (readMatch) {
    toolsUsed = true;
    const filepath = readMatch[1].trim();
    const result = await readFile(filepath);

    const resultText = result.success
      ? `\n📄 Contenido de ${filepath}:\n${result.content}`
      : `\n❌ Error: ${result.error}`;

    processedResponse = processedResponse.replace(readMatch[0], resultText);
  }

  // Listar archivos
  const listMatch = response.match(/\[LIST_FILES:(.+?)\]/);
  if (listMatch) {
    toolsUsed = true;
    const dir = listMatch[1].trim();
    const result = await listFiles(dir);

    let resultText;
    if (result.success) {
      resultText = `\n📁 Archivos en ${dir}:\n`;
      result.files.forEach(f => {
        resultText += `  ${f.isDirectory ? '📁' : '📄'} ${f.name}\n`;
      });
    } else {
      resultText = `\n❌ Error: ${result.error}`;
    }

    processedResponse = processedResponse.replace(listMatch[0], resultText);
  }

  return { processedResponse, toolsUsed };
}

// CLI Principal
async function main() {
  await ensureWorkspace();

  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║     LLM CLI - Asistente de Programación       ║', 'cyan');
  log('╚════════════════════════════════════════════════╝\n', 'cyan');

  log(`📁 Workspace: ${path.resolve(WORKSPACE_DIR)}`, 'blue');
  log(`🤖 Modelo: ${OLLAMA_MODEL}`, 'blue');
  log(`🔍 Búsqueda web: ${SERPAPI_KEY ? 'Activada (SerpAPI)' : 'Desactivada'}`, 'blue');
  log('\nComandos especiales:', 'yellow');
  log('  /exit - Salir', 'yellow');
  log('  /clear - Limpiar pantalla', 'yellow');
  log('  /help - Mostrar ayuda\n', 'yellow');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const conversationHistory = [];

  const askQuestion = () => {
    rl.question(colors.green + '> ' + colors.reset, async (input) => {
      const userInput = input.trim();

      if (!userInput) {
        askQuestion();
        return;
      }

      if (userInput === '/exit') {
        log('\n👋 ¡Hasta luego!', 'cyan');
        rl.close();
        return;
      }

      if (userInput === '/clear') {
        console.clear();
        askQuestion();
        return;
      }

      if (userInput === '/help') {
        log('\n📚 Ayuda:', 'cyan');
        log('  • Pregunta lo que quieras, el LLM tiene acceso a:', 'white');
        log('    - Búsqueda en internet', 'white');
        log('    - Ejecución de código (JS, Python, Bash)', 'white');
        log('    - Creación y lectura de archivos', 'white');
        log('\n  • Ejemplos:', 'yellow');
        log('    "Busca información sobre React Hooks"', 'white');
        log('    "Crea un archivo fibonacci.js con un script de fibonacci"', 'white');
        log('    "Crea un archivo index.html con un hola mundo"', 'white');
        log('\n  • Comandos especiales:', 'yellow');
        log('    ejecuta archivo.js - Ejecuta un archivo del workspace', 'white');
        log('    correr archivo.py - Ejecuta un archivo Python', 'white');
        log('    run script.sh - Ejecuta un script bash', 'white');
        log('    /exit - Salir del CLI', 'white');
        log('    /clear - Limpiar pantalla', 'white');
        log('    /help - Mostrar esta ayuda\n', 'white');
        askQuestion();
        return;
      }

      try {
        conversationHistory.push({ role: 'user', content: userInput });

        // Primera respuesta del LLM
        let response = await queryOllama(userInput, conversationHistory);

        // Procesar herramientas (pasar también el input del usuario)
        let { processedResponse, toolsUsed } = await processResponse(response, userInput);

        // Si se usaron herramientas, no hacer segunda consulta
        // Ya procesamos todo lo necesario
        if (!toolsUsed) {
          // Si no se usaron herramientas, la respuesta es la del modelo
          processedResponse = response;
        }

        conversationHistory.push({ role: 'assistant', content: processedResponse });

        log('\n' + colors.bright + colors.blue + '🤖 Asistente:' + colors.reset);
        console.log(processedResponse + '\n');

      } catch (error) {
        log(`\n❌ Error: ${error.message}\n`, 'red');
      }

      askQuestion();
    });
  };

  askQuestion();
}

// Iniciar CLI
main().catch(console.error);
