import { useForm } from 'react-hook-form';
import { useState } from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { toast } from 'sonner';

import {
  registerSchema,
  type RegisterFormInput,
  type RegisterPayload,
} from '@/features/auth/schemas';
import { RegisterForm } from '@/features/auth/components';

import { createTitle } from '@/config/metadata';

import {
  getTranslatedAuthErrorMessage,
  signUp,
  type AuthErrorCode,
} from '@/lib/auth';
import { m } from '@/paraglide/messages';

import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_auth/register')({
  head: () => ({
    meta: [
      {
        title: createTitle(m.register_page_title()),
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const [isEmailPending, setIsEmailPending] = useState(false);

  const form = useForm<RegisterFormInput>({
    defaultValues: { confirmPassword: '', password: '', email: '' },
    resolver: standardSchemaResolver(registerSchema),
    mode: 'onBlur',
  });

  const {
    formState: { isSubmitting },
  } = form;

  const isPending = isSubmitting || isEmailPending;

  const handleOnSubmit = async (data: RegisterPayload) => {
    try {
      const { password, email } = data;

      await signUp.email(
        {
          name: data.email.split('@')[0],
          callbackURL: '/',
          password,
          email,
        },
        {
          onError({ error }) {
            const errorCode = error.code as AuthErrorCode;

            toast.error(m.auth_failed(), {
              description: getTranslatedAuthErrorMessage(errorCode),
            });

            setIsEmailPending(false);
          },
          onRequest: () => {
            setIsEmailPending(true);
          },
        },
      );
    } catch (error) {
      console.error(error);

      toast.error(m.auth_failed(), { description: m.auth_unexpected_error() });
    } finally {
      setIsEmailPending(false);
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {m.register_page_heading()}
        </h1>

        <div className="mt-1.5 text-xs text-muted-foreground space-x-1">
          <span>{m.register_page_has_account()}</span>

          <Button
            variant="link"
            className="h-auto p-0 font-semibold text-[11px] text-foreground hover:bg-transparent! hover:underline cursor-pointer"
            nativeButton={false}
            render={<Link to="/login">{m.register_page_sign_in()}</Link>}
          />
        </div>
      </div>

      <div className="w-full space-y-7">
        <RegisterForm
          id="synapse-register-form"
          form={form}
          onSubmit={handleOnSubmit}
          isPending={isPending}
        />

        <Button
          form="synapse-register-form"
          type="submit"
          className="w-full cursor-pointer"
          disabled={isPending}
        >
          {isSubmitting || isEmailPending ? (
            <div className="flex items-center gap-1.5">
              <Spinner className="h-4 w-4" />
              <span>{m.register_page_please_wait()}</span>
            </div>
          ) : (
            <span>{m.register_page_submit()}</span>
          )}
        </Button>
      </div>

      <div className="text-[10px] text-center text-muted-foreground/85 mt-8 leading-relaxed max-w-70">
        {m.register_page_footer()}{' '}
        {/* oxlint-disable-next-line jsx-a11y/anchor-is-valid -- Placeholder Terms link, no route yet */}
        <a
          href="#"
          className="underline hover:text-muted-foreground transition-colors"
        >
          {m.register_page_terms()}
        </a>{' '}
        {m.register_page_and()}{' '}
        {/* oxlint-disable-next-line jsx-a11y/anchor-is-valid -- Placeholder Privacy link, no route yet */}
        <a
          href="#"
          className="underline hover:text-muted-foreground transition-colors"
        >
          {m.register_page_privacy()}
        </a>
        .
      </div>
    </>
  );
}
