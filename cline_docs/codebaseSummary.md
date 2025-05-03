# Resumen de la Base de Código SAFEIA

## Estructura principal

- **src/components/**: Componentes de UI reutilizables (formularios, dashboards, navegación, etc.).
- **src/pages/**: Vistas principales y rutas de la aplicación.
- **src/services/**: Lógica de negocio, integración con APIs externas, manejo de datos y autenticación.
- **src/utils/**: Funciones utilitarias (cifrado, rate limiting, logging, etc.).
- **src/config/**: Configuración de Firebase y otros servicios.
- **public/**: Recursos estáticos y plantillas descargables.
- **server/**: Backend (si aplica), scripts y configuración de entorno.

## Interacción de componentes

- Los componentes de UI consumen servicios a través de hooks y contextos.
- El flujo de autenticación y autorización se gestiona con Firebase Auth y contextos de React.
- Los datos de usuario y antecedentes se almacenan y consultan en Firestore, con reglas restrictivas.
- La generación de documentos y análisis de IA se realiza mediante servicios integrados (OpenAI, Azure OpenAI).
- Los pagos y suscripciones se gestionan con PayPal y componentes dedicados.

## Flujo de datos

1. El usuario se autentica (Firebase Auth).
2. Se cargan datos y antecedentes del usuario desde Firestore.
3. El usuario interactúa con herramientas y formularios, que pueden invocar servicios de IA.
4. Los resultados se muestran en la UI y pueden exportarse como documentos.
5. Las acciones críticas (pagos, cambios de perfil, etc.) se validan y registran.

## Dependencias externas

- **Firebase**: Auth, Firestore, Storage.
- **OpenAI / Azure OpenAI**: Generación de texto e imágenes.
- **PayPal**: Procesamiento de pagos.
- **Zod, dompurify**: Validación y saneamiento.
- **MUI, Tailwind, Headless UI**: UI y estilos.

## Cambios recientes

- Se implementó una auditoría de seguridad y rendimiento.
- Se crearon archivos de documentación en `cline_docs` para roadmap, tareas, stack y resumen.
- Se verificó la ausencia de patrones inseguros en servicios y utilidades.
- Se documentó la necesidad de implementar pruebas automáticas y monitoreo.

## Integración de feedback

- El feedback del usuario se documenta y prioriza en el roadmap.
- Las tareas actuales y futuras se actualizan en `currentTask.md` y `projectRoadmap.md`.
- Se recomienda mantener esta documentación actualizada tras cada cambio relevante.
