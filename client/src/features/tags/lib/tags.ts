export interface TagMetadata {
   description: string;
   createdAt: string;
   color: string;
   name: string;
}

const STORAGE_KEY = 'synapse_tag_metadata';

const TAG_COLOR_NAMES = [
   'violet',
   'red',
   'emerald',
   'amber',
   'blue',
   'rose',
   'sky',
   'orange',
   'slate',
];

export function loadTagMetadata(): TagMetadata[] {
   try {
      const str = localStorage.getItem(STORAGE_KEY);
      if (str) return JSON.parse(str) as TagMetadata[];
   } catch {
      /* ignore */
   }
   return [];
}

export function saveTagMetadata(tags: TagMetadata[]): void {
   localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
}

export function createTag(
   name: string,
   color?: string,
   description?: string,
): TagMetadata[] {
   const tags = loadTagMetadata();
   const usedColors = tags.map((t) => t.color);
   const available = TAG_COLOR_NAMES.find((c) => !usedColors.includes(c));
   const newTag: TagMetadata = {
      color:
         color ||
         available ||
         TAG_COLOR_NAMES[tags.length % TAG_COLOR_NAMES.length],
      createdAt: new Date().toISOString(),
      description: description || '',
      name: name.trim(),
   };
   tags.push(newTag);
   saveTagMetadata(tags);
   return tags;
}

export function updateTag(
   oldName: string,
   updates: Partial<TagMetadata>,
): TagMetadata[] {
   const tags = loadTagMetadata();
   const idx = tags.findIndex((t) => t.name === oldName);
   if (idx === -1) return tags;
   tags[idx] = { ...tags[idx], ...updates };
   saveTagMetadata(tags);
   return tags;
}

export function deleteTag(name: string): TagMetadata[] {
   const tags = loadTagMetadata().filter((t) => t.name !== name);
   saveTagMetadata(tags);
   return tags;
}

export function discoverTagsFromNotes(noteTags: string[]): TagMetadata[] {
   const existing = loadTagMetadata();
   const existingNames = new Set(existing.map((t) => t.name));
   const usedColors = new Set(existing.map((t) => t.color));
   const newTags: TagMetadata[] = [];

   for (const tag of noteTags) {
      if (!existingNames.has(tag)) {
         const color =
            TAG_COLOR_NAMES.find((c) => !usedColors.has(c)) ||
            TAG_COLOR_NAMES[0];
         usedColors.add(color);
         newTags.push({
            createdAt: new Date().toISOString(),
            description: '',
            name: tag,
            color,
         });
      }
   }

   if (newTags.length > 0) {
      saveTagMetadata([...existing, ...newTags]);
      return [...existing, ...newTags];
   }

   return existing;
}

export function cascadeRenameTag(oldName: string, newName: string): void {
   const notesStr = localStorage.getItem('synapse_notes');
   if (!notesStr) return;
   try {
      const notes = JSON.parse(notesStr) as { tags?: string[] }[];
      for (const note of notes) {
         if (note.tags) {
            const idx = note.tags.indexOf(oldName);
            if (idx !== -1) note.tags[idx] = newName;
         }
      }
      localStorage.setItem('synapse_notes', JSON.stringify(notes));
      window.dispatchEvent(new CustomEvent('synapse-notes-updated'));
   } catch {
      /* ignore */
   }
}

export function cascadeDeleteTag(name: string): void {
   const notesStr = localStorage.getItem('synapse_notes');
   if (!notesStr) return;
   try {
      const notes = JSON.parse(notesStr) as { tags?: string[] }[];
      for (const note of notes) {
         if (note.tags) {
            note.tags = note.tags.filter((t) => t !== name);
         }
      }
      localStorage.setItem('synapse_notes', JSON.stringify(notes));
      window.dispatchEvent(new CustomEvent('synapse-notes-updated'));
   } catch {
      /* ignore */
   }
}
