import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { toast } from 'sonner';
import * as z from 'zod';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Icon } from '@iconify/react';

import { signUp } from '@/core/client/auth-client';

export const Route = createFileRoute('/_auth/register')({
   component: RouteComponent,
});

const registerSchema = z
   .object({
      password: z
         .string()
         .min(1, 'Password is required')
         .min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
      email: z.email('Please enter a valid email address'),
   })
   .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
   });

type RegisterForm = z.infer<typeof registerSchema>;

function RouteComponent() {
   const navigate = useNavigate();
   const [showPassword, setShowPassword] = useState(false);

   const form = useForm<RegisterForm>({
      defaultValues: { confirmPassword: '', password: '', email: '' },
      resolver: standardSchemaResolver(registerSchema),
      mode: 'onBlur',
   });

   const {
      formState: { isSubmitting },
      handleSubmit,
      setError,
      control,
   } = form;

   const onSubmit = async (data: RegisterForm) => {
      try {
         const { error } = await signUp.email({
            name: data.email.split('@')[0],
            password: data.password,
            callbackURL: '/notes',
            email: data.email,
         });

         if (error) {
            toast.error('Registration Failed', {
               description:
                  error.message ||
                  'Could not create account. Please try again.',
            });
            setError('root', {
               message:
                  error.message ||
                  'Could not create account. Please try again.',
            });
            return;
         }

         toast.success('Account created successfully!', {
            description: 'Your Synapse workspace is ready.',
         });
         navigate({ to: '/notes' });
      } catch (error) {
         const err = error as Error;

         const message =
            err?.message || 'An unexpected error occurred. Please try again.';
         toast.error('Registration Failed', { description: message });
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
               Create an account
            </h1>
            <p className="mt-1.5 text-xs text-zinc-400">
               Already have an account?{' '}
               <button
                  type="button"
                  onClick={() => navigate({ to: '/login' })}
                  className="font-medium text-white hover:underline cursor-pointer"
               >
                  Sign in
               </button>
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
                        htmlFor="register-email"
                     >
                        Email
                     </FieldLabel>
                     <Input
                        {...field}
                        id="register-email"
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
                     <FieldLabel
                        className="text-xs font-medium text-zinc-400"
                        htmlFor="register-password"
                     >
                        Password
                     </FieldLabel>
                     <div className="relative">
                        <Input
                           {...field}
                           id="register-password"
                           type={showPassword ? 'text' : 'password'}
                           placeholder="••••••••"
                           aria-invalid={fieldState.invalid}
                           className="w-full bg-zinc-900/40 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 h-9.5 rounded-lg pr-9 text-xs"
                           disabled={isSubmitting}
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                           title={
                              showPassword ? 'Hide password' : 'Show password'
                           }
                        >
                           <Icon
                              icon={
                                 showPassword ? 'lucide:eye-off' : 'lucide:eye'
                              }
                              className="h-4 w-4"
                           />
                        </button>
                     </div>
                     {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                     )}
                  </Field>
               )}
            />

            {/* Confirm Password */}
            <Controller
               name="confirmPassword"
               control={control}
               render={({ fieldState, field }) => (
                  <Field data-invalid={fieldState.invalid}>
                     <FieldLabel
                        className="text-xs font-medium text-zinc-400"
                        htmlFor="register-confirm-password"
                     >
                        Confirm Password
                     </FieldLabel>
                     <Input
                        {...field}
                        id="register-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
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

            {/* Submit */}
            <Button
               type="submit"
               className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium h-9.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
               disabled={isSubmitting}
            >
               {isSubmitting ? (
                  <div className="flex items-center gap-1.5">
                     <Spinner className="h-3 w-3 border-2 border-zinc-950 border-t-transparent" />
                     <span>Please wait...</span>
                  </div>
               ) : (
                  <span>Create Account</span>
               )}
            </Button>
         </form>

         {/* Divider */}
         <div className="w-full flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-zinc-800/80" />
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
               Or
            </span>
            <div className="h-px flex-1 bg-zinc-800/80" />
         </div>

         {/* OAuth Buttons */}
         <div className="grid grid-cols-2 gap-3 w-full">
            <button
               type="button"
               disabled={isSubmitting}
               className="flex items-center justify-center gap-2 px-3 h-9 rounded-lg border border-zinc-800/80 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-zinc-700 text-zinc-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            >
               <Icon icon="simple-icons:github" className="h-4 w-4" />
               <span>GitHub</span>
            </button>
            <button
               type="button"
               disabled={isSubmitting}
               className="flex items-center justify-center gap-2 px-3 h-9 rounded-lg border border-zinc-800/80 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-zinc-700 text-zinc-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            >
               <Icon icon="simple-icons:google" className="h-4 w-4" />
               <span>Google</span>
            </button>
         </div>

         {/* Footer */}
         <div className="text-[10px] text-center text-zinc-500 mt-8 leading-relaxed max-w-70">
            By clicking continue, you agree to our{' '}
            <a
               href="#"
               className="underline hover:text-zinc-300 transition-colors"
            >
               Terms of Service
            </a>{' '}
            and{' '}
            <a
               href="#"
               className="underline hover:text-zinc-300 transition-colors"
            >
               Privacy Policy
            </a>
            .
         </div>
      </div>
   );
}
