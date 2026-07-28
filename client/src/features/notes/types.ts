export interface NotesSearchParams {
  startDate?: string;
  pageSize?: number;
  endDate?: string;
  sort?: string;
  page?: number;
  view?: string;
  tag?: string;
  q?: string;
}

export interface EditableNoteData {
  content?: string;
  title: string;
}

export interface Note extends EditableNoteData {
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  userId: string;
  id: string;
}

export type NoteTab = 'write' | 'preview' | 'history';

export interface NoteEditorProps {
  onContentChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onTagsChange: (v: string) => void;
  onTabChange: (t: NoteTab) => void;
  contentPlaceholder?: string;
  onSplitToggle: () => void;
  titlePlaceholder?: string;
  textareaId?: string;
  allTags: string[];
  isSplit: boolean;
  titleId?: string;
  content: string;
  title: string;
  tags: string;
  tab: NoteTab;
}
