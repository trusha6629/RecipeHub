import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="min-h-screen bg-[#FFF8E1] text-[#1A1A1A]">
      <div class="grid min-h-screen lg:grid-cols-2">
        <section
          class="relative hidden overflow-hidden bg-gradient-to-br from-[#FFC107] via-[#FFC107] to-[#FFB300] lg:flex lg:min-h-screen lg:items-center lg:justify-center"
        >
          <div class="absolute inset-0">
            <div class="absolute -left-24 top-16 h-64 w-64 rounded-full bg-white/20 blur-3xl"></div>
            <div class="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-amber-50/30 blur-3xl"></div>
            <div class="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.28),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.12)_1px,_transparent_1px)] bg-[length:auto,32px_32px] opacity-70"></div>
          </div>

          <div class="relative z-10 mx-auto flex max-w-xl flex-col justify-center px-12 py-16 text-white">
            <span class="w-fit rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/90">
              Premium cooking network
            </span>
            <h1 class="mt-8 font-display text-5xl font-bold leading-[1.02] xl:text-6xl">
              Welcome to RecipeHub 🍲
            </h1>
            <p class="mt-6 max-w-lg text-lg leading-8 text-white/88">
              Build your recipe brand, save standout dishes, and turn everyday cooking into a polished community experience.
            </p>

            <div class="mt-12 grid max-w-lg gap-4 sm:grid-cols-2">
              <div class="rounded-[28px] border border-white/25 bg-white/16 p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/20">
                <p class="text-sm text-white/80">Curated collections</p>
                <p class="mt-3 font-display text-3xl font-bold">12k+</p>
              </div>
              <div class="rounded-[28px] border border-white/25 bg-white/16 p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/20">
                <p class="text-sm text-white/80">Creator engagement</p>
                <p class="mt-3 font-display text-3xl font-bold">4.9/5</p>
              </div>
            </div>
          </div>
        </section>

        <section class="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,193,7,0.22),_transparent_28%)]"></div>
          <div class="relative z-10 w-full max-w-[400px]">
            <div
              class="rounded-[28px] bg-white p-8 shadow-[0_24px_80px_rgba(26,26,26,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(26,26,26,0.16)] sm:p-10"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[#FFB300]">Sign in</p>
                  <h2 class="mt-3 font-display text-4xl font-bold tracking-tight text-[#1A1A1A]">Welcome back</h2>
                </div>
                <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFC107] to-[#FFB300] text-2xl shadow-[0_14px_30px_rgba(255,193,7,0.35)]">
                  R
                </div>
              </div>

              <p class="mt-4 text-sm leading-6 text-[#1A1A1A]/65">
                Access your saved recipes, creator insights, and beautifully organized cooking collections.
              </p>

              <form class="mt-8 space-y-5" [formGroup]="form" (ngSubmit)="submit()">
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[#1A1A1A]">Email</label>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="chef@recipehub.com"
                    class="w-full rounded-2xl border border-[#1A1A1A]/10 bg-[#FFFDF4] px-4 py-3.5 text-sm text-[#1A1A1A] outline-none transition duration-300 placeholder:text-[#1A1A1A]/35 focus:border-[#FFC107] focus:ring-2 focus:ring-yellow-400"
                    [class.border-rose-300]="showFieldError('email')"
                    [class.focus:border-rose-300]="showFieldError('email')"
                    [class.focus:ring-rose-200]="showFieldError('email')"
                  >
                  <p *ngIf="showFieldError('email')" class="mt-2 text-sm text-rose-500">{{ getEmailError() }}</p>
                </div>

                <div>
                  <div class="mb-2 flex items-center justify-between">
                    <label class="block text-sm font-semibold text-[#1A1A1A]">Password</label>
                    <span class="text-xs font-medium text-[#1A1A1A]/45">Secure access</span>
                  </div>
                  <input
                    type="password"
                    formControlName="password"
                    placeholder="Enter your password"
                    class="w-full rounded-2xl border border-[#1A1A1A]/10 bg-[#FFFDF4] px-4 py-3.5 text-sm text-[#1A1A1A] outline-none transition duration-300 placeholder:text-[#1A1A1A]/35 focus:border-[#FFC107] focus:ring-2 focus:ring-yellow-400"
                    [class.border-rose-300]="showFieldError('password')"
                    [class.focus:border-rose-300]="showFieldError('password')"
                    [class.focus:ring-rose-200]="showFieldError('password')"
                  >
                  <p *ngIf="showFieldError('password')" class="mt-2 text-sm text-rose-500">Password is required.</p>
                </div>

                <div
                  *ngIf="error()"
                  class="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600"
                >
                  {{ error() }}
                </div>

                <button
                  type="submit"
                  class="w-full rounded-2xl bg-gradient-to-r from-[#FFC107] to-[#FFB300] px-5 py-3.5 text-sm font-semibold text-[#1A1A1A] shadow-[0_18px_36px_rgba(255,193,7,0.28)] transition duration-300 hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  [disabled]="loading() || form.invalid"
                >
                  {{ loading() ? 'Signing in...' : 'Sign In to RecipeHub' }}
                </button>
              </form>

              <div class="mt-8 flex items-center gap-3 text-sm text-[#1A1A1A]/55">
                <div class="h-px flex-1 bg-[#1A1A1A]/10"></div>
                <span>New to RecipeHub?</span>
                <div class="h-px flex-1 bg-[#1A1A1A]/10"></div>
              </div>

              <a
                routerLink="/register"
                class="mt-5 flex items-center justify-center rounded-2xl border border-[#1A1A1A]/10 px-5 py-3 text-sm font-semibold text-[#1A1A1A] transition duration-300 hover:border-[#FFC107] hover:bg-[#FFF8E1]"
              >
                Create your account
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  showFieldError(field: 'email' | 'password') {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  getEmailError() {
    const control = this.form.controls.email;
    if (control.hasError('required')) {
      return 'Email is required.';
    }

    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }

    return '';
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Welcome back to RecipeHub.');
        this.router.navigateByUrl('/');
      },
      error: (errorResponse) => {
        const message = errorResponse.error?.message || 'Login failed.';
        this.error.set(message);
        this.toastService.error(message);
        this.loading.set(false);
      }
    });
  }
}
