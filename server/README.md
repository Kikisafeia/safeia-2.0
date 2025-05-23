# SAFEIA-VT Server

This directory contains the server-side application for SAFEIA-VT.

## Environment Variables

To run the server, you need to set up the following environment variables. You can create a `.env` file in the `server` directory to manage these:

-   `PORT`: The port on which the server will listen (e.g., 3001).
-   `DIFY_API_URL`: The base URL for the Dify API (e.g., `https://api.dify.ai/v1`).
-   `DIFY_API_KEY`: Your Dify Service Secret Key (should start with `sk-`). This key is used for server-to-server communication with the Dify API.
-   `GOOGLE_APPLICATION_CREDENTIALS`: (Optional) Path to your Firebase service account key JSON file. If not set, Firebase Admin SDK will attempt to initialize using default credentials (e.g., in Google Cloud environments).
-   `AZURE_OPENAI_ENDPOINT`: The endpoint URL for your Azure OpenAI service.
-   `AZURE_OPENAI_API_KEY`: The API key for your Azure OpenAI service.
-   `AZURE_OPENAI_DEPLOYMENT`: The deployment name for your Azure OpenAI model (e.g., the name of your deployed chat model).

**Example `.env` file:**

```
PORT=3001
DIFY_API_URL=https://api.dify.ai/v1
DIFY_API_KEY=sk-yourdifysecretkeyhere
GOOGLE_APPLICATION_CREDENTIALS=./path/to/your/serviceAccountKey.json
AZURE_OPENAI_ENDPOINT="https://youropenaiendpoint.openai.azure.com/"
AZURE_OPENAI_API_KEY="youropenaikey"
AZURE_OPENAI_DEPLOYMENT="yourdeploymentname"
```

## Setup and Running

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your `.env` file:**
    Create a `.env` file in the `server` directory and populate it with your specific API keys and configuration details as listed above.

4.  **Start the server:**
    ```bash
    npm start
    ```
    Alternatively, you can run `node index.js`.

The server should now be running on the port specified in your `PORT` environment variable.
