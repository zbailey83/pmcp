This project contains two servers:

1.  **MCP Server (`src/index.ts`):** A stdio-based server for the Model Context Protocol.
2.  **HTTP Server (`src/server.ts`):** An Express-based server for the web dashboard.

## Running the Servers

*   **MCP Server:** `npm start`
*   **HTTP Server:** `npm run start:http`

## Project Structure

*   `src/index.ts`: The main entry point for the MCP server.
*   `src/server.ts`: The main entry point for the HTTP server.
*   `src/utils/`: Utility functions for fetching data from the prediction market APIs.
*   `public/`: Frontend assets for the web dashboard.