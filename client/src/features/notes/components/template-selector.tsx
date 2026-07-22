import { useState } from 'react';

import {
   loadCustomTemplates,
   saveCustomTemplates,
   deleteCustomTemplate,
   PREDEFINED_TEMPLATES,
   type NoteTemplate,
} from '@/shared/lib/copilot-config';

import {
   Dialog,
   DialogContent,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import {
   Plus,
   Trash2,
   Briefcase,
   Calendar,
   FileSpreadsheet,
   GraduationCap,
} from 'lucide-react';

import { m } from '@/paraglide/messages';

interface TemplateSelectorProps {
   onApplyTemplate: (title: string, content: string) => void;
}

const TEMPLATE_ICONS = [Briefcase, Calendar, FileSpreadsheet, GraduationCap];

export function TemplateSelector({ onApplyTemplate }: TemplateSelectorProps) {
   const [customTemplates, setCustomTemplates] = useState<NoteTemplate[]>(() =>
      loadCustomTemplates(),
   );
   const [isSaving, setIsSaving] = useState(false);
   const [saveName, setSaveName] = useState('');
   const [saveDesc, setSaveDesc] = useState('');
   const [saveTitle, setSaveTitle] = useState('');
   const [saveContent, setSaveContent] = useState('');

   function handleDelete(name: string) {
      const updated = deleteCustomTemplate(name);
      setCustomTemplates(updated);
   }

   function handleSaveTemplate() {
      if (!saveName.trim()) return;
      const tmpl: NoteTemplate = {
         titlePattern: saveTitle.trim(),
         description: saveDesc.trim(),
         name: saveName.trim(),
         content: saveContent,
         predefined: false,
      };
      const updated = [...customTemplates, tmpl];
      setCustomTemplates(updated);
      saveCustomTemplates(updated);
      setIsSaving(false);
      setSaveName('');
      setSaveDesc('');
      setSaveTitle('');
      setSaveContent('');
   }

   return (
      <div>
         <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
               {m.notes_page_template_heading()}
            </span>
            <Button
               variant="ghost"
               size="icon-xs"
               onClick={() => setIsSaving(true)}
            >
               <Plus className="size-3.5" />
            </Button>
         </div>

         <div className="space-y-2">
            {[...PREDEFINED_TEMPLATES, ...customTemplates].map((t, i) => {
               const Icon = TEMPLATE_ICONS[i % TEMPLATE_ICONS.length];
               return (
                  <div
                     key={t.name}
                     className="group flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                     onClick={() => onApplyTemplate(t.titlePattern, t.content)}
                  >
                     <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/20">
                        <Icon className="size-4 text-violet-600 dark:text-violet-400" />
                     </div>
                     <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                           {t.description}
                        </p>
                     </div>
                     {!t.predefined && (
                        <Button
                           variant="ghost"
                           size="icon-xs"
                           className="opacity-0 group-hover:opacity-100 shrink-0"
                           onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(t.name);
                           }}
                        >
                           <Trash2 className="size-3" />
                        </Button>
                     )}
                  </div>
               );
            })}
         </div>

         <Dialog open={isSaving} onOpenChange={setIsSaving}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>{m.notes_page_template_save()}</DialogTitle>
               </DialogHeader>
               <div className="space-y-4">
                  <div>
                     <Label>{m.settings_page_template_name()}</Label>
                     <Input
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                     />
                  </div>
                  <div>
                     <Label>{m.settings_page_template_description()}</Label>
                     <Input
                        value={saveDesc}
                        onChange={(e) => setSaveDesc(e.target.value)}
                     />
                  </div>
                  <div>
                     <Label>{m.settings_page_template_title_pattern()}</Label>
                     <Input
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                     />
                  </div>
                  <div>
                     <Label>{m.settings_page_template_content()}</Label>
                     <Textarea
                        value={saveContent}
                        onChange={(e) => setSaveContent(e.target.value)}
                        rows={4}
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSaving(false)}>
                     Cancel
                  </Button>
                  <Button onClick={handleSaveTemplate}>Save</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
