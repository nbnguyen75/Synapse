import { createVertex } from '@ai-sdk/google-vertex';
import { JWT } from 'google-auth-library';

import { env } from '@/config/env';

const authClient = new JWT({
	scopes: ['https://www.googleapis.com/auth/cloud-platform'],
	key: env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
	email: env.GOOGLE_CLIENT_EMAIL
});

export const vertex = createVertex({
	googleAuthOptions: {
		authClient
	},
	location: env.GOOGLE_VERTEX_LOCATION,
	project: env.GOOGLE_VERTEX_PROJECT
});

export const vertexGemini35FlashLite = vertex('gemini-3.5-flash-lite');
export const vertexGeminiEmbedding001 = vertex.embeddingModel('gemini-embedding-001');
export const vertexGemma431bIt = vertex('gemma-4-31b-it');
export const vertexGemini25FlashLite = vertex('gemini-2.5-flash-lite');
