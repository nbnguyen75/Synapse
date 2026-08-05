import type { LoginFormValues } from '@/features/auth/schemas';

import { useState, type BaseSyntheticEvent, type ComponentProps } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { toast } from 'sonner';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Icon } from '@iconify/react';

interface LoginFormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  onSubmit?: (
    data: LoginFormValues,
    $event?: BaseSyntheticEvent,
  ) => Promise<void> | void;
  form: UseFormReturn<LoginFormValues>;
  isPending?: boolean;
}

export default function LoginForm({
  isPending,
  className,
  onSubmit,
  form,
  ...restProps
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const { handleSubmit, setValue, control, trigger } = form;

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
            <FieldLabel className="text-xs font-medium" htmlFor="login-email">
              {m.login_page_email_label()}
            </FieldLabel>

            <Input
              {...field}
              id="login-email"
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
            <div className="flex items-center justify-between">
              <FieldLabel
                className="text-xs font-medium"
                htmlFor="login-password"
              >
                {m.login_page_password_label()}
              </FieldLabel>

              <Button
                variant="ghost"
                size="xs"
                type="button"
                onClick={() => {
                  setValue('email', 'demo@synapse.dev');
                  setValue('password', 'Demo@12345');
                  trigger();
                  toast.info(m.login_page_demo_loaded());
                }}
                className="cursor-pointer dark:text-muted-foreground text-muted-foreground/80 dark:hover:text-foreground hover:text-foreground/80 hover:bg-transparent!"
              >
                {m.login_page_fill_demo()}
              </Button>
            </div>

            <InputGroup>
              <InputGroupInput
                {...field}
                id="login-password"
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
    </form>
  );
}
