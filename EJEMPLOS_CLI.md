# Ejemplos Prácticos del CLI

## Inicio Rápido

```bash
npm run cli
```

## Ejemplos Básicos

### 1. Hola Mundo en Python

```
> Escribe un programa Python que imprima "Hola Mundo" y ejecútalo
```

**El LLM hará:**
1. Escribirá el código Python
2. Lo ejecutará automáticamente
3. Mostrará el resultado

### 2. Script de Fibonacci

```
> Crea un script Python que calcule los primeros 20 números de Fibonacci y ejecútalo
```

### 3. Crear un archivo HTML

```
> Crea un archivo index.html con una página web simple que tenga un título y un párrafo
```

El archivo se guardará en `workspace/index.html`.

## Ejemplos Intermedios

### 4. Calculadora en JavaScript

```
> Crea una calculadora funcional con HTML, CSS y JavaScript. Debe verse moderna y tener las operaciones básicas.
```

El LLM creará:
- `calculator.html`
- `calculator.css` (si es necesario)
- `calculator.js`

### 5. Web Scraping

```
> Busca información sobre cómo hacer web scraping en Python con BeautifulSoup, luego crea un script que extraiga los títulos de una página de noticias
```

### 6. Análisis de Datos

```
> Crea un script Python que genere datos aleatorios, calcule estadísticas básicas (media, mediana, desviación estándar) y muestre los resultados
```

## Ejemplos Avanzados

### 7. API REST con Express

```
> Crea un servidor Express con las siguientes rutas:
- GET /api/users - Lista de usuarios
- GET /api/users/:id - Usuario por ID
- POST /api/users - Crear usuario

Incluye validación básica y manejo de errores
```

### 8. Todo App Completa

```
> Crea una aplicación Todo completa con:
- HTML con estructura semántica
- CSS con diseño responsive y moderno
- JavaScript vanilla con persistencia en localStorage
- Funciones para agregar, eliminar, marcar como completado y filtrar tareas
```

### 9. Automatización con Bash

```
> Crea un script bash que:
1. Cree un directorio de backup
2. Copie todos los archivos .js del workspace
3. Los comprima en un archivo .tar.gz con la fecha actual
4. Muestre un resumen de lo que hizo
```

### 10. Testing Automatizado

```
> Crea una función de ordenamiento en JavaScript y luego escribe tests unitarios para verificar que funciona correctamente con diferentes casos (array vacío, array ordenado, array invertido, duplicados)
```

## Ejemplos con Búsqueda Web

### 11. Información Actualizada

```
> Busca cuáles son las mejores prácticas actuales para seguridad en Node.js y luego crea un ejemplo de servidor Express que las implemente
```

### 12. Debugging con Búsqueda

```
> Tengo este error: "TypeError: Cannot read property 'map' of undefined". Busca información sobre este error y explícame las soluciones más comunes
```

### 13. Aprendiendo Nuevas Tecnologías

```
> Busca información sobre React Hooks useState y useEffect, luego muéstrame ejemplos prácticos de cada uno
```

## Flujos de Trabajo Complejos

### 14. Proyecto Full Stack

```
> Crea un proyecto completo:

Backend:
- Servidor Express con API REST
- Endpoint para crear y listar notas
- Datos en memoria (array)

Frontend:
- HTML con formulario para crear notas
- JavaScript que consuma la API
- CSS moderno

Crea todos los archivos necesarios
```

### 15. Scraping + Análisis + Visualización

```
> Crea un proyecto que:
1. Busque información sobre las mejores librerías de scraping en Python
2. Cree un script que haga scraping de títulos de noticias
3. Analice las palabras más frecuentes
4. Guarde los resultados en un archivo JSON
```

### 16. Generador de Proyecto

```
> Crea un generador de proyecto que:
- Cree estructura de carpetas (src, public, tests)
- Genere package.json con dependencias comunes
- Cree archivos base (index.js, README.md, .gitignore)
- Incluya un script de inicio
```

## Tips para Mejores Resultados

### Sé Específico

❌ Malo:
```
> Crea una app
```

✅ Bueno:
```
> Crea una aplicación de lista de tareas con HTML, CSS y JavaScript vanilla. Debe poder agregar, eliminar y marcar como completadas las tareas. Guarda en localStorage.
```

### Itera y Corrige

```
> Crea un contador en JavaScript

[el LLM crea el código]

> Ahora agrégale botones para incrementar y decrementar

[el LLM modifica el código]

> Agrégale un límite máximo de 100
```

### Usa Búsqueda para Información Actual

```
> Busca la sintaxis más reciente de async/await en JavaScript y luego crea un ejemplo que haga múltiples peticiones HTTP en paralelo
```

### Combina Herramientas

```
> Busca ejemplos de expresiones regulares en Python para validar emails, luego crea un script que valide una lista de emails y muestre cuáles son válidos
```

## Comandos Útiles del Sistema

### Ver el workspace

```
> Lista los archivos en el workspace
```

### Leer un archivo creado

```
> Lee el contenido del archivo calculator.html
```

### Ejecutar código existente

```
> Lee el archivo script.py y ejecútalo
```

### Modificar archivos

```
> Lee el archivo index.html y agrégale un footer con el copyright
```

## Resolución de Problemas

### El código no se ejecuta

```
> El script de Python no funcionó, este es el error: [pega el error]. Busca soluciones y corrígelo
```

### Necesito instalar dependencias

```
> Busca cómo instalar requests en Python y dame el comando exacto
```

### Optimizar código existente

```
> Lee el archivo sort.js y optimízalo para mejor rendimiento. Explica los cambios que hiciste
```

## Casos de Uso Reales

### Desarrollo Web

```
> Crea un landing page responsive para una app de fitness con:
- Hero section con CTA
- Sección de características
- Formulario de contacto
- Footer
Todo con HTML semántico y CSS moderno
```

### Data Science

```
> Crea un script Python que:
- Genere 1000 puntos de datos aleatorios
- Calcule estadísticas descriptivas
- Encuentre outliers
- Guarde los resultados en CSV
```

### DevOps

```
> Crea un script bash que:
- Verifique si Node.js está instalado
- Clone un repo de git
- Instale dependencias
- Ejecute los tests
- Muestre un reporte
```

### Automatización

```
> Crea un script que automatice el proceso de:
- Crear un nuevo componente React
- Generar los archivos necesarios (component, styles, tests)
- Agregar imports al index
```

---

## Próximos Pasos

Una vez que domines estos ejemplos, puedes:

1. **Crear tus propios proyectos complejos**
2. **Automatizar tareas repetitivas**
3. **Aprender nuevas tecnologías con ejemplos prácticos**
4. **Debugging interactivo de tu código**
5. **Prototipado rápido de ideas**

¡Experimenta y descubre todo lo que puedes lograr!
