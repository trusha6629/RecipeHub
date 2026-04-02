import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:text-white">
      <div
        class="flex items-center rounded-2xl px-2 py-3"
        [class.justify-center]="layoutService.sidebarCollapsed()"
        [class.gap-3]="!layoutService.sidebarCollapsed()"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-slate-900">
          R
        </div>
        <div *ngIf="!layoutService.sidebarCollapsed()">
          <p class="font-display text-lg font-bold text-slate-900 dark:text-white">RecipeHub</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">Food dashboard</p>
        </div>
      </div>

      <nav class="mt-5 space-y-1">
        <a
          *ngFor="let item of navItems"
          [routerLink]="item.link"
          routerLinkActive="bg-brand-500 text-slate-950"
          [routerLinkActiveOptions]="item.exact ? { exact: true } : { exact: false }"
          class="flex items-center rounded-xl px-2 py-2.5 text-sm font-medium text-slate-600 transition duration-300 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          [class.justify-center]="layoutService.sidebarCollapsed()"
          [class.gap-3]="!layoutService.sidebarCollapsed()"
          [title]="layoutService.sidebarCollapsed() ? item.label : ''"
          (click)="layoutService.closeMobileSidebar()"
        >
          <span class="flex h-9 w-9 items-center justify-center rounded-lg text-current">
            <svg *ngIf="item.icon === 'dashboard'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
            </svg>
            <svg *ngIf="item.icon === 'recipes'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 3.75h8A2.25 2.25 0 0 1 17.25 6v14.25H9A2.25 2.25 0 0 1 6.75 18V4A.25.25 0 0 1 7 3.75Z"></path>
              <path d="M9.75 8.25h4.5"></path>
              <path d="M9.75 12h4.5"></path>
              <path d="M9.75 15.75h3"></path>
            </svg>
            <svg *ngIf="item.icon === 'favorites'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 20.25-1.45-1.32C5.4 14.36 2.25 11.5 2.25 7.84A4.59 4.59 0 0 1 6.84 3.25c1.83 0 3.23.86 4.11 2.04.88-1.18 2.28-2.04 4.11-2.04a4.59 4.59 0 0 1 4.59 4.59c0 3.66-3.15 6.52-8.3 11.09L12 20.25Z"></path>
            </svg>
            <svg *ngIf="item.icon === 'reviews'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7.5 18 3.75 20.25V6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v9A2.25 2.25 0 0 1 18 17.25H9.75L7.5 18Z"></path>
              <path d="m9 10.5 1.5 1.5 4.5-4.5"></path>
            </svg>
            <svg *ngIf="item.icon === 'settings'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.5 3.84c.38-1.12 1.96-1.12 2.34 0l.2.6a1.24 1.24 0 0 0 1.57.79l.6-.2c1.12-.38 2.24.74 1.86 1.86l-.2.6a1.24 1.24 0 0 0 .79 1.57l.6.2c1.12.38 1.12 1.96 0 2.34l-.6.2a1.24 1.24 0 0 0-.79 1.57l.2.6c.38 1.12-.74 2.24-1.86 1.86l-.6-.2a1.24 1.24 0 0 0-1.57.79l-.2.6c-.38 1.12-1.96 1.12-2.34 0l-.2-.6a1.24 1.24 0 0 0-1.57-.79l-.6.2c-1.12.38-2.24-.74-1.86-1.86l.2-.6a1.24 1.24 0 0 0-.79-1.57l-.6-.2c-1.12-.38-1.12-1.96 0-2.34l.6-.2a1.24 1.24 0 0 0 .79-1.57l-.2-.6c-.38-1.12.74-2.24 1.86-1.86l.6.2a1.24 1.24 0 0 0 1.57-.79l.2-.6Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </span>
          <span *ngIf="!layoutService.sidebarCollapsed()" class="truncate">{{ item.label }}</span>
        </a>
      </nav>

      <div
        class="mt-auto rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-800"
        [class.text-center]="layoutService.sidebarCollapsed()"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-slate-900" [class.mx-auto]="layoutService.sidebarCollapsed()">
          {{ (authService.currentUser()?.name?.charAt(0) || 'R').toUpperCase() }}
        </div>
        <ng-container *ngIf="!layoutService.sidebarCollapsed()">
          <p class="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{{ authService.currentUser()?.name || 'Guest Chef' }}</p>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ authService.currentUser()?.email || 'Sign in to personalize your dashboard' }}</p>
        </ng-container>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  readonly authService = inject(AuthService);
  readonly layoutService = inject(LayoutService);

  readonly navItems = [
    { label: 'Dashboard', link: '/', icon: 'dashboard', exact: true },
    { label: 'Recipes', link: '/recipes', icon: 'recipes', exact: true },
    { label: 'Favorites', link: '/favorites', icon: 'favorites', exact: true },
    { label: 'Reviews', link: '/reviews', icon: 'reviews', exact: true },
    { label: 'Settings', link: '/settings', icon: 'settings', exact: true }
  ] as const;
}
