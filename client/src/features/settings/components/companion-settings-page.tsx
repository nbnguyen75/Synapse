import { Controller, useForm, useWatch } from 'react-hook-form';
import { useEffect } from 'react';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';

import {
  companionSettingsSchema,
  DEFAULT_COMPANION_SETTINGS,
  useGetCompanionSettingsQuery,
  useUpdateCompanionSettingsMutation,
  type CompanionSettingsFormInput,
  type CompanionSettingsPayload,
} from '@/features/companion';
import {
  COMPANION_RESPONSE_LENGTH_OPTIONS,
  COMPANION_SETTINGS_LANGUAGE_OPTIONS,
  COMPANION_SETTINGS_PRESET_OPTIONS,
} from '@/features/settings/constants';

import { useFormSaveShortcut } from '@/hooks/use-form-save-shortcut';

import { m } from '@/paraglide/messages';

import { LexicalEditor } from '@/components/shared/editor';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { SaveIcon } from 'lucide-react';

export default function CompanionSettingsPage() {
  const {
    data: companionSettings = DEFAULT_COMPANION_SETTINGS,
    isLoading: isLoadingCompanionSettings,
  } = useGetCompanionSettingsQuery();
  const {
    isPending: isUpdatingCompanionSettings,
    mutate: updateCompanionSettings,
  } = useUpdateCompanionSettingsMutation();

  const form = useForm<CompanionSettingsFormInput>({
    resolver: standardSchemaResolver(companionSettingsSchema),
    defaultValues: companionSettings,
    mode: 'onBlur',
  });

  const {
    formState: { isDirty },
    handleSubmit,
    control,
    reset,
  } = form;

  const [watchedPreset] = useWatch({
    name: ['preset'],
    control,
  });

  useEffect(() => {
    if (companionSettings) {
      reset(companionSettings);
    }
  }, [companionSettings, reset]);

  const isPending = isUpdatingCompanionSettings;

  const onSubmit = (data: CompanionSettingsPayload) => {
    updateCompanionSettings({ body: data });
  };

  useFormSaveShortcut({
    onSubmit: (data) => {
      if (!form.formState.isDirty) return;
      onSubmit(data as CompanionSettingsPayload);
    },
    isSubmitting: isPending,
    form,
  });

  if (isLoadingCompanionSettings) {
    return (
      <div className="w-full space-y-4">
        {/* Bot Name */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Response Length */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>

        {/* useEmoji - Switch row */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-3">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>

        {/* Preset */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Custom Instructions (optional block) */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <form
        onSubmit={handleSubmit((data) =>
          onSubmit(data as CompanionSettingsPayload),
        )}
        className="w-full space-y-5"
        id="companion-settings-form"
      >
        {/* Bot Name */}
        <Controller
          name="botName"
          control={control}
          render={({ fieldState, field }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs font-medium" htmlFor="botName">
                {m.settings_companion_bot_name()}
              </FieldLabel>

              <Input
                {...field}
                id="botName"
                placeholder={m.settings_companion_bot_name_placeholder()}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Response Length */}
        <Controller
          name="responseLength"
          control={control}
          render={({ fieldState, field }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                className="text-xs font-medium"
                htmlFor="responseLength"
              >
                {m.settings_companion_response_length()}
              </FieldLabel>

              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
                items={COMPANION_RESPONSE_LENGTH_OPTIONS}
              >
                <SelectTrigger id="responseLength" className="w-full">
                  <SelectValue
                    placeholder={m.settings_companion_response_length_placeholder()}
                  />
                </SelectTrigger>

                <SelectContent>
                  {COMPANION_RESPONSE_LENGTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Language */}
        <Controller
          name="language"
          control={control}
          render={({ fieldState, field }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs font-medium" htmlFor="language">
                {m.settings_companion_language()}
              </FieldLabel>

              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
                items={COMPANION_SETTINGS_LANGUAGE_OPTIONS}
              >
                <SelectTrigger id="language" className="w-full">
                  <SelectValue
                    placeholder={m.settings_companion_language_placeholder()}
                  />
                </SelectTrigger>

                <SelectContent>
                  {COMPANION_SETTINGS_LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="useEmoji"
          control={control}
          render={({ field }) => (
            <Field className="flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-2">
                <FieldLabel className="text-xs font-medium" htmlFor="useEmoji">
                  {m.settings_companion_use_emoji()}
                </FieldLabel>
                <FieldDescription>
                  {m.settings_companion_use_emoji_desc()}
                </FieldDescription>
              </div>

              <Switch
                id="useEmoji"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isPending}
              />
            </Field>
          )}
        />

        {/* Preset */}
        <Controller
          name="preset"
          control={control}
          render={({ fieldState, field }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs font-medium" htmlFor="preset">
                {m.settings_companion_preset()}
              </FieldLabel>

              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
                items={COMPANION_SETTINGS_PRESET_OPTIONS}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={m.settings_companion_preset_placeholder()}
                  />
                </SelectTrigger>

                <SelectContent>
                  {COMPANION_SETTINGS_PRESET_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Custom Instructions - chỉ hiện khi preset = custom */}
        {watchedPreset === 'custom' && (
          <Controller
            name="customInstructions"
            control={control}
            render={({ fieldState, field }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  className="text-xs font-medium"
                  htmlFor="customInstructions"
                >
                  {m.settings_companion_custom_instructions()}
                </FieldLabel>

                <LexicalEditor
                  {...field}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  id="custom-instructions"
                  className="h-full max-h-130"
                  placeholder={m.settings_companion_custom_instructions_placeholder()}
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

        <Button type="submit" disabled={isPending || !isDirty}>
          <SaveIcon />
          {m.settings_page_companion_save()}
        </Button>
      </form>
    </div>
  );
}
