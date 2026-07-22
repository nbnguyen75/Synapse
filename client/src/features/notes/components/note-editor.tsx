import type { NoteEditorProps } from '../types';

import ReactMarkdown from 'react-markdown';
import { type ChangeEvent } from 'react';

import { toast } from 'sonner';

import { generateAiTitle } from '@/shared/lib/ai-title';

import LexicalEditor from '@/shared/components/editor/lexical-editor';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { Edit3, Eye } from 'lucide-react';
import { Sparkles } from 'lucide-react';

import { m } from '@/paraglide/messages';

export function NoteEditor({
   contentPlaceholder,
   titlePlaceholder,
   onContentChange,
   onTitleChange,
   onSplitToggle,
   onTagsChange,
   onTabChange,
   textareaId,
   onAiTitle,
   content,
   allTags,
   isSplit,
   titleId,
   title,
   tags,
   tab,
}: NoteEditorProps & { onAiTitle?: (title: string) => void }) {
   const tagsInput = (
      <div className="space-y-1.5">
         <Label className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{m.notes_page_create_tags_label()}</span>
            <span className="text-[10px] text-muted-foreground/60">
               {m.notes_page_create_tags_hint()}
            </span>
         </Label>
         <Input
            type="text"
            placeholder={m.notes_page_create_tags_placeholder()}
            value={tags}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
               onTagsChange(e.target.value)
            }
            className="h-9 rounded-lg"
         />
         {allTags.length > 0 && (
            <div className="mt-1">
               <div className="mb-1 text-[10px] font-medium text-muted-foreground/60">
                  {m.notes_page_create_quick_tags()}
               </div>
               <div className="flex max-h-16 flex-wrap gap-1 overflow-y-auto scrollbar-none">
                  {allTags.map((tag) => {
                     const currentTags = tags
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean);
                     const has = currentTags.includes(tag);
                     return (
                        <Button
                           key={tag}
                           variant="outline"
                           size="xs"
                           type="button"
                           onClick={() => {
                              const next = has
                                 ? currentTags.filter((t) => t !== tag)
                                 : [...currentTags, tag];
                              onTagsChange(next.join(', '));
                           }}
                           className={`cursor-pointer ${
                              has
                                 ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                 : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
                           }`}
                        >
                           {tag}
                        </Button>
                     );
                  })}
               </div>
            </div>
         )}
      </div>
   );

   return (
      <div className="space-y-4">
         <div className="mb-4 flex items-center justify-between border-b border-border">
            <div className="flex">
               <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                     onTabChange('write');
                     if (isSplit) onSplitToggle();
                  }}
                  className={`cursor-pointer ${
                     tab === 'write' && !isSplit
                        ? 'border-b-2 border-primary text-primary'
                        : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
                  }`}
               >
                  <Edit3 className="h-3.5 w-3.5" />
                  {m.notes_page_create_write()}
               </Button>
               <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                     onTabChange('preview');
                     if (isSplit) onSplitToggle();
                  }}
                  className={`cursor-pointer ${
                     tab === 'preview' && !isSplit
                        ? 'border-b-2 border-primary text-primary'
                        : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
                  }`}
               >
                  <Eye className="h-3.5 w-3.5" />
                  {m.notes_page_create_preview()}
               </Button>
            </div>
            <Button
               variant="outline"
               size="xs"
               type="button"
               onClick={onSplitToggle}
               className={`cursor-pointer ${
                  isSplit ? 'border-primary/30 bg-primary/10 text-primary' : ''
               }`}
            >
               <span>{m.notes_page_create_split_view()}</span>
            </Button>
         </div>

         <div className="space-y-1.5">
            <div className="flex items-center justify-between">
               <Label
                  className="text-xs font-semibold text-muted-foreground"
                  htmlFor={titleId}
               >
                  {m.notes_page_create_title_label()}
               </Label>
               {onAiTitle && content && (
                  <Button
                     variant="ghost"
                     size="xs"
                     type="button"
                     onClick={() => {
                        const generated = generateAiTitle(content);
                        toast.success(m.notes_page_ai_title_success());
                        onAiTitle(generated);
                     }}
                     className="text-xs text-muted-foreground hover:text-primary"
                  >
                     <Sparkles className="mr-1 size-3" />
                     {m.notes_page_ai_title()}
                  </Button>
               )}
            </div>
            <Input
               id={titleId}
               type="text"
               placeholder={titlePlaceholder}
               value={title}
               onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onTitleChange(e.target.value)
               }
               className="h-9 rounded-lg"
               required
            />
         </div>

         {isSplit ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <div className="space-y-1.5">
                  <Label
                     className="text-xs font-semibold text-muted-foreground"
                     htmlFor={textareaId}
                  >
                     {m.notes_page_create_content_label()}
                  </Label>
                  <LexicalEditor
                     id={textareaId}
                     placeholder={contentPlaceholder}
                     value={content}
                     onChange={onContentChange}
                     className="h-[320px]"
                  />
               </div>
               <div className="flex flex-col space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                     {m.notes_page_create_preview()}
                  </Label>
                  <div className="h-[320px] max-h-[320px] overflow-y-auto rounded-lg border border-border bg-muted/30 p-4 text-xs leading-relaxed">
                     <ReactMarkdown>
                        {content || m.notes_page_create_empty_preview()}
                     </ReactMarkdown>
                  </div>
               </div>
            </div>
         ) : (
            <>
               {tab === 'write' ? (
                  <div className="space-y-1.5">
                     <Label
                        className="text-xs font-semibold text-muted-foreground"
                        htmlFor={textareaId}
                     >
                        {m.notes_page_create_content_label()}
                     </Label>
                     <LexicalEditor
                        id={textareaId}
                        placeholder={contentPlaceholder}
                        value={content}
                        onChange={onContentChange}
                        className="min-h-[160px] max-h-[350px]"
                     />
                  </div>
               ) : (
                  <div className="space-y-1.5">
                     <Label className="text-xs font-semibold text-muted-foreground">
                        {m.notes_page_create_content_label()}
                     </Label>
                     <div className="min-h-[140px] max-h-[220px] overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed">
                        <ReactMarkdown>
                           {content || m.notes_page_create_empty_preview_tab()}
                        </ReactMarkdown>
                     </div>
                  </div>
               )}
            </>
         )}

         {tagsInput}
      </div>
   );
}
