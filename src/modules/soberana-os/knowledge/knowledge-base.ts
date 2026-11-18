import type { KnowledgeEntry } from './types';

export const knowledgeBase: KnowledgeEntry[] = [
  // ─── SOVY ────────────────────────────────────────────────
  {
    id: 'what-is-sovy',
    topic: 'sovy',
    question: 'What is Zentinel?',
    questionEs: '¿Qué es Zentinel?',
    aliases: [
      'qué es sovy',
      'explain sovy',
      'tell me about sovy',
      'sovy',
      'cuéntame sobre sovy',
      'what is the ai',
      'qué es la ia',
      'about sovy',
      'sobre sovy',
    ],
    keywords: ['sovy', 'ai', 'assistant', 'treasury', 'inteligencia', 'cfo', 'asistente', 'ia'],
    response: `## 🤖 Meet Zentinel

Zentinel is Soberana's **AI-powered treasury assistant**. Think of it as a CFO that never sleeps — it monitors your finances 24/7, answers your questions in plain language, and can even execute actions on your behalf.

**What makes it special:**
- Connects to your **real financial data** (balances, invoices, payments)
- Uses **Claude 3.5 Sonnet** (Anthropic) — one of the most advanced AI models
- Has **12 specialized financial tools** it can use to query data and take action
- Operates over **SSE (Server-Sent Events)** for real-time streaming responses
- Full **tenant isolation** — your data is completely separate from other companies

Zentinel operates in two modes:
1. **Conversational** — you ask questions via the chat that opens from the dashboard
2. **Autonomous** — it proactively generates alerts and recommendations in the background

> *"Like having a CFO on speed dial, 24/7."*`,
    responseEs: `## 🤖 Conoce a Zentinel

Zentinel es el **asistente de tesorería impulsado por IA** de Soberana. Piensa en él como un CFO que nunca duerme — monitorea tus finanzas 24/7, responde tus preguntas en lenguaje natural y puede ejecutar acciones en tu nombre.

**Qué lo hace especial:**
- Se conecta a tus **datos financieros reales** (saldos, facturas, pagos)
- Usa **Claude 3.5 Sonnet** (Anthropic) — uno de los modelos de IA más avanzados
- Tiene **12 herramientas financieras especializadas** para consultar datos y actuar
- Opera sobre **SSE (Server-Sent Events)** para respuestas en tiempo real
- **Aislamiento total por empresa** — tus datos están completamente separados

Zentinel opera en dos modos:
1. **Conversacional** — preguntas vía el chat que se abre desde el dashboard
2. **Autónomo** — genera alertas y recomendaciones proactivamente

> *"Como tener un CFO disponible 24/7."*`,
    followUps: [
      'sovy-capabilities',
      'sovy-tools',
      'sovy-how-works',
      'sovy-security',
    ],
    depth: 'beginner',
  },

  {
    id: 'sovy-capabilities',
    topic: 'sovy',
    question: 'What can Zentinel do?',
    questionEs: '¿Qué puede hacer Zentinel?',
    aliases: [
      'sovy features',
      'qué puede hacer sovy',
      'sovy capacidades',
      'sovy functions',
      'what does sovy do',
      'funciones de sovy',
      'sovy abilities',
      'para qué sirve sovy',
    ],
    keywords: ['capabilities', 'features', 'liquidity', 'cashflow', 'fx', 'alerts', 'funciones', 'capacidades', 'reports', 'invoices'],
    response: `## 🎯 Zentinel's Core Capabilities

Zentinel connects to your real financial data and can answer questions, generate reports, manage alerts, and execute actions — all in natural language.`,
    responseEs: `## 🎯 Capacidades de Zentinel

Zentinel se conecta a tus datos financieros reales y puede responder preguntas, generar reportes, gestionar alertas y ejecutar acciones — todo en lenguaje natural.`,
    richBlocks: [
      {
        type: 'info-cards',
        position: 'after',
        data: [
          { icon: '💰', title: 'Liquidity Analysis', description: 'Real-time balances across all accounts, wallets, and vaults.', metric: '"How much do I have available?"' },
          { icon: '📊', title: 'Cash Flow Projections', description: 'Predict inflows and outflows with confidence scores.', metric: '7, 14, 30, 90-day windows' },
          { icon: '💱', title: 'FX Risk Management', description: 'Currency exposure, volatility, and hedging recommendations.', metric: '"What\'s my EUR exposure?"' },
          { icon: '🔔', title: 'Smart Alerts', description: 'Monitor liquidity, FX rates, invoice aging 24/7.', metric: 'Email, push, SMS, or chat' },
          { icon: '📋', title: 'Invoice Management', description: 'Track receivables, payables, DSO/DPO metrics.', metric: '"Overdue invoices > $10K"' },
          { icon: '📄', title: 'Report Generation', description: 'Downloadable PDF/Excel treasury reports.', metric: 'Liquidity, cashflow, FX, full' },
        ],
      },
    ],
    richBlocksEs: [
      {
        type: 'info-cards',
        position: 'after',
        data: [
          { icon: '💰', title: 'Análisis de Liquidez', description: 'Saldos en tiempo real de cuentas, wallets y vaults.', metric: '"¿Cuánto tengo disponible?"' },
          { icon: '📊', title: 'Proyecciones de Flujo', description: 'Predice ingresos y egresos con scores de confianza.', metric: 'Ventanas de 7, 14, 30, 90 días' },
          { icon: '💱', title: 'Gestión Riesgo FX', description: 'Exposición cambiaria, volatilidad y recomendaciones.', metric: '"¿Cuál es mi exposición en EUR?"' },
          { icon: '🔔', title: 'Alertas Inteligentes', description: 'Monitorea liquidez, tasas FX, facturas 24/7.', metric: 'Email, push, SMS o chat' },
          { icon: '📋', title: 'Gestión de Facturas', description: 'Rastrea cobros, pagos, métricas DSO/DPO.', metric: '"Facturas vencidas > $10K"' },
          { icon: '📄', title: 'Generación de Reportes', description: 'Reportes PDF/Excel descargables.', metric: 'Liquidez, flujo, FX, completo' },
        ],
      },
    ],
    followUps: [
      'sovy-tools',
      'sovy-vaults-integration',
      'sovy-payments-integration',
      'sovy-how-works',
    ],
    depth: 'beginner',
  },

  {
    id: 'sovy-tools',
    topic: 'sovy',
    question: 'What tools does Zentinel have?',
    questionEs: '¿Qué herramientas tiene Zentinel?',
    aliases: [
      'herramientas de sovy',
      'sovy tool system',
      'sovy functions',
      'tools sovy',
      'sovy 12 tools',
      'las 12 herramientas',
      'financial tools',
      'herramientas financieras',
    ],
    keywords: ['tools', 'functions', 'tool_use', 'registry', '12', 'herramientas', 'balance', 'forecast', 'report', 'alert', 'payment'],
    response: `## 🔧 Zentinel's 12 Financial Tools

Zentinel doesn't guess — it uses **12 specialized tools** to query real data and take action. Each tool has a Zod-validated schema, returns structured JSON, and includes a render hint for rich UI display.

> ⚠️ Tools 7 and 8 always ask for confirmation before executing.`,
    responseEs: `## 🔧 Las 12 Herramientas de Zentinel

Zentinel no adivina — usa **12 herramientas especializadas** para consultar datos reales y actuar. Cada herramienta tiene un esquema validado con Zod, retorna JSON estructurado e incluye un hint de renderizado.

> ⚠️ Las herramientas 7 y 8 siempre piden confirmación antes de ejecutar.`,
    richBlocks: [
      {
        type: 'tool-grid',
        position: 'after',
        label: '12 Financial Tools',
        data: [
          { icon: '💰', name: 'Balance Check', description: 'Real-time account balances', example: 'How much do I have?' },
          { icon: '📊', name: 'Cash Flow', description: 'Predict income & expenses', example: 'Cash flow next month' },
          { icon: '💱', name: 'FX Exposure', description: 'Currency risk analysis', example: 'My exposure in EUR?' },
          { icon: '📋', name: 'Invoices', description: 'Pending receivables & payables', example: 'Overdue invoices > $10K' },
          { icon: '🏦', name: 'Vault Positions', description: 'Investment positions & P&L', example: 'How are my Vaults?' },
          { icon: '📈', name: 'Vault Performance', description: 'Detailed vault metrics', example: 'APY trend for Alpha' },
          { icon: '💸', name: 'Execute Payment ⚠️', description: 'Schedule payments', example: 'Pay $5K to Supplier XYZ' },
          { icon: '🛡️', name: 'Create FX Hedge ⚠️', description: 'FX forward contracts', example: 'Hedge MXN 30 days' },
          { icon: '📄', name: 'Generate Report', description: 'PDF/Excel reports', example: 'Treasury report Feb' },
          { icon: '🔔', name: 'Set Alert', description: 'Automated monitoring', example: 'Alert if liquidity < $50K' },
          { icon: '🔄', name: 'Pay-in Status', description: 'Track incoming payments', example: 'Did my PIX arrive?' },
          { icon: '📤', name: 'Pay-out Status', description: 'Track outgoing payments', example: 'Where is supplier pay?' },
        ],
      },
    ],
    followUps: [
      'sovy-how-works',
      'sovy-tool-use-technical',
      'sovy-security',
      'sovy-vaults-integration',
    ],
    depth: 'intermediate',
  },

  {
    id: 'sovy-how-works',
    topic: 'sovy',
    question: 'How does Zentinel work technically?',
    questionEs: '¿Cómo funciona Zentinel técnicamente?',
    aliases: [
      'cómo funciona sovy',
      'sovy architecture',
      'sovy tech stack',
      'arquitectura sovy',
      'how sovy works',
      'sovy under the hood',
      'cómo funciona la ia',
      'sovy technical',
    ],
    keywords: ['architecture', 'orchestrator', 'sse', 'claude', 'anthropic', 'streaming', 'hono', 'nodejs', 'tech', 'stack', 'arquitectura'],
    response: `## ⚙️ How Zentinel Works

Every time you ask a question, Zentinel runs a **5-step intelligence loop** powered by Claude 3.5 Sonnet, real-time data, and 12 specialized tools.

> Built on SSE streaming, pgvector RAG, and Redis caching — response in under 1.5 seconds.`,
    responseEs: `## ⚙️ Cómo Funciona Zentinel

Cada vez que haces una pregunta, Zentinel ejecuta un **bucle de inteligencia de 5 pasos** impulsado por Claude 3.5 Sonnet, datos en tiempo real y 12 herramientas especializadas.

> Construido sobre SSE streaming, pgvector RAG y cache Redis — respuesta en menos de 1.5 segundos.`,
    richBlocks: [
      {
        type: 'step-list',
        position: 'after',
        data: [
          { icon: '💬', title: 'You ask a question', description: 'Natural language via chat. Spanish, English, Portuguese.' },
          { icon: '🧠', title: 'Zentinel understands intent', description: 'AI classifies: balance check? forecast? action?' },
          { icon: '🔍', title: 'Queries real financial data', description: 'Connects to accounts, wallets, invoices, and market data.' },
          { icon: '📊', title: 'Analyzes and reasons', description: 'Processes data, runs calculations, identifies risks.' },
          { icon: '✅', title: 'Streams response', description: 'Clear answer with numbers, trends, and recommendations.' },
        ],
      },
    ],
    richBlocksEs: [
      {
        type: 'step-list',
        position: 'after',
        data: [
          { icon: '💬', title: 'Haces una pregunta', description: 'Lenguaje natural vía chat. Español, inglés, portugués.' },
          { icon: '🧠', title: 'Zentinel entiende tu intención', description: 'IA clasifica: ¿consulta de saldo? ¿pronóstico? ¿acción?' },
          { icon: '🔍', title: 'Consulta datos financieros reales', description: 'Se conecta a cuentas, wallets, facturas y datos de mercado.' },
          { icon: '📊', title: 'Analiza y razona', description: 'Procesa datos, ejecuta cálculos, identifica riesgos.' },
          { icon: '✅', title: 'Transmite respuesta', description: 'Respuesta clara con números, tendencias y recomendaciones.' },
        ],
      },
    ],
    followUps: [
      'sovy-tool-use-technical',
      'sovy-rag',
      'sovy-sse-protocol',
      'sovy-system-prompt',
    ],
    depth: 'technical',
  },

  {
    id: 'sovy-tool-use-technical',
    topic: 'sovy',
    subtopic: 'tool-use',
    question: "How does Zentinel's tool_use work?",
    questionEs: '¿Cómo funciona el tool_use de Zentinel?',
    aliases: [
      'function calling sovy',
      'tool execution',
      'cómo usa herramientas',
      'tool use deep dive',
      'tool_use explained',
      'cómo ejecuta herramientas',
      'function calling',
    ],
    keywords: ['tool_use', 'function', 'calling', 'anthropic', 'schema', 'confirmation', 'zod', 'execute', 'token', 'confirm'],
    response: `## 🔧 Tool Use — Deep Technical Dive

Zentinel uses Anthropic's native **\`tool_use\`** capability. Here's the flow:

### Tool Execution Flow

1. Claude's response includes a \`content_block_start\` with type \`tool_use\`
2. The orchestrator validates the call against a **Zod schema**
3. Server-side injects \`company_id\` (never from user input — security)
4. Tool function executes and returns structured data
5. Result is fed back to Claude as a \`tool_result\` message
6. Claude continues generating text (may call up to **5 tools per turn**)

### Write Action Safety

For dangerous tools (\`execute_payment\`, \`create_fx_forward\`):
- A **confirmation token** is generated and stored in Redis (5-minute TTL)
- Zentinel shows the full action summary and asks for explicit confirmation
- Only after user approves → \`POST /api/sovy/actions/:type\` with the token
- Token is single-use and expires

### Tool Schema Example

Each tool is a self-contained module:
- \`name\` — unique identifier
- \`inputSchema\` — Zod schema for validation
- \`anthropicSchema\` — JSON Schema for Claude's API
- \`requiresConfirmation\` — boolean flag
- \`execute()\` — async function that queries real data
- \`renderHint\` — how the frontend should display the result`,
    responseEs: `## 🔧 Tool Use — Inmersión Técnica

Zentinel usa la capacidad nativa **\`tool_use\`** de Anthropic. Así funciona:

### Flujo de Ejecución de Herramientas

1. La respuesta de Claude incluye un \`content_block_start\` con tipo \`tool_use\`
2. El orquestador valida la llamada contra un **esquema Zod**
3. El servidor inyecta \`company_id\` (nunca del input del usuario — seguridad)
4. La función de la herramienta ejecuta y retorna datos estructurados
5. El resultado se retroalimenta a Claude como un mensaje \`tool_result\`
6. Claude continúa generando texto (puede llamar hasta **5 herramientas por turno**)

### Seguridad en Acciones de Escritura

Para herramientas peligrosas (\`execute_payment\`, \`create_fx_forward\`):
- Se genera un **token de confirmación** y se almacena en Redis (TTL 5 min)
- Zentinel muestra el resumen completo de la acción y pide confirmación explícita
- Solo después de que el usuario aprueba → \`POST /api/sovy/actions/:type\` con el token
- El token es de un solo uso y expira

### Estructura de cada Herramienta

Cada herramienta es un módulo autocontenido:
- \`name\` — identificador único
- \`inputSchema\` — esquema Zod para validación
- \`anthropicSchema\` — JSON Schema para la API de Claude
- \`requiresConfirmation\` — flag booleano
- \`execute()\` — función async que consulta datos reales
- \`renderHint\` — cómo el frontend debe mostrar el resultado`,
    followUps: ['sovy-rag', 'sovy-security', 'sovy-tools', 'sovy-sse-protocol'],
    depth: 'technical',
  },

  {
    id: 'sovy-rag',
    topic: 'sovy',
    subtopic: 'rag',
    question: "How does Zentinel's RAG work?",
    questionEs: '¿Cómo funciona el RAG de Zentinel?',
    aliases: [
      'retrieval augmented generation',
      'vector search',
      'embeddings sovy',
      'rag pipeline',
      'búsqueda vectorial',
      'rag',
      'búsqueda semántica',
      'semantic search',
      'knowledge retrieval',
    ],
    keywords: ['rag', 'embeddings', 'pgvector', 'chunks', 'retrieval', 'semantic', 'search', 'vector', 'indexing', 'cosine', 'embedding'],
    response: `## 📚 RAG Pipeline — Knowledge Retrieval

Zentinel uses **Retrieval-Augmented Generation** to answer questions about historical data, policies, and documents.

### How it works

1. **Indexing:** Financial data (transactions, invoices, policies) is chunked and embedded using OpenAI \`text-embedding-3-small\` (1536 dimensions)
2. **Storage:** Embeddings are stored in **pgvector** (PostgreSQL extension) with JSONB metadata
3. **Retrieval:** When a query arrives, it's embedded and searched against pgvector using cosine similarity
4. **Injection:** Top 5 results (similarity > 0.7) are injected into the system prompt as context

### Indexing Triggers

| Source | Trigger | Strategy |
|--------|---------|----------|
| New transaction | \`AFTER INSERT\` trigger | Single-row embedding |
| Invoice created | Application event | Single-row embedding |
| Policy document | Manual upload | Paragraph-level chunking (512 tokens) |
| FX contract | Application event | Full-document embedding |
| Batch re-index | Nightly cron (02:00 UTC) | Full table scan, upsert |

### Query Classification

| Query Type | Example | RAG? | Tools? |
|-----------|---------|------|--------|
| Real-time | "What's my balance?" | No | Yes |
| Historical | "Payments over $50K last quarter" | Yes (metadata filter) | No |
| Policy | "What's our FX hedging policy?" | Yes (semantic) | No |
| Projection | "Predict next month's cash flow" | Yes (historical) | Yes |
| Conversational | "Thank you" | No | No |`,
    responseEs: `## 📚 Pipeline RAG — Recuperación de Conocimiento

Zentinel usa **Retrieval-Augmented Generation** para responder preguntas sobre datos históricos, políticas y documentos.

### Cómo funciona

1. **Indexación:** Los datos financieros (transacciones, facturas, políticas) se fragmentan y se generan embeddings con OpenAI \`text-embedding-3-small\` (1536 dimensiones)
2. **Almacenamiento:** Los embeddings se guardan en **pgvector** (extensión PostgreSQL) con metadatos JSONB
3. **Recuperación:** Cuando llega una consulta, se genera su embedding y se busca en pgvector por similitud coseno
4. **Inyección:** Los 5 mejores resultados (similitud > 0.7) se inyectan en el system prompt como contexto

### Triggers de Indexación

| Fuente | Trigger | Estrategia |
|--------|---------|-----------|
| Nueva transacción | \`AFTER INSERT\` trigger | Embedding de fila individual |
| Factura creada | Evento de aplicación | Embedding de fila individual |
| Documento de política | Carga manual | Fragmentación por párrafos (512 tokens) |
| Contrato FX | Evento de aplicación | Embedding de documento completo |
| Re-indexación batch | Cron nocturno (02:00 UTC) | Escaneo completo, upsert |

### Clasificación de Consultas

| Tipo | Ejemplo | ¿RAG? | ¿Tools? |
|------|---------|-------|---------|
| Tiempo real | "¿Cuál es mi saldo?" | No | Sí |
| Histórico | "Pagos mayores a $50K del trimestre pasado" | Sí (filtro metadata) | No |
| Política | "¿Cuál es nuestra política de cobertura FX?" | Sí (semántico) | No |
| Proyección | "Predice el flujo de caja del próximo mes" | Sí (histórico) | Sí |
| Conversacional | "Gracias" | No | No |`,
    followUps: ['sovy-how-works', 'sovy-tool-use-technical', 'sovy-security'],
    depth: 'technical',
  },

  {
    id: 'sovy-sse-protocol',
    topic: 'sovy',
    subtopic: 'sse',
    question: 'How does the SSE protocol work?',
    questionEs: '¿Cómo funciona el protocolo SSE?',
    aliases: [
      'server sent events',
      'streaming protocol',
      'real time sovy',
      'protocolo streaming',
      'sse',
      'how does streaming work',
      'tiempo real',
      'real-time protocol',
    ],
    keywords: ['sse', 'streaming', 'events', 'token', 'tool_call', 'done', 'real-time', 'eventsource', 'ndjson', 'stream'],
    response: `## 📡 SSE Transport Protocol

Zentinel streams responses in real-time using **Server-Sent Events**.

### Event Types

| Event | Description |
|-------|-------------|
| \`token\` | Text fragment from Claude — concatenate to build message |
| \`tool_call\` | Claude is calling a tool — frontend shows loading indicator |
| \`tool_result\` | Tool execution complete — frontend renders result card |
| \`confirmation\` | Write action needs user approval — shows confirm dialog |
| \`suggestion\` | Follow-up suggestion chips |
| \`action\` | UI actions (navigate, export) |
| \`error\` | Error occurred |
| \`done\` | Stream complete with message ID and token count |

### Reconnection Strategy

If connection drops mid-stream:
1. Frontend shows "Reconectando..." indicator
2. Reconnects and fetches \`GET /api/sovy/sessions/:id\`
3. Resumes from last persisted state

### Latency Budget

| Phase | Target |
|-------|--------|
| Context assembly | < 200ms |
| RAG retrieval | < 300ms |
| First token from Claude | < 800ms |
| Total time-to-first-token | < 1.5s |`,
    responseEs: `## 📡 Protocolo de Transporte SSE

Zentinel transmite respuestas en tiempo real usando **Server-Sent Events**.

### Tipos de Eventos

| Evento | Descripción |
|--------|-------------|
| \`token\` | Fragmento de texto de Claude — concatenar para construir el mensaje |
| \`tool_call\` | Claude está llamando una herramienta — el frontend muestra indicador de carga |
| \`tool_result\` | Ejecución de herramienta completa — el frontend renderiza card de resultado |
| \`confirmation\` | Acción de escritura necesita aprobación — muestra diálogo de confirmación |
| \`suggestion\` | Chips de sugerencia de seguimiento |
| \`action\` | Acciones de UI (navegar, exportar) |
| \`error\` | Ocurrió un error |
| \`done\` | Stream completo con ID de mensaje y conteo de tokens |

### Estrategia de Reconexión

Si la conexión se cae a mitad del stream:
1. El frontend muestra indicador "Reconectando..."
2. Se reconecta y obtiene \`GET /api/sovy/sessions/:id\`
3. Resume desde el último estado persistido

### Presupuesto de Latencia

| Fase | Objetivo |
|------|----------|
| Ensamblaje de contexto | < 200ms |
| Recuperación RAG | < 300ms |
| Primer token de Claude | < 800ms |
| Tiempo total al primer token | < 1.5s |`,
    followUps: ['sovy-how-works', 'sovy-tool-use-technical'],
    depth: 'technical',
  },

  {
    id: 'sovy-system-prompt',
    topic: 'sovy',
    subtopic: 'prompt',
    question: "What is Zentinel's system prompt?",
    questionEs: '¿Cuál es el system prompt de Zentinel?',
    aliases: [
      'prompt de sovy',
      'instrucciones de sovy',
      'system prompt',
      'sovy rules',
      'prompt',
      'instructions',
      'how is sovy configured',
      'cómo está configurado sovy',
    ],
    keywords: ['system', 'prompt', 'rules', 'instructions', 'context', 'personality', 'guardrails', 'configuration'],
    response: `## 📋 Zentinel's System Prompt

The system prompt is dynamically built for every request. It includes:

### Absolute Rules
1. **NEVER fabricate financial data** — only use tool results
2. **Cite source and timestamp** for every financial figure
3. When unsure → call the appropriate tool (never guess)
4. Format monetary amounts as: \`[CURRENCY] [AMOUNT with separators]\`
5. For write actions → describe fully and ask *"¿Confirmas?"* before executing
6. Respond in the **same language** as the user's message
7. Use markdown tables for comparisons, bullet points for summaries

### Dynamic Context Injected
- Company name, ID, industry, base currency
- Active accounts list with currencies
- Vault positions with protocols and amounts
- User name, role, timezone
- Current page and selected currency from frontend
- Active alerts count and priorities
- RAG-retrieved documents (if applicable)

### Response Style Guidelines
- Lead with the **most critical number** or insight
- Be concise: **150-300 words** unless the user asks for detail
- End with **1-2 actionable next steps**
- Include confidence level for projections
- Add financial disclaimer when giving investment advice`,
    responseEs: `## 📋 System Prompt de Zentinel

El system prompt se construye dinámicamente para cada solicitud. Incluye:

### Reglas Absolutas
1. **NUNCA fabricar datos financieros** — solo usar resultados de herramientas
2. **Citar fuente y timestamp** para cada cifra financiera
3. En caso de duda → llamar a la herramienta apropiada (nunca adivinar)
4. Formatear montos como: \`[MONEDA] [MONTO con separadores]\`
5. Para acciones de escritura → describir completamente y preguntar *"¿Confirmas?"*
6. Responder en el **mismo idioma** que el mensaje del usuario
7. Usar tablas markdown para comparaciones, viñetas para resúmenes

### Contexto Dinámico Inyectado
- Nombre de empresa, ID, industria, moneda base
- Lista de cuentas activas con monedas
- Posiciones en vaults con protocolos y montos
- Nombre del usuario, rol, zona horaria
- Página actual y moneda seleccionada del frontend
- Conteo y prioridad de alertas activas
- Documentos recuperados vía RAG (si aplica)

### Directrices de Estilo de Respuesta
- Liderar con el **número más crítico** o insight
- Ser conciso: **150-300 palabras** a menos que el usuario pida detalle
- Terminar con **1-2 pasos accionables**
- Incluir nivel de confianza para proyecciones
- Agregar disclaimer financiero al dar consejos de inversión`,
    followUps: ['sovy-how-works', 'sovy-security', 'sovy-tools'],
    depth: 'technical',
  },

  {
    id: 'sovy-security',
    topic: 'sovy',
    subtopic: 'security',
    question: 'How secure is Zentinel?',
    questionEs: '¿Qué tan seguro es Zentinel?',
    aliases: [
      'seguridad sovy',
      'sovy privacy',
      'data protection sovy',
      'privacidad',
      'is sovy secure',
      'es seguro sovy',
      'sovy data safety',
      'protección de datos',
    ],
    keywords: ['security', 'privacy', 'tenant', 'isolation', 'audit', 'pii', 'seguridad', 'rls', 'jwt', 'encryption', 'rate', 'limiting'],
    response: `## 🔒 Zentinel Security

Zentinel follows a **4-pillar security model** designed for financial-grade data protection. Every layer is built with zero-trust principles.

> Rate limited, audit-logged, JWT-authenticated, HTTPS-only.`,
    responseEs: `## 🔒 Seguridad de Zentinel

Zentinel sigue un **modelo de seguridad de 4 pilares** diseñado para protección de datos de grado financiero. Cada capa está construida con principios zero-trust.

> Rate limiting, auditoría completa, autenticación JWT, solo HTTPS.`,
    richBlocks: [
      {
        type: 'info-cards',
        position: 'after',
        data: [
          { icon: '🔒', title: 'Tenant Isolation', description: 'Data scoped via RLS on PostgreSQL. company_id injected from JWT.' },
          { icon: '📝', title: 'Full Audit Trail', description: 'Every question, answer, and action logged. Append-only.' },
          { icon: '🛡️', title: 'Zero Data Training', description: 'Conversations never train AI models. PII redacted before LLM.' },
          { icon: '⚡', title: 'Confirmation Required', description: 'Write actions need explicit approval. 5-min token expiry.' },
        ],
      },
    ],
    richBlocksEs: [
      {
        type: 'info-cards',
        position: 'after',
        data: [
          { icon: '🔒', title: 'Aislamiento por Empresa', description: 'Datos limitados vía RLS en PostgreSQL. company_id inyectado del JWT.' },
          { icon: '📝', title: 'Auditoría Completa', description: 'Cada pregunta, respuesta y acción registrada. Append-only.' },
          { icon: '🛡️', title: 'Cero Entrenamiento', description: 'Las conversaciones nunca entrenan modelos. PII redactado antes del LLM.' },
          { icon: '⚡', title: 'Confirmación Requerida', description: 'Acciones de escritura requieren aprobación. Token expira en 5 min.' },
        ],
      },
    ],
    followUps: ['sovy-how-works', 'sovy-tools', 'what-is-sovy'],
    depth: 'intermediate',
  },

  {
    id: 'sovy-vaults-integration',
    topic: 'sovy',
    subtopic: 'vaults',
    question: 'How does Zentinel connect to the Vaults?',
    questionEs: '¿Cómo se conecta Zentinel con los Vaults?',
    aliases: [
      'sovy y vaults',
      'sovy vault integration',
      'vault tools sovy',
      'integración vaults',
      'sovy and vaults',
      'can sovy manage vaults',
      'sovy vault connection',
    ],
    keywords: ['vaults', 'positions', 'performance', 'integration', 'erc4626', 'get_vault', 'yield', 'rebalance'],
    response: `## 🏦 Zentinel × Vaults

Zentinel has **direct access** to your Vault positions via two dedicated tools: \`get_vault_positions\` (all investments, P&L, APY) and \`get_vault_performance\` (deep dive into any vault with historical data and risk metrics).`,
    responseEs: `## 🏦 Zentinel × Vaults

Zentinel tiene **acceso directo** a tus posiciones en Vaults vía dos herramientas dedicadas: \`get_vault_positions\` (todas las inversiones, P&L, APY) y \`get_vault_performance\` (inmersión profunda con datos históricos y métricas de riesgo).`,
    richBlocks: [
      {
        type: 'conversation',
        position: 'after',
        label: 'Weekly yield check',
        data: [
          { role: 'user', content: 'How much did I earn this week from the Vaults?' },
          { role: 'sovy', content: '• SOL/USDC Alpha: +$87.30 (APY: 11.4%)\n• ETH/USDC Beta: +$42.20 (APY: 8.2%)\n\nTotal weekly yield: +$129.50\nPerforming 15% above 30-day average.' },
        ],
      },
      {
        type: 'conversation',
        position: 'after',
        label: 'Withdrawal advice',
        data: [
          { role: 'user', content: 'Should I withdraw from Beta for payroll?' },
          { role: 'sovy', content: 'Available liquidity: $45,000\nPayroll tomorrow: $38,000\n\n✅ Enough without withdrawing.\nKeep Beta active — costs ~$12/day in lost yield.' },
        ],
      },
    ],
    richBlocksEs: [
      {
        type: 'conversation',
        position: 'after',
        label: 'Rendimiento semanal',
        data: [
          { role: 'user', content: '¿Cuánto gané esta semana de los Vaults?' },
          { role: 'sovy', content: '• SOL/USDC Alpha: +$87.30 (APY: 11.4%)\n• ETH/USDC Beta: +$42.20 (APY: 8.2%)\n\nRendimiento semanal: +$129.50\n15% por encima del promedio de 30 días.' },
        ],
      },
      {
        type: 'conversation',
        position: 'after',
        label: 'Consejo de retiro',
        data: [
          { role: 'user', content: '¿Debería retirar de Beta para nómina?' },
          { role: 'sovy', content: 'Liquidez disponible: $45,000\nNómina mañana: $38,000\n\n✅ Suficiente sin retirar.\nMantén Beta activo — cuesta ~$12/día en rendimiento perdido.' },
        ],
      },
    ],
    followUps: ['what-are-vaults', 'vault-share-price', 'vault-strategies', 'sovy-payments-integration'],
    depth: 'intermediate',
  },

  {
    id: 'sovy-payments-integration',
    topic: 'sovy',
    subtopic: 'payments',
    question: 'How does Zentinel track payments?',
    questionEs: '¿Cómo rastrea Zentinel los pagos?',
    aliases: [
      'sovy pagos',
      'pay-in pay-out sovy',
      'payment status sovy',
      'rastreo de pagos',
      'sovy payments',
      'cobros y pagos',
      'payment tracking',
    ],
    keywords: ['payments', 'pay-in', 'pay-out', 'status', 'state', 'machine', 'tracking', 'invoices', 'facturas', 'cobros', 'pagos'],
    response: `## 💸 Zentinel × Payments

Zentinel monitors every payment through its complete lifecycle using **state machines** — from initiation to completion, for both incoming (pay-in) and outgoing (pay-out) transfers.`,
    responseEs: `## 💸 Zentinel × Pagos

Zentinel monitorea cada pago a través de su ciclo de vida completo usando **máquinas de estado** — desde el inicio hasta la completación, tanto para transferencias entrantes (pay-in) como salientes (pay-out).`,
    richBlocks: [
      {
        type: 'state-timeline',
        position: 'after',
        label: 'Pay-in states',
        data: [
          { label: 'INITIATED', status: 'completed' },
          { label: 'PENDING', status: 'completed' },
          { label: 'RECEIVED', status: 'completed' },
          { label: 'CONVERTING', status: 'active' },
          { label: 'CREDITED', status: 'pending' },
          { label: 'COMPLETED', status: 'pending' },
        ],
      },
      {
        type: 'state-timeline',
        position: 'after',
        label: 'Pay-out states',
        data: [
          { label: 'CREATED', status: 'completed' },
          { label: 'APPROVED', status: 'completed' },
          { label: 'PROCESSING', status: 'active' },
          { label: 'SENT', status: 'pending' },
          { label: 'CONFIRMED', status: 'pending' },
          { label: 'COMPLETED', status: 'pending' },
        ],
      },
      {
        type: 'conversation',
        position: 'after',
        label: 'Example',
        data: [
          { role: 'user', content: 'Did my PIX from Brazil arrive?' },
          { role: 'sovy', content: 'Yes! R$5,000 BRL received 8 min ago.\nStatus: Converting to USDC\nEstimated: ~961.54 USDC\nCompletion: ~7 more minutes' },
        ],
      },
    ],
    richBlocksEs: [
      {
        type: 'state-timeline',
        position: 'after',
        label: 'Estados Pay-in',
        data: [
          { label: 'INITIATED', status: 'completed' },
          { label: 'PENDING', status: 'completed' },
          { label: 'RECEIVED', status: 'completed' },
          { label: 'CONVERTING', status: 'active' },
          { label: 'CREDITED', status: 'pending' },
          { label: 'COMPLETED', status: 'pending' },
        ],
      },
      {
        type: 'state-timeline',
        position: 'after',
        label: 'Estados Pay-out',
        data: [
          { label: 'CREATED', status: 'completed' },
          { label: 'APPROVED', status: 'completed' },
          { label: 'PROCESSING', status: 'active' },
          { label: 'SENT', status: 'pending' },
          { label: 'CONFIRMED', status: 'pending' },
          { label: 'COMPLETED', status: 'pending' },
        ],
      },
      {
        type: 'conversation',
        position: 'after',
        label: 'Ejemplo',
        data: [
          { role: 'user', content: '¿Llegó mi PIX de Brasil?' },
          { role: 'sovy', content: '¡Sí! R$5,000 BRL recibido hace 8 min.\nEstado: Convirtiendo a USDC\nEstimado: ~961.54 USDC\nCompletado: ~7 minutos más' },
        ],
      },
    ],
    followUps: ['sovy-tools', 'sovy-vaults-integration', 'sovy-capabilities'],
    depth: 'intermediate',
  },

  {
    id: 'sovy-roadmap',
    topic: 'sovy',
    question: "What's the roadmap for Zentinel?",
    questionEs: '¿Cuál es el roadmap de Zentinel?',
    aliases: [
      'sovy futuro',
      'sovy roadmap',
      'qué viene para sovy',
      'sovy plan',
      'what comes next',
      'próximos pasos',
      'future plans',
      'cuando estará listo',
    ],
    keywords: ['roadmap', 'phases', 'future', 'planned', 'fases', 'timeline', 'milestones', 'launch', 'release'],
    response: `## 🗺️ Zentinel Roadmap

| Phase | Title | Status | Description |
|-------|-------|--------|-------------|
| **Phase 1** | Real-time data | ✅ Done | Zentinel answers with real data from accounts |
| **Phase 2** | Actions | 🔄 Building | Execute payments, create hedges, manage vaults via chat |
| **Phase 3** | Predictive AI | 📅 Planned | Anomaly detection, predictive alerts, document analysis with Prophet/ARIMA models |
| **Phase 4** | Multi-channel | 📅 Planned | Access Zentinel from WhatsApp, Telegram, Slack |

### Cost Model (Phase 1)
- ~$0.015 per message (Claude 3.5 Sonnet)
- ~$0.0001 per embedding (OpenAI text-embedding-3-small)
- Infrastructure: ~$450/month base (Cloud Run + Cloud SQL + Redis)
- At 500 messages/day: ~$675/month total`,
    responseEs: `## 🗺️ Roadmap de Zentinel

| Fase | Título | Estado | Descripción |
|------|--------|--------|-------------|
| **Fase 1** | Datos en tiempo real | ✅ Listo | Zentinel responde con datos reales de cuentas |
| **Fase 2** | Acciones | 🔄 Construyendo | Ejecutar pagos, crear coberturas, gestionar vaults vía chat |
| **Fase 3** | IA Predictiva | 📅 Planeado | Detección de anomalías, alertas predictivas, análisis de documentos con modelos Prophet/ARIMA |
| **Fase 4** | Multi-canal | 📅 Planeado | Acceder a Zentinel desde WhatsApp, Telegram, Slack |

### Modelo de Costos (Fase 1)
- ~$0.015 por mensaje (Claude 3.5 Sonnet)
- ~$0.0001 por embedding (OpenAI text-embedding-3-small)
- Infraestructura: ~$450/mes base (Cloud Run + Cloud SQL + Redis)
- Con 500 mensajes/día: ~$675/mes total`,
    followUps: ['sovy-how-works', 'sovy-security', 'what-is-sovy'],
    depth: 'beginner',
  },

  // ─── VAULTS ──────────────────────────────────────────────────
  {
    id: 'what-are-vaults',
    topic: 'vaults',
    question: 'What are Soberana Vaults?',
    questionEs: '¿Qué son los Soberana Vaults?',
    aliases: [
      'qué son los vaults',
      'vaults explained',
      'vaults',
      'explain vaults',
      'soberana vaults',
      'tell me about vaults',
      'cuéntame sobre los vaults',
      'what are the vaults',
      'bóvedas',
    ],
    keywords: ['vaults', 'investment', 'yield', 'defi', 'shares', 'savings', 'inversión', 'rendimiento', 'usdc', 'deposit', 'depositar'],
    response: `## 🏦 Soberana Vaults

A Vault is a **smart savings account**. Deposit USDC, receive Shares, and the algorithm invests across DeFi protocols to generate yield. No lock-ups — redeem anytime.

> *"Your money doesn't sleep. Neither should your treasury."*`,
    responseEs: `## 🏦 Soberana Vaults

Un Vault es una **cuenta de ahorro inteligente**. Deposita USDC, recibe Shares, y el algoritmo invierte en protocolos DeFi para generar rendimiento. Sin lock-ups — retira cuando quieras.

> *"Tu dinero no duerme. Tu tesorería tampoco debería."*`,
    richBlocks: [
      {
        type: 'flow-diagram',
        position: 'after',
        label: 'The Vault Lifecycle',
        data: [
          { icon: '💰', label: 'Deposit USDC', sublabel: 'Min $10' },
          { icon: '🎫', label: 'Receive Shares', sublabel: 'Proportional' },
          { icon: '🤖', label: 'Algorithm invests', sublabel: 'Orca + Hyperliquid' },
          { icon: '📈', label: 'Yield accrues', sublabel: 'Daily' },
          { icon: '💸', label: 'Redeem anytime', sublabel: 'No lock-ups' },
        ],
      },
      {
        type: 'metric-cards',
        position: 'after',
        data: [
          { label: 'Min Investment', value: 10, prefix: '$', decimals: 0 },
          { label: 'Expected APY', value: 11.4, suffix: '%', decimals: 1 },
          { label: 'Lock-up Period', value: 0, suffix: ' days', decimals: 0 },
        ],
      },
    ],
    richBlocksEs: [
      {
        type: 'flow-diagram',
        position: 'after',
        label: 'Ciclo de Vida del Vault',
        data: [
          { icon: '💰', label: 'Deposita USDC', sublabel: 'Mín $10' },
          { icon: '🎫', label: 'Recibe Shares', sublabel: 'Proporcional' },
          { icon: '🤖', label: 'Algoritmo invierte', sublabel: 'Orca + Hyperliquid' },
          { icon: '📈', label: 'Rendimiento acumula', sublabel: 'Diario' },
          { icon: '💸', label: 'Retira cuando quieras', sublabel: 'Sin lock-ups' },
        ],
      },
      {
        type: 'metric-cards',
        position: 'after',
        data: [
          { label: 'Inversión Mínima', value: 10, prefix: '$', decimals: 0 },
          { label: 'APY Esperado', value: 11.4, suffix: '%', decimals: 1 },
          { label: 'Lock-up', value: 0, suffix: ' días', decimals: 0 },
        ],
      },
    ],
    followUps: [
      'vault-how-money-grows',
      'vault-share-price',
      'vault-strategies',
      'vault-fees',
      'vault-safety',
    ],
    depth: 'beginner',
  },

  {
    id: 'vault-how-money-grows',
    topic: 'vaults',
    question: 'How does my money grow in a Vault?',
    questionEs: '¿Cómo crece mi dinero en un Vault?',
    aliases: [
      'cómo crece mi dinero',
      'vault yield',
      'how vaults generate returns',
      'rendimiento vault',
      'how do i earn',
      'how do i make money',
      'cómo gano dinero',
      'returns',
      'apy',
      'yield',
    ],
    keywords: ['yield', 'returns', 'strategies', 'orca', 'hyperliquid', 'arbitrage', 'grow', 'apy', 'interest', 'rendimiento', 'ganar'],
    response: `## 📈 How Your Money Grows

Your USDC is deployed across **three strategies simultaneously**, managed by a Python Quant Engine that evaluates market conditions every 60 seconds.`,
    responseEs: `## 📈 Cómo Crece Tu Dinero

Tu USDC se despliega en **tres estrategias simultáneamente**, gestionadas por un Motor Cuantitativo Python que evalúa condiciones de mercado cada 60 segundos.`,
    richBlocks: [
      {
        type: 'info-cards',
        position: 'after',
        data: [
          { icon: '🌊', title: 'Liquidity Provision', description: 'USDC + SOL in Orca concentrated LP pools. Earns trading fees.', metric: '~70% allocation · 8-15% APY' },
          { icon: '🛡️', title: 'Automated Hedging', description: 'Short SOL perpetuals on Hyperliquid offset LP risk.', metric: '~25% allocation · Up to 80% protection' },
          { icon: '🔄', title: 'Reserve Buffer', description: 'Liquid reserve for instant redemptions.', metric: '~5% allocation · Always available' },
        ],
      },
    ],
    richBlocksEs: [
      {
        type: 'info-cards',
        position: 'after',
        data: [
          { icon: '🌊', title: 'Provisión de Liquidez', description: 'USDC + SOL en pools LP concentrada de Orca. Gana comisiones.', metric: '~70% asignación · 8-15% APY' },
          { icon: '🛡️', title: 'Cobertura Automatizada', description: 'Short SOL perpetuos en Hyperliquid compensa riesgo LP.', metric: '~25% asignación · Hasta 80% protección' },
          { icon: '🔄', title: 'Buffer de Reserva', description: 'Reserva líquida para redenciones instantáneas.', metric: '~5% asignación · Siempre disponible' },
        ],
      },
    ],
    followUps: ['vault-what-is-lp', 'vault-what-is-hedging', 'vault-quant-engine', 'vault-share-price'],
    depth: 'intermediate',
  },

  {
    id: 'vault-what-is-lp',
    topic: 'vaults',
    subtopic: 'lp',
    question: 'What is a Liquidity Pool?',
    questionEs: '¿Qué es un Liquidity Pool?',
    aliases: [
      'qué es un liquidity pool',
      'lp explained',
      'concentrated liquidity',
      'pool de liquidez',
      'liquidity pool',
      'lp',
      'pools',
      'orca pools',
      'providing liquidity',
      'provisión de liquidez',
      'liquidity provision',
    ],
    keywords: ['liquidity', 'pool', 'lp', 'amm', 'concentrated', 'orca', 'whirlpool', 'trading', 'fees', 'swap', 'solana', 'dex'],
    response: `## 🌊 Liquidity Pools — Explained Simply

A **Liquidity Pool** is like a vending machine for crypto. Instead of a company matching buyers and sellers, a pool of tokens does it automatically.

### How it works

1. **You provide tokens** (e.g., SOL + USDC) to a pool
2. **Traders swap** using your pool (e.g., someone buys SOL with USDC)
3. **You earn a fee** on every swap (typically 0.01-0.30%)
4. Your funds stay in the pool earning fees until you withdraw

### Concentrated Liquidity (Orca Whirlpool)

In traditional pools, your money is spread across all possible prices. In **concentrated liquidity** (what Soberana uses), your money is focused in a specific **price range** — for example, SOL $120-$160.

This means:
- **Higher fees earned** — your capital is more efficient
- **But risk if price moves outside range** — your position stops earning

The Quant Engine monitors this every 60 seconds and rebalances when needed.

### The Numbers

| Metric | Typical Value |
|--------|---------------|
| Fee tier | 0.64% per swap (64 bps) |
| Price range | ±15% around current price |
| Rebalance frequency | Every 60 seconds (automated) |
| Chain | Solana (fast, cheap transactions) |`,
    responseEs: `## 🌊 Pools de Liquidez — Explicación Simple

Un **Liquidity Pool** es como una máquina expendedora de crypto. En lugar de que una empresa conecte compradores y vendedores, un pool de tokens lo hace automáticamente.

### Cómo funciona

1. **Provees tokens** (ej. SOL + USDC) a un pool
2. **Los traders intercambian** usando tu pool (ej. alguien compra SOL con USDC)
3. **Ganas una comisión** en cada swap (típicamente 0.01-0.30%)
4. Tus fondos permanecen en el pool ganando comisiones hasta que retiras

### Liquidez Concentrada (Orca Whirlpool)

En pools tradicionales, tu dinero se distribuye en todos los precios posibles. En **liquidez concentrada** (lo que usa Soberana), tu dinero se enfoca en un **rango de precio** específico — por ejemplo, SOL $120-$160.

Esto significa:
- **Más comisiones ganadas** — tu capital es más eficiente
- **Pero riesgo si el precio sale del rango** — tu posición deja de ganar

El Motor Cuantitativo monitorea esto cada 60 segundos y rebalancea cuando es necesario.

### Los Números

| Métrica | Valor Típico |
|---------|--------------|
| Tier de comisión | 0.64% por swap (64 bps) |
| Rango de precio | ±15% alrededor del precio actual |
| Frecuencia de rebalanceo | Cada 60 segundos (automatizado) |
| Cadena | Solana (transacciones rápidas y baratas) |`,
    followUps: ['vault-what-is-hedging', 'vault-impermanent-loss', 'vault-how-money-grows', 'vault-quant-engine'],
    depth: 'beginner',
  },

  {
    id: 'vault-what-is-hedging',
    topic: 'vaults',
    subtopic: 'hedging',
    question: 'What is hedging and how does it protect me?',
    questionEs: '¿Qué es hedging y cómo me protege?',
    aliases: [
      'qué es hedging',
      'cobertura',
      'hyperliquid hedging',
      'how hedge works',
      'cobertura cambiaria',
      'hedge',
      'hedging',
      'short position',
      'protección',
      'posición corta',
      'how does the hedge work',
    ],
    keywords: ['hedging', 'hedge', 'protection', 'perpetuals', 'hyperliquid', 'short', 'risk', 'cobertura', 'futures', 'protección', 'insurance'],
    response: `## 🛡️ Hedging — Your Safety Net

**Hedging** means taking an opposite position to reduce risk. In Soberana Vaults, it works like insurance.

### The Problem
When you provide liquidity with SOL + USDC, you're exposed to SOL's price movements. If SOL drops 20%, your LP position loses value (this is called **impermanent loss**).

### The Solution
The Vault simultaneously opens a **short position** on SOL perpetual futures on Hyperliquid. If SOL drops, the short position profits — offsetting your LP losses.

### How it works

| SOL price | LP position | Hedge (short) | Net result |
|-----------|------------|----------------|------------|
| SOL +10% | LP gains from fees but some IL | Hedge loses slightly | **Small positive** |
| SOL -20% | LP loses from IL | Hedge profits | **Protected (up to 80%)** |
| SOL stable | LP earns maximum fees | Hedge costs minimal | **Best scenario** |

### Key Terms
- **Perpetual futures:** Contracts that let you bet on price without expiry
- **Short position:** Profits when price goes down
- **Leverage:** Soberana uses 1x leverage (lowest risk)
- **Funding rate:** Cost of holding the position (usually small)

> The goal isn't to eliminate all risk — it's to ensure that **market volatility doesn't eat your yield**.`,
    responseEs: `## 🛡️ Hedging — Tu Red de Seguridad

**Hedging** significa tomar una posición opuesta para reducir riesgo. En Soberana Vaults, funciona como un seguro.

### El Problema
Cuando provees liquidez con SOL + USDC, estás expuesto a los movimientos de precio de SOL. Si SOL baja 20%, tu posición LP pierde valor (esto se llama **pérdida impermanente**).

### La Solución
El Vault simultáneamente abre una **posición corta** en futuros perpetuos de SOL en Hyperliquid. Si SOL baja, la posición corta gana — compensando tus pérdidas LP.

### Cómo funciona

| Precio SOL | Posición LP | Hedge (corto) | Resultado neto |
|------------|------------|----------------|----------------|
| SOL +10% | LP gana por fees pero algo de IL | Hedge pierde ligeramente | **Pequeño positivo** |
| SOL -20% | LP pierde por IL | Hedge gana | **Protegido (hasta 80%)** |
| SOL estable | LP gana máximas fees | Hedge cuesta mínimo | **Mejor escenario** |

### Términos Clave
- **Futuros perpetuos:** Contratos que permiten apostar al precio sin expiración
- **Posición corta:** Gana cuando el precio baja
- **Apalancamiento:** Soberana usa 1x (riesgo más bajo)
- **Funding rate:** Costo de mantener la posición (usualmente pequeño)

> El objetivo no es eliminar todo el riesgo — es asegurar que **la volatilidad del mercado no se coma tu rendimiento**.`,
    followUps: ['vault-impermanent-loss', 'vault-what-is-lp', 'vault-safety', 'vault-quant-engine'],
    depth: 'beginner',
  },

  {
    id: 'vault-impermanent-loss',
    topic: 'vaults',
    subtopic: 'il',
    question: 'What is impermanent loss?',
    questionEs: '¿Qué es impermanent loss?',
    aliases: [
      'qué es impermanent loss',
      'il explained',
      'pérdida impermanente',
      'impermanent loss',
      'what is il',
      'divergence loss',
      'lp risk',
      'riesgo de liquidez',
    ],
    keywords: ['impermanent', 'loss', 'il', 'risk', 'lp', 'divergence', 'pérdida', 'price', 'move', 'withdraw'],
    response: `## ⚠️ Impermanent Loss — The LP Risk

**Impermanent Loss (IL)** happens when the price of tokens in your liquidity pool changes compared to when you deposited. The greater the price change, the greater the loss.

### Why does it happen?

When you deposit SOL + USDC into a pool at $140/SOL:
- If SOL goes to $200 → the pool rebalances, and you end up with **less SOL** and **more USDC** than if you had just held
- If SOL drops to $100 → you end up with **more SOL** (now worth less) and **less USDC**

In both cases, you'd have been better off simply holding the tokens.

### Why is it called "impermanent"?

Because if the price returns to its original value, the loss disappears. It only becomes **permanent** if you withdraw while the price is different.

### How Soberana Mitigates It

1. **Concentrated range** — Position only within ±15%, limiting exposure
2. **Automated hedging** — Hyperliquid shorts offset SOL price drops
3. **60-second monitoring** — Quant Engine detects regime changes and can exit positions fast
4. **Trading fees offset** — The yield from fees often exceeds the IL

> In practice, Soberana's strategies are designed so that **trading fees + hedge profits > impermanent loss** in most market conditions.`,
    responseEs: `## ⚠️ Pérdida Impermanente — El Riesgo del LP

**Impermanent Loss (IL)** ocurre cuando el precio de los tokens en tu pool de liquidez cambia respecto a cuando depositaste. Cuanto mayor sea el cambio de precio, mayor la pérdida.

### ¿Por qué ocurre?

Cuando depositas SOL + USDC en un pool a $140/SOL:
- Si SOL sube a $200 → el pool rebalancea, y terminas con **menos SOL** y **más USDC** que si hubieras simplemente mantenido
- Si SOL baja a $100 → terminas con **más SOL** (ahora vale menos) y **menos USDC**

En ambos casos, habrías estado mejor simplemente manteniendo los tokens.

### ¿Por qué se llama "impermanente"?

Porque si el precio regresa a su valor original, la pérdida desaparece. Solo se vuelve **permanente** si retiras mientras el precio es diferente.

### Cómo Soberana lo Mitiga

1. **Rango concentrado** — Posición solo dentro de ±15%, limitando exposición
2. **Cobertura automatizada** — Shorts en Hyperliquid compensan caídas de SOL
3. **Monitoreo cada 60 segundos** — El Motor Cuantitativo detecta cambios de régimen y puede salir rápido
4. **Las fees compensan** — El rendimiento por comisiones frecuentemente supera el IL

> En la práctica, las estrategias de Soberana están diseñadas para que **comisiones de trading + ganancias del hedge > pérdida impermanente** en la mayoría de condiciones de mercado.`,
    followUps: ['vault-what-is-hedging', 'vault-what-is-lp', 'vault-safety'],
    depth: 'beginner',
  },

  {
    id: 'vault-share-price',
    topic: 'vaults',
    subtopic: 'nav',
    question: 'What are Shares and how is the price calculated?',
    questionEs: '¿Qué son las Shares y cómo se calcula el precio?',
    aliases: [
      'qué son las shares',
      'nav explained',
      'share price',
      'precio de la share',
      'net asset value',
      'shares',
      'nav',
      'how is nav calculated',
      'cómo se calcula el nav',
      'valor de las shares',
    ],
    keywords: ['shares', 'nav', 'net', 'asset', 'value', 'price', 'calculation', 'tvl', 'acciones', 'precio', 'valor'],
    response: `## 📊 Shares & NAV

When you invest, you receive **Shares** — your proportional ownership. The price is calculated from the **NAV (Net Asset Value)**: total vault assets divided by shares outstanding.

> All calculations use \`numeric(28,18)\` precision — zero float operations.`,
    responseEs: `## 📊 Shares & NAV

Cuando inviertes, recibes **Shares** — tu propiedad proporcional. El precio se calcula del **NAV (Valor Neto de Activos)**: activos totales del vault divididos por shares en circulación.

> Todos los cálculos usan precisión \`numeric(28,18)\` — cero operaciones float.`,
    richBlocks: [
      {
        type: 'metric-cards',
        position: 'after',
        data: [
          { label: 'Share Price', value: 10.82, prefix: '$', decimals: 2 },
          { label: 'Your Shares', value: 92.42, decimals: 2 },
          { label: 'Your Value', value: 1000, prefix: '$', decimals: 0 },
        ],
      },
    ],
    richBlocksEs: [
      {
        type: 'metric-cards',
        position: 'after',
        data: [
          { label: 'Precio Share', value: 10.82, prefix: '$', decimals: 2 },
          { label: 'Tus Shares', value: 92.42, decimals: 2 },
          { label: 'Tu Valor', value: 1000, prefix: '$', decimals: 0 },
        ],
      },
    ],
    followUps: ['vault-how-money-grows', 'vault-invest-flow', 'vault-fees', 'vault-precision'],
    depth: 'intermediate',
  },

  {
    id: 'vault-invest-flow',
    topic: 'vaults',
    subtopic: 'invest',
    question: 'How does investing in a Vault work step by step?',
    questionEs: '¿Cómo funciona invertir en un Vault paso a paso?',
    aliases: [
      'cómo invertir',
      'invest flow',
      'deposit flow',
      'paso a paso inversión',
      'how to invest',
      'how to deposit',
      'cómo depositar',
      'invertir en vault',
    ],
    keywords: ['invest', 'deposit', 'flow', 'steps', 'bridge', 'shares', 'transaction', 'depositar', 'invertir', 'proceso'],
    response: `## 💰 Investment Flow

Investing in a Vault is a **6-step process** from deposit to confirmation. Shares are credited optimistically for instant UX — if Bridge.xyz fails, the system reverses everything automatically.`,
    responseEs: `## 💰 Flujo de Inversión

Invertir en un Vault es un **proceso de 6 pasos** desde el depósito hasta la confirmación. Las shares se acreditan de manera optimista para UX instantáneo — si Bridge.xyz falla, el sistema reversa todo automáticamente.`,
    richBlocks: [
      {
        type: 'step-list',
        position: 'after',
        data: [
          { icon: '1️⃣', title: 'Send USDC', description: 'POST /vaults/:slug/invest — JWT validates identity' },
          { icon: '2️⃣', title: 'Validations pass', description: 'KYC approved, vault active, NAV fresh (≤60s), minimum met' },
          { icon: '3️⃣', title: 'Shares calculated', description: '1000 USDC ÷ $10.82 = 92.42 shares' },
          { icon: '4️⃣', title: 'Bridge.xyz transfer', description: 'USDC moves from your wallet to vault master wallet' },
          { icon: '5️⃣', title: 'Shares credited', description: 'Optimistically — before Bridge confirms (instant UX)' },
          { icon: '✅', title: 'Webhook confirms', description: 'Bridge.xyz webhook → transaction CONFIRMED' },
        ],
      },
    ],
    richBlocksEs: [
      {
        type: 'step-list',
        position: 'after',
        data: [
          { icon: '1️⃣', title: 'Envía USDC', description: 'POST /vaults/:slug/invest — JWT valida identidad' },
          { icon: '2️⃣', title: 'Validaciones pasan', description: 'KYC aprobado, vault activo, NAV fresco (≤60s), mínimo cumplido' },
          { icon: '3️⃣', title: 'Shares calculadas', description: '1000 USDC ÷ $10.82 = 92.42 shares' },
          { icon: '4️⃣', title: 'Transferencia Bridge.xyz', description: 'USDC se mueve de tu wallet al wallet master del vault' },
          { icon: '5️⃣', title: 'Shares acreditadas', description: 'Optimistamente — antes de que Bridge confirme (UX instantáneo)' },
          { icon: '✅', title: 'Webhook confirma', description: 'Webhook Bridge.xyz → transacción CONFIRMADA' },
        ],
      },
    ],
    followUps: ['vault-redeem-flow', 'vault-share-price', 'vault-precision', 'vault-webhooks'],
    depth: 'technical',
  },

  {
    id: 'vault-redeem-flow',
    topic: 'vaults',
    subtopic: 'redeem',
    question: 'How does redeeming/withdrawing from a Vault work?',
    questionEs: '¿Cómo funciona retirar de un Vault?',
    aliases: [
      'cómo retirar',
      'redeem flow',
      'withdraw',
      'cashout vault',
      'rescate',
      'how to withdraw',
      'cómo sacar mi dinero',
      'get my money out',
      'withdrawal',
    ],
    keywords: ['redeem', 'withdraw', 'cashout', 'shares', 'usdc', 'flow', 'retirar', 'sacar', 'retiro', 'liquidar'],
    response: `## 💸 Redeem Flow — Getting Your Money Back

### Step by Step

1. **You send:** \`POST /vaults/{id}/redeem\` with \`{ sharesAmount: 50 }\` OR \`{ amountUsd: 500 }\`
2. **Same validations** as invest (KYC, active, vault active, NAV fresh)
3. **Load your shares** with pessimistic lock
4. **Calculate redemption:** \`50 shares × $10.82 = $541.00 USDC\`
5. **Shares debited optimistically** — prevents double-spend
6. **TVL reduced** accordingly
7. **Bridge.xyz transfer** from vault master wallet to your wallet
8. **If Bridge fails** → shares re-credited immediately (inline rollback)
9. **Response:** \`202 Accepted\`

### Key Differences from Invest

| Aspect | Invest | Redeem |
|--------|--------|--------|
| Input | Amount in USDC | Amount in Shares OR USDC |
| Optimistic update | Credit shares before confirmation | Debit shares before confirmation |
| On failure | Reverse share credit | Re-credit shares |
| Settlement | Mint new shares | Burn existing shares |

### No Lock-ups
You can redeem at any time. There's no minimum holding period.

**Important limitation:** If vault reserves are insufficient to cover a large redemption (because capital is deployed in Orca/Hyperliquid), the system doesn't yet automatically unwind DeFi positions. This is planned for Phase 2.`,
    responseEs: `## 💸 Flujo de Retiro — Recuperando Tu Dinero

### Paso a Paso

1. **Envías:** \`POST /vaults/{id}/redeem\` con \`{ sharesAmount: 50 }\` O \`{ amountUsd: 500 }\`
2. **Mismas validaciones** que inversión (KYC, activa, vault activo, NAV fresco)
3. **Cargar tus shares** con lock pesimista
4. **Calcular redención:** \`50 shares × $10.82 = $541.00 USDC\`
5. **Shares debitadas de manera optimista** — previene doble gasto
6. **TVL reducido** acorde
7. **Transferencia Bridge.xyz** del wallet master del vault a tu wallet
8. **Si Bridge falla** → shares re-acreditadas inmediatamente (rollback inline)
9. **Respuesta:** \`202 Accepted\`

### Diferencias Clave vs Inversión

| Aspecto | Inversión | Retiro |
|---------|-----------|--------|
| Input | Monto en USDC | Monto en Shares O USDC |
| Update optimista | Acreditar shares antes de confirmar | Debitar shares antes de confirmar |
| En fallo | Reversar crédito de shares | Re-acreditar shares |
| Liquidación | Crear nuevas shares | Quemar shares existentes |

### Sin Lock-ups
Puedes retirar en cualquier momento. No hay período mínimo de tenencia.`,
    followUps: ['vault-invest-flow', 'vault-share-price', 'vault-fees', 'vault-safety'],
    depth: 'technical',
  },

  {
    id: 'vault-fees',
    topic: 'vaults',
    subtopic: 'fees',
    question: 'What fees do Vaults charge?',
    questionEs: '¿Qué comisiones cobran los Vaults?',
    aliases: [
      'comisiones vault',
      'vault fees',
      'management fee',
      'performance fee',
      'costos vault',
      'how much does it cost',
      'cuánto cuesta',
      'cuánto cobran',
      'vault pricing',
      'fees',
    ],
    keywords: ['fees', 'management', 'performance', 'cost', 'charges', 'comisiones', 'pricing', '2%', '20%', 'costo', 'cobro'],
    response: `## 💵 Vault Fees — Transparent and Fair

| Fee | Rate | How it works |
|-----|------|-------------|
| **Management Fee** | 2% annual | Deducted daily from the Vault's NAV. Already reflected in the share price — you don't pay it separately. |
| **Performance Fee** | 20% on profits | Only charged on gains. If the Vault doesn't make money, you pay nothing. |

### Concrete Example

You invest **$10,000**. After 1 year, the Vault earns **12% gross** ($1,200):

| Item | Amount |
|------|--------|
| Gross return | $1,200 (12%) |
| Management fee | -$200 (2% of $10,000) |
| Net gain before perf fee | $1,000 |
| Performance fee | -$200 (20% of $1,000) |
| **Your net return** | **$800 (8% net yield)** |

### How Fees Are Collected

Fees are embedded in the NAV calculation — they reduce the share price slightly each day. You never see a separate fee charge or transaction. This is the industry-standard approach used by all major funds.

> No hidden fees. No entry fees. No exit fees. No lock-up penalties.`,
    responseEs: `## 💵 Comisiones del Vault — Transparentes y Justas

| Comisión | Tasa | Cómo funciona |
|----------|------|---------------|
| **Comisión de Gestión** | 2% anual | Se deduce diariamente del NAV del Vault. Ya reflejada en el precio de la share — no la pagas por separado. |
| **Comisión de Rendimiento** | 20% sobre ganancias | Solo se cobra sobre ganancias. Si el Vault no genera dinero, no pagas nada. |

### Ejemplo Concreto

Inviertes **$10,000**. Después de 1 año, el Vault gana **12% bruto** ($1,200):

| Concepto | Monto |
|----------|-------|
| Retorno bruto | $1,200 (12%) |
| Comisión de gestión | -$200 (2% de $10,000) |
| Ganancia neta antes de perf fee | $1,000 |
| Comisión de rendimiento | -$200 (20% de $1,000) |
| **Tu retorno neto** | **$800 (8% rendimiento neto)** |

### Cómo se Cobran las Comisiones

Las comisiones están embebidas en el cálculo del NAV — reducen ligeramente el precio de la share cada día. Nunca ves un cargo o transacción separada. Este es el enfoque estándar de la industria usado por los principales fondos.

> Sin comisiones ocultas. Sin comisión de entrada. Sin comisión de salida. Sin penalidades por lock-up.`,
    followUps: ['vault-share-price', 'what-are-vaults', 'vault-safety'],
    depth: 'beginner',
  },

  {
    id: 'vault-strategies',
    topic: 'vaults',
    subtopic: 'strategies',
    question: 'What strategies do the Vaults use?',
    questionEs: '¿Qué estrategias usan los Vaults?',
    aliases: [
      'estrategias vault',
      'vault investment strategies',
      'orca strategy',
      'vault strategy',
      'strategies',
      'investment strategy',
      'estrategia de inversión',
      'cómo invierten los vaults',
    ],
    keywords: ['strategies', 'orca', 'whirlpool', 'hyperliquid', 'quant', 'algorithm', 'estrategias', 'cash', 'carry', 'perpetual', 'concentrated'],
    response: `## 🧠 Vault Strategies

### Strategy 1: Concentrated Liquidity (Orca Whirlpool)

The primary yield source. Deposits SOL + USDC into Orca's concentrated liquidity pools on Solana.

- **Pair:** SOL/USDC
- **Price range:** Dynamically set (e.g., $120-$160)
- **Fee tier:** 64 bps (0.64% per swap)
- **Income:** Trading fees from every swap through the pool

### Strategy 2: Perpetual Hedging (Hyperliquid)

Risk mitigation layer. Opens short SOL positions to protect against price drops.

- **Instrument:** SOL perpetual futures
- **Leverage:** 1x (lowest risk)
- **Direction:** Typically short (to offset LP long exposure)
- **Income:** Funding rates (when positive)

### Strategy 3: Cash & Carry (Planned)

Arbitrage between spot and futures prices. Buy SOL spot + short futures = risk-free yield from the spread.

### Decision Engine: Python Quant Brain

The quantitative engine (\`MS_soberana_quant\`) evaluates every 60 seconds:

1. **Market regime detection** — bull, bear, lateral, high volatility
2. **Risk assessment** — low / medium / high + confidence score
3. **Deployment decision** — DEPLOY_ORCA, DEPLOY_HYPERLIQUID, REBALANCE, WITHDRAW, or HOLD
4. **Zero Trust validation** — Node.js validates Python's suggested amount never exceeds \`maxDeploymentPct\` of reserves

All financial values transmitted as **strings** via gRPC Protobuf — zero float operations.`,
    responseEs: `## 🧠 Estrategias del Vault

### Estrategia 1: Liquidez Concentrada (Orca Whirlpool)

Fuente principal de rendimiento. Deposita SOL + USDC en pools de liquidez concentrada de Orca en Solana.

- **Par:** SOL/USDC
- **Rango de precio:** Dinámico (ej. $120-$160)
- **Tier de comisión:** 64 bps (0.64% por swap)
- **Ingreso:** Comisiones de trading de cada swap

### Estrategia 2: Cobertura con Perpetuos (Hyperliquid)

Capa de mitigación de riesgo. Abre posiciones cortas en SOL para proteger contra caídas de precio.

- **Instrumento:** Futuros perpetuos de SOL
- **Apalancamiento:** 1x (riesgo más bajo)
- **Dirección:** Típicamente corto (para compensar exposición larga del LP)
- **Ingreso:** Funding rates (cuando son positivos)

### Estrategia 3: Cash & Carry (Planeada)

Arbitraje entre precios spot y futuros. Comprar SOL spot + shortear futuros = rendimiento libre de riesgo del spread.

### Motor de Decisión: Python Quant Brain

El motor cuantitativo (\`MS_soberana_quant\`) evalúa cada 60 segundos:

1. **Detección de régimen de mercado** — alcista, bajista, lateral, alta volatilidad
2. **Evaluación de riesgo** — bajo / medio / alto + score de confianza
3. **Decisión de despliegue** — DEPLOY_ORCA, DEPLOY_HYPERLIQUID, REBALANCE, WITHDRAW o HOLD
4. **Validación Zero Trust** — Node.js valida que el monto sugerido por Python nunca exceda \`maxDeploymentPct\` de reservas`,
    followUps: ['vault-quant-engine', 'vault-what-is-lp', 'vault-what-is-hedging', 'vault-how-money-grows'],
    depth: 'intermediate',
  },

  {
    id: 'vault-quant-engine',
    topic: 'vaults',
    subtopic: 'quant',
    question: 'How does the Quant Engine work?',
    questionEs: '¿Cómo funciona el Motor Cuantitativo?',
    aliases: [
      'motor cuantitativo',
      'python quant brain',
      'decision engine',
      'grpc engine',
      'quant engine',
      'quant',
      'python engine',
      'grpc',
      'como funciona el quant engine',
      'quantitative engine',
      'motor de decisión',
    ],
    keywords: ['quant', 'python', 'grpc', 'brain', 'strategy', 'deployment', 'decision', 'engine', 'cron', 'rebalance', 'deploy_orca', 'motor'],
    response: `## 🧬 The Quant Engine — Python Decision Brain

The Quant Engine is a separate Python microservice that makes all investment decisions via **gRPC**.

### Architecture

\`\`\`
Node.js (NestJS) ──gRPC──→ Python (gRPC Server)
     Port 3001                    Port 50051
     Orchestrator                 QuantBrainService
\`\`\`

### Decision Flow (every 60 seconds)

1. **Cron fires** on Node.js → \`@Cron(EVERY_MINUTE)\`
2. **For each active vault**, Node.js builds a \`VaultDeploymentRequest\`:
   - TVL, deployed capital, liquid reserves
   - Current SOL price, LP range bounds
   - Price history, hedge state
3. **gRPC call** to Python with 5-second timeout
4. **Python evaluates:** \`VaultStrategy.evaluate()\`:
   - Check minimum reserves
   - Detect market regime (bull/bear/lateral/volatile)
   - Calculate risk level and confidence score
   - Decide: DEPLOY_ORCA, DEPLOY_HYPERLIQUID, REBALANCE, WITHDRAW, or HOLD
5. **Response validated** by Node.js (Zero Trust — amount capped at \`maxDeploymentPct\`)
6. **Execute** on Orca or Hyperliquid

### Precision Chain

| Layer | Technology | Precision |
|-------|-----------|-----------|
| Database | PostgreSQL | \`numeric(28,18)\` |
| Backend | Decimal.js | 28+ digits (string) |
| gRPC transport | Protobuf \`string\` | Zero loss |
| Python | \`decimal.Decimal\` | 28 digits |

> **Zero float operations** in the entire financial chain. Every number is a string until the final protocol call.`,
    responseEs: `## 🧬 El Motor Cuantitativo — Cerebro de Decisión Python

El Motor Cuantitativo es un microservicio Python separado que toma todas las decisiones de inversión vía **gRPC**.

### Arquitectura

\`\`\`
Node.js (NestJS) ──gRPC──→ Python (Servidor gRPC)
     Puerto 3001                   Puerto 50051
     Orquestador                   QuantBrainService
\`\`\`

### Flujo de Decisión (cada 60 segundos)

1. **Cron se dispara** en Node.js → \`@Cron(EVERY_MINUTE)\`
2. **Para cada vault activo**, Node.js construye un \`VaultDeploymentRequest\`:
   - TVL, capital desplegado, reservas líquidas
   - Precio actual de SOL, límites del rango LP
   - Historial de precios, estado del hedge
3. **Llamada gRPC** a Python con timeout de 5 segundos
4. **Python evalúa:** \`VaultStrategy.evaluate()\`:
   - Verificar reservas mínimas
   - Detectar régimen de mercado (alcista/bajista/lateral/volátil)
   - Calcular nivel de riesgo y score de confianza
   - Decidir: DEPLOY_ORCA, DEPLOY_HYPERLIQUID, REBALANCE, WITHDRAW o HOLD
5. **Respuesta validada** por Node.js (Zero Trust — monto limitado a \`maxDeploymentPct\`)
6. **Ejecutar** en Orca o Hyperliquid

### Cadena de Precisión

| Capa | Tecnología | Precisión |
|------|-----------|-----------|
| Base de datos | PostgreSQL | \`numeric(28,18)\` |
| Backend | Decimal.js | 28+ dígitos (string) |
| Transporte gRPC | Protobuf \`string\` | Cero pérdida |
| Python | \`decimal.Decimal\` | 28 dígitos |

> **Cero operaciones float** en toda la cadena financiera. Cada número es un string hasta la llamada final al protocolo.`,
    followUps: ['vault-strategies', 'vault-precision', 'vault-invest-flow', 'vault-safety'],
    depth: 'technical',
  },

  {
    id: 'vault-precision',
    topic: 'vaults',
    subtopic: 'precision',
    question: 'How precise are the financial calculations?',
    questionEs: '¿Qué tan precisos son los cálculos financieros?',
    aliases: [
      'precisión financiera',
      'decimal precision',
      'numeric calculations',
      'financial precision',
      'precision',
      'float',
      'cálculos financieros',
      'decimal.js',
      'zero float',
    ],
    keywords: ['precision', 'decimal', 'numeric', 'float', 'financial', '28', 'decimaljs', 'string', 'postgresql', 'concurrency'],
    response: `## 🔢 Financial Precision — Zero Float Operations

Soberana uses **institutional-grade** decimal precision across the entire stack.

### The Rule: No Floats Allowed

JavaScript's \`number\` type uses IEEE 754 floating point — which means \`0.1 + 0.2 = 0.30000000000000004\`. In finance, this is unacceptable.

### End-to-End Precision Chain

| Layer | Technology | Type |
|-------|-----------|------|
| PostgreSQL | \`numeric(28,18)\` | SQL string |
| TypeScript | \`Decimal.js\` | \`.toFixed(18)\` string |
| gRPC transport | Protobuf \`string\` fields | UTF-8 strings |
| Python | \`decimal.Decimal\` | \`getcontext().prec = 28\` |
| Bridge.xyz API | 2 decimal places | \`amount.toFixed(2)\` |

### In Practice

\`\`\`
Shares calculation:
1000.000000000000000000 USDC ÷ 10.820000000000000000 price
= 92.421441774491682070 shares (18 decimal places)
\`\`\`

The only place where precision is reduced is at the Bridge.xyz API boundary (2 decimals), because Bridge only accepts 2-decimal amounts.

### Concurrency Protection

All financial mutations use **pessimistic write locks** (\`SELECT ... FOR UPDATE\`) to prevent race conditions. Additionally, \`@VersionColumn()\` provides optimistic locking as a second safety layer.`,
    responseEs: `## 🔢 Precisión Financiera — Cero Operaciones Float

Soberana usa precisión decimal de **grado institucional** en todo el stack.

### La Regla: No se Permiten Floats

El tipo \`number\` de JavaScript usa IEEE 754 punto flotante — lo que significa \`0.1 + 0.2 = 0.30000000000000004\`. En finanzas, esto es inaceptable.

### Cadena de Precisión End-to-End

| Capa | Tecnología | Tipo |
|------|-----------|------|
| PostgreSQL | \`numeric(28,18)\` | String SQL |
| TypeScript | \`Decimal.js\` | String \`.toFixed(18)\` |
| Transporte gRPC | Campos \`string\` Protobuf | Strings UTF-8 |
| Python | \`decimal.Decimal\` | \`getcontext().prec = 28\` |
| Bridge.xyz API | 2 decimales | \`amount.toFixed(2)\` |

### En la Práctica

\`\`\`
Cálculo de shares:
1000.000000000000000000 USDC ÷ 10.820000000000000000 precio
= 92.421441774491682070 shares (18 decimales)
\`\`\`

El único lugar donde se reduce la precisión es en la frontera con Bridge.xyz (2 decimales), porque Bridge solo acepta montos con 2 decimales.

### Protección de Concurrencia

Todas las mutaciones financieras usan **pessimistic write locks** (\`SELECT ... FOR UPDATE\`) para prevenir condiciones de carrera. Además, \`@VersionColumn()\` provee locking optimista como segunda capa de seguridad.`,
    followUps: ['vault-quant-engine', 'vault-invest-flow', 'vault-share-price'],
    depth: 'technical',
  },

  {
    id: 'vault-safety',
    topic: 'vaults',
    subtopic: 'safety',
    question: 'Is my money safe in the Vaults?',
    questionEs: '¿Está seguro mi dinero en los Vaults?',
    aliases: [
      'es seguro invertir',
      'vault risks',
      'vault security',
      'riesgos',
      'seguridad vault',
      'is it safe',
      'are vaults safe',
      'es seguro',
      'qué riesgos hay',
      'risks',
      'safe',
    ],
    keywords: ['safety', 'security', 'risk', 'protection', 'audit', 'bridge', 'custody', 'seguro', 'riesgo', 'kill', 'switch', 'safeguard'],
    response: `## 🛡️ Vault Security

DeFi carries inherent risk, but Soberana has **multiple safety layers** protecting your capital at every level — from smart contract audits to automated kill switches.

> ⚠️ Past performance doesn't guarantee future results.`,
    responseEs: `## 🛡️ Seguridad del Vault

DeFi conlleva riesgo inherente, pero Soberana tiene **múltiples capas de seguridad** protegiendo tu capital en cada nivel — desde auditorías de smart contracts hasta kill switches automáticos.

> ⚠️ Rendimiento pasado no garantiza resultados futuros.`,
    richBlocks: [
      {
        type: 'risk-grid',
        position: 'after',
        data: [
          { risk: 'Smart contract bug', riskDescription: 'Protocol vulnerability', safeguard: 'Audited protocols', safeguardDescription: 'Orca & Hyperliquid — billions in TVL' },
          { risk: 'Market crash', riskDescription: 'Sudden price drop', safeguard: 'Auto-hedging', safeguardDescription: 'Exit positions in seconds' },
          { risk: 'Liquidity crunch', riskDescription: "Can't redeem", safeguard: '5% reserve buffer', safeguardDescription: 'Instant redemptions guaranteed' },
          { risk: 'Over-deployment', riskDescription: 'Too much exposure', safeguard: 'Zero Trust cap', safeguardDescription: 'Max 50% reserves per cycle' },
        ],
      },
    ],
    richBlocksEs: [
      {
        type: 'risk-grid',
        position: 'after',
        data: [
          { risk: 'Bug smart contract', riskDescription: 'Vulnerabilidad de protocolo', safeguard: 'Protocolos auditados', safeguardDescription: 'Orca & Hyperliquid — miles de millones en TVL' },
          { risk: 'Crash de mercado', riskDescription: 'Caída súbita de precio', safeguard: 'Cobertura automática', safeguardDescription: 'Sale de posiciones en segundos' },
          { risk: 'Crisis de liquidez', riskDescription: 'No puede redimir', safeguard: '5% buffer reserva', safeguardDescription: 'Redenciones instantáneas garantizadas' },
          { risk: 'Sobre-despliegue', riskDescription: 'Demasiada exposición', safeguard: 'Límite Zero Trust', safeguardDescription: 'Máx 50% reservas por ciclo' },
        ],
      },
    ],
    followUps: ['vault-precision', 'vault-quant-engine', 'what-are-vaults', 'vault-fees'],
    depth: 'intermediate',
  },

  {
    id: 'vault-webhooks',
    topic: 'vaults',
    subtopic: 'webhooks',
    question: 'How do Bridge.xyz webhooks work?',
    questionEs: '¿Cómo funcionan los webhooks de Bridge.xyz?',
    aliases: [
      'webhooks bridge',
      'transfer confirmation',
      'webhook flow',
      'bridge webhooks',
      'bridge.xyz',
      'bridge xyz',
      'how bridge works',
      'cómo funciona bridge',
    ],
    keywords: ['webhook', 'bridge', 'confirmation', 'transfer', 'async', 'callback', 'fiat', 'onramp', 'offramp'],
    response: `## 🔗 Bridge.xyz Webhooks — Transfer Lifecycle

When a USDC transfer is initiated via Bridge.xyz, the confirmation happens asynchronously via webhooks.

### Webhook Events

| Event | Handler | Action |
|-------|---------|--------|
| \`bridge.transfer.completed\` | \`confirmTransaction()\` | Marks transaction as CONFIRMED |
| \`bridge.transfer.failed\` | \`failTransaction()\` | Reverses shares, restores TVL |
| \`bridge.transfer.updated\` | Logging only | Tracks intermediate states |

### Confirm Flow
1. Lock transaction with pessimistic write
2. If already CONFIRMED → return (idempotent)
3. Set status = \`CONFIRMED\`, confirmedAt = now
4. No ledger changes (shares were already credited optimistically)

### Fail Flow
1. Lock transaction with pessimistic write
2. If already CONFIRMED → return (don't reverse a confirmed tx)
3. If PROCESSING → reverse the optimistic update:
   - **For INVEST:** subtract shares, reduce TVL
   - **For REDEEM:** re-credit shares, restore TVL
4. Set status = \`FAILED\`, failureReason = reason

### Error Handling
If the handler itself fails → enqueue to Dead Letter Queue (\`WebhookDlqService\`) for manual reconciliation.`,
    responseEs: `## 🔗 Webhooks de Bridge.xyz — Ciclo de Vida de Transferencia

Cuando una transferencia USDC se inicia vía Bridge.xyz, la confirmación ocurre asincrónicamente vía webhooks.

### Eventos de Webhook

| Evento | Handler | Acción |
|--------|---------|--------|
| \`bridge.transfer.completed\` | \`confirmTransaction()\` | Marca transacción como CONFIRMED |
| \`bridge.transfer.failed\` | \`failTransaction()\` | Reversa shares, restaura TVL |
| \`bridge.transfer.updated\` | Solo logging | Rastrea estados intermedios |

### Flujo de Confirmación
1. Bloquear transacción con write pesimista
2. Si ya está CONFIRMED → retornar (idempotente)
3. Establecer status = \`CONFIRMED\`, confirmedAt = ahora
4. Sin cambios en el ledger (shares ya fueron acreditadas de forma optimista)

### Flujo de Fallo
1. Bloquear transacción con write pesimista
2. Si ya está CONFIRMED → retornar (no reversar una tx confirmada)
3. Si PROCESSING → reversar la actualización optimista:
   - **Para INVEST:** restar shares, reducir TVL
   - **Para REDEEM:** re-acreditar shares, restaurar TVL
4. Establecer status = \`FAILED\`, failureReason = razón

### Manejo de Errores
Si el handler mismo falla → encolar en Dead Letter Queue (\`WebhookDlqService\`) para reconciliación manual.`,
    followUps: ['vault-invest-flow', 'vault-redeem-flow', 'vault-precision'],
    depth: 'technical',
  },

  // ─── MANIFESTO ───────────────────────────────────────────────
  {
    id: 'what-is-manifesto',
    topic: 'manifesto',
    question: 'What is the Soberana Manifesto?',
    questionEs: '¿Qué es el Manifiesto de Soberana?',
    aliases: [
      'qué es el manifiesto',
      'manifesto',
      'soberana vision',
      'misión soberana',
      'manifiesto',
      'soberana principles',
      'principios de soberana',
      'visión',
      'the manifesto',
    ],
    keywords: ['manifesto', 'vision', 'mission', 'principles', 'autonomous', 'finance', 'manifiesto', 'sovereignty', 'soberanía', 'capital', 'agentic'],
    response: `## 📜 The Soberana Manifesto

### The Premise

> *"Capital should move at the speed of intent."*

Soberana is the **Autonomous Treasury Operating System** — a platform where capital velocity, intelligent automation, and financial sovereignty converge.

We redesigned the financial technology stack under one immutable premise: every dollar of corporate capital should be **earning yield, protected from risk, and instantly accessible** — simultaneously.

### Three Design Principles

**1. 🏛️ Sovereignty of Capital**
Your treasury operates under your rules. We provide infrastructure, not decisions. All flows are deterministic, auditable, and reversible.

**2. ⚡ Active Capital**
Idle capital is wasted capital. Through Soberana Vaults (ERC-4626), every dollar earns yield in DeFi while remaining liquid and available for operations.

**3. 🤖 Agentic Treasury**
Zentinel — our AI core — analyzes, predicts, and executes. It's not a dashboard you check; it's an agent that works for you 24/7.

### The Product Stack

- **Soberana Card Pro** — Corporate cards with atomic treasury integration
- **Soberana Vaults** — Autonomous yield with institutional precision
- **Soberana Zentinel** — AI-powered treasury intelligence
- **Soberana Global Connectors** — Cross-border payment infrastructure

> *"We're not building a bank. We're building the operating system for autonomous finance."*`,
    responseEs: `## 📜 El Manifiesto de Soberana

### La Premisa

> *"El capital debe moverse a la velocidad de la intención."*

Soberana es el **Sistema Operativo de Tesorería Autónoma** — una plataforma donde la velocidad del capital, la automatización inteligente y la soberanía financiera convergen.

Rediseñamos el stack de tecnología financiera bajo una premisa inmutable: cada dólar de capital corporativo debe estar **generando rendimiento, protegido del riesgo, e instantáneamente accesible** — simultáneamente.

### Tres Principios de Diseño

**1. 🏛️ Soberanía del Capital**
Tu tesorería opera bajo tus reglas. Proveemos infraestructura, no decisiones. Todos los flujos son determinísticos, auditables y reversibles.

**2. ⚡ Capital Activo**
El capital ocioso es capital desperdiciado. A través de Soberana Vaults (ERC-4626), cada dólar genera rendimiento en DeFi mientras permanece líquido y disponible para operaciones.

**3. 🤖 Tesorería Agéntica**
Zentinel — nuestro núcleo de IA — analiza, predice y ejecuta. No es un dashboard que revisas; es un agente que trabaja por ti 24/7.

### El Stack de Productos

- **Soberana Card Pro** — Tarjetas corporativas con integración atómica de tesorería
- **Soberana Vaults** — Rendimiento autónomo con precisión institucional
- **Soberana Zentinel** — Inteligencia de tesorería impulsada por IA
- **Soberana Global Connectors** — Infraestructura de pagos transfronterizos

> *"No estamos construyendo un banco. Estamos construyendo el sistema operativo de las finanzas autónomas."*`,
    followUps: ['manifesto-card-pro', 'what-are-vaults', 'what-is-sovy', 'manifesto-infrastructure'],
    depth: 'beginner',
  },

  {
    id: 'manifesto-card-pro',
    topic: 'manifesto',
    subtopic: 'card-pro',
    question: 'What is Soberana Card Pro?',
    questionEs: '¿Qué es Soberana Card Pro?',
    aliases: [
      'card pro',
      'tarjeta corporativa',
      'corporate card soberana',
      'soberana card',
      'card',
      'tarjeta',
      'corporate card',
      'debit card',
      'tarjeta de débito',
    ],
    keywords: ['card', 'pro', 'corporate', 'visa', 'atomic', 'treasury', 'tarjeta', 'mastercard', 'pos', 'payment', 'purchase'],
    response: `## 💳 Soberana Card Pro

Card Pro is a corporate card system with **atomic treasury integration**. Every card transaction triggers an instant treasury cycle:

### The Atomic Flow (400ms)

1. **Signal** — POS/e-commerce authorization request arrives (Visa/Mastercard network)
2. **Solvency Check** — Zentinel validates available balance across all accounts in <50ms
3. **Atomic Execution** — If needed, Vault shares are redeemed to cover the transaction
4. **Approval** — Card is approved with funds guaranteed

### Why it matters

Traditional corporate cards:
- Require pre-funding
- Don't earn yield while waiting
- Manual reconciliation

Card Pro:
- **Funds earn yield until the exact moment of purchase**
- Vault shares → USDC → card payment in one atomic transaction
- Real-time reconciliation with full audit trail
- No pre-funding required

> *"Every dollar earns yield right up until it's spent."*`,
    responseEs: `## 💳 Soberana Card Pro

Card Pro es un sistema de tarjetas corporativas con **integración atómica de tesorería**. Cada transacción de tarjeta activa un ciclo instantáneo de tesorería:

### El Flujo Atómico (400ms)

1. **Señal** — Llega solicitud de autorización POS/e-commerce (red Visa/Mastercard)
2. **Verificación de Solvencia** — Zentinel valida balance disponible en todas las cuentas en <50ms
3. **Ejecución Atómica** — Si es necesario, shares del Vault se redimen para cubrir la transacción
4. **Aprobación** — Tarjeta aprobada con fondos garantizados

### Por qué importa

Tarjetas corporativas tradicionales:
- Requieren pre-fondeo
- No generan rendimiento mientras esperan
- Reconciliación manual

Card Pro:
- **Los fondos generan rendimiento hasta el momento exacto de la compra**
- Vault shares → USDC → pago de tarjeta en una transacción atómica
- Reconciliación en tiempo real con auditoría completa
- Sin pre-fondeo necesario

> *"Cada dólar genera rendimiento hasta que se gasta."*`,
    followUps: ['what-is-manifesto', 'what-are-vaults', 'manifesto-infrastructure'],
    depth: 'beginner',
  },

  {
    id: 'manifesto-infrastructure',
    topic: 'manifesto',
    subtopic: 'infra',
    question: 'What infrastructure does Soberana use?',
    questionEs: '¿Qué infraestructura usa Soberana?',
    aliases: [
      'infraestructura soberana',
      'tech stack',
      'cloud architecture',
      'stack tecnológico',
      'infrastructure',
      'what tech do you use',
      'qué tecnología usan',
      'microservices',
      'microservicios',
    ],
    keywords: ['infrastructure', 'gcp', 'cloud', 'docker', 'architecture', 'infraestructura', 'nestjs', 'redis', 'postgresql', 'microservice', 'vite', 'react'],
    response: `## 🏗️ Soberana Infrastructure

### Cloud Platform: Google Cloud (GCP)

| Service | Purpose |
|---------|---------|
| Cloud Run Gen2 | Serverless compute for APIs and Zentinel |
| Cloud SQL (PostgreSQL 15) | Primary database + pgvector |
| Memorystore (Redis 7) | Cache, rate limiting, sessions |
| Cloud Storage (GCS) | Reports, assets, signed URLs |
| Artifact Registry | Docker image storage |
| Cloud Logging + Trace | Observability |

### Microservices

| Service | Stack | Port | Purpose |
|---------|-------|------|---------|
| \`suite-loopay-back\` | NestJS + TypeScript | 3000 | Main API |
| \`MS_connectors_marketplace\` | NestJS + TypeScript | 3001 | Vaults + DeFi connectors |
| \`MS_soberana_quant\` | Python + gRPC | 50051 | Quantitative engine |
| \`sovy-api\` | Hono + TypeScript | 3002 | AI agent |
| \`suite-loopay-front\` | React + Vite | 5173 | Frontend SPA |

### Key Integrations

- **Bridge.xyz** — KYC, wallets, USDC transfers
- **Orca (Solana)** — Concentrated liquidity pools
- **Hyperliquid** — Perpetual futures hedging
- **Anthropic** — Claude 3.5 Sonnet for Zentinel
- **OpenAI** — text-embedding-3-small for RAG`,
    responseEs: `## 🏗️ Infraestructura de Soberana

### Plataforma Cloud: Google Cloud (GCP)

| Servicio | Propósito |
|----------|-----------|
| Cloud Run Gen2 | Cómputo serverless para APIs y Zentinel |
| Cloud SQL (PostgreSQL 15) | Base de datos principal + pgvector |
| Memorystore (Redis 7) | Cache, rate limiting, sesiones |
| Cloud Storage (GCS) | Reportes, assets, URLs firmadas |
| Artifact Registry | Almacenamiento de imágenes Docker |
| Cloud Logging + Trace | Observabilidad |

### Microservicios

| Servicio | Stack | Puerto | Propósito |
|----------|-------|--------|-----------|
| \`suite-loopay-back\` | NestJS + TypeScript | 3000 | API principal |
| \`MS_connectors_marketplace\` | NestJS + TypeScript | 3001 | Vaults + conectores DeFi |
| \`MS_soberana_quant\` | Python + gRPC | 50051 | Motor cuantitativo |
| \`sovy-api\` | Hono + TypeScript | 3002 | Agente IA |
| \`suite-loopay-front\` | React + Vite | 5173 | Frontend SPA |

### Integraciones Clave

- **Bridge.xyz** — KYC, wallets, transferencias USDC
- **Orca (Solana)** — Pools de liquidez concentrada
- **Hyperliquid** — Cobertura con futuros perpetuos
- **Anthropic** — Claude 3.5 Sonnet para Zentinel
- **OpenAI** — text-embedding-3-small para RAG`,
    followUps: ['what-is-manifesto', 'vault-quant-engine', 'sovy-how-works'],
    depth: 'intermediate',
  },

  // ─── GENERAL ─────────────────────────────────────────────────
  {
    id: 'what-is-soberana',
    topic: 'general',
    question: 'What is Soberana?',
    questionEs: '¿Qué es Soberana?',
    aliases: [
      'qué es soberana',
      'what is loopay soberana',
      'soberana explained',
      'loopay soberana',
      'what is this',
      'qué es esto',
      'about soberana',
      'sobre soberana',
      'what is loopay',
      'qué es loopay',
    ],
    keywords: ['soberana', 'loopay', 'platform', 'autonomous', 'finance', 'plataforma', 'product', 'producto', 'company', 'empresa'],
    response: `## ✨ What is Soberana?

**Soberana** is Loopay's flagship product — the **Autonomous Treasury Operating System** for businesses.

It combines:
- **💰 Soberana Vaults** — DeFi yield for corporate capital (8-15% APY)
- **🤖 Soberana Zentinel** — AI treasury assistant powered by Claude
- **💳 Soberana Card Pro** — Corporate cards with atomic yield integration
- **🌐 Global Connectors** — Cross-border payments across LATAM, EU, and US

### The Vision

> *"Capital should move at the speed of intent."*

Instead of money sitting idle in bank accounts, Soberana puts every dollar to work — earning yield, protected from risk, instantly available, and managed by AI.

### Who is it for?
- CFOs and treasury teams
- Companies handling multi-currency operations
- Businesses with idle capital that should be earning yield
- Operations that need fast cross-border payments`,
    responseEs: `## ✨ ¿Qué es Soberana?

**Soberana** es el producto insignia de Loopay — el **Sistema Operativo de Tesorería Autónoma** para empresas.

Combina:
- **💰 Soberana Vaults** — Rendimiento DeFi para capital corporativo (8-15% APY)
- **🤖 Soberana Zentinel** — Asistente de tesorería IA impulsado por Claude
- **💳 Soberana Card Pro** — Tarjetas corporativas con integración atómica de rendimiento
- **🌐 Global Connectors** — Pagos transfronterizos en LATAM, EU y US

### La Visión

> *"El capital debe moverse a la velocidad de la intención."*

En lugar de que el dinero esté ocioso en cuentas bancarias, Soberana pone cada dólar a trabajar — generando rendimiento, protegido del riesgo, instantáneamente disponible y gestionado por IA.

### ¿Para quién es?
- CFOs y equipos de tesorería
- Empresas que manejan operaciones multi-moneda
- Negocios con capital ocioso que debería estar generando rendimiento
- Operaciones que necesitan pagos transfronterizos rápidos`,
    followUps: ['what-is-manifesto', 'what-are-vaults', 'what-is-sovy', 'manifesto-card-pro'],
    depth: 'beginner',
  },

  {
    id: 'fallback',
    topic: 'general',
    question: '',
    questionEs: '',
    aliases: [],
    keywords: [],
    response: `Hmm, I'm not sure I understand that question exactly. But I know a lot about:

- **🏦 Vaults** — How they work, strategies, yields, fees, technical details
- **🤖 Zentinel** — AI assistant capabilities, tools, architecture, security
- **📜 Manifesto** — Our vision, principles, Card Pro, infrastructure

Try one of these, or rephrase your question!`,
    responseEs: `Hmm, no estoy seguro de entender tu pregunta exactamente. Pero conozco mucho sobre:

- **🏦 Vaults** — Cómo funcionan, estrategias, rendimientos, comisiones, detalles técnicos
- **🤖 Zentinel** — Capacidades del asistente IA, herramientas, arquitectura, seguridad
- **📜 Manifiesto** — Nuestra visión, principios, Card Pro, infraestructura

¡Prueba con uno de estos, o reformula tu pregunta!`,
    followUps: ['what-is-sovy', 'what-are-vaults', 'what-is-manifesto'],
    depth: 'beginner',
  },
];
