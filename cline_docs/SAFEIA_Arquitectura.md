# Arquitectura de la Aplicación SAFEIA

## Resumen del Proyecto

SAFEIA es una aplicación web diseñada para la gestión integral de la Seguridad y Salud en el Trabajo (SST). La plataforma combina una interfaz de usuario moderna construida con React y un backend robusto que sirve como proxy seguro para servicios de IA y otras APIs, garantizando la seguridad y eficiencia en la gestión de datos y procesos SST.

## Diagrama de Arquitectura

```mermaid
graph TD
    subgraph "Usuario (Navegador)"
        Frontend[React App (Vite)]
    end

    subgraph "Backend (Servidor)"
        ProxyServer[Express.js Proxy Server]
    end

    subgraph "Servicios Externos"
        Firebase[Firebase (Auth, Firestore, Storage)]
        AzureOpenAI[Azure OpenAI API]
        BraveSearch[Brave Search (vía MCP)]
        PayPal[PayPal API]
    end

    Frontend --"Llamadas API (HTTPS)"--> ProxyServer
    ProxyServer --"Autenticación y Datos"--> Firebase
    ProxyServer --"Consultas de IA"--> AzureOpenAI
    ProxyServer --"Búsquedas Legales"--> BraveSearch
    Frontend --"Pagos"--> PayPal

    style Frontend fill:#6CF,stroke:#333,stroke-width:2px
    style ProxyServer fill:#9F6,stroke:#333,stroke-width:2px
    style Firebase fill:#F96,stroke:#333,stroke-width:2px
    style AzureOpenAI fill:#F96,stroke:#333,stroke-width:2px
```

## Componentes Principales

### **1. Frontend (Cliente)**

-   **Ubicación**: Directorio `src/`
-   **Tecnología**: React 18, Vite, TypeScript, Tailwind CSS, Material UI.
-   **Estructura**:
    -   `src/pages`: Vistas principales de la aplicación, cada una asociada a una ruta.
    -   `src/components`: Componentes de UI reutilizables (formularios, modales, etc.).
    -   `src/services`: Lógica de negocio del lado del cliente, incluyendo llamadas a la API del backend. **Todas las interacciones con servicios de IA (como Azure OpenAI) se enrutan a través del Backend Proxy para mayor seguridad y gestión centralizada.**
    -   `src/hooks`: Hooks personalizados para manejar estado y lógica compleja.
    -   `src/contexts`: Contextos de React para la gestión del estado global (ej. `AuthContext`).
-   **Responsabilidades**:
    -   Renderizar la interfaz de usuario.
    -   Manejar la interacción del usuario.
    -   Gestionar el estado de la aplicación local.
    -   Comunicarse con el backend a través de llamadas API seguras.

### **2. Backend (Servidor Proxy)**

-   **Ubicación**: Directorio `server/`
-   **Tecnología**: Node.js, Express.js.
-   **Estructura**:
    -   `server/index.js`: Punto de entrada principal del servidor. Define los endpoints de la API.
    -   `server/.env`: Archivo de configuración para variables de entorno sensibles (claves API, etc.).
-   **Responsabilidades**:
    -   Actuar como un **proxy seguro** entre el frontend y los servicios externos (Azure OpenAI, Brave Search). Esto es crucial para **evitar la exposición de claves API** en el lado del cliente.
    -   Manejar la lógica de negocio del lado del servidor.
    -   Implementar medidas de seguridad como la limitación de velocidad (`express-rate-limit`) y CORS.

### **3. Servicios Externos**

-   **Firebase**: Utilizado para:
    -   **Authentication**: Gestión de usuarios (login, registro).
    -   **Firestore**: Base de datos NoSQL para almacenar datos de la aplicación (perfiles de empresa, resultados de análisis, etc.).
    -   **Storage**: Almacenamiento de archivos (documentos generados, imágenes).
-   **Azure OpenAI**: Servicio de IA para la generación de contenido en las herramientas SST (análisis de riesgos, políticas, etc.).
-   **Brave Search (MCP)**: Utilizado a través de un Model Context Protocol (MCP) server para realizar búsquedas de información legal y normativa actualizada.
-   **PayPal**: Integrado para gestionar pagos y suscripciones.

## Flujo de Datos y Seguridad

1.  El usuario interactúa con el **Frontend**.
2.  Para operaciones que requieren datos o lógica de backend (ej. generar un análisis de riesgos), el frontend realiza una llamada a un endpoint específico en el **Backend Proxy**.
3.  El **Backend Proxy**, utilizando las claves API almacenadas de forma segura en sus variables de entorno, realiza la solicitud al servicio externo correspondiente (ej. **Azure OpenAI**).
4.  El servicio externo responde al backend.
5.  El backend procesa la respuesta si es necesario y la devuelve al frontend, que actualiza la UI.

Esta arquitectura asegura que las claves API y la lógica de negocio sensible permanezcan en el servidor, protegiendo la aplicación de vulnerabilidades comunes.
