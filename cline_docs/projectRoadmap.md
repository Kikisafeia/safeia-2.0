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

- Revisión de servicios y utilidades: sin patrones inseguros ni malas prácticas detectadas.
- Revisión de configuración y dependencias: stack moderno, sin paquetes obsoletos ni riesgos evidentes.
- Revisión de reglas de Firestore: acceso mínimo necesario, sin exposición de datos.
- Revisión de variables de entorno: sin secretos expuestos, documentación clara.

## Consideraciones de escalabilidad

- Mantener dependencias actualizadas y seguras.
- Implementar pruebas automáticas para prevenir regresiones.
- Documentar arquitectura y decisiones técnicas.
- Monitorear el rendimiento y uso de recursos en producción.
- Revisar periódicamente reglas de seguridad y configuración de CORS.
