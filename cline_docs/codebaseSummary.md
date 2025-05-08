# Resumen de la Base de Código SAFEIA

## Estructura principal

- **src/components/**: Componentes de UI reutilizables (formularios, dashboards, navegación, etc.).
- **src/pages/**: Vistas principales y rutas de la aplicación.
- **src/services/**: Lógica de negocio, integración con APIs externas, manejo de datos y autenticación. Incluye `aiService.ts` para interacciones con Azure OpenAI y `braveSearchService.ts` para búsqueda web legal (vía MCP).
- **src/utils/**: Funciones utilitarias (cifrado, rate limiting, logging, etc.).
- **src/config/**: Configuración de Firebase y otros servicios.
- **public/**: Recursos estáticos y plantillas descargables.
- **server/**: Backend Express.js que incluye un proxy para servicios externos (Dify, Azure OpenAI) y gestión de agentes.

## Interacción de componentes

- Los componentes de UI consumen servicios a través de hooks (`src/hooks/`) y contextos (`src/contexts/`).
- El flujo de autenticación y autorización se gestiona con Firebase Auth y contextos de React. El `AuthProvider` principal se encuentra en `main.tsx`.
- Los datos de usuario y antecedentes se almacenan y consultan en Firestore, con reglas restrictivas.
- La generación de documentos y análisis de IA se realiza mediante llamadas a servicios de Azure OpenAI (`aiService.ts`), ahora gestionadas a través de un backend proxy para mayor seguridad.
- La búsqueda de información legal se realiza a través de `braveSearchService.ts`, que interactúa con un MCP server (la llamada real la realiza el asistente).
- La interacción con agentes especializados (listado, estado, chat) se gestiona a través de `agentService.ts`, que ahora llama a los endpoints del backend (`/api/agents...`).
- Los pagos y suscripciones se gestionan con PayPal y componentes dedicados.

## Flujo de datos

1. El usuario se autentica (Firebase Auth, gestionado por `AuthProvider` en `main.tsx`).
2. Se cargan datos y antecedentes del usuario desde Firestore.
3. El usuario interactúa con herramientas y formularios. Las llamadas a servicios de IA (Azure OpenAI) se realizan desde `aiService.ts` (y otros servicios que lo usan) y se enrutan a través del backend proxy (`server/index.js`). Las búsquedas legales usan `braveSearchService.ts`. Las interacciones con agentes usan `agentService.ts` para comunicarse con el backend.
4. Los resultados se muestran en la UI y pueden exportarse como documentos.
5. Las acciones críticas (pagos, cambios de perfil, etc.) se validan y registran.

## Dependencias externas

- **Firebase**: Auth, Firestore, Storage.
- **OpenAI / Azure OpenAI**: Generación de texto e imágenes (accedido vía backend proxy).
- **Brave Search (MCP)**: Búsqueda web legal.
- **Dify**: Plataforma de agentes AI (accedido vía backend proxy).
- **PayPal**: Procesamiento de pagos.
- **Zod, dompurify**: Validación y saneamiento.
- **MUI, Tailwind, Headless UI**: UI y estilos.
- **Express.js (backend)**: Para el servidor proxy y otras APIs.

## Cambios recientes

- Se implementó una auditoría de seguridad y rendimiento.
- Se crearon archivos de documentación en `cline_docs` para roadmap, tareas, stack y resumen.
- Se verificó la ausencia de patrones inseguros en servicios y utilidades.
- Se documentó la necesidad de implementar pruebas automáticas y monitoreo.
- Se unificó la lógica de generación de herramientas SST (ATS, PTS, Matriz de Riesgos) usando el componente ToolGenerator.
- Se refactorizó `src/components/auth/AuthComponent.tsx` para eliminar una advertencia de TypeScript.
- Se refactorizó la inicialización de `AuthProvider` para eliminar una instancia duplicada; ahora se instancia únicamente en `main.tsx`.
- Se mejoró `AuthContext.tsx` implementando el estado `loading` en las funciones `login`, `signup` y `logout`.
- **Se implementó un backend proxy en `server/index.js` para gestionar de forma segura las llamadas a los servicios de Azure OpenAI, mitigando una vulnerabilidad crítica de exposición de claves API.**
- **Se consolidaron los servicios de IA frontend en `src/services/aiService.ts`, eliminando los archivos redundantes `openai.ts` y `azureOpenAI.ts`.**
- **Se refactorizaron `aiService.ts`, `src/hooks/useSuggestions.ts`, `src/services/investigation.ts`, `src/services/riskMatrix.ts` y `src/services/legal.ts` para usar el backend proxy y las rutas de importación correctas.**
- **Se eliminaron las claves API de Azure OpenAI del archivo `.env` del frontend.**
- **Se simplificó la definición de rutas en `src/App.tsx` eliminando una definición duplicada de la ruta `/pricing`.**
- **Se refactorizó `src/services/braveSearchService.ts` para eliminar la implementación mock y clarificar el uso del MCP tool.**
- **Se eliminó el archivo redundante `src/services/mcp.ts`.**
- **Se refactorizó `src/services/agentService.ts` para eliminar datos hardcodeados y usar los endpoints del API backend (`/api/agents...`).**
- **Se refactorizó `src/services/investigation.ts` para solicitar y procesar JSON desde la API en lugar de parsear markdown.**

## Integración de feedback

- El feedback del usuario se documenta y prioriza en el roadmap.
- Las tareas actuales y futuras se actualizan en `currentTask.md` y `projectRoadmap.md`.
- Se recomienda mantener esta documentación actualizada tras cada cambio relevante.
