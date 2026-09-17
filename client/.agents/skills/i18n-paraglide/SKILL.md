---
name: i18n-paraglide
description: Create, configure, or change ARIA's Paraglide i18n integration, locale messages, locale switching, or translated UI copy. Use whenever a task mentions i18n, translations, locales, language selection, or Paraglide, even when it is phrased as adding UI text in another language.
---

# ARIA i18n with Paraglide

Use Paraglide for user-visible UI strings. Before adding anything, inspect the
existing `project.inlang` configuration and message files; extend that setup
instead of creating a second i18n system.

## Creating the integration

1. Add the Paraglide package and Vite integration only if they are absent; use
   the project's existing package manager and lockfile.
2. Keep source messages in the configured locale files (normally
   `messages/<locale>.json`), with one stable key present for every supported
   locale. Use the configured base locale as the completeness reference.
3. Configure generated output at `src/paraglide/`. This directory is generated:
   never edit generated files by hand and do not commit manual fixes there.
4. Run the configured generation/typecheck after changing messages or config.
   Import generated message functions from the generated Paraglide API rather
   than maintaining a parallel translation map.

## Usage rules

- Put a feature's UI message keys near that feature in the locale files; use
  clear, namespaced keys and preserve existing key conventions.
- Call the generated message function (for example `m.some_message()`) rather
  than passing translated text through ad-hoc props or branching on the locale.
- Pass variables through the message function for interpolation, plurals, and
  formatted values; do not concatenate translated fragments.
- Keep non-user-visible identifiers, API error codes, and backend contracts out
  of translation files. Map a user-facing error message at the feature UI edge.
- A locale switch updates Paraglide's locale state. Do not fork route trees or
  duplicate feature components by language.
- Do not translate secrets, logs, telemetry identifiers, or product data whose
  meaning must remain machine-stable.

## Review checklist

- Is there one source of truth for configuration and locale messages?
- Are generated `src/paraglide/` files untouched by hand?
- Does every supported locale contain the new key and required parameters?
- Does TypeScript validate the message call and interpolation variables?
- Is locale-specific UI text confined to the UI layer, with no changes to
  backend contracts or domain rules?
