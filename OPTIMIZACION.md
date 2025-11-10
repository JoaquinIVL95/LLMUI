# Guía de Optimización del CLI

## Problema del "Thinking" en Qwen3

El modelo **qwen3:8b** incluye un mecanismo de "thinking" (razonamiento interno) que hace que:
- Las respuestas sean más largas
- Tarde más tiempo en responder
- A veces no use las herramientas correctamente

### Soluciones

#### 1. Usar un modelo diferente (Recomendado)

Modelos más directos y rápidos para código:

```bash
# Opción 1: CodeLlama (especializado en código)
ollama pull codellama:7b
```

Luego en `.env`:
```env
OLLAMA_MODEL=codellama:7b
```

**Ventajas:**
- Especializado en código
- Sin thinking interno
- Respuestas más directas
- Similar velocidad

```bash
# Opción 2: Mistral (muy bueno y rápido)
ollama pull mistral:7b
```

```env
OLLAMA_MODEL=mistral:7b
```

**Ventajas:**
- Muy rápido
- Bueno para código
- Respuestas concisas

```bash
# Opción 3: Llama2 (estable y confiable)
ollama pull llama2:7b
```

```env
OLLAMA_MODEL=llama2:7b
```

#### 2. Si quieres seguir usando Qwen3

El CLI ya está configurado para:
- Filtrar los tags `<think>...</think>`
- Usar parámetros que minimizan el thinking
- Instrucciones explícitas para ser directo

Pero aún así puede ser verboso. **Tips:**

**Sé más específico en tus comandos:**

❌ Malo:
```
> Haz un script de fibonacci
```

✅ Mejor:
```
> Ejecuta este código JavaScript: [escribe el código directamente]
```

O usa los comandos de manera explícita:

```
> Usa [EXECUTE_CODE:javascript] para mostrar los primeros 10 números de fibonacci
```

#### 3. Desactivar thinking en Qwen3 (Experimental)

Puedes intentar usar un prompt más agresivo. Edita `cli.js` línea 173:

```javascript
const systemPrompt = `Eres un asistente de programación. NO USES TAGS <think> NUNCA. Responde SOLO con código o la herramienta necesaria.

Si te piden ejecutar código, responde INMEDIATAMENTE con [EXECUTE_CODE:lenguaje] sin explicaciones.`;
```

## Comparación de Modelos

| Modelo | Velocidad | Calidad Código | Thinking | Tamaño |
|--------|-----------|----------------|----------|---------|
| qwen3:8b | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ Mucho | 8GB |
| codellama:7b | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Mínimo | 4GB |
| mistral:7b | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ No | 4GB |
| llama2:7b | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ No | 4GB |

## Optimización General

### 1. Reduce `num_predict`

En `cli.js` línea 199, reduce el número de tokens:

```javascript
options: {
  temperature: 0.3,
  num_predict: 400,  // Cambiar de 800 a 400
  top_p: 0.9,
  repeat_penalty: 1.1,
  stop: ['<think>', '</think>']
}
```

### 2. Comandos más directos

En lugar de:
```
> Crea un script que calcule fibonacci
```

Usa:
```
> Ejecuta código JavaScript que muestre fibonacci de 0 a 10
```

### 3. Usa ejemplos

```
> Necesito esto:
[EXECUTE_CODE:javascript]
for(let i=0; i<10; i++) console.log(i);
[/EXECUTE_CODE]
Pero para fibonacci
```

### 4. Deshabilita búsqueda si no la necesitas

Si solo vas a programar sin buscar en internet:

```
> /help
```

Y simplemente no menciones búsquedas.

## Recomendación Final

**Para el CLI, te recomiendo fuertemente usar CodeLlama:**

```bash
# Instalar
ollama pull codellama:7b

# Configurar en .env
OLLAMA_MODEL=codellama:7b

# Reiniciar CLI
npm run cli
```

**Razones:**
1. Especializado en código
2. Mucho más rápido que qwen3
3. Sin thinking interno
4. Entiende mejor las herramientas de código
5. Respuestas más concisas

## Ejemplo Comparativo

### Con Qwen3:8b
```
> Fibonacci en JavaScript

🤖 Asistente:
<think>
Okay, el usuario quiere fibonacci... [500 palabras de razonamiento]
</think>

Claro, aquí está el código:
[EXECUTE_CODE:javascript]
...
[/EXECUTE_CODE]

[Explicación de 200 palabras más]
```
⏱️ Tiempo: ~15-20 segundos

### Con CodeLlama:7b
```
> Fibonacci en JavaScript

🤖 Asistente:
[EXECUTE_CODE:javascript]
let a=0,b=1;
console.log(a,b);
for(let i=2;i<10;i++){
  let c=a+b;
  console.log(c);
  a=b;b=c;
}
[/EXECUTE_CODE]
```
⏱️ Tiempo: ~3-5 segundos

## Verificar cambios

Después de cambiar el modelo:

```bash
# Verificar que Ollama tiene el modelo
ollama list

# Debería aparecer tu nuevo modelo

# Reiniciar el CLI
npm run cli

# Probar
> Hola
```

Deberías ver respuestas mucho más rápidas y directas.
