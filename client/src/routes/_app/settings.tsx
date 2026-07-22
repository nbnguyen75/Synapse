import { useState, useEffect, useRef, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { toast } from 'sonner';

import {
   loadCopilotConfig,
   saveCopilotConfig,
   loadCustomTemplates,
   saveCustomTemplates,
   deleteCustomTemplate,
   DEFAULT_COPILOT_CONFIG,
   PREDEFINED_TEMPLATES,
   type CopilotConfig,
   type NoteTemplate,
   type PersonaId,
} from '@/shared/lib/copilot-config';
import { createTitle } from '@/shared/lib/metadata';

import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
   Dialog,
   DialogContent,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/shared/components/ui/dialog';
import {
   Tabs,
   TabsContent,
   TabsList,
   TabsTrigger,
} from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import { Slider } from '@/shared/components/ui/slider';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import {
   Save,
   Bot,
   Sparkles,
   FileText,
   Plus,
   Pencil,
   Trash2,
} from 'lucide-react';

import { m } from '@/paraglide/messages';

const PRESET_AVATARS = [
   'bot',
   'sparkles',
   'brain',
   'heart',
   'star',
   'zap',
   'flame',
   'droplets',
   'feather',
   'gem',
   'compass',
   'crown',
];

export const Route = createFileRoute('/_app/settings')({
   head: () => ({
      meta: [{ title: createTitle(m.settings_page_title()) }],
   }),
   component: RouteComponent,
});

function RouteComponent() {
   const [activeTab, setActiveTab] = useState('general');
   const [copilotConfig, setCopilotConfig] = useState<CopilotConfig>(() =>
      loadCopilotConfig(),
   );
   const [customTemplates, setCustomTemplates] = useState<NoteTemplate[]>(() =>
      loadCustomTemplates(),
   );
   const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
      'idle',
   );
   const [autosave, setAutosave] = useState(
      () => localStorage.getItem('synapse_autosave_enabled') !== 'false',
   );
   const [emailDigests, setEmailDigests] = useState(
      () => localStorage.getItem('synapse_email_digests') === 'true',
   );
   const [copilotAlerts, setCopilotAlerts] = useState(
      () => localStorage.getItem('synapse_copilot_alerts') === 'true',
   );
   const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

   const [avatarTab, setAvatarTab] = useState<'preset' | 'url' | 'upload'>(
      'preset',
   );
   const [customAvatarUrl, setCustomAvatarUrl] = useState('');

   const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
   const [tmplName, setTmplName] = useState('');
   const [tmplDesc, setTmplDesc] = useState('');
   const [tmplTitle, setTmplTitle] = useState('');
   const [tmplContent, setTmplContent] = useState('');
   const [editingTmplName, setEditingTmplName] = useState<string | null>(null);
   const [deleteTmplTarget, setDeleteTmplTarget] = useState<string | null>(
      null,
   );

   const persistSetting = useCallback((key: string, value: boolean) => {
      localStorage.setItem(key, String(value));
      window.dispatchEvent(new CustomEvent('synapse-settings-updated'));
   }, []);

   const debouncedSave = useCallback((config: CopilotConfig) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveStatus('saving');
      debounceRef.current = setTimeout(() => {
         saveCopilotConfig(config);
         setSaveStatus('saved');
      }, 400);
   }, []);

   function updateConfig(updates: Partial<CopilotConfig>) {
      const next = { ...copilotConfig, ...updates };
      setCopilotConfig(next);
      debouncedSave(next);
   }

   useEffect(() => {
      return () => {
         if (debounceRef.current) clearTimeout(debounceRef.current);
      };
   }, []);

   function handleManualSave() {
      saveCopilotConfig(copilotConfig);
      setSaveStatus('saved');
      toast.success(m.settings_page_toast_saved());
   }

   function handleResetDefaults() {
      setCopilotConfig({ ...DEFAULT_COPILOT_CONFIG });
      saveCopilotConfig(DEFAULT_COPILOT_CONFIG);
      setSaveStatus('saved');
      toast.success(m.settings_page_toast_saved());
   }

   function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
         toast.error(m.settings_page_toast_avatar_invalid());
         return;
      }
      const reader = new FileReader();
      reader.onload = () => {
         const dataUrl = reader.result as string;
         updateConfig({ avatar: dataUrl });
      };
      reader.readAsDataURL(file);
   }

   function handleSaveTemplate() {
      if (!tmplName.trim()) return;
      if (editingTmplName) {
         const updated = customTemplates.map((t) =>
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
         setCustomTemplates(updated);
         saveCustomTemplates(updated);
      } else {
         const newTemplate: NoteTemplate = {
            titlePattern: tmplTitle.trim(),
            description: tmplDesc.trim(),
            name: tmplName.trim(),
            content: tmplContent,
            predefined: false,
         };
         const updated = [...customTemplates, newTemplate];
         setCustomTemplates(updated);
         saveCustomTemplates(updated);
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
      const updated = deleteCustomTemplate(deleteTmplTarget);
      setCustomTemplates(updated);
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
      <div className="mx-auto max-w-3xl p-6">
         <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">
               {m.settings_page_title()}
            </h1>
         </div>

         <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
               <TabsTrigger value="general">
                  {m.settings_page_tab_general()}
               </TabsTrigger>
               <TabsTrigger value="copilot">
                  <Bot className="mr-1.5 size-3.5" />
                  {m.settings_page_tab_copilot()}
               </TabsTrigger>
               <TabsTrigger value="templates">
                  <FileText className="mr-1.5 size-3.5" />
                  {m.settings_page_tab_templates()}
               </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6 space-y-6">
               <div className="space-y-4">
                  <h2 className="text-sm font-semibold">
                     {m.settings_page_general_appearance()}
                  </h2>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                     <div>
                        <Label>{m.settings_page_general_autosave()}</Label>
                        <p className="text-xs text-muted-foreground">
                           {m.settings_page_general_autosave_desc()}
                        </p>
                     </div>
                     <Switch
                        checked={autosave}
                        onCheckedChange={(v) => {
                           setAutosave(v);
                           persistSetting('synapse_autosave_enabled', v);
                        }}
                     />
                  </div>
               </div>

               <div className="space-y-4">
                  <h2 className="text-sm font-semibold">
                     {m.settings_page_general_notifications()}
                  </h2>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                     <div>
                        <Label>{m.settings_page_general_email_digests()}</Label>
                        <p className="text-xs text-muted-foreground">
                           {m.settings_page_general_email_digests_desc()}
                        </p>
                     </div>
                     <Switch
                        checked={emailDigests}
                        onCheckedChange={(v) => {
                           setEmailDigests(v);
                           persistSetting('synapse_email_digests', v);
                        }}
                     />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                     <div>
                        <Label>
                           {m.settings_page_general_copilot_alerts()}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                           {m.settings_page_general_copilot_alerts_desc()}
                        </p>
                     </div>
                     <Switch
                        checked={copilotAlerts}
                        onCheckedChange={(v) => {
                           setCopilotAlerts(v);
                           persistSetting('synapse_copilot_alerts', v);
                        }}
                     />
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="copilot" className="mt-6 space-y-6">
               <div>
                  <h2 className="text-sm font-semibold mb-4">
                     {m.settings_page_copilot_identity()}
                  </h2>
                  <div className="space-y-4">
                     <div>
                        <Label>{m.settings_page_copilot_name()}</Label>
                        <Input
                           value={copilotConfig.name}
                           onChange={(e) =>
                              updateConfig({ name: e.target.value })
                           }
                           className="mt-1"
                        />
                     </div>
                     <div>
                        <Label>
                           {m.settings_page_copilot_temperature()} (
                           {copilotConfig.temperature.toFixed(1)})
                        </Label>
                        <Slider
                           value={[copilotConfig.temperature]}
                           onValueChange={(v: number | readonly number[]) =>
                              updateConfig({
                                 temperature: (Array.isArray(v)
                                    ? v[0]
                                    : v) as number,
                              })
                           }
                           min={0}
                           max={1}
                           step={0.1}
                           className="mt-2"
                        />
                     </div>
                     <div>
                        <Label>{m.settings_page_copilot_avatar()}</Label>
                        <div className="mt-2 flex gap-3">
                           <Tabs
                              value={avatarTab}
                              onValueChange={(v) =>
                                 setAvatarTab(v as 'preset' | 'url' | 'upload')
                              }
                           >
                              <TabsList>
                                 <TabsTrigger value="preset">
                                    Preset
                                 </TabsTrigger>
                                 <TabsTrigger value="url">URL</TabsTrigger>
                                 <TabsTrigger value="upload">
                                    {m.settings_page_copilot_import_image()}
                                 </TabsTrigger>
                              </TabsList>
                              <TabsContent value="preset" className="mt-2">
                                 <div className="flex flex-wrap gap-2">
                                    {PRESET_AVATARS.map((icon) => (
                                       <button
                                          key={icon}
                                          type="button"
                                          onClick={() =>
                                             updateConfig({ avatar: icon })
                                          }
                                          className={`flex size-9 items-center justify-center rounded-lg border ${copilotConfig.avatar === icon ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-muted hover:bg-muted'}`}
                                       >
                                          <Sparkles className="size-4" />
                                       </button>
                                    ))}
                                 </div>
                              </TabsContent>
                              <TabsContent value="url" className="mt-2">
                                 <Input
                                    value={customAvatarUrl}
                                    onChange={(e) =>
                                       setCustomAvatarUrl(e.target.value)
                                    }
                                    placeholder="https://example.com/avatar.png"
                                 />
                                 <Button
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => {
                                       if (customAvatarUrl)
                                          updateConfig({
                                             avatar: customAvatarUrl,
                                          });
                                    }}
                                 >
                                    Set URL
                                 </Button>
                              </TabsContent>
                              <TabsContent value="upload" className="mt-2">
                                 <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                 />
                              </TabsContent>
                           </Tabs>
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                  <h2 className="text-sm font-semibold mb-4">
                     {m.settings_page_copilot_personality()}
                  </h2>
                  <div className="grid grid-cols-3 gap-2">
                     {(
                        [
                           'butler',
                           'sassy',
                           'scientist',
                           'poet',
                           'concise',
                           'custom',
                        ] as PersonaId[]
                     ).map((p) => (
                        <Button
                           key={p}
                           variant={
                              copilotConfig.persona === p
                                 ? 'default'
                                 : 'outline'
                           }
                           className="capitalize"
                           onClick={() => updateConfig({ persona: p })}
                        >
                           {p}
                        </Button>
                     ))}
                  </div>
                  {copilotConfig.persona === 'custom' && (
                     <div className="mt-4 space-y-4">
                        <div>
                           <Label>Persona Name</Label>
                           <Input
                              value={copilotConfig.customPersonaName || ''}
                              onChange={(e) =>
                                 updateConfig({
                                    customPersonaName: e.target.value,
                                 })
                              }
                              className="mt-1"
                           />
                        </div>
                        <div>
                           <Label>Persona Instructions</Label>
                           <Textarea
                              value={
                                 copilotConfig.customPersonaInstructions || ''
                              }
                              onChange={(e) =>
                                 updateConfig({
                                    customPersonaInstructions: e.target.value,
                                 })
                              }
                              className="mt-1"
                              rows={3}
                           />
                        </div>
                     </div>
                  )}
               </div>

               <div>
                  <Label>{m.settings_page_copilot_prompt()}</Label>
                  <Textarea
                     value={copilotConfig.prompt}
                     onChange={(e) => updateConfig({ prompt: e.target.value })}
                     className="mt-1"
                     rows={4}
                  />
               </div>

               <div>
                  <Label>{m.settings_page_copilot_welcome()}</Label>
                  <Textarea
                     value={copilotConfig.welcomeMessage}
                     onChange={(e) =>
                        updateConfig({ welcomeMessage: e.target.value })
                     }
                     className="mt-1"
                     rows={3}
                  />
               </div>

               <div className="flex items-center gap-2">
                  <Button onClick={handleManualSave}>
                     <Save className="mr-1.5 size-4" />
                     {saveStatus === 'saving'
                        ? m.settings_page_copilot_saving()
                        : saveStatus === 'saved'
                          ? m.settings_page_copilot_saved()
                          : m.settings_page_copilot_save()}
                  </Button>
                  <Button variant="outline" onClick={handleResetDefaults}>
                     Reset to Default
                  </Button>
               </div>
            </TabsContent>

            <TabsContent value="templates" className="mt-6 space-y-4">
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

               {customTemplates.length > 0 && (
                  <>
                     <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
                        {m.settings_page_copilot_persona_custom()}
                     </h3>
                     {customTemplates.map((t) => (
                        <div
                           key={t.name}
                           className="flex items-center justify-between rounded-lg border p-4"
                        >
                           <div>
                              <div className="text-sm font-medium">
                                 {t.name}
                              </div>
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
            </TabsContent>
         </Tabs>

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
      </div>
   );
}
