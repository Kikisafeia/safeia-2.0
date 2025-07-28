# Instrucciones para Iniciar el Proyecto Manualmente

Para diagnosticar el problema con el servidor de desarrollo, por favor sigue estos pasos:

1.  **Abre dos terminales separadas en tu editor de código.**

2.  **En la primera terminal, inicia el servidor de backend:**
    *   Navega al directorio del servidor:
        ```bash
        cd server
        ```
    *   Inicia el servidor en modo de desarrollo:
        ```bash
        npm run dev
        ```
    *   Mantén esta terminal abierta para monitorear los logs del backend.

3.  **En la segunda terminal, inicia el servidor de frontend:**
    *   Asegúrate de estar en el directorio raíz del proyecto (`safeia-2.0`).
    *   Inicia el servidor de desarrollo de Vite:
        ```bash
        npm run dev
        ```

4.  **Observa la salida en ambas terminales.** Si alguno de los servidores no se inicia o muestra un error, por favor, copia y pega el mensaje de error completo en nuestro chat.

Esto nos ayudará a identificar la causa exacta del problema.
