import type {
  BulkNoteActions,
  GenerateNoteTitleInput,
  NoteIdParams,
  NoteInputPayload,
  NotesQueryParams,
} from '@/features/notes/schemas';
import type {
  ApiSuccessResponse,
  PaginatedApiSuccessResponse,
} from '@/types/response';
import type { Note } from '@/features/notes/types/note';
import type { EnsureRouter } from '@/lib/fetch';

export type NotesApiParams = Omit<NotesQueryParams, 'sort'> & {
  sort: (NotesQueryParams['sort'] | (string & {}))[];
  archived?: boolean;
  favorite?: boolean;
  trashed?: boolean;
};

export type NotesFetchRouter = EnsureRouter<{
  '/api/v1/notes/:id': {
    $delete: {
      response: ApiSuccessResponse<Record<never, never>>;
      params: {
        id: string;
      };
    };
    $put: {
      response: ApiSuccessResponse<Note>;
      body: NoteInputPayload;
      params: NoteIdParams;
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
  '/api/v1/notes/:id/unarchive': {
    $patch: {
      params: {
        id: string;
      };
      response: ApiSuccessResponse<Note>;
    };
  };
  '/api/v1/notes/:id/favorite': {
    $patch: {
      params: {
        id: string;
      };
      response: ApiSuccessResponse<Note>;
    };
  };
  '/api/v1/notes/:id/archive': {
    $patch: {
      params: {
        id: string;
      };
      response: ApiSuccessResponse<Note>;
    };
  };
  '/api/v1/notes/:id/restore': {
    $patch: {
      params: {
        id: string;
      };
      response: ApiSuccessResponse<Note>;
    };
  };
  '/api/v1/notes/:id/trash': {
    $patch: {
      params: {
        id: string;
      };
      response: ApiSuccessResponse<Note>;
    };
  };
  '/api/v1/notes/:id/pin': {
    $patch: {
      params: {
        id: string;
      };
      response: ApiSuccessResponse<Note>;
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
