import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';

import { toast } from 'sonner';

import { getNotes } from '@/features/notes/api';

import {
   loadTagMetadata,
   createTag,
   updateTag,
   deleteTag,
   discoverTagsFromNotes,
   cascadeRenameTag,
   cascadeDeleteTag,
   type TagMetadata,
} from '@/shared/lib/tags';
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
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/shared/components/ui/dialog';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';

import {
   Tag,
   Search,
   Pencil,
   Trash2,
   ChevronLeft,
   ChevronRight,
} from 'lucide-react';

import { m } from '@/paraglide/messages';

const TAG_COLORS = [
   'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700',
   'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
   'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
   'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
   'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
   'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
   'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700',
   'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
   'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700',
];

const TAG_COLOR_VALUES = [
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

export const Route = createFileRoute('/_app/tags')({
   head: () => ({
      meta: [{ title: createTitle(m.tags_page_title()) }],
   }),
   component: RouteComponent,
});

function RouteComponent() {
   const queryClient = useQueryClient();
   const { data: notes = [] } = useQuery({
      queryKey: ['notes'],
      queryFn: getNotes,
   });

   useEffect(() => {
      const allNoteTags = Array.from(
         new Set(notes.flatMap((n) => n.tags || [])),
      );
      discoverTagsFromNotes(allNoteTags);
   }, [notes]);

   const [tagList, setTagList] = useState<TagMetadata[]>(() =>
      loadTagMetadata(),
   );
   const [searchQuery, setSearchQuery] = useState('');
   const [colorFilter, setColorFilter] = useState('all');
   const [usageFilter, setUsageFilter] = useState('all');
   const [sortBy, setSortBy] = useState<
      'name_asc' | 'name_desc' | 'usage_desc' | 'usage_asc'
   >('name_asc');
   const [currentPage, setCurrentPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);

   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [isEditOpen, setIsEditOpen] = useState(false);
   const [isDeleteOpen, setIsDeleteOpen] = useState(false);
   const [deleteTarget, setDeleteTarget] = useState<TagMetadata | null>(null);

   const [newName, setNewName] = useState('');
   const [newColor, setNewColor] = useState(TAG_COLOR_VALUES[0]);
   const [newDesc, setNewDesc] = useState('');
   const [editingTag, setEditingTag] = useState<TagMetadata | null>(null);

   const tagUsageCount = useMemo(() => {
      const count: Record<string, number> = {};
      for (const note of notes) {
         for (const tag of note.tags || []) {
            count[tag] = (count[tag] || 0) + 1;
         }
      }
      return count;
   }, [notes]);

   const filtered = useMemo(() => {
      let result = [...tagList];

      if (searchQuery) {
         const q = searchQuery.toLowerCase();
         result = result.filter(
            (t) =>
               t.name.toLowerCase().includes(q) ||
               t.description.toLowerCase().includes(q),
         );
      }
      if (colorFilter !== 'all')
         result = result.filter((t) => t.color === colorFilter);
      if (usageFilter === 'used')
         result = result.filter((t) => (tagUsageCount[t.name] || 0) > 0);
      if (usageFilter === 'unused')
         result = result.filter((t) => !tagUsageCount[t.name]);

      result.sort((a, b) => {
         const aUsage = tagUsageCount[a.name] || 0;
         const bUsage = tagUsageCount[b.name] || 0;
         switch (sortBy) {
            case 'name_asc':
               return a.name.localeCompare(b.name);
            case 'name_desc':
               return b.name.localeCompare(a.name);
            case 'usage_desc':
               return bUsage - aUsage;
            case 'usage_asc':
               return aUsage - bUsage;
            default:
               return 0;
         }
      });

      return result;
   }, [tagList, searchQuery, colorFilter, usageFilter, sortBy, tagUsageCount]);

   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
   const effectivePage = Math.min(currentPage, totalPages);
   const paginated = filtered.slice(
      (effectivePage - 1) * pageSize,
      effectivePage * pageSize,
   );

   function refreshTags() {
      setTagList([...loadTagMetadata()]);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
   }

   function handleCreate() {
      if (!newName.trim()) return;
      createTag(newName.trim(), newColor, newDesc.trim());
      refreshTags();
      setIsCreateOpen(false);
      setNewName('');
      setNewColor(TAG_COLOR_VALUES[0]);
      setNewDesc('');
      toast.success(m.tags_page_toast_created());
   }

   function handleEdit() {
      if (!editingTag || !newName.trim()) return;
      const oldName = editingTag.name;
      updateTag(oldName, {
         description: newDesc.trim(),
         name: newName.trim(),
         color: newColor,
      });
      if (oldName !== newName.trim()) cascadeRenameTag(oldName, newName.trim());
      refreshTags();
      setIsEditOpen(false);
      setEditingTag(null);
      toast.success(m.tags_page_toast_updated());
   }

   function handleDelete() {
      if (!deleteTarget) return;
      deleteTag(deleteTarget.name);
      cascadeDeleteTag(deleteTarget.name);
      refreshTags();
      setDeleteTarget(null);
      setIsDeleteOpen(false);
      toast.success(m.tags_page_toast_deleted());
   }

   function openEdit(tag: TagMetadata) {
      setEditingTag(tag);
      setNewName(tag.name);
      setNewColor(tag.color);
      setNewDesc(tag.description);
      setIsEditOpen(true);
   }

   function openCreate() {
      setNewName('');
      setNewColor(TAG_COLOR_VALUES[0]);
      setNewDesc('');
      setIsCreateOpen(true);
   }

   return (
      <div className="flex h-full flex-col p-6">
         <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">
               {m.tags_page_title()}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
               {m.tags_page_description()}
            </p>
         </div>

         <div className="mb-4 grid grid-cols-4 gap-3">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
               <Input
                  value={searchQuery}
                  onChange={(e) => {
                     setSearchQuery(e.target.value);
                     setCurrentPage(1);
                  }}
                  placeholder={m.tags_page_search()}
                  className="pl-9"
               />
            </div>
            <Select
               value={colorFilter}
               onValueChange={(v) => {
                  if (v !== null) {
                     setColorFilter(v);
                     setCurrentPage(1);
                  }
               }}
            >
               <SelectTrigger>
                  <SelectValue />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">
                     {m.tags_page_filter_color()}
                  </SelectItem>
                  {TAG_COLOR_VALUES.map((c) => (
                     <SelectItem key={c} value={c} className="capitalize">
                        {c}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
            <Select
               value={usageFilter}
               onValueChange={(v) => {
                  if (v !== null) {
                     setUsageFilter(v);
                     setCurrentPage(1);
                  }
               }}
            >
               <SelectTrigger>
                  <SelectValue />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">
                     {m.tags_page_filter_usage()}
                  </SelectItem>
                  <SelectItem value="used">
                     {m.tags_page_filter_usage_used()}
                  </SelectItem>
                  <SelectItem value="unused">
                     {m.tags_page_filter_usage_unused()}
                  </SelectItem>
               </SelectContent>
            </Select>
            <div className="flex gap-2">
               <Select
                  value={sortBy}
                  onValueChange={(v) => {
                     if (v !== null) setSortBy(v);
                  }}
               >
                  <SelectTrigger className="flex-1">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="name_asc">Name A-Z</SelectItem>
                     <SelectItem value="name_desc">Name Z-A</SelectItem>
                     <SelectItem value="usage_desc">Most Used</SelectItem>
                     <SelectItem value="usage_asc">Least Used</SelectItem>
                  </SelectContent>
               </Select>
               <Button onClick={openCreate}>{m.tags_page_create()}</Button>
            </div>
         </div>

         {paginated.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground py-20">
               <Tag className="size-8" />
               <p>
                  {searchQuery || colorFilter !== 'all' || usageFilter !== 'all'
                     ? m.tags_page_no_results()
                     : m.tags_page_empty()}
               </p>
               <p className="text-sm">
                  {searchQuery || colorFilter !== 'all' || usageFilter !== 'all'
                     ? m.tags_page_no_results_desc()
                     : m.tags_page_empty_desc()}
               </p>
            </div>
         ) : (
            <div className="flex-1 overflow-auto">
               <table className="w-full text-sm">
                  <thead>
                     <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">
                           {m.tags_page_table_name()}
                        </th>
                        <th className="pb-3 font-medium">
                           {m.tags_page_table_notes()}
                        </th>
                        <th className="pb-3 font-medium">
                           {m.tags_page_table_created()}
                        </th>
                        <th className="pb-3 font-medium">
                           {m.tags_page_table_actions()}
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     {paginated.map((tag) => (
                        <tr key={tag.name} className="border-b last:border-0">
                           <td className="py-3">
                              <Badge className={tag.color}>{tag.name}</Badge>
                              {tag.description && (
                                 <span className="ml-2 text-xs text-muted-foreground">
                                    {tag.description}
                                 </span>
                              )}
                           </td>
                           <td className="py-3">
                              {tagUsageCount[tag.name] || 0}
                           </td>
                           <td className="py-3 text-muted-foreground">
                              {new Date(tag.createdAt).toLocaleDateString()}
                           </td>
                           <td className="py-3">
                              <div className="flex gap-1">
                                 <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => openEdit(tag)}
                                 >
                                    <Pencil className="size-4" />
                                 </Button>
                                 <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                       setDeleteTarget(tag);
                                       setIsDeleteOpen(true);
                                    }}
                                 >
                                    <Trash2 className="size-4" />
                                 </Button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="flex items-center gap-2">
               <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                     setPageSize(Number(v));
                     setCurrentPage(1);
                  }}
               >
                  <SelectTrigger className="w-20">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="5">5</SelectItem>
                     <SelectItem value="10">10</SelectItem>
                     <SelectItem value="20">20</SelectItem>
                  </SelectContent>
               </Select>
               <span className="text-sm text-muted-foreground">
                  {filtered.length > 0
                     ? m.notes_page_showing({
                          to: Math.min(
                             effectivePage * pageSize,
                             filtered.length,
                          ),
                          from: (effectivePage - 1) * pageSize + 1,
                          total: filtered.length,
                       })
                     : ''}
               </span>
            </div>
            <div className="flex items-center gap-2">
               <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={effectivePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
               >
                  <ChevronLeft className="size-4" />
               </Button>
               <span className="text-sm text-muted-foreground px-2">
                  {m.notes_page_page_of({
                     current: effectivePage,
                     total: totalPages,
                  })}
               </span>
               <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={effectivePage === totalPages}
                  onClick={() =>
                     setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
               >
                  <ChevronRight className="size-4" />
               </Button>
            </div>
         </div>

         <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>{m.tags_page_create_title()}</DialogTitle>
                  <DialogDescription>
                     {m.tags_page_description()}
                  </DialogDescription>
               </DialogHeader>
               <div className="space-y-4">
                  <div>
                     <label className="text-sm font-medium">
                        {m.tags_page_tag_name()}
                     </label>
                     <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                     />
                  </div>
                  <div>
                     <label className="text-sm font-medium">
                        {m.tags_page_tag_color()}
                     </label>
                     <div className="flex flex-wrap gap-2 mt-1">
                        {TAG_COLOR_VALUES.map((c) => (
                           <button
                              key={c}
                              type="button"
                              onClick={() => setNewColor(c)}
                              className={`size-6 rounded-full border-2 ${newColor === c ? 'border-foreground' : 'border-transparent'} ${TAG_COLORS[TAG_COLOR_VALUES.indexOf(c)].split(' ')[0]}`}
                           />
                        ))}
                     </div>
                  </div>
                  <div>
                     <label className="text-sm font-medium">
                        {m.tags_page_tag_description()}
                     </label>
                     <Input
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button
                     variant="outline"
                     onClick={() => setIsCreateOpen(false)}
                  >
                     {m.tags_page_cancel()}
                  </Button>
                  <Button onClick={handleCreate}>{m.tags_page_save()}</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>{m.tags_page_edit_title()}</DialogTitle>
               </DialogHeader>
               <div className="space-y-4">
                  <div>
                     <label className="text-sm font-medium">
                        {m.tags_page_tag_name()}
                     </label>
                     <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                     />
                  </div>
                  <div>
                     <label className="text-sm font-medium">
                        {m.tags_page_tag_color()}
                     </label>
                     <div className="flex flex-wrap gap-2 mt-1">
                        {TAG_COLOR_VALUES.map((c) => (
                           <button
                              key={c}
                              type="button"
                              onClick={() => setNewColor(c)}
                              className={`size-6 rounded-full border-2 ${newColor === c ? 'border-foreground' : 'border-transparent'} ${TAG_COLORS[TAG_COLOR_VALUES.indexOf(c)].split(' ')[0]}`}
                           />
                        ))}
                     </div>
                  </div>
                  <div>
                     <label className="text-sm font-medium">
                        {m.tags_page_tag_description()}
                     </label>
                     <Input
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button
                     variant="outline"
                     onClick={() => setIsEditOpen(false)}
                  >
                     {m.tags_page_cancel()}
                  </Button>
                  <Button onClick={handleEdit}>{m.tags_page_save()}</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>
                     {m.tags_page_delete_title()}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                     {m.tags_page_delete_desc({
                        name: deleteTarget?.name || '',
                     })}
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>{m.tags_page_cancel()}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                     {m.tags_page_delete()}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
