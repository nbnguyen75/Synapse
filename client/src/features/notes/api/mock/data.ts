import type { Note } from '@/features/notes/types';

export const INITIAL_NOTES: Note[] = [
   {
      content:
         'This is your first note. You can write in **Markdown** and it will be rendered beautifully.\n\n## Features\n- Create, edit, and delete notes\n- Tag and filter notes\n- Pin important notes to the top\n- Markdown preview\n- Auto-save on edits',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      tags: ['welcome', 'getting-started'],
      title: 'Welcome to Synapse',
      userId: 'usr_01',
      id: 'note_1',
      pinned: true,
   },
   {
      content:
         '## Color Palette\n\n- **Primary**: Violet 600\n- **Background**: Neutral 950 (dark) / White (light)\n- **Accent**: Violet 500\n\n## Typography\n\n- Heading: Inter Variable\n- Body: Inter Variable\n- Mono: System default',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      title: 'Design System Tokens',
      tags: ['design', 'tokens'],
      userId: 'usr_01',
      pinned: false,
      id: 'note_2',
   },
   {
      content:
         '## Goals\n\n1. Ship notes MVP\n2. Launch AI chat integration\n3. Onboard first 100 beta users\n\n## Timeline\n\n- **July**: Notes + Tags\n- **August**: AI chat + RAG\n- **September**: Beta launch + Feedback loop',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      title: 'Project Roadmap Q3',
      tags: ['roadmap', 'q3'],
      userId: 'usr_01',
      pinned: false,
      id: 'note_3',
   },
   {
      content:
         '## Goals\n\n1. Ship notes MVP\n2. Launch AI chat integration\n3. Onboard first 100 beta users\n\n## Timeline\n\n- **July**: Notes + Tags\n- **August**: AI chat + RAG\n- **September**: Beta launch + Feedback loop',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      title: 'Project Roadmap Q3',
      tags: ['roadmap', 'q3'],
      userId: 'usr_01',
      pinned: false,
      id: 'note_4',
   },
   {
      content:
         '## Goals\n\n1. Ship notes MVP\n2. Launch AI chat integration\n3. Onboard first 100 beta users\n\n## Timeline\n\n- **July**: Notes + Tags\n- **August**: AI chat + RAG\n- **September**: Beta launch + Feedback loop',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      title: 'Project Roadmap Q3',
      tags: ['roadmap', 'q3'],
      userId: 'usr_01',
      pinned: false,
      id: 'note_5',
   },
   {
      content:
         '## Goals\n\n1. Ship notes MVP\n2. Launch AI chat integration\n3. Onboard first 100 beta users\n\n## Timeline\n\n- **July**: Notes + Tags\n- **August**: AI chat + RAG\n- **September**: Beta launch + Feedback loop',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      title: 'Project Roadmap Q3',
      tags: ['roadmap', 'q3'],
      userId: 'usr_01',
      pinned: false,
      id: 'note_6',
   },
   {
      content:
         '## Goals\n\n1. Ship notes MVP\n2. Launch AI chat integration\n3. Onboard first 100 beta users\n\n## Timeline\n\n- **July**: Notes + Tags\n- **August**: AI chat + RAG\n- **September**: Beta launch + Feedback loop',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      title: 'Project Roadmap Q3',
      tags: ['roadmap', 'q3'],
      userId: 'usr_01',
      pinned: false,
      id: 'note_7',
   },
   {
      content:
         '## Goals\n\n1. Ship notes MVP\n2. Launch AI chat integration\n3. Onboard first 100 beta users\n\n## Timeline\n\n- **July**: Notes + Tags\n- **August**: AI chat + RAG\n- **September**: Beta launch + Feedback loop',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      title: 'Project Roadmap Q3',
      tags: ['roadmap', 'q3'],
      userId: 'usr_01',
      pinned: false,
      id: 'note_8',
   },
   {
      content:
         '## Goals\n\n1. Ship notes MVP\n2. Launch AI chat integration\n3. Onboard first 100 beta users\n\n## Timeline\n\n- **July**: Notes + Tags\n- **August**: AI chat + RAG\n- **September**: Beta launch + Feedback loop',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      title: 'Project Roadmap Q3',
      tags: ['roadmap', 'q3'],
      userId: 'usr_01',
      pinned: false,
      id: 'note_9',
   },
   {
      content:
         '## Goals\n\n1. Ship notes MVP\n2. Launch AI chat integration\n3. Onboard first 100 beta users\n\n## Timeline\n\n- **July**: Notes + Tags\n- **August**: AI chat + RAG\n- **September**: Beta launch + Feedback loop',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      title: 'Project Roadmap Q3',
      tags: ['roadmap', 'q3'],
      userId: 'usr_01',
      pinned: false,
      id: 'note_10',
   },
];
