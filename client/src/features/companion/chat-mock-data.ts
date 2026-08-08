export interface Model {
  providers: string[];
  chefSlug: string;
  chef: string;
  name: string;
  id: string;
}

export const models: Model[] = [
  {
    providers: ['openai', 'azure'],
    chefSlug: 'openai',
    chef: 'OpenAI',
    name: 'GPT-4o',
    id: 'gpt-4o',
  },
  {
    providers: ['openai', 'azure'],
    name: 'GPT-4o Mini',
    chefSlug: 'openai',
    id: 'gpt-4o-mini',
    chef: 'OpenAI',
  },
  {
    providers: ['anthropic', 'azure', 'google', 'amazon-bedrock'],
    id: 'claude-opus-4-20250514',
    chefSlug: 'anthropic',
    name: 'Claude 4 Opus',
    chef: 'Anthropic',
  },
  {
    providers: ['anthropic', 'azure', 'google', 'amazon-bedrock'],
    id: 'claude-sonnet-4-20250514',
    name: 'Claude 4 Sonnet',
    chefSlug: 'anthropic',
    chef: 'Anthropic',
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    providers: ['google'],
    chefSlug: 'google',
    chef: 'Google',
  },
];

export const suggestions = [
  'What are the latest trends in AI?',
  'How does machine learning work?',
  'Explain quantum computing',
  'Best practices for React development',
  'Tell me about TypeScript benefits',
  'How to optimize database queries?',
  'What is the difference between SQL and NoSQL?',
  'Explain cloud computing basics',
];

export const chefs = ['OpenAI', 'Anthropic', 'Google'];
