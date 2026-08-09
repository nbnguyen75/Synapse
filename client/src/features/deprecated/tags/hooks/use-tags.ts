import { useState, useMemo } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import {
  loadTagMetadata,
  createTag,
  updateTag,
  deleteTag,
  cascadeRenameTag,
  cascadeDeleteTag,
  type TagMetadata,
} from '@/features/deprecated/tags/lib/tags';
// import { useGetNotesQuery } from '@/features/notes/hooks/api/use-get-note';
// import { getNotes } from '@/features/notes/fetch';

import { m } from '@/paraglide/messages';
import { useGetNotes } from '@/features/notes';

export const TAG_COLORS = [
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

export const TAG_COLOR_VALUES = [
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

export function useTags() {
  const queryClient = useQueryClient();
  const { data } = useGetNotes();

  const notes = data?.items ?? [];

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
    // for (const note of notes) {
    // }
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

  return {
    setIsCreateOpen,
    setIsDeleteOpen,
    setDeleteTarget,
    setSearchQuery,
    setColorFilter,
    setUsageFilter,
    setCurrentPage,
    tagUsageCount,
    effectivePage,
    setIsEditOpen,
    isCreateOpen,
    isDeleteOpen,
    deleteTarget,
    handleCreate,
    handleDelete,
    searchQuery,
    colorFilter,
    usageFilter,
    currentPage,
    setPageSize,
    setNewColor,
    totalPages,
    isEditOpen,
    setNewName,
    setNewDesc,
    handleEdit,
    openCreate,
    setSortBy,
    paginated,
    pageSize,
    filtered,
    newColor,
    openEdit,
    newName,
    newDesc,
    sortBy,
    notes,
  };
}
