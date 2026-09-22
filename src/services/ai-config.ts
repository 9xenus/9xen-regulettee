export let aiProviderConfigs = {
  primaryProvider: 'gemini',
  fallbackProvider: 'customAgi',
  providers: {
    gemini: { enabled: true, apiKey: process.env.GEMINI_API_KEY || '', model: 'gemini-3.7-flash' },
    openrouter: {
      enabled: false,
      apiKey: process.env.OPENROUTER_API_KEY || '',
      model: process.env.OPENROUTER_MODEL || 'openrouter/auto',
      endpoint: process.env.OPENROUTER_API_BASE || 'https://openrouter.ai/api/v1',
      protocol: 'openai',
      temperature: 0.2,
      maxTokens: 2048
    },
    customAgi: { 
      enabled: true, 
      endpoint: process.env.CUSTOM_LLM_ENDPOINT || 'https://api.openai.com/v1', 
      apiKey: process.env.CUSTOM_LLM_API_KEY || '',
      model: process.env.CUSTOM_LLM_MODEL || 'gpt-4o-mini',
      protocol: 'openai',
      temperature: 0.2,
      maxTokens: 2048
    },
    claude: { enabled: false, apiKey: '', model: 'claude-3-5-sonnet-20241022' },
    deepseek: { enabled: false, apiKey: '', model: 'deepseek-chat', endpoint: 'https://api.deepseek.com/v1' },
    ollama: { enabled: false, endpoint: 'http://localhost:11434', model: 'llama3:latest' }
  }
};

export const updateAiProviderConfigs = (newConfig: any) => {
  aiProviderConfigs = {
    ...aiProviderConfigs,
    ...newConfig
  };
};
