import type { RegisterFormValues } from '@/features/auth/schemas';

import { useState, type BaseSyntheticEvent, type ComponentProps } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { Icon } from '@iconify/react';

interface RegisterFormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  onSubmit?: (
    data: RegisterFormValues,
    $event?: BaseSyntheticEvent,
  ) => Promise<void> | void;
  form: UseFormReturn<RegisterFormValues>;
  isPending?: boolean;
}

export default function RegisterForm({
  isPending,
  className,
  onSubmit,
  form,
  ...restProps
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const { handleSubmit, control } = form;

  return (
    <form
      onSubmit={handleSubmit((data, $event) => onSubmit?.(data, $event))}
      className={cn('w-full space-y-4', className)}
      {...restProps}
    >
      <Controller
        name="email"
        control={control}
        render={({ fieldState, field }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-xs font-medium"
              htmlFor="register-email"
            >
              {m.register_page_email_label()}
            </FieldLabel>

            <Input
              {...field}
              id="register-email"
              type="email"
              placeholder={m.auth_placeholder_email()}
              aria-invalid={fieldState.invalid}
              disabled={isPending}
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ fieldState, field }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-xs font-medium"
              htmlFor="register-password"
            >
              {m.register_page_password_label()}
            </FieldLabel>

            <InputGroup>
              <InputGroupInput
                {...field}
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={m.auth_placeholder_password()}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
              />

              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowPassword(!showPassword)}
                  className="dark:text-muted-foreground text-muted-foreground/80 dark:hover:text-foreground hover:text-foreground/80 hover:bg-transparent! cursor-pointer"
                  title={
                    showPassword
                      ? m.login_page_hide_password()
                      : m.login_page_show_password()
                  }
                >
                  <Icon
                    icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'}
                    className="h-4 w-4"
                  />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ fieldState, field }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-xs font-medium"
              htmlFor="register-confirm-password"
            >
              {m.register_page_password_label()}
            </FieldLabel>

            <Input
              {...field}
              id="register-confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder={m.auth_placeholder_password()}
              aria-invalid={fieldState.invalid}
              disabled={isPending}
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </form>
  );
}
