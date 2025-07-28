# Resumen de la Base de Código SAFEIA

Para una descripción visual y detallada de la arquitectura del sistema, consulte el documento [SAFEIA_Arquitectura.md](./SAFEIA_Arquitectura.md).

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

- **Se refactorizaron `src/pages/ObligacionInformar.tsx` y `src/services/ats.ts` para que todas las llamadas a Azure OpenAI se realicen a través del backend proxy (`/api/azure/chat/completions`), eliminando la exposición directa de claves API en el frontend.**
- **Se unificó la implementación de los endpoints de backend `/api/ai/das`, `/api/ai/generate-policy` y `/api/ai/policy-suggestions` en `server/index.js` para utilizar consistentemente las funciones auxiliares `getAzureOpenAIConfig` y `callAzureOpenAI`, mejorando la modularidad y consistencia.**
- Se implementó una auditoría de seguridad y rendimiento.
- Se crearon archivos de documentación en `cline_docs` para roadmap, tareas, stack y resumen.
- Se verificó la ausencia de patrones inseguros en servicios y utilidades.
- Se documentó la necesidad de implementar pruebas automáticas y monitoreo.
- Se unificó la lógica de generación de herramientas SST (ATS, PTS, Matriz de Riesgos) usando el componente ToolGenerator.
- Se refactorizó `src/components/auth/AuthComponent.tsx` para eliminar una advertencia de TypeScript.
- Se refactorizó la inicialización de `AuthProvider` para eliminar una instancia duplicada; ahora se instancia únicamente en `main.tsx`.
- Se mejoró `AuthContext.tsx` implementando el estado `loading` en las funciones `login`, `signup` y `logout`.
- **Se implementó un backend proxy en `server/index.js` para gestionar de forma segura las llamadas a los servicios de Azure OpenAI, mitigando una vulnerabilidad crítica de exposición de claves API.**
- **Se consolidaron los servicios de IA frontend en `src/services/aiService.ts`, eliminando los archivos redundantes `openai.ts`, `azureOpenAI.ts` y el problemático `ai.ts`.**
- **Se refactorizaron `aiService.ts`, `src/hooks/useSuggestions.ts`, `src/services/investigation.ts`, `src/services/riskMatrix.ts`, `src/services/legal.ts` y `src/services/audit.ts` para usar el backend proxy y las rutas de importación correctas.**
- **Se eliminó el archivo `src/api/azure-openai.ts` y se confirmó que las claves API de Azure OpenAI no están expuestas en el frontend, ya que todas las llamadas se realizan a través del backend proxy.**
- **Se consolidó la configuración de Firebase en `src/config/firebase.ts`, eliminando el archivo redundante `src/firebase.ts` y actualizando todas las importaciones para usar la nueva ruta centralizada.**
- **Se eliminó el componente `src/components/TestConnection.vue` (componente Vue.js obsoleto en un proyecto React).**
- **Se eliminó el archivo `src/services/azure-ai.ts` y sus funciones se consolidaron en `src/services/aiService.ts`, asegurando que todas las interacciones con Azure OpenAI pasen por el backend proxy.**
- **Se simplificó la definición de rutas en `src/App.tsx` eliminando una definición duplicada de la ruta `/pricing`.**
- **Se refactorizó `src/services/braveSearchService.ts` para eliminar la implementación mock y clarificar el uso del MCP tool.**
    - **Se eliminó el archivo redundante `src/services/mcp.ts`.**
    - **Se refactorizó `src/services/agentService.ts` para eliminar datos hardcodeados y usar los endpoints del API backend (`/api/agents...`).**
    - **Se refactorizó `src/services/investigation.ts` para solicitar y procesar JSON desde la API en lugar de parsear markdown.**
    - **Se eliminó el archivo problemático y no utilizado `src/services/ai.ts`.**
    - **Se refactorizaron las páginas de herramientas que utilizan `ToolGenerator` (ej. `MatrizRiesgos.tsx`, `ATS.tsx`, `PTS.tsx`) para asegurar que importan y utilizan correctamente el servicio centralizado `src/services/aiService.ts` y manejan adecuadamente los tipos de datos para las funciones de generación, eliminando referencias a `azureOpenAI.ts` (ya eliminado).**
    - **Se configuró el backend proxy (`server/index.js`) con las variables de entorno correctas para Azure OpenAI en `server/.env`, resolviendo errores de comunicación.**
    - **Se agregaron las variables de entorno de Azure OpenAI al archivo `.env` del frontend.**
- **Se corrigió un error en `src/services/audit.ts`**: La función `generateAuditFindings` ahora maneja de forma segura los casos en que el parámetro `hallazgos` es `undefined`, previniendo un `TypeError`.
- **Se mejoró la herramienta ATS (`src/pages/herramientas/ATS.tsx` y `src/services/aiService.ts`):**
    - Se incluyó el campo "Sector Industrial" en los datos enviados al servicio de IA (`generateDAS`) para generar análisis más precisos.
    - Se actualizó la función `generateDAS` en `aiService.ts` para solicitar y procesar respuestas en formato JSON, incluyendo detalles como consecuencias y medidas preventivas para cada riesgo.
    - Se hizo más robusta la plantilla de resultados (`resultTemplate`) en `ATS.tsx` para manejar adecuadamente datos incompletos o faltantes de la IA.
- **Se mejoró la herramienta ATS (`src/pages/herramientas/ATS.tsx` y `src/services/aiService.ts`) para integrar la búsqueda de legislación aplicable:**
    - `aiService.ts` (`DASInput` y `generateDAS`) ahora puede aceptar y utilizar `legislacionAplicable` en el prompt a la IA.
    - `ATS.tsx` (`handleGenerateDAS`) está preparado conceptualmente para que el asistente realice una búsqueda de legislación (usando el MCP de Brave Search con el país y sector del formulario) y la incorpore en la generación del ATS.
- **Se resolvió un error `AzureKeyCredential` relacionado con la herramienta ATS:**
    - Se eliminó un archivo obsoleto `src/pages/ATS.tsx` que intentaba realizar llamadas directas al SDK de Azure OpenAI.
    - Se corrigió la importación en `src/App.tsx` para que la ruta `/herramientas-sst/ats` apunte correctamente a `src/pages/herramientas/ATS.tsx` (la versión actual que utiliza el backend proxy).
- **Se añadieron botones de asistencia con IA a la herramienta ATS (`src/pages/herramientas/ATS.tsx`):**
    - Se crearon nuevas funciones en `aiService.ts` (`suggestActividadesATS`, `suggestEquiposATS`, `suggestMaterialesATS`) para obtener sugerencias de IA para los campos "Actividades Principales", "Equipos/Maquinaria Utilizada" y "Materiales/Substancias".
    - `ATS.tsx` ahora pasa estas funciones de sugerencia al componente `ToolGenerator` a través de la prop `suggestionFunctions`.
    - `ToolGenerator.tsx` ya estaba equipado para mostrar botones de sugerencia (✨) y manejar la lógica de llamada para campos `textarea` cuando se le proporcionan estas funciones.
- **Se reestructuró la salida de la herramienta ATS para mostrar los resultados en formato de tabla:**
    - La interfaz `DASResponse` en `aiService.ts` fue modificada para reflejar una estructura basada en `etapas` del trabajo (cada etapa con `nombreEtapa`, `riesgosAspectosIncidentes`, `medidasPreventivas`). También se añadió `legislacionAplicableOriginal` para pasar la legislación general.
    - El prompt para la IA en la función `generateDAS` (`aiService.ts`) fue actualizado para solicitar esta nueva estructura de datos. La lógica de parseo también se hizo más robusta.
    - La función `resultTemplate` en `src/pages/herramientas/ATS.tsx` fue completamente reescrita para renderizar una tabla HTML con columnas "Etapas del trabajo", "Riesgos / Aspecto ambientales / incidentes", "Medidas Preventivas", y "Legislación Aplicable al tipo de trabajo", utilizando los datos de `result.etapas` y `result.legislacionAplicableOriginal`.
- **Se implementó la búsqueda automática de legislación para la herramienta ATS:**
    - Se creó un nuevo endpoint en el backend (`server/index.js` en la ruta `POST /api/legislation/search-ats`).
    - Este endpoint toma `pais` y `sector`, realiza una búsqueda de legislación usando Brave Search (a través de una llamada a un MCP Router local), y luego usa Azure OpenAI para resumir los resultados de búsqueda.
    - El frontend (`src/pages/herramientas/ATS.tsx`), en su función `handleGenerateDAS`, ahora llama a este endpoint para obtener la legislación aplicable de forma automática antes de generar el contenido principal del ATS.

## Integración de feedback

- El feedback del usuario se documenta y prioriza en el roadmap.
- Las tareas actuales y futuras se actualizan en `currentTask.md` y `projectRoadmap.md`.
- Se recomienda mantener esta documentación actualizada tras cada cambio relevante.
