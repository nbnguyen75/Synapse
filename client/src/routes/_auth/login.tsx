import type { LoginFormInput, LoginPayload } from '@/features/auth/schemas';

import { useForm } from 'react-hook-form';
import { useState } from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { toast } from 'sonner';

import { createTitle } from '@/config/metadata';
import { env } from '@/config/env';

import { getTranslatedAuthErrorMessage, signIn } from '@/lib/auth';
import { m } from '@/paraglide/messages';

import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

import { Icon } from '@iconify/react';

import { LoginForm } from '@/features/auth/components';
import { loginSchema } from '@/features/auth/schemas';

export const Route = createFileRoute('/_auth/login')({
  head: () => ({
    meta: [
      {
        title: createTitle(m.login_page_title()),
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const [isEmailPending, setIsEmailPending] = useState(false);
  const [isSocialPending, setIsSocialPending] = useState(false);

  const form = useForm<LoginFormInput>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: { password: '', email: '' },
    mode: 'onBlur',
  });

  const {
    formState: { isSubmitting, isDirty },
  } = form;

  const isPending = isSubmitting || isEmailPending || isSocialPending;

  const handleOnSubmit = async (data: LoginPayload) => {
    try {
      const { password, email } = data;

      await signIn.email(
        {
          callbackURL: '/',
          password,
          email,
        },
        {
          onError({ error }) {
            toast.error(m.auth_failed(), {
              description: getTranslatedAuthErrorMessage(String(error.code)),
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

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    try {
      await signIn.social(
        {
          callbackURL: `${window.location.origin}/`,
          provider,
        },
        {
          onError({ error }) {
            // TODO: get error code rather than message
            const { message } = error;

            toast.error(m.login_page_oauth_failed(), {
              description: message || m.login_page_oauth_description({ provider }),
            });

            setIsSocialPending(false);
          },
          onRequest: () => {
            setIsSocialPending(true);
          },
        },
      );
    } catch (error) {
      console.error(error);

      toast.error(m.login_page_oauth_failed(), {
        description: m.login_page_oauth_description({ provider }),
      });
    } finally {
      setIsSocialPending(false);
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          <span
            // Paraglide message embeds a styled <span> for the app name via an
            // HTML param; the content is a static i18n string, never user input.
            dangerouslySetInnerHTML={{
              __html: m.login_page_welcome({
                appName: `<span class="text-primary">${env.VITE_APP_NAME}</span>`,
              }),
            }}
          />
        </h1>

        <div className="mt-1.5 text-xs text-muted-foreground space-x-1">
          <span>{m.login_page_no_account()}</span>

          <Button
            variant="link"
            className="h-auto p-0 font-semibold text-[11px] text-foreground hover:bg-transparent! hover:underline cursor-pointer"
            nativeButton={false}
            render={<Link to="/register">{m.login_page_sign_up()}</Link>}
          />
        </div>
      </div>

      <div className="w-full space-y-7">
        <LoginForm
          id="synapse-login-form"
          form={form}
          onSubmit={handleOnSubmit}
          isPending={isPending}
        />

        <Button
          form="synapse-login-form"
          type="submit"
          className="w-full cursor-pointer"
          disabled={isPending || !isDirty}
        >
          {isSubmitting || isEmailPending ? (
            <div className="flex items-center gap-1.5">
              <Spinner className="h-4 w-4" />
              <span>{m.login_page_please_wait()}</span>
            </div>
          ) : (
            <span>{m.login_page_submit()}</span>
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="w-full flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-muted/80" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {m.login_page_or()}
        </span>
        <div className="h-px flex-1 bg-muted/80" />
      </div>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <Button
          variant="outline"
          type="button"
          onClick={() => void handleSocialLogin('github')}
          disabled={true}
          className="cursor-pointer h-9 font-medium transition-all text-xs"
        >
          <Icon icon="simple-icons:github" className="h-4 w-4" />
          <span>{m.auth_oauth_github()}</span>
        </Button>

        <Button
          variant="outline"
          type="button"
          onClick={() => void handleSocialLogin('google')}
          disabled={isPending}
          className="cursor-pointer h-9 font-medium transition-all text-xs"
        >
          <Icon icon="simple-icons:google" className="h-4 w-4" />
          <span>{m.auth_oauth_google()}</span>
        </Button>
      </div>

      {/* Footer */}
      <div className="text-[10px] text-center text-muted-foreground/85 mt-8 leading-relaxed max-w-70">
        {m.login_page_footer()}{' '}
        {/* oxlint-disable-next-line jsx-a11y/anchor-is-valid -- Placeholder Terms link, no route yet */}
        <a href="#" className="underline hover:text-muted-foreground transition-colors">
          {m.login_page_terms()}
        </a>{' '}
        {m.login_page_and()}{' '}
        {/* oxlint-disable-next-line jsx-a11y/anchor-is-valid -- Placeholder Privacy link, no route yet */}
        <a href="#" className="underline hover:text-muted-foreground transition-colors">
          {m.login_page_privacy()}
        </a>
        .
      </div>
    </>
  );
}
