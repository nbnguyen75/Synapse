export interface NoteTemplate {
  titlePattern: string;
  description: string;
  predefined: boolean;
  content: string;
  name: string;
}

const STORAGE_KEY_TEMPLATES = 'synapse_custom_templates';

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
    description: 'Outline project goals, milestones, timeline, and resources.',
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
