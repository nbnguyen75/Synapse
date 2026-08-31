import type {
  BulkNoteActions,
  GenerateNoteTitleInput,
  NoteIdParams,
  NoteInputPayload,
  NotesQueryParams,
} from '@/features/notes/schemas';
import type { Note } from '@/features/notes/types/note';
import type { EnsureRouter } from '@/lib/fetch';
import type {
  ApiSuccessResponse,
  PaginatedApiSuccessResponse,
} from '@/types/response';

export type NotesApiParams = Omit<NotesQueryParams, 'sort'> & {
  sort: (NotesQueryParams['sort'] | (string & {}))[];
  archived?: boolean;
  favorite?: boolean;
  trashed?: boolean;
};
export type PatchNoteInput = {
  status?: 'ACTIVE' | 'ARCHIVED' | 'TRASHED';
  favorite?: boolean;
  pinned?: boolean;
};

export type NotesFetchRouter = EnsureRouter<{
  '/api/v1/notes/:id': {
    $put: {
      response: ApiSuccessResponse<Note>;
      body: NoteInputPayload;
      params: NoteIdParams;
    };
    $patch: {
      response: ApiSuccessResponse<Note>;
      body: PatchNoteInput;
      params: NoteIdParams;
    };
    $delete: {
      response: ApiSuccessResponse<Record<never, never>>;
      params: { id: string };
    };
    $get: {
      response: ApiSuccessResponse<Note>;
      params: NoteIdParams;
    };
  };
  '/api/v1/notes': {
    $get: {
      response: PaginatedApiSuccessResponse<Note>;
      query: NotesApiParams | undefined;
    };
    $post: {
      response: ApiSuccessResponse<Note>;
      body: NoteInputPayload;
    };
  };
  '/api/v1/ai/generator/note-title': {
    $post: {
      response: ApiSuccessResponse<Prettify<Pick<Note, 'title'>>>;
      body: GenerateNoteTitleInput;
    };
  };
  '/api/v1/notes/bulk/actions': {
    $post: {
      response: ApiSuccessResponse<number>;
      body: BulkNoteActions;
    };
  };
  '/api/v1/notes/trash': {
    $delete: {
      response: ApiSuccessResponse<Record<never, never>>;
    };
  };
}>;
