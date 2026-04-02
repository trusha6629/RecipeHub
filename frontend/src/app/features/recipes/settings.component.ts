import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="space-y-8">
      <section class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="rounded-[32px] bg-white p-8 shadow-soft dark:bg-slate-900">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Settings</p>
          <h2 class="mt-3 font-display text-4xl font-bold text-slate-900 dark:text-white">Manage your RecipeHub workspace</h2>
          <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Tune your account, switch themes, and jump back into publishing without leaving the dashboard experience.
          </p>
        </div>
        <div class="rounded-[32px] bg-[#fff8e1] p-8 shadow-soft dark:bg-slate-800">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Theme</p>
          <p class="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">{{ themeService.darkMode() ? 'Dark Mode' : 'Light Mode' }}</p>
          <button
            type="button"
            class="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-200 text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-slate-600"
            (click)="themeService.toggleTheme()"
            [attr.aria-label]="themeService.darkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg
              *ngIf="!themeService.darkMode(); else settingsSunIcon"
              class="h-5 w-5 transition duration-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3c0 .34-.02.67-.02 1.01A8 8 0 0 0 19 11.81c.34 0 .67-.02 1-.02Z"></path>
            </svg>
            <ng-template #settingsSunIcon>
              <svg class="h-5 w-5 transition duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2.5"></path>
                <path d="M12 19.5V22"></path>
                <path d="m4.93 4.93 1.77 1.77"></path>
                <path d="m17.3 17.3 1.77 1.77"></path>
                <path d="M2 12h2.5"></path>
                <path d="M19.5 12H22"></path>
                <path d="m4.93 19.07 1.77-1.77"></path>
                <path d="m17.3 6.7 1.77-1.77"></path>
              </svg>
            </ng-template>
          </button>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-2">
        <div class="rounded-[32px] bg-white p-8 shadow-soft dark:bg-slate-900">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Profile</p>
          <div class="mt-6 space-y-4">
            <div class="rounded-2xl bg-[#fffdf4] p-4 dark:bg-slate-800">
              <p class="text-sm text-slate-500 dark:text-slate-400">Display name</p>
              <p class="mt-1 font-semibold text-slate-900 dark:text-white">{{ authService.currentUser()?.name || 'Guest User' }}</p>
            </div>
            <div class="rounded-2xl bg-[#fffdf4] p-4 dark:bg-slate-800">
              <p class="text-sm text-slate-500 dark:text-slate-400">Email</p>
              <p class="mt-1 font-semibold text-slate-900 dark:text-white">{{ authService.currentUser()?.email || 'Sign in to see your email' }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-[32px] bg-white p-8 shadow-soft dark:bg-slate-900">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Quick Actions</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a routerLink="/recipes/new" class="btn-primary">Add New Recipe</a>
            <a routerLink="/favorites" class="btn-secondary">Open Favorites</a>
            <a routerLink="/reviews" class="btn-secondary">View Reviews</a>
          </div>
        </div>
      </section>
    </main>
  `
})
export class SettingsComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
}
