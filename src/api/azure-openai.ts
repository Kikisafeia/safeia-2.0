import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { Message } from '../services/azureOpenAI';

export async function POST(request: Request) {
  try {
    const { messages, temperature = 0.7, max_tokens = 1000 } = await request.json();

    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
    const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;

    const client = new OpenAIClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );

    const result = await client.getChatCompletions(
      deployment,
      messages,
      {
        temperature,
        maxTokens: max_tokens,
      }
    );

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    return new Response(
      JSON.stringify({ error: 'Error processing your request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
