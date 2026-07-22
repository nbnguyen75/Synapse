import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { toast } from 'sonner';
import * as z from 'zod';

import { createTitle } from '@/shared/lib/metadata';

import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field';
import { Spinner } from '@/shared/components/ui/spinner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

import { Icon } from '@iconify/react';

import { signIn } from '@/core/auth-client';
import { m } from '@/paraglide/messages';
import { env } from '@/env';

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

const loginSchema = z.object({
   password: z
      .string()
      .min(1, m.validation_password_required())
      .min(6, m.validation_password_min()),
   email: z.email(m.validation_email_invalid()),
});

type LoginForm = z.infer<typeof loginSchema>;

function RouteComponent() {
   const navigate = useNavigate();
   const [showPassword, setShowPassword] = useState(false);

   const form = useForm<LoginForm>({
      resolver: standardSchemaResolver(loginSchema),
      defaultValues: { password: '', email: '' },
      mode: 'onBlur',
   });

   const {
      formState: { isSubmitting },
      handleSubmit,
      setError,
      setValue,
      control,
      trigger,
   } = form;

   const onSubmit = async (data: LoginForm) => {
      try {
         const { error } = await signIn.email({
            password: data.password,
            callbackURL: '/notes',
            email: data.email,
         });

         if (error) {
            toast.error(m.auth_failed(), {
               description: error.message || m.auth_invalid_credentials(),
            });
            setError('root', {
               message: error.message || m.auth_invalid_credentials(),
            });
            return;
         }

         toast.success(m.auth_login_success(), {
            description: m.auth_welcome_back({ appName: env.VITE_APP_NAME }),
         });

         void navigate({ to: '/notes' });
      } catch (error) {
         const err = error as Error;

         const message = err?.message || m.auth_unexpected_error();
         toast.error(m.auth_failed(), { description: message });
         setError('root', { message });
      }
   };

   const handleSocialLogin = async (provider: 'github' | 'google') => {
      try {
         const { error } = await signIn.social({
            callbackURL: '/notes',
            provider,
         });

         if (error) {
            toast.error(m.login_page_oauth_failed(), {
               description:
                  error.message || m.login_page_oauth_description({ provider }),
            });
            setError('root', {
               message:
                  error.message || m.login_page_oauth_description({ provider }),
            });
         }
      } catch (error) {
         const err = error as Error;

         const message =
            err?.message || m.login_page_oauth_description({ provider });
         toast.error(m.login_page_oauth_failed(), { description: message });
         setError('root', { message });
      }
   };

   return (
      <div className="w-full max-w-95 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* Top Minimalist Icon */}
         <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg text-white">
            <Icon icon="lucide:archive" className="h-5 w-5 text-zinc-100" />
         </div>

         {/* Header Block */}
         <div className="text-center mb-6">
            <h1 className="text-xl font-semibold tracking-tight text-white">
               {m.login_page_welcome({ appName: env.VITE_APP_NAME })}
            </h1>
            <p className="mt-1.5 text-xs text-zinc-400">
               {m.login_page_no_account()}{' '}
               <Button
                  variant="link"
                  onClick={() => navigate({ to: '/register' })}
                  className="h-auto p-0 font-medium text-white hover:underline cursor-pointer"
               >
                  {m.login_page_sign_up()}
               </Button>
            </p>
         </div>

         {/* Inline Error Alert */}
         {form.formState.errors.root && (
            <div className="w-full flex items-start gap-2.5 rounded-lg bg-red-950/20 border border-red-900/40 p-3 text-xs text-red-400 mb-4 animate-in fade-in slide-in-from-top-2">
               <Icon
                  icon="lucide:shield-alert"
                  className="h-4 w-4 shrink-0 mt-0.5"
               />
               <div>{form.formState.errors.root.message}</div>
            </div>
         )}

         {/* Form */}
         <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
            {/* Email */}
            <Controller
               name="email"
               control={control}
               render={({ fieldState, field }) => (
                  <Field data-invalid={fieldState.invalid}>
                     <FieldLabel
                        className="text-xs font-medium text-zinc-400"
                        htmlFor="login-email"
                     >
                        {m.login_page_email_label()}
                     </FieldLabel>
                     <Input
                        {...field}
                        id="login-email"
                        type="email"
                        placeholder="m@example.com"
                        aria-invalid={fieldState.invalid}
                        className="w-full bg-zinc-900/40 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 h-9.5 rounded-lg text-xs"
                        disabled={isSubmitting}
                     />
                     {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                     )}
                  </Field>
               )}
            />

            {/* Password */}
            <Controller
               name="password"
               control={control}
               render={({ fieldState, field }) => (
                  <Field data-invalid={fieldState.invalid}>
                     <div className="flex items-center justify-between">
                        <FieldLabel
                           className="text-xs font-medium text-zinc-400"
                           htmlFor="login-password"
                        >
                           {m.login_page_password_label()}
                        </FieldLabel>
                        <Button
                           variant="ghost"
                           size="xs"
                           type="button"
                           onClick={() => {
                              setValue('email', 'nbnguyen.dev@gmail.com');
                              setValue('password', 'password123');
                              trigger();
                              toast.info(m.login_page_demo_loaded());
                           }}
                           className="h-auto p-0 text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-transparent cursor-pointer"
                        >
                           {m.login_page_fill_demo()}
                        </Button>
                     </div>
                     <div className="relative">
                        <Input
                           {...field}
                           id="login-password"
                           type={showPassword ? 'text' : 'password'}
                           placeholder="••••••••"
                           aria-invalid={fieldState.invalid}
                           className="w-full bg-zinc-900/40 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 h-9.5 rounded-lg pr-9 text-xs"
                           disabled={isSubmitting}
                        />
                        <Button
                           variant="ghost"
                           size="icon-xs"
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 hover:bg-transparent cursor-pointer"
                           title={
                              showPassword
                                 ? m.login_page_hide_password()
                                 : m.login_page_show_password()
                           }
                        >
                           <Icon
                              icon={
                                 showPassword ? 'lucide:eye-off' : 'lucide:eye'
                              }
                              className="h-4 w-4"
                           />
                        </Button>
                     </div>
                     {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                     )}
                  </Field>
               )}
            />

            {/* Submit */}
            <Button
               type="submit"
               className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium h-9.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
               disabled={isSubmitting}
            >
               {isSubmitting ? (
                  <div className="flex items-center gap-1.5">
                     <Spinner className="h-3 w-3 border-2 border-zinc-950 border-t-transparent" />
                     <span>{m.login_page_please_wait()}</span>
                  </div>
               ) : (
                  <span>{m.login_page_submit()}</span>
               )}
            </Button>
         </form>

         {/* Divider */}
         <div className="w-full flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-zinc-800/80" />
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
               {m.login_page_or()}
            </span>
            <div className="h-px flex-1 bg-zinc-800/80" />
         </div>

         {/* OAuth Buttons */}
         <div className="grid grid-cols-2 gap-3 w-full">
            <Button
               variant="outline"
               type="button"
               onClick={() => handleSocialLogin('github')}
               disabled={isSubmitting}
               className="flex items-center justify-center gap-2 px-3 h-9 rounded-lg border-zinc-800/80 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-zinc-700 text-zinc-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            >
               <Icon icon="simple-icons:github" className="h-4 w-4" />
               <span>GitHub</span>
            </Button>
            <Button
               variant="outline"
               type="button"
               onClick={() => handleSocialLogin('google')}
               disabled={isSubmitting}
               className="flex items-center justify-center gap-2 px-3 h-9 rounded-lg border-zinc-800/80 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-zinc-700 text-zinc-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            >
               <Icon icon="simple-icons:google" className="h-4 w-4" />
               <span>Google</span>
            </Button>
         </div>

         {/* Footer */}
         <div className="text-[10px] text-center text-zinc-500 mt-8 leading-relaxed max-w-70">
            {m.login_page_footer()}{' '}
            <a
               href="#"
               className="underline hover:text-zinc-300 transition-colors"
            >
               {m.login_page_terms()}
            </a>{' '}
            {m.login_page_and()}{' '}
            <a
               href="#"
               className="underline hover:text-zinc-300 transition-colors"
            >
               {m.login_page_privacy()}
            </a>
            .
         </div>
      </div>
   );
}
