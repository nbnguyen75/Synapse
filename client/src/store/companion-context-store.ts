import { create } from 'zustand';

export interface CompanionActiveDocument {
  content: string;
  title: string;
  id: string;
}

export interface CompanionEditorBridge {
  replace: (markdown: string) => void;
  insert: (markdown: string) => void;
}

interface CompanionContextState {
  setActiveDocument: (doc: CompanionActiveDocument | null) => void;
  setEditorBridge: (bridge: CompanionEditorBridge | null) => void;
  activeDocument: CompanionActiveDocument | null;
  editorBridge: CompanionEditorBridge | null;
}

export const useCompanionContextStore = create<CompanionContextState>()((set) => ({
  setActiveDocument: (activeDocument) => set({ activeDocument }),
  setEditorBridge: (editorBridge) => set({ editorBridge }),
  activeDocument: null,
  editorBridge: null,
}));
