export function generateAiTitle(content: string): string {
   if (!content.trim()) return 'Draft Document';

   const headingMatch = content.match(/^###?\s+(.+)/m);
   if (headingMatch) return headingMatch[1].trim();

   const keywords: [RegExp, string][] = [
      [/\brag\b/i, 'RAG Architecture Overview'],
      [/roadmap/i, 'Project Roadmap'],
      [/\bcoffee\b/i, 'Coffee Chat Notes'],
      [/\bui\b/i, 'UI Design Notes'],
      [/meeting/i, 'Meeting Notes'],
      [/\btodo\b/i, 'Todo List'],
      [/\brecipe\b/i, 'Recipe Notes'],
      [/\bidea\b/i, 'Brainstorm Ideas'],
      [/\bconcept\b/i, 'Concept Overview'],
      [/\btutorial\b/i, 'Tutorial Guide'],
   ];

   for (const [pattern, title] of keywords) {
      if (pattern.test(content)) return title;
   }

   const firstLine = content.split('\n')[0].trim();
   if (firstLine && firstLine.length < 60) return firstLine;

   const words = content.trim().split(/\s+/);
   if (words.length > 0) {
      return words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '');
   }

   return 'Draft Document';
}
