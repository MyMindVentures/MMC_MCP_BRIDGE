// OpenAI MCP Tools - Full Implementation
// Covers: Chat, Completions, Embeddings, Images, Assistants, Fine-tuning, Audio, Files, Moderation

import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

// Singleton OpenAI client
let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export async function executeOpenAITool(tool: string, params: any): Promise<any> {
  const client = getClient();

  switch (tool) {
    // ==================== CHAT COMPLETIONS ====================
    case 'chat': {
      const completion = await client.chat.completions.create({
        model: params.model || 'gpt-4',
        messages: params.messages as ChatCompletionMessageParam[],
        temperature: params.temperature,
        max_tokens: params.max_tokens,
        top_p: params.top_p,
        frequency_penalty: params.frequency_penalty,
        presence_penalty: params.presence_penalty,
        stop: params.stop,
        n: params.n,
        user: params.user,
      });
      return completion.choices[0].message;
    }

    case 'chatStreaming': {
      // For SSE streaming, we return an async generator
      const stream = await client.chat.completions.create({
        model: params.model || 'gpt-4',
        messages: params.messages as ChatCompletionMessageParam[],
        temperature: params.temperature,
        max_tokens: params.max_tokens,
        stream: true,
      });

      const chunks: string[] = [];
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          chunks.push(content);
        }
      }
      return { content: chunks.join(''), chunks };
    }

    case 'chatWithFunctions': {
      const completion = await client.chat.completions.create({
        model: params.model || 'gpt-4',
        messages: params.messages as ChatCompletionMessageParam[],
        functions: params.functions,
        function_call: params.function_call,
        temperature: params.temperature,
      });
      return completion.choices[0].message;
    }

    case 'chatWithTools': {
      const completion = await client.chat.completions.create({
        model: params.model || 'gpt-4',
        messages: params.messages as ChatCompletionMessageParam[],
        tools: params.tools,
        tool_choice: params.tool_choice,
        temperature: params.temperature,
      });
      return completion.choices[0].message;
    }

    case 'chatWithVision': {
      const completion = await client.chat.completions.create({
        model: params.model || 'gpt-4-vision-preview',
        messages: params.messages as ChatCompletionMessageParam[],
        max_tokens: params.max_tokens || 300,
      });
      return completion.choices[0].message;
    }

    // ==================== LEGACY COMPLETIONS ====================
    case 'completion': {
      const completion = await client.completions.create({
        model: params.model || 'gpt-3.5-turbo-instruct',
        prompt: params.prompt,
        max_tokens: params.max_tokens,
        temperature: params.temperature,
        top_p: params.top_p,
        n: params.n,
        stream: false,
        stop: params.stop,
      });
      return completion.choices[0].text;
    }

    // ==================== EMBEDDINGS ====================
    case 'embedding': {
      const embedding = await client.embeddings.create({
        model: params.model || 'text-embedding-3-small',
        input: params.input,
        encoding_format: params.encoding_format,
        dimensions: params.dimensions,
      });
      return embedding.data[0].embedding;
    }

    case 'batchEmbeddings': {
      const embedding = await client.embeddings.create({
        model: params.model || 'text-embedding-3-small',
        input: params.inputs, // Array of strings
      });
      return embedding.data.map(d => d.embedding);
    }

    // ==================== IMAGES ====================
    case 'generateImage': {
      const image = await client.images.generate({
        prompt: params.prompt,
        model: params.model || 'dall-e-3',
        n: params.n || 1,
        size: params.size || '1024x1024',
        quality: params.quality || 'standard',
        response_format: params.response_format || 'url',
        style: params.style,
        user: params.user,
      });
      return image.data[0];
    }

    case 'editImage': {
      const image = await client.images.edit({
        image: params.image, // File or base64
        prompt: params.prompt,
        mask: params.mask,
        n: params.n || 1,
        size: params.size || '1024x1024',
        response_format: params.response_format || 'url',
      });
      return image.data[0];
    }

    case 'createImageVariation': {
      const image = await client.images.createVariation({
        image: params.image,
        n: params.n || 1,
        size: params.size || '1024x1024',
        response_format: params.response_format || 'url',
      });
      return image.data[0];
    }

    // ==================== ASSISTANTS ====================
    case 'createAssistant': {
      const assistant = await client.beta.assistants.create({
        name: params.name,
        description: params.description,
        model: params.model || 'gpt-4',
        instructions: params.instructions,
        tools: params.tools || [],
        file_ids: params.file_ids || [],
        metadata: params.metadata,
      });
      return assistant;
    }

    case 'listAssistants': {
      const assistants = await client.beta.assistants.list({
        limit: params.limit || 20,
        order: params.order || 'desc',
        after: params.after,
        before: params.before,
      });
      return assistants.data;
    }

    case 'getAssistant': {
      const assistant = await client.beta.assistants.retrieve(params.assistant_id);
      return assistant;
    }

    case 'updateAssistant': {
      const assistant = await client.beta.assistants.update(params.assistant_id, {
        name: params.name,
        description: params.description,
        model: params.model,
        instructions: params.instructions,
        tools: params.tools,
        file_ids: params.file_ids,
        metadata: params.metadata,
      });
      return assistant;
    }

    case 'deleteAssistant': {
      const result = await client.beta.assistants.del(params.assistant_id);
      return result;
    }

    case 'createThread': {
      const thread = await client.beta.threads.create({
        messages: params.messages,
        metadata: params.metadata,
      });
      return thread;
    }

    case 'runAssistant': {
      const run = await client.beta.threads.runs.create(params.thread_id, {
        assistant_id: params.assistant_id,
        instructions: params.instructions,
        additional_instructions: params.additional_instructions,
        model: params.model,
        tools: params.tools,
      });
      return run;
    }

    case 'getRun': {
      const run = await client.beta.threads.runs.retrieve(
        params.thread_id,
        params.run_id
      );
      return run;
    }

    case 'listRuns': {
      const runs = await client.beta.threads.runs.list(params.thread_id, {
        limit: params.limit || 20,
        order: params.order || 'desc',
      });
      return runs.data;
    }

    // ==================== FINE-TUNING ====================
    case 'createFineTune': {
      const fineTune = await client.fineTuning.jobs.create({
        training_file: params.training_file,
        model: params.model || 'gpt-3.5-turbo',
        hyperparameters: params.hyperparameters,
        suffix: params.suffix,
        validation_file: params.validation_file,
      });
      return fineTune;
    }

    case 'listFineTunes': {
      const fineTunes = await client.fineTuning.jobs.list({
        limit: params.limit || 20,
        after: params.after,
      });
      return fineTunes.data;
    }

    case 'getFineTune': {
      const fineTune = await client.fineTuning.jobs.retrieve(params.fine_tuning_job_id);
      return fineTune;
    }

    case 'cancelFineTune': {
      const fineTune = await client.fineTuning.jobs.cancel(params.fine_tuning_job_id);
      return fineTune;
    }

    case 'listFineTuneEvents': {
      const events = await client.fineTuning.jobs.listEvents(params.fine_tuning_job_id, {
        limit: params.limit || 20,
        after: params.after,
      });
      return events.data;
    }

    // ==================== AUDIO ====================
    case 'transcribe': {
      const transcription = await client.audio.transcriptions.create({
        file: params.file,
        model: params.model || 'whisper-1',
        language: params.language,
        prompt: params.prompt,
        response_format: params.response_format || 'json',
        temperature: params.temperature,
      });
      return transcription;
    }

    case 'translate': {
      const translation = await client.audio.translations.create({
        file: params.file,
        model: params.model || 'whisper-1',
        prompt: params.prompt,
        response_format: params.response_format || 'json',
        temperature: params.temperature,
      });
      return translation;
    }

    case 'textToSpeech': {
      const speech = await client.audio.speech.create({
        model: params.model || 'tts-1',
        voice: params.voice || 'alloy',
        input: params.input,
        response_format: params.response_format || 'mp3',
        speed: params.speed || 1.0,
      });
      return speech;
    }

    // ==================== FILES ====================
    case 'uploadFile': {
      const file = await client.files.create({
        file: params.file,
        purpose: params.purpose || 'assistants',
      });
      return file;
    }

    case 'listFiles': {
      const files = await client.files.list({
        purpose: params.purpose,
      });
      return files.data;
    }

    case 'getFile': {
      const file = await client.files.retrieve(params.file_id);
      return file;
    }

    case 'deleteFile': {
      const result = await client.files.del(params.file_id);
      return result;
    }

    case 'getFileContent': {
      const content = await client.files.content(params.file_id);
      return content;
    }

    // ==================== MODERATION ====================
    case 'moderateText': {
      const moderation = await client.moderations.create({
        input: params.input,
        model: params.model || 'text-moderation-latest',
      });
      return moderation.results[0];
    }

    case 'moderateBatch': {
      const moderation = await client.moderations.create({
        input: params.inputs, // Array of strings
        model: params.model || 'text-moderation-latest',
      });
      return moderation.results;
    }

    // ==================== MODELS ====================
    case 'listModels': {
      const models = await client.models.list();
      return models.data;
    }

    case 'getModel': {
      const model = await client.models.retrieve(params.model);
      return model;
    }

    case 'deleteModel': {
      const result = await client.models.del(params.model);
      return result;
    }

    default:
      throw new Error(`Unknown OpenAI tool: ${tool}`);
  }
}


