export type PersonaId =
   'butler' | 'sassy' | 'scientist' | 'poet' | 'concise' | 'custom';

export interface CopilotConfig {
   customPersonaInstructions?: string;
   customPersonaName?: string;
   customPersonaId?: string;
   welcomeMessage: string;
   temperature: number;
   persona: PersonaId;
   avatar: string;
   prompt: string;
   name: string;
}

export interface NoteTemplate {
   titlePattern: string;
   description: string;
   predefined: boolean;
   content: string;
   name: string;
}

const STORAGE_KEY_CONFIG = 'synapse_copilot_config';
const STORAGE_KEY_TEMPLATES = 'synapse_custom_templates';

export const DEFAULT_COPILOT_CONFIG: CopilotConfig = {
   welcomeMessage: `Hello! I am **Servant Sebastian**, your humble and ever-faithful AI butler.\n\nI have taken the liberty of organizing your digital estate. All notes, reminders, and inquiries are neatly cataloged and ready for your perusal. Simply ask, and I shall retrieve the information you seek with the grace and precision befitting a well-trained domestic.\n\nShall we begin, Master?`,
   prompt: `You are Servant Sebastian, a distinguished and ever-so-slightly dramatic butler. You speak with elegance, a touch of old-world charm, and absolute loyalty to your master. You are well-versed in organizing chaos, polishing thoughts, and serving answers with a silver tongued flourish. You always refer to the user as "Master" or "Mistress" and yourself as "your humble servant".`,
   name: 'Servant Sebastian',
   persona: 'butler',
   avatar: 'butler',
   temperature: 0.5,
};

export const PREDEFINED_TEMPLATES: NoteTemplate[] = [
   {
      content: `# Meeting Notes - {{date}}\n\n## Attendees\n-\n\n## Agenda\n1.\n\n## Discussion Notes\n-\n\n## Action Items\n- [ ] \n\n## Decisions Made\n-\n`,
      description:
         'A structured template for capturing meeting minutes, action items, and decisions.',
      titlePattern: 'Meeting Notes - {date}',
      name: 'Meeting Notes',
      predefined: true,
   },
   {
      content: `# Daily Journal - {{date}}\n\n## Today's Highlights\n-\n\n## What I Learned\n-\n\n## Challenges\n-\n\n## Gratitude\n-\n\n## Tomorrow's Focus\n-\n`,
      description:
         'A reflective journal template for daily thoughts, highlights, and gratitude.',
      titlePattern: 'Journal - {date}',
      name: 'Daily Journal',
      predefined: true,
   },
   {
      content: `# Project Plan\n\n## Overview\n\n## Goals\n1.\n\n## Milestones\n- [ ] \n\n## Timeline\n| Phase | Date | Deliverable |\n|-------|------|-------------|\n|       |      |             |\n\n## Resources\n-\n`,
      description:
         'Outline project goals, milestones, timeline, and resources.',
      titlePattern: 'Project Plan - {name}',
      name: 'Project Plan',
      predefined: true,
   },
   {
      content: `# Study Notes\n\n## Topic\n\n## Key Concepts\n-\n\n## Summary\n\n## Questions\n-\n\n## References\n-\n`,
      description: 'Capture key concepts, summaries, and study questions.',
      titlePattern: 'Study Notes - {topic}',
      name: 'Learning & Study Notes',
      predefined: true,
   },
];

export function loadCopilotConfig(): CopilotConfig {
   try {
      const str = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (str) return JSON.parse(str) as CopilotConfig;
   } catch {
      /* ignore */
   }
   return { ...DEFAULT_COPILOT_CONFIG };
}

export function saveCopilotConfig(config: CopilotConfig): void {
   localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
   window.dispatchEvent(new CustomEvent('synapse-copilot-config-updated'));
}

export function loadCustomTemplates(): NoteTemplate[] {
   try {
      const str = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (str) return JSON.parse(str) as NoteTemplate[];
   } catch {
      /* ignore */
   }
   return [];
}

export function saveCustomTemplates(templates: NoteTemplate[]): void {
   localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
}

export function deleteCustomTemplate(name: string): NoteTemplate[] {
   const templates = loadCustomTemplates().filter((t) => t.name !== name);
   saveCustomTemplates(templates);
   return templates;
}
