package com.synapse.notes.note;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.synapse.notes.common.annotation.CurrentUserId;
import com.synapse.notes.common.response.ApiResponse;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    private final NoteRepository noteRepository;

    public NoteController(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    @GetMapping("")
    public ApiResponse<List<Note>> getNotes(@CurrentUserId String userId) {
        final var noteList = noteRepository.findByUserId(userId);

        return ApiResponse.success(noteList);
    }

}
