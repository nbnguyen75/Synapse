# Synapse — Product Overview

## What is Synapse?

Synapse is a **Personal Knowledge Assistant** — an AI-powered note-taking app.
Users write notes, the system automatically embeds them, and users can "chat"
with an AI that answers questions grounded in their own notes (RAG). The AI
also has agentic capabilities, such as creating reminders from note content.

This repo (`synapse-web`) is the **web client** for Synapse — a React SPA that
talks to the backend services (Auth, Notes, AI) through a Kong API gateway.

## Core User-Facing Features

| Area       | Feature                                                                    |
| ---------- | -------------------------------------------------------------------------- |
| Auth       | Register, login, JWT-based session (access + refresh token)                |
| Notes      | Create / read / update / delete notes                                      |
| AI Chat    | Ask questions about your notes, get answers grounded in note content (RAG) |
| Agentic AI | AI can summarize notes and create reminders from note content              |
| Reminders  | Notifications for reminders derived from notes                             |

## MVP Scope (Client)

The client MVP ships three screens:

1. **Login** — calls Auth service via Kong, stores JWT
2. **Notes list** — CRUD notes via Notes service (Spring Boot backend) via Kong
3. **AI Chat** — ask a question, get a RAG-grounded answer from the AI service via Kong

## Post-MVP Direction (client-relevant)

- Chat UI evolves to show agentic tool calls (e.g. "reminder created" confirmations)
- Notifications UI for reminder delivery (event-driven backend, Epic 4)
- i18n: English + Vietnamese via Paraglide-JS
- Observability hooks (client-side logging/error reporting) once backend Epic 5 lands

## Non-Goals (for this repo)

- Backend service implementation (Auth/Notes/AI services, Kong config, k8s manifests,
  GCP infra) — those live in their own repos/services. This repo only _consumes_ them
  through the gateway.
