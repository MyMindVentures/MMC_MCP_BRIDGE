// Anthropic MCP Tools - Full Implementation
// Covers: Messages, Streaming, Tools, Vision, Prompt Caching, Token Counting

import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/messages';

// Singleton Anthropic client
let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

export async function executeAnthropicTool(tool: string, params: any): Promise<any> {
  const client = getClient();

  switch (tool) {
    // ==================== MESSAGES ====================
    case 'chat': {
      const message = await client.messages.create({
        model: params.model || 'claude-3-5-sonnet-20241022',
        max_tokens: params.max_tokens || 1024,
        messages: params.messages as MessageParam[],
        temperature: params.temperature,
        top_p: params.top_p,
        top_k: params.top_k,
        stop_sequences: params.stop_sequences,
        system: params.system,
        metadata: params.metadata,
      });
      return message.content[0];
    }

    case 'chatStreaming': {
      // For SSE streaming
      const stream = await client.messages.stream({
        model: params.model || 'claude-3-5-sonnet-20241022',
        max_tokens: params.max_tokens || 1024,
        messages: params.messages as MessageParam[],
        temperature: params.temperature,
        system: params.system,
      });

      const chunks: string[] = [];
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          chunks.push(event.delta.text);
        }
      }

      const finalMessage = await stream.finalMessage();
      return {
        content: chunks.join(''),
        chunks,
        usage: finalMessage.usage,
        stop_reason: finalMessage.stop_reason,
      };
    }

    case 'chatWithTools': {
      const message = await client.messages.create({
        model: params.model || 'claude-3-5-sonnet-20241022',
        max_tokens: params.max_tokens || 1024,
        messages: params.messages as MessageParam[],
        tools: params.tools,
        tool_choice: params.tool_choice,
        system: params.system,
      });
      return message;
    }

    case 'chatWithVision': {
      // Vision support via image content blocks
      const message = await client.messages.create({
        model: params.model || 'claude-3-5-sonnet-20241022',
        max_tokens: params.max_tokens || 1024,
        messages: params.messages as MessageParam[],
        system: params.system,
      });
      return message.content[0];
    }

    case 'chatWithCaching': {
      // Prompt caching for long contexts
      const message = await client.messages.create({
        model: params.model || 'claude-3-5-sonnet-20241022',
        max_tokens: params.max_tokens || 1024,
        messages: params.messages as MessageParam[],
        system: params.system
          ? [
              {
                type: 'text',
                text: params.system,
                cache_control: { type: 'ephemeral' },
              },
            ]
          : undefined,
      } as any); // Cast needed for cache_control
      return message;
    }

    // ==================== LEGACY COMPLETION ====================
    case 'completion': {
      // Legacy completion endpoint (uses messages API)
      const message = await client.messages.create({
        model: params.model || 'claude-3-5-sonnet-20241022',
        max_tokens: params.max_tokens || 1024,
        messages: [{ role: 'user', content: params.prompt }],
        temperature: params.temperature,
      });
      return message.content[0];
    }

    // ==================== BATCH MESSAGES ====================
    case 'batchMessages': {
      // Process multiple messages in parallel
      const results = await Promise.all(
        params.messages_batch.map((msg: any) =>
          client.messages.create({
            model: params.model || 'claude-3-5-sonnet-20241022',
            max_tokens: params.max_tokens || 1024,
            messages: msg.messages,
            system: msg.system,
          })
        )
      );
      return results.map(r => r.content[0]);
    }

    // ==================== TOKEN COUNTING ====================
    case 'countTokens': {
      const message = await client.messages.count_tokens({
        model: params.model || 'claude-3-5-sonnet-20241022',
        messages: params.messages as MessageParam[],
        system: params.system,
        tools: params.tools,
      });
      return message;
    }

    // ==================== MODELS ====================
    case 'listModels': {
      // Anthropic doesn't have a models API, return static list
      return [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          description: 'Most intelligent model',
          max_tokens: 200000,
        },
        {
          id: 'claude-3-5-haiku-20241022',
          name: 'Claude 3.5 Haiku',
          description: 'Fastest model',
          max_tokens: 200000,
        },
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          description: 'Most powerful model',
          max_tokens: 200000,
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          description: 'Balanced model',
          max_tokens: 200000,
        },
        {
          id: 'claude-3-haiku-20240307',
          name: 'Claude 3 Haiku',
          description: 'Fast model',
          max_tokens: 200000,
        },
      ];
    }

    case 'getModel': {
      // Return model info
      const models: Record<string, any> = {
        'claude-3-5-sonnet-20241022': {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          description: 'Most intelligent model',
          max_tokens: 200000,
          supports_vision: true,
          supports_tools: true,
          supports_caching: true,
        },
        'claude-3-5-haiku-20241022': {
          id: 'claude-3-5-haiku-20241022',
          name: 'Claude 3.5 Haiku',
          description: 'Fastest model',
          max_tokens: 200000,
          supports_vision: true,
          supports_tools: true,
          supports_caching: true,
        },
        'claude-3-opus-20240229': {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          description: 'Most powerful model',
          max_tokens: 200000,
          supports_vision: true,
          supports_tools: true,
          supports_caching: true,
        },
      };
      return models[params.model] || models['claude-3-5-sonnet-20241022'];
    }

    // ==================== ADVANCED FEATURES ====================
    case 'extractStructuredData': {
      // Use Claude to extract structured data from text
      const message = await client.messages.create({
        model: params.model || 'claude-3-5-sonnet-20241022',
        max_tokens: params.max_tokens || 2048,
        messages: [
          {
            role: 'user',
            content: `Extract structured data from the following text in JSON format:\n\n${params.text}\n\nSchema: ${JSON.stringify(params.schema)}`,
          },
        ],
        temperature: 0,
      });
      
      const content = message.content[0];
      if (content.type === 'text') {
        try {
          // Try to parse JSON from response
          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          // Return raw text if JSON parsing fails
        }
        return content.text;
      }
      return content;
    }

    case 'analyzeImage': {
      // Analyze image with vision
      const message = await client.messages.create({
        model: params.model || 'claude-3-5-sonnet-20241022',
        max_tokens: params.max_tokens || 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: params.image_source_type || 'base64',
                  media_type: params.media_type || 'image/jpeg',
                  data: params.image_data,
                },
              },
              {
                type: 'text',
                text: params.prompt || 'What do you see in this image?',
              },
            ],
          },
        ],
      });
      return message.content[0];
    }

    case 'continueConversation': {
      // Continue a multi-turn conversation
      const allMessages = [
        ...(params.history || []),
        { role: 'user', content: params.message },
      ];
      
      const message = await client.messages.create({
        model: params.model || 'claude-3-5-sonnet-20241022',
        max_tokens: params.max_tokens || 1024,
        messages: allMessages as MessageParam[],
        system: params.system,
      });
      
      return {
        response: message.content[0],
        updated_history: [...allMessages, { role: 'assistant', content: message.content }],
        usage: message.usage,
      };
    }

    default:
      throw new Error(`Unknown Anthropic tool: ${tool}`);
  }
}

