import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { UpdatesService } from '../../core/services/updates.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-40 border-b border-white/60 bg-[#fff8e1]/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75">
      <div class="section-shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center justify-between gap-4">
          <a routerLink="/" class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-lg font-bold text-slate-950 shadow-soft">
              R
            </div>
            <div>
              <p class="font-display text-xl font-bold text-slate-900 dark:text-white">RecipeHub</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Curated flavors, beautifully shared</p>
            </div>
          </a>

          <button
            type="button"
            class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 dark:border-white/10 dark:text-slate-100 lg:hidden"
            (click)="themeService.toggleTheme()"
          >
            {{ themeService.darkMode() ? 'Light' : 'Dark' }}
          </button>
        </div>

        <form class="flex flex-1 items-center gap-3 lg:max-w-xl" (ngSubmit)="submitSearch()">
          <div class="relative flex-1">
            <input
              [(ngModel)]="searchTerm"
              name="searchTerm"
              type="text"
              placeholder="Search recipes or categories..."
              class="input-field pl-11"
            >
            <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-700">Go</span>
          </div>
          <button type="submit" class="btn-primary">Search</button>
        </form>

        <nav class="flex items-center gap-3">
          <a
            routerLink="/"
            routerLinkActive="bg-white text-brand-800 shadow-soft dark:bg-white/10 dark:text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="rounded-2xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/80 hover:text-brand-700 dark:text-slate-200"
          >
            Discover
          </a>
          <a
            *ngIf="authService.isAuthenticated()"
            routerLink="/analytics"
            routerLinkActive="bg-white text-brand-800 shadow-soft dark:bg-white/10 dark:text-white"
            class="rounded-2xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/80 hover:text-brand-700 dark:text-slate-200"
          >
            Analytics
          </a>
          <a
            *ngIf="authService.isAuthenticated()"
            routerLink="/updates"
            routerLinkActive="bg-white text-brand-800 shadow-soft dark:bg-white/10 dark:text-white"
            class="relative rounded-2xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/80 hover:text-brand-700 dark:text-slate-200"
          >
            Updates
            <span
              *ngIf="updatesService.unreadCount() > 0"
              class="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white"
            >
              {{ updatesService.unreadCount() > 9 ? '9+' : updatesService.unreadCount() }}
            </span>
          </a>
          <a
            *ngIf="authService.isAuthenticated()"
            routerLink="/recipes/new"
            routerLinkActive="bg-white text-brand-800 shadow-soft dark:bg-white/10 dark:text-white"
            class="rounded-2xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/80 hover:text-brand-700 dark:text-slate-200"
          >
            Add Recipe
          </a>
          <button
            type="button"
            class="hidden rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 dark:border-white/10 dark:text-slate-100 lg:block"
            (click)="themeService.toggleTheme()"
          >
            {{ themeService.darkMode() ? 'Light' : 'Dark' }}
          </button>
          <ng-container *ngIf="authService.currentUser() as user; else guestState">
            <div class="hidden rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900 sm:block">
              {{ user.name }}
            </div>
            <button type="button" class="btn-secondary" (click)="authService.logout()">Logout</button>
          </ng-container>
          <ng-template #guestState>
            <a routerLink="/login" class="btn-secondary">Login</a>
          </ng-template>
        </nav>
      </div>
    </header>
  `
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly updatesService = inject(UpdatesService);
  private readonly router = inject(Router);
  searchTerm = '';

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.updatesService.refreshUnreadCount()?.subscribe();
      } else {
        this.updatesService.clear();
      }
    });
  }

  submitSearch() {
    this.router.navigate(['/'], {
      queryParams: this.searchTerm.trim() ? { q: this.searchTerm.trim() } : {}
    });
  }
}
