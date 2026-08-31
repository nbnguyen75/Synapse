import { useEffect } from 'react';

import { $convertFromMarkdownString, $generateNodesFromMarkdownString } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection } from 'lexical';

import { useCompanionContextStore } from '@/store/companion-context-store';

import { CUSTOM_TRANSFORMERS } from './lexical-plugins';

export default function CompanionBridgePlugin() {
  const [editor] = useLexicalComposerContext();
  const setEditorBridge = useCompanionContextStore((state) => state.setEditorBridge);

  useEffect(() => {
    const bridge = {
      insert: (markdown: string) => {
        editor.update(() => {
          const nodes = $generateNodesFromMarkdownString(markdown, CUSTOM_TRANSFORMERS);
          if (nodes.length === 0) return;

          const selection = $getSelection();
          if (selection && selection.getNodes().length > 0) {
            selection.insertNodes(nodes);
          } else {
            const root = $getRoot();
            root.append(...nodes);
          }
        });
      },
      replace: (markdown: string) => {
        editor.update(() => {
          $getRoot().clear();
          $convertFromMarkdownString(markdown, CUSTOM_TRANSFORMERS);
        });
      },
    };

    setEditorBridge(bridge);
    return () => setEditorBridge(null);
  }, [editor, setEditorBridge]);

  return null;
}
