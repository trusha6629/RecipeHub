import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="min-h-screen bg-[#FFF8E1] text-[#1A1A1A]">
      <div class="grid min-h-screen lg:grid-cols-2">
        <section class="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,193,7,0.22),_transparent_28%)]"></div>
          <div class="relative z-10 w-full max-w-[400px]">
            <div
              class="rounded-[28px] bg-white p-8 shadow-[0_24px_80px_rgba(26,26,26,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(26,26,26,0.16)] sm:p-10"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[#FFB300]">Create account</p>
                  <h2 class="mt-3 font-display text-4xl font-bold tracking-tight text-[#1A1A1A]">Join RecipeHub</h2>
                </div>
                <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFC107] to-[#FFB300] text-2xl shadow-[0_14px_30px_rgba(255,193,7,0.35)]">
                  +
                </div>
              </div>

              <p class="mt-4 text-sm leading-6 text-[#1A1A1A]/65">
                Set up your creator profile and start sharing polished recipes with a community built for food lovers.
              </p>

              <form class="mt-8 space-y-5" [formGroup]="form" (ngSubmit)="submit()">
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[#1A1A1A]">Name</label>
                  <input
                    type="text"
                    formControlName="name"
                    placeholder="Your display name"
                    class="w-full rounded-2xl border border-[#1A1A1A]/10 bg-[#FFFDF4] px-4 py-3.5 text-sm text-[#1A1A1A] outline-none transition duration-300 placeholder:text-[#1A1A1A]/35 focus:border-[#FFC107] focus:ring-2 focus:ring-yellow-400"
                    [class.border-rose-300]="showFieldError('name')"
                    [class.focus:border-rose-300]="showFieldError('name')"
                    [class.focus:ring-rose-200]="showFieldError('name')"
                  >
                  <p *ngIf="showFieldError('name')" class="mt-2 text-sm text-rose-500">Name is required.</p>
                </div>

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
                    <span class="text-xs font-medium text-[#1A1A1A]/45">Minimum 6 characters</span>
                  </div>
                  <input
                    type="password"
                    formControlName="password"
                    placeholder="At least 6 characters"
                    class="w-full rounded-2xl border border-[#1A1A1A]/10 bg-[#FFFDF4] px-4 py-3.5 text-sm text-[#1A1A1A] outline-none transition duration-300 placeholder:text-[#1A1A1A]/35 focus:border-[#FFC107] focus:ring-2 focus:ring-yellow-400"
                    [class.border-rose-300]="showFieldError('password')"
                    [class.focus:border-rose-300]="showFieldError('password')"
                    [class.focus:ring-rose-200]="showFieldError('password')"
                  >
                  <p *ngIf="showFieldError('password')" class="mt-2 text-sm text-rose-500">{{ getPasswordError() }}</p>
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
                  {{ loading() ? 'Creating account...' : 'Create Your Account' }}
                </button>
              </form>

              <div class="mt-8 flex items-center gap-3 text-sm text-[#1A1A1A]/55">
                <div class="h-px flex-1 bg-[#1A1A1A]/10"></div>
                <span>Already a member?</span>
                <div class="h-px flex-1 bg-[#1A1A1A]/10"></div>
              </div>

              <a
                routerLink="/login"
                class="mt-5 flex items-center justify-center rounded-2xl border border-[#1A1A1A]/10 px-5 py-3 text-sm font-semibold text-[#1A1A1A] transition duration-300 hover:border-[#FFC107] hover:bg-[#FFF8E1]"
              >
                Sign in instead
              </a>
            </div>
          </div>
        </section>

        <section
          class="relative hidden overflow-hidden bg-gradient-to-br from-[#FFC107] via-[#FFC107] to-[#FFB300] lg:flex lg:min-h-screen lg:items-center lg:justify-center"
        >
          <div class="absolute inset-0">
            <div class="absolute -right-28 top-16 h-72 w-72 rounded-full bg-white/20 blur-3xl"></div>
            <div class="absolute bottom-0 left-6 h-80 w-80 rounded-full bg-amber-50/25 blur-3xl"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.28),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.12)_1px,_transparent_1px)] bg-[length:auto,32px_32px] opacity-70"></div>
          </div>

          <div class="relative z-10 mx-auto flex max-w-xl flex-col justify-center px-12 py-16 text-white">
            <span class="w-fit rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/90">
              Build your food brand
            </span>
            <h1 class="mt-8 font-display text-5xl font-bold leading-[1.02] xl:text-6xl">
              Welcome to RecipeHub 🍲
            </h1>
            <p class="mt-6 max-w-lg text-lg leading-8 text-white/88">
              Launch a premium recipe presence with rich visuals, audience engagement, and a beautifully modern home for every dish.
            </p>

            <div class="mt-12 space-y-4">
              <div class="rounded-[28px] border border-white/25 bg-white/16 p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/20">
                <p class="text-sm text-white/80">Instant publishing flow</p>
                <p class="mt-2 text-base text-white/92">Share recipes, track favorites, and grow a following from day one.</p>
              </div>
              <div class="rounded-[28px] border border-white/25 bg-white/16 p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/20">
                <p class="text-sm text-white/80">Designed for standout creators</p>
                <p class="mt-2 text-base text-white/92">Turn your best dishes into a clean, investor-ready product story.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  showFieldError(field: 'name' | 'email' | 'password') {
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

  getPasswordError() {
    const control = this.form.controls.password;
    if (control.hasError('required')) {
      return 'Password is required.';
    }

    if (control.hasError('minlength')) {
      return 'Password must be at least 6 characters.';
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

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Your account is ready. Start sharing recipes.');
        this.router.navigateByUrl('/');
      },
      error: (errorResponse) => {
        const message = errorResponse.error?.message || 'Registration failed.';
        this.error.set(message);
        this.toastService.error(message);
        this.loading.set(false);
      }
    });
  }
}
