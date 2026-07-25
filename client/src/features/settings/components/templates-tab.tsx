import { useState } from 'react';

import {
   PREDEFINED_TEMPLATES,
   type NoteTemplate,
} from '@/features/chat/lib/copilot-config';

import { m } from '@/paraglide/messages';

import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
   Dialog,
   DialogContent,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Plus, Pencil, Trash2 } from 'lucide-react';

interface TemplatesTabProps {
   onTemplatesChange: (templates: NoteTemplate[]) => void;
   templates: NoteTemplate[];
}

export default function TemplatesTab({
   onTemplatesChange,
   templates,
}: TemplatesTabProps) {
   const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
   const [tmplName, setTmplName] = useState('');
   const [tmplDesc, setTmplDesc] = useState('');
   const [tmplTitle, setTmplTitle] = useState('');
   const [tmplContent, setTmplContent] = useState('');
   const [editingTmplName, setEditingTmplName] = useState<string | null>(null);
   const [deleteTmplTarget, setDeleteTmplTarget] = useState<string | null>(
      null,
   );

   function handleSaveTemplate() {
      if (!tmplName.trim()) return;
      if (editingTmplName) {
         const updated = templates.map((t) =>
            t.name === editingTmplName
               ? {
                    ...t,
                    titlePattern: tmplTitle.trim(),
                    description: tmplDesc.trim(),
                    name: tmplName.trim(),
                    content: tmplContent,
                 }
               : t,
         );
         onTemplatesChange(updated);
      } else {
         const newTemplate: NoteTemplate = {
            titlePattern: tmplTitle.trim(),
            description: tmplDesc.trim(),
            name: tmplName.trim(),
            content: tmplContent,
            predefined: false,
         };
         onTemplatesChange([...templates, newTemplate]);
      }
      setTemplateEditorOpen(false);
      setEditingTmplName(null);
      setTmplName('');
      setTmplDesc('');
      setTmplTitle('');
      setTmplContent('');
   }

   function handleDeleteTemplate() {
      if (!deleteTmplTarget) return;
      const updated = templates.filter((t) => t.name !== deleteTmplTarget);
      onTemplatesChange(updated);
      setDeleteTmplTarget(null);
   }

   function openTemplateEditor(template?: NoteTemplate) {
      if (template) {
         setEditingTmplName(template.name);
         setTmplName(template.name);
         setTmplDesc(template.description);
         setTmplTitle(template.titlePattern);
         setTmplContent(template.content);
      } else {
         setEditingTmplName(null);
         setTmplName('');
         setTmplDesc('');
         setTmplTitle('');
         setTmplContent('');
      }
      setTemplateEditorOpen(true);
   }

   return (
      <>
         <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-sm font-semibold">
                  {m.settings_page_tab_templates()}
               </h2>
               <Button size="sm" onClick={() => openTemplateEditor()}>
                  <Plus className="mr-1 size-3.5" />
                  {m.settings_page_template_create()}
               </Button>
            </div>

            {PREDEFINED_TEMPLATES.map((t) => (
               <div
                  key={t.name}
                  className="flex items-center justify-between rounded-lg border p-4"
               >
                  <div>
                     <div className="text-sm font-medium">{t.name}</div>
                     <p className="text-xs text-muted-foreground">
                        {t.description}
                     </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                     Predefined
                  </span>
               </div>
            ))}

            {templates.length > 0 && (
               <>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
                     {m.settings_page_copilot_persona_custom()}
                  </h3>
                  {templates.map((t) => (
                     <div
                        key={t.name}
                        className="flex items-center justify-between rounded-lg border p-4"
                     >
                        <div>
                           <div className="text-sm font-medium">{t.name}</div>
                           <p className="text-xs text-muted-foreground">
                              {t.description}
                           </p>
                        </div>
                        <div className="flex gap-1">
                           <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openTemplateEditor(t)}
                           >
                              <Pencil className="size-4" />
                           </Button>
                           <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteTmplTarget(t.name)}
                           >
                              <Trash2 className="size-4" />
                           </Button>
                        </div>
                     </div>
                  ))}
               </>
            )}
         </div>

         <Dialog open={templateEditorOpen} onOpenChange={setTemplateEditorOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>
                     {editingTmplName
                        ? 'Edit Template'
                        : m.settings_page_template_create()}
                  </DialogTitle>
               </DialogHeader>
               <div className="space-y-4">
                  <div>
                     <Label>{m.settings_page_template_name()}</Label>
                     <Input
                        value={tmplName}
                        onChange={(e) => setTmplName(e.target.value)}
                     />
                  </div>
                  <div>
                     <Label>{m.settings_page_template_description()}</Label>
                     <Input
                        value={tmplDesc}
                        onChange={(e) => setTmplDesc(e.target.value)}
                     />
                  </div>
                  <div>
                     <Label>{m.settings_page_template_title_pattern()}</Label>
                     <Input
                        value={tmplTitle}
                        onChange={(e) => setTmplTitle(e.target.value)}
                     />
                  </div>
                  <div>
                     <Label>{m.settings_page_template_content()}</Label>
                     <Textarea
                        value={tmplContent}
                        onChange={(e) => setTmplContent(e.target.value)}
                        rows={6}
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button
                     variant="outline"
                     onClick={() => setTemplateEditorOpen(false)}
                  >
                     Cancel
                  </Button>
                  <Button onClick={handleSaveTemplate}>Save</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         <AlertDialog
            open={!!deleteTmplTarget}
            onOpenChange={(o) => {
               if (!o) setDeleteTmplTarget(null);
            }}
         >
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>
                     {m.notes_page_template_delete_title()}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                     {m.notes_page_template_delete_desc({
                        name: deleteTmplTarget || '',
                     })}
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTemplate}>
                     Delete
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
