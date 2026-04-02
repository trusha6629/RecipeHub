import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';
import { UpdatesService } from '../../core/services/updates.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <header class="flex flex-col gap-4 rounded-[32px] bg-white px-5 py-5 shadow-soft dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-[#fffdf4] text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          (click)="toggleSidebar()"
          aria-label="Toggle sidebar"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 7h16"></path>
            <path d="M4 12h16"></path>
            <path d="M4 17h16"></path>
          </svg>
        </button>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">RecipeHub Workspace</p>
          <h1 class="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">Kitchen Dashboard</h1>
        </div>
      </div>

      <div class="flex flex-col gap-3 xl:flex-row xl:items-center">
        <form class="relative min-w-[280px] xl:min-w-[360px]" (ngSubmit)="submitSearch()">
          <input
            [(ngModel)]="searchTerm"
            name="searchTerm"
            type="text"
            placeholder="Search recipes, categories, creators..."
            class="w-full rounded-2xl border border-slate-200 bg-[#fffdf4] py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition duration-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
          <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-700 dark:text-brand-300">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="m20 20-3.5-3.5"></path>
            </svg>
          </span>
        </form>

        <button
          type="button"
          class="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-[#fffdf4] text-slate-700 transition duration-300 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          [routerLink]="['/updates']"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.5 21a1.5 1.5 0 0 0 3 0"></path>
          </svg>
          <span
            *ngIf="updatesService.unreadCount() > 0"
            class="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-slate-950"
          >
            {{ updatesService.unreadCount() > 9 ? '9+' : updatesService.unreadCount() }}
          </span>
        </button>

        <button
          type="button"
          class="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-200 text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-slate-600"
          (click)="themeService.toggleTheme()"
          [attr.aria-label]="themeService.darkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg
            *ngIf="!themeService.darkMode(); else sunIcon"
            class="h-5 w-5 transition duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3c0 .34-.02.67-.02 1.01A8 8 0 0 0 19 11.81c.34 0 .67-.02 1-.02Z"></path>
          </svg>
          <ng-template #sunIcon>
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

        <a routerLink="/recipes/new" class="btn-primary">Add New Recipe</a>

        <div class="flex items-center gap-3 rounded-2xl bg-[#fff8e1] px-3 py-2 dark:bg-slate-800">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1a1a1a] text-sm font-bold text-white dark:bg-brand-500 dark:text-slate-950">
            {{ userInitial() }}
          </div>
          <div class="hidden sm:block">
            <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ authService.currentUser()?.name || 'Guest User' }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ authService.isAuthenticated() ? 'Chef account' : 'Visitor mode' }}</p>
          </div>
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent {
  readonly authService = inject(AuthService);
  readonly layoutService = inject(LayoutService);
  readonly updatesService = inject(UpdatesService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  searchTerm = '';

  userInitial() {
    return (this.authService.currentUser()?.name?.charAt(0) || 'R').toUpperCase();
  }

  toggleSidebar() {
    if (window.innerWidth < 1024) {
      this.layoutService.toggleMobileSidebar();
      return;
    }

    this.layoutService.toggleSidebar();
  }

  submitSearch() {
    this.router.navigate(['/recipes'], {
      queryParams: this.searchTerm.trim() ? { q: this.searchTerm.trim() } : {}
    });
  }
}
