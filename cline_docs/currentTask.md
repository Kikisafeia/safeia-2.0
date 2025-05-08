# Tarea Actual: Mejorar la Funcionalidad de la Aplicación Web - Corrección de Seguridad y Mejoras Iniciales

## Objetivo

Revisar y mejorar la aplicación web, priorizando la corrección de vulnerabilidades de seguridad y abordando ineficiencias iniciales identificadas en la estructura central, proveedores de contexto, servicios de IA y enrutamiento.

## Contexto relevante

- Se inició una revisión general de la aplicación siguiendo un plan de 6 pasos.
- Se identificó una vulnerabilidad de seguridad crítica relacionada con la exposición de claves API de Azure OpenAI en el cliente.
- Se identificaron otras ineficiencias y problemas (duplicación de `AuthProvider`, estado `loading` no utilizado, redundancia en servicios AI, duplicación de ruta `/pricing`, servicio MCP mockeado, servicio `mcp.ts` redundante, inconsistencias en `agentService.ts`, parsing frágil en `investigation.ts`).

## Relación con el Roadmap

Esta tarea aborda directamente los objetivos de "Proveer una plataforma segura y eficiente", "Garantizar la privacidad y seguridad de los datos de los usuarios" y "Mejorar la mantenibilidad y robustez del sistema".

## Trabajo Realizado (Pasos Completados)

- **Paso 1 (Revisión de Lógica Existente - Parte A-J):**
    - Revisión de `cline_docs`, núcleo, servicios AI, hook `useSuggestions`, `investigation.ts`, `riskMatrix.ts`, `legal.ts`, `braveSearchService.ts`, `mcp.ts`, `agentService.ts`.
    - **Identificación de Vulnerabilidad Crítica**: Exposición de claves API de Azure OpenAI en el cliente.
    - **Identificación de Ineficiencia**: Duplicación de `AuthProvider`.
    - **Identificación de Redundancia**: Dos servicios AI.
    - **Identificación de Redundancia de Ruta**: Ruta `/pricing` duplicada.
    - **Identificación de Implementación Mock**: `braveSearchService.ts` usa datos mock.
    - **Identificación de Servicio Redundante**: `mcp.ts` no era utilizado.
    - **Identificación de Inconsistencias**: `agentService.ts` usa datos hardcodeados y llama a endpoint incorrecto.
    - **Identificación de Parsing Frágil**: `investigation.ts` usaba regex para parsear markdown.
- **Comunicación y Priorización**: Se informó al usuario sobre los hallazgos y se acordó el orden de las acciones.
- **Paso 2 (Mejorar Eficiencia y Seguridad):**
    - **Refactorización de AuthProvider**: Eliminada instancia duplicada.
    - **Mejora en AuthContext**: Implementado estado `loading`.
    - **Implementación de Backend Proxy**: Creados endpoints, refactorizados servicios frontend (`aiService.ts`, `investigation.ts`, `riskMatrix.ts`, `legal.ts`), eliminadas claves API del `.env` frontend.
    - **Consolidación de Servicios AI**: Creado `aiService.ts`, eliminados `openai.ts` y `azureOpenAI.ts`.
    - **Refactorización de Rutas**: Eliminada ruta `/pricing` duplicada.
    - **Corrección de Imports**: Actualizadas importaciones en hooks y servicios afectados.
    - **Refactorización de Brave Search Service**: Eliminada función mock, clarificado uso de MCP tool.
    - **Eliminación de Servicio Redundante**: Eliminado el archivo `src/services/mcp.ts`.
    - **Refactorización de Agent Service**: Modificado `agentService.ts` para usar API backend.
    - **Mejora de Parsing en Investigation Service**: Modificado `investigation.ts` para solicitar y procesar JSON en lugar de markdown.
- **Actualización de Documentación**: `currentTask.md` y `codebaseSummary.md` actualizados.

## Hallazgos Clave (y acciones tomadas)

1.  **VULNERABILIDAD DE SEGURIDAD CRÍTICA (Solucionada)**: Exposición de claves API de Azure OpenAI.
2.  **Ineficiencia Principal (Solucionada)**: Duplicación de `AuthProvider`.
3.  **Oportunidad de Mejora Menor (AuthContext - Solucionada)**: Estado `loading` no utilizado.
4.  **Redundancia y Consistencia (Servicios AI - Solucionada)**: Dos archivos de servicio AI.
5.  **Observación Menor (App.tsx - Solucionada)**: Ruta `/pricing` duplicada.
6.  **Implementación Mock (Brave Search - Parcialmente Resuelto)**: Servicio usaba datos mock.
    - *Acción*: Código refactorizado para indicar que la llamada real al MCP tool es necesaria.
7.  **Servicio Redundante (`mcp.ts` - Solucionado)**: Archivo no utilizado y confuso.
    - *Acción*: Eliminado.
8.  **Inconsistencia Frontend/Backend (`agentService.ts` - Solucionado)**: Usaba datos hardcodeados y llamaba a endpoint incorrecto.
    - *Acción*: Refactorizado para usar API backend.
9.  **Parsing Frágil (`investigation.ts` - Solucionado)**: Usaba regex para parsear markdown.
    - *Acción*: Refactorizado para solicitar y procesar JSON.

## Pasos Pendientes / Próximos Pasos

1.  **Actualizar `cline_docs/codebaseSummary.md`** (Última actualización pendiente para reflejar la refactorización de `investigation.ts`).
2.  **Decisión del Usuario sobre Próximos Pasos**:
    - Continuar con la revisión general de otras áreas de la aplicación (ej. otros servicios, componentes complejos).
    - Pasar a otros pasos del plan general de mejora (UX, Escalabilidad, Pruebas).
    - Detener la tarea de mejora por ahora.
