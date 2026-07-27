export interface Note {
   archived?: boolean;
   createdAt: string;
   updatedAt: string;
   pinned?: boolean;
   content: string;
   tags?: string[];
   userId: string;
   title: string;
   id: string;
}

export type NoteTab = 'write' | 'preview' | 'history';

export interface NoteEditorProps {
   onContentChange: (v: string) => void;
   onTitleChange: (v: string) => void;
   onTagsChange: (v: string) => void;
   onTabChange: (t: NoteTab) => void;
   contentPlaceholder: string;
   onSplitToggle: () => void;
   titlePlaceholder: string;
   textareaId: string;
   allTags: string[];
   isSplit: boolean;
   content: string;
   titleId: string;
   title: string;
   tags: string;
   tab: NoteTab;
}
