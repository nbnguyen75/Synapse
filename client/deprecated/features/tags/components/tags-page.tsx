import { useEffect } from 'react';

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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import {
  Tag,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { useTags, TAG_COLORS, TAG_COLOR_VALUES } from '../hooks/use-tags';
import { discoverTagsFromNotes } from '../lib/tags';

function TagsPage() {
  const {
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
  } = useTags();

  // useEffect(() => {
  //   const allNoteTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));
  //   discoverTagsFromNotes(allNoteTags);
  // }, [notes]);

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
            <SelectItem value="all">{m.tags_page_filter_color()}</SelectItem>
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
            <SelectItem value="all">{m.tags_page_filter_usage()}</SelectItem>
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
              <SelectItem value="name_asc">
                {m.tags_page_sort_name_az()}
              </SelectItem>
              <SelectItem value="name_desc">
                {m.tags_page_sort_name_za()}
              </SelectItem>
              <SelectItem value="usage_desc">
                {m.tags_page_sort_most_used()}
              </SelectItem>
              <SelectItem value="usage_asc">
                {m.tags_page_sort_least_used()}
              </SelectItem>
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
                <th className="pb-3 font-medium">{m.tags_page_table_name()}</th>
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
                  <td className="py-3">{tagUsageCount[tag.name] || 0}</td>
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
                  to: Math.min(effectivePage * pageSize, filtered.length),
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
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.tags_page_create_title()}</DialogTitle>
            <DialogDescription>{m.tags_page_description()}</DialogDescription>
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
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
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
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {m.tags_page_cancel()}
            </Button>
            <Button onClick={handleEdit}>{m.tags_page_save()}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.tags_page_delete_title()}</AlertDialogTitle>
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

export default TagsPage;
