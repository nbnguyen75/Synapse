package com.synapse.notes;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/notes")
public class NoteController {
    private final NoteRepository noteRepository;

    public NoteController(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    @GetMapping("")
    public ResponseEntity<?> getNotes() {
        final var noteList = noteRepository.findByUserId("");

        var data = new Object(){
            public final Boolean success = true;
            public final Object data = noteList;
        };

        return ResponseEntity.ok(data);
    }

}
