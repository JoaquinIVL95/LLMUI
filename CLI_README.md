# LLM CLI - Asistente de Programación con Ejecución de Código

Interfaz de línea de comandos que permite a tu LLM local ejecutar código, crear archivos y buscar en internet.

## Inicio Rápido

```bash
npm run cli
```

## Características

### 1. Búsqueda en Internet
El LLM puede buscar información actualizada en Google usando SerpAPI.

**Ejemplo:**
```
> Busca información sobre las últimas características de Python 3.12
```

### 2. Ejecución de Código

Ejecuta código en JavaScript, Python o Bash directamente desde la conversación.

**Lenguajes soportados:**
- JavaScript/Node.js
- Python
- Bash/Shell

**Ejemplos:**
```
> Escribe un script Python que calcule los primeros 10 números de fibonacci

> Crea un programa JavaScript que haga una petición HTTP

> Ejecuta un comando bash para listar los archivos más grandes
```

### 3. Manejo de Archivos

El LLM puede crear, leer y listar archivos en el directorio `workspace/`.

**Ejemplos:**
```
> Crea un archivo HTML con un formulario de login

> Lee el contenido del archivo index.html

> Lista los archivos en el workspace
```

### 4. Proyectos Completos

Puedes pedirle que cree proyectos completos con múltiples archivos.

**Ejemplos:**
```
> Crea una aplicación web simple con HTML, CSS y JavaScript para un todo list

> Escribe un script Python para scraping de una página web con sus dependencias

> Crea un servidor Express básico con varias rutas
```

## Sistema de Herramientas

El LLM tiene acceso a las siguientes herramientas (las usa automáticamente):

### SEARCH_WEB
Busca información en internet.

```
[SEARCH_WEB: consulta de búsqueda]
```

### EXECUTE_CODE
Ejecuta código en el lenguaje especificado.

```
[EXECUTE_CODE:javascript]
console.log('Hola mundo');
[/EXECUTE_CODE]
```

Lenguajes: `javascript`, `python`, `bash`

### WRITE_FILE
Crea o sobrescribe un archivo en el workspace.

```
[WRITE_FILE:index.html]
<!DOCTYPE html>
<html>
<body>Hola</body>
</html>
[/WRITE_FILE]
```

### READ_FILE
Lee el contenido de un archivo.

```
[READ_FILE:index.html]
```

### LIST_FILES
Lista archivos en un directorio del workspace.

```
[LIST_FILES:.]
```

## Comandos Especiales

- `/exit` - Salir del CLI
- `/clear` - Limpiar la pantalla
- `/help` - Mostrar ayuda

## Configuración

En tu archivo `.env`:

```env
# Modelo de Ollama a usar
OLLAMA_MODEL=qwen3:8b

# API key de SerpAPI (opcional pero recomendado)
SERPAPI_KEY=tu_api_key_aqui

# Directorio de trabajo (donde se crean los archivos)
WORKSPACE_DIR=./workspace
```

## Ejemplos de Uso

### Crear una aplicación web completa

```
> Crea una aplicación web de calculadora con HTML, CSS y JavaScript.
  Debe tener un diseño moderno y funcionar correctamente.
```

El LLM:
1. Creará `calculator.html` con la estructura
2. Creará `styles.css` con el diseño
3. Creará `script.js` con la lógica
4. Puede probar el JavaScript ejecutándolo

### Resolver un problema de programación

```
> Necesito un script que descargue imágenes de una lista de URLs.
  Hazlo en Python con manejo de errores.
```

El LLM:
1. Buscará información sobre librerías de Python
2. Escribirá el código
3. Lo ejecutará para verificar que funciona
4. Guardará el archivo

### Debugging con búsqueda web

```
> Tengo este error en Python: "ModuleNotFoundError: No module named 'requests'"
  ¿Cómo lo soluciono?
```

El LLM:
1. Buscará información sobre el error
2. Te explicará la solución
3. Puede ejecutar el comando para instalar la librería

### Análisis de datos

```
> Crea un script Python que analice un archivo CSV y genere estadísticas básicas
```

### Automatización

```
> Escribe un script bash que haga backup de un directorio y lo comprima
```

## Seguridad

**IMPORTANTE:** El CLI ejecuta código real en tu sistema. Algunas recomendaciones:

1. **Revisa el código** antes de que el LLM lo ejecute (especialmente comandos bash)
2. El directorio `workspace/` está aislado pero el código puede acceder a tu sistema
3. No ejecutes código de fuentes no confiables
4. Usa un modelo confiable de Ollama

## Troubleshooting

### El LLM no está usando las herramientas

El modelo puede necesitar instrucciones más explícitas:
```
> Busca en internet información sobre... y luego ejecuta un ejemplo en Python
```

### Python no encontrado

Asegúrate de tener Python instalado:
```bash
python --version
```

### Errores de permisos

En Windows, algunos comandos bash pueden fallar. Usa PowerShell o Git Bash.

### El LLM no encuentra archivos

Los archivos se crean en `./workspace/` relativo al directorio del proyecto.

## Diferencias con el Servidor Web

| Característica | Servidor Web | CLI |
|---------------|--------------|-----|
| Interfaz | Navegador | Terminal |
| Búsqueda web | ✅ | ✅ |
| Ejecución de código | ❌ | ✅ |
| Crear archivos | ❌ | ✅ |
| Leer archivos | ❌ | ✅ |
| Múltiples usuarios | ✅ | ❌ |
| Historial visual | ✅ | ❌ |

## Tips

1. **Sé específico:** Indica exactamente qué quieres que haga
2. **Verifica el código:** Revisa lo que genera antes de ejecutar
3. **Usa el workspace:** Todos los archivos se crean ahí por defecto
4. **Encadena tareas:** Puedes pedir múltiples cosas en una consulta
5. **Itera:** Si algo no funciona, pide correcciones

## Ejemplos Avanzados

### Scraping web con análisis

```
> Busca información sobre cómo hacer web scraping en Python, luego crea
  un script que extraiga títulos de Hacker News y los guarde en un archivo
```

### Testing de código

```
> Crea una función de ordenamiento en JavaScript, luego escribe tests
  para verificar que funciona correctamente y ejecútalos
```

### Proyecto full-stack

```
> Crea un servidor Express con una ruta /api/users que devuelva datos,
  y un HTML que consuma esa API y muestre los usuarios en una tabla
```

---

¡Experimenta y descubre todo lo que puede hacer tu asistente de programación!
