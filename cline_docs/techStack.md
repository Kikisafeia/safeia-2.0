# Tech Stack y Decisiones Arquitectónicas

## Frontend

- **React 18**: Framework principal para la UI, moderno y eficiente.
- **Vite**: Bundler rápido, soporte para HMR y optimización de build.
- **TypeScript**: Tipado estático para mayor robustez y mantenibilidad.
- **Tailwind CSS**: Utilidades para estilos rápidos y consistentes.
- **Material UI (MUI)**: Componentes accesibles y personalizables.
- **Headless UI, Heroicons, Lucide**: Componentes y iconografía moderna.

## Backend / Servicios

- **Firebase**: Autenticación, Firestore, Storage.
- **Express-rate-limit**: Protección contra abuso de endpoints.
- **OpenAI / Azure OpenAI**: Integración de IA para generación de contenido.
- **Brave Search (MCP)**: Búsqueda de información legal y normativa en SST.
- **PayPal**: Procesamiento de pagos y suscripciones.

## Utilidades y Seguridad

- **Zod**: Validación de datos robusta.
- **dompurify**: Saneamiento de HTML para prevenir XSS.
- **JWT-decode**: Decodificación segura de tokens JWT en frontend.
- **date-fns**: Manipulación de fechas eficiente.
- **exceljs, docx, jspdf, html2canvas**: Generación y exportación de documentos.

## Decisiones clave

- Separación estricta de lógica de negocio (src/services) y utilidades (src/utils).
- Uso de variables de entorno con prefijo VITE_ para exponer solo lo necesario al frontend.
- Reglas de Firestore restrictivas: acceso mínimo necesario.
- Proxies y CORS configurados solo para orígenes de confianza.
- Sin secretos expuestos en el repositorio.
- Dependencias modernas y mantenidas.

## Justificación

- El stack prioriza seguridad, rendimiento y facilidad de mantenimiento.
- Se eligen librerías ampliamente adoptadas y con soporte activo.
- La arquitectura facilita escalabilidad y futuras integraciones.
