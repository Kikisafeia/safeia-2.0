# Project Title (Replace with actual title)

This project consists of a frontend application built with Vite and React, and a backend server built with Node.js and Express.

## Local Development Setup

To run this project locally, follow these steps:

1.  **Prerequisites:**
    *   Node.js (latest LTS)
    *   npm or yarn

2.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

3.  **Install dependencies for the frontend:**
    ```bash
    npm install
    # or
    yarn install
    ```

4.  **Install dependencies for the backend server:**
    Navigate to the `server` directory and install its dependencies.
    ```bash
    cd server
    npm install
    # or
    yarn install
    cd ..
    ```

5.  **Set up environment variables:**
    *   **Frontend:** The frontend uses Vite and expects environment variables to be prefixed with `VITE_`. Create a `.env` file in the project root by copying `.env.example` (if it exists). Ensure `VITE_API_URL=/api` is set in this file. This allows frontend requests to be proxied to the backend via the Vite dev server.
    *   **Backend:** The backend server in `server/index.js` uses environment variables (e.g., for `PORT`, `DIFY_API_KEY`, Azure OpenAI credentials). Create a `.env` file inside the `server` directory by copying `server/.env.example` (if it exists) or based on the required variables in `server/index.js`. Ensure `PORT=3001` is set.

6.  **Run the backend server:**
    From the project root:
    ```bash
    npm run server
    # or
    yarn server
    ```
    This will start the Node.js Express server, typically on port 3001.

7.  **Run the frontend Vite dev server:**
    From the project root, in a new terminal:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This will start the Vite development server, typically on port 3000.

Refer to the 'Recommended Development Setup' section for instructions on running both servers concurrently with a single command.

## Recommended Development Setup

For an improved development experience, consider running both the frontend Vite server and the backend Node.js server concurrently. You can achieve this using a tool like `concurrently`.

First, install it if you haven't:
```bash
npm install --save-dev concurrently
```
or
```bash
yarn add --dev concurrently
```

Then, add a script to your root `package.json`:
```json
"scripts": {
  // ... other scripts
  "dev:full": "concurrently \"npm run dev\" \"npm run server\""
}
```

You can then run `npm run dev:full` or `yarn dev:full` to start both servers with a single command.

## Available Scripts

In the project directory, you can run:

### `npm run dev` or `yarn dev`

Runs the Vite frontend development server.
Open [http://localhost:3000](http://localhost:3000) (or the configured port) to view it in the browser.

### `npm run server` or `yarn server`

Runs the Node.js backend server.
The server will typically start on `http://localhost:3001` (or the configured port).

### `npm run build` or `yarn build`

Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run lint` or `yarn lint`

Lints the codebase using ESLint.

### `npm run preview` or `yarn preview`

Serves the production build locally to preview it.

(You can add more sections here as needed, like Installation, Project Structure, Deployment, etc.)
