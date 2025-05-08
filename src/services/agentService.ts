import { Agent, AgentRequest, AgentResponse } from '../types/agents';

// Base URL for the backend server API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'; // Fallback just in case

// Helper function for authenticated fetch calls (if needed in the future)
// For now, just basic fetch, assuming endpoints are public or auth handled elsewhere
// Note: sendPrompt specifically adds an Authorization header below.
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `HTTP error ${response.status}` };
    }
    console.error(`API Error (${response.status}) on ${endpoint}:`, errorData);
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  // Handle cases where response might be empty (e.g., 204 No Content)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return response.text(); // Or handle as needed
  }
}


export const agentService = {
  async listAgents(): Promise<Agent[]> {
    // Fetch from the backend API instead of using hardcoded data
    try {
      const agents = await fetchApi('/api/agents');
      // TODO: Add validation here (e.g., using Zod) to ensure the response matches Agent[]
      return agents as Agent[];
    } catch (error) {
      console.error('Error fetching agents from API:', error);
      // Fallback or re-throw depending on desired UX
      return []; // Return empty array on error
    }
  },

  async getAgent(agentId: string): Promise<Agent> {
    // Fetch from the backend API
    try {
      const agent = await fetchApi(`/api/agents/${agentId}`);
      // TODO: Add validation here (e.g., using Zod) to ensure the response matches Agent
      return agent as Agent;
    } catch (error) {
      console.error(`Error fetching agent ${agentId} from API:`, error);
      throw error; // Re-throw to be handled by caller
    }
  },

  async sendPrompt(agentId: string, request: AgentRequest): Promise<AgentResponse> {
    // Call the correct backend endpoint: /api/agents/:id/chat (which proxies to Dify)
    // Note: The backend currently doesn't seem to use the Authorization header for this endpoint,
    // but keeping it here in case backend auth is added later.
    // Ensure the token retrieval logic is correct for your auth setup (Firebase usually uses ID tokens).
    const token = localStorage.getItem('token'); // Or get Firebase ID token: await auth.currentUser?.getIdToken();

    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Only include Authorization if a token exists
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(request), // Send the original request payload
      });

      if (!response.ok) {
         let errorData;
         try {
           errorData = await response.json();
         } catch (e) {
           errorData = { message: `HTTP error ${response.status}` };
         }
         console.error(`API Error (${response.status}) on /api/agents/${agentId}/chat:`, errorData);
         throw new Error(errorData.message || `Failed to send prompt to agent ${agentId}`);
      }
      
      // Assuming the backend proxy returns the expected AgentResponse structure
      // If the backend returns a stream, this needs different handling (like in server/index.js)
      // For now, assuming non-streaming response based on original function signature
      const responseData = await response.json();
      // TODO: Add validation here (e.g., using Zod) to ensure the response matches AgentResponse
      return responseData as AgentResponse;

    } catch (error) {
       console.error(`Error sending prompt to agent ${agentId}:`, error);
       throw error; // Re-throw
    }
  },

  async getAgentStatus(agentId: string): Promise<{ status: Agent['status'] }> {
     // Fetch from the backend API
    try {
      const statusData = await fetchApi(`/api/agents/${agentId}/status`);
      // TODO: Add validation here (e.g., using Zod)
      return statusData as { status: Agent['status'] };
    } catch (error) {
      console.error(`Error fetching status for agent ${agentId} from API:`, error);
      // Fallback or re-throw
      return { status: 'inactive' }; // Example fallback
    }
  },
};
