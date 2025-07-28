# Tarea Actual: Unificar Paleta de Colores del Proyecto

## Objetivo

Asegurar que todas las herramientas y componentes de la aplicación SAFEIA utilicen una paleta de colores consistente y unificada, mejorando la coherencia visual y la experiencia de usuario.

## Contexto relevante

- La aplicación utiliza Tailwind CSS y Material UI (MUI) para los estilos.
- Se busca definir una paleta de colores centralizada y aplicarla en todos los elementos visuales de las herramientas y la interfaz en general.
- Esta tarea sigue a una serie de mejoras de seguridad y refactorización de la aplicación.

## Relación con el Roadmap

Esta tarea contribuye al objetivo de "Ofrecer una experiencia de usuario moderna, accesible y escalable" y mejora la consistencia visual general del proyecto.

## Pasos Planificados

1.  **Identificar Definiciones de Color Existentes**:
    *   Revisar `tailwind.config.js` para la configuración de colores de Tailwind.
    *   Localizar la configuración del tema de MUI (probablemente en `src/theme.ts`, `src/App.tsx` o `src/main.tsx`).
    *   Buscar colores hardcodeados en archivos `.tsx`, `.css` o `.scss`.
2.  **Definir la Paleta de Colores Unificada**:
    *   Proponer o solicitar al usuario una paleta de colores primaria, secundaria y de acento. Se podría tomar como referencia el logo `SAFEIA LOGO.jpg`.
3.  **Implementar la Paleta Unificada**:
    *   Actualizar `tailwind.config.js` con los nuevos colores.
    *   Actualizar la configuración del tema de MUI.
    *   Reemplazar colores hardcodeados con las nuevas definiciones de la paleta (clases de Tailwind o variables del tema MUI).
4.  **Verificar la Aplicación**:
    *   Revisar visualmente las principales herramientas y componentes para asegurar la consistencia.
5.  **Actualizar Documentación**:
    *   Actualizar `cline_docs/techStack.md` si se introducen cambios significativos en la gestión de estilos.
    *   Actualizar `cline_docs/codebaseSummary.md` para reflejar los cambios en la UI.
    *   Actualizar `cline_docs/projectRoadmap.md` para incluir la mejora de la consistencia visual.

## Tareas Completadas Recientemente

- Refactorización de las interacciones con la API de Azure OpenAI para usar el proxy de backend y unificar las funciones auxiliares.
- Adición de variables de entorno de Azure OpenAI al archivo `.env`.

## Pasos Pendientes / Próximos Pasos

- Iniciar con el Paso 1: Identificar Definiciones de Color Existentes.
