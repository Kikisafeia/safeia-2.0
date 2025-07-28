# SAFEIA Project Roadmap

## Objetivos de alto nivel

- Proveer una plataforma segura y eficiente para la gestión de seguridad y salud ocupacional.
- Integrar servicios de IA (Azure OpenAI, OpenAI) para generación de contenido y análisis.
- Garantizar la privacidad y seguridad de los datos de los usuarios.
- Facilitar la gestión documental y automatización de procesos SST.
- Ofrecer una experiencia de usuario moderna, accesible y escalable.

## Características clave

- Autenticación y autorización segura (Firebase Auth).
- Gestión de usuarios y antecedentes con control de acceso estricto.
- Integración con servicios de IA y generación de documentos.
- Procesamiento y almacenamiento seguro de archivos.
- Integración de pagos (PayPal).
- Validación y saneamiento de datos (Zod, dompurify).
- Limitación de peticiones (express-rate-limit).
- Interfaz moderna con React, Tailwind y MUI.

## Criterios de finalización y progreso

- [x] Configuración segura de Firestore (reglas restrictivas).
- [x] Manejo seguro de variables de entorno (sin secretos expuestos).
- [x] Uso de validación y saneamiento de datos.
- [x] Integración de limitación de peticiones.
- [x] Configuración de CORS y proxies controlados.
- [ ] Pruebas automáticas implementadas.
- [ ] Documentación técnica y de usuario completa.
- [ ] Auditoría de dependencias y actualización periódica.
- [ ] Monitoreo y logging centralizado en producción.

## Tareas completadas

- Refactorización de las interacciones con la API de Azure OpenAI para usar el proxy de backend y unificar las funciones auxiliares.
- Revisión de servicios y utilidades: sin patrones inseguros ni malas prácticas detectadas.
- Revisión de configuración y dependencias: stack moderno, sin paquetes obsoletos ni riesgos evidentes.
- Revisión de reglas de Firestore: acceso mínimo necesario, sin exposición de datos.
- Revisión de variables de entorno: sin secretos expuestos, documentación clara.
- Unificación de la lógica de generación de herramientas SST (ATS, PTS, Matriz de Riesgos) usando el componente ToolGenerator.
- Mejora de la herramienta ATS para integrar la búsqueda de legislación aplicable (vía Brave Search MCP) en la generación del Análisis de Trabajo Seguro.
- Incorporación de botones de asistencia con IA en la herramienta ATS para los campos de actividades, equipos y materiales, utilizando la funcionalidad existente de `ToolGenerator`.
- Reestructuración de la salida de la herramienta ATS para presentar los resultados en un formato de tabla detallado, mejorando la legibilidad y utilidad del análisis.
- Implementación de búsqueda automática de legislación en el backend para la herramienta ATS, utilizando Brave Search (vía MCP) y resumen con Azure OpenAI.
- Adición de variables de entorno de Azure OpenAI al archivo .env.

## Consideraciones de escalabilidad

- Mantener dependencias actualizadas y seguras.
- Implementar pruebas automáticas para prevenir regresiones.
- Documentar arquitectura y decisiones técnicas.
- Monitorear el rendimiento y uso de recursos en producción.
- Revisar periódicamente reglas de seguridad y configuración de CORS.
