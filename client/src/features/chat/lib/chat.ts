import type { Note } from '@/features/notes/types';

import { loadCopilotConfig, type CopilotConfig } from './copilot-config';

export interface ChatMessage {
   sender: 'user' | 'ai';
   sources?: string[];
   timestamp: number;
   text: string;
   id: string;
}

interface PersonaHandler {
   format: (question: string, sources: string[]) => string;
   name: string;
}

const PERSONAS: Record<string, PersonaHandler> = {
   poet: {
      format: (question, sources) => {
         const sourceRef =
            sources.length > 0
               ? `\n\nFrom dusty tomes on digital shelves,\nThese sources my mind compelled:\n${sources.map((s) => `- "${s}"`).join('\n')}`
               : '\n\nAlas, no parchment could I find,\nTo ease the seeking of your mind.';
         return `You ask of "${question}", a curious quest,\nAllow my mind to put to test.\nThe notes you've kept, both long and vast,\nI've searched them deeply, unsurpassed.${sourceRef}\n\nThus ends my verse, my answer given,\nA digital poet, - your servant driven.`;
      },
      name: 'Poet',
   },
   butler: {
      format: (question, sources) => {
         const sourceRef =
            sources.length > 0
               ? `\n\nI consulted the following documents from your library:\n${sources.map((s) => `- "${s}"`).join('\n')}`
               : '\n\nI am afraid I could not find any relevant notes pertaining to your query in your library, Master.';
         return `Good day, Master. I have taken the liberty of researching your query regarding "${question}".${sourceRef}\n\nI remain, as always, your humble servant.`;
      },
      name: 'Butler',
   },
   scientist: {
      format: (question, sources) => {
         const sourceRef =
            sources.length > 0
               ? `\n\n## Relevant Corpus\n${sources.map((s) => `- "${s}"`).join('\n')}`
               : '\n\n## Notes\nNo relevant documents found in the knowledge base.';
         return `## Analysis: "${question}"\n\n### Methodology\nQuery processed against local knowledge graph.${sourceRef}\n\n### Confidence\n${sources.length > 0 ? 'HIGH' : 'LOW'}`;
      },
      name: 'Scientist',
   },
   sassy: {
      format: (question, sources) => {
         const sourceRef =
            sources.length > 0
               ? `\n\nLooked through your notes (yes, I actually read them):\n${sources.map((s) => `- "${s}"`).join('\n')}`
               : "\n\nCouldn't find anything relevant in your notes. Maybe try writing something down first?";
         return `Ugh, fine, I looked into "${question}" for you.${sourceRef}\n\nYou're welcome, by the way.`;
      },
      name: 'Sassy',
   },
   concise: {
      format: (question, sources) => {
         const sourceRef =
            sources.length > 0
               ? `\nSources: ${sources.join(', ')}`
               : '\nNo relevant notes found.';
         return `Re: "${question}"${sourceRef}`;
      },
      name: 'Concise',
   },
};

function generateDefaultResponse(
   question: string,
   config: CopilotConfig,
): string {
   const handler = PERSONAS[config.persona];
   if (handler) return handler.format(question, []);
   return `I received your question: "${question}". I am still learning how to best assist you.`;
}

function matchNotesToQuery(question: string, notes: Note[]): Note[] {
   const words = question
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);
   return notes.filter((note) => {
      const content = (note.title + ' ' + (note.content || '')).toLowerCase();
      return words.some((w) => content.includes(w));
   });
}

export function sendChatMessage(question: string): Promise<ChatMessage> {
   const delay = 800 + Math.random() * 1200;

   return new Promise((resolve) => {
      setTimeout(() => {
         const config = loadCopilotConfig();

         let notes: Note[] = [];
         try {
            const str = localStorage.getItem('synapse_notes');
            if (str) notes = JSON.parse(str) as Note[];
         } catch {
            /* ignore */
         }

         const matched = matchNotesToQuery(question, notes);
         const sources = matched.map((n) => n.title);
         const handler = PERSONAS[config.persona] || PERSONAS.butler;
         const text = handler.format(question, sources);

         resolve({
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            sources: sources.length > 0 ? sources : undefined,
            timestamp: Date.now(),
            sender: 'ai',
            text,
         });
      }, delay);
   });
}

export function generateDefaultResponseMessage(question: string): ChatMessage {
   return {
      text: generateDefaultResponse(question, loadCopilotConfig()),
      id: `msg_${Date.now()}`,
      timestamp: Date.now(),
      sender: 'ai',
   };
}

const CHAT_HISTORY_KEY = 'synapse_chat_history';

export function loadChatHistory(): ChatMessage[] {
   try {
      const str = localStorage.getItem(CHAT_HISTORY_KEY);
      if (str) return JSON.parse(str) as ChatMessage[];
   } catch {
      /* ignore */
   }
   return [];
}

export function saveChatHistory(messages: ChatMessage[]): void {
   localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
}

export function clearChatHistory(): void {
   localStorage.removeItem(CHAT_HISTORY_KEY);
}
