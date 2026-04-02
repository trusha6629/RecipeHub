import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreatorStats } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="section-shell py-10">
      <section class="glass-panel overflow-hidden p-8 md:p-10">
        <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Creator analytics</p>
            <h1 class="mt-3 font-display text-4xl font-bold text-slate-900 dark:text-white">
              Performance insights for {{ authService.currentUser()?.name }}
            </h1>
            <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Track how your recipes are performing, which categories are carrying momentum, and which dishes are earning the most saves.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <a routerLink="/recipes/new" class="btn-primary">Publish Another Recipe</a>
              <a routerLink="/" class="btn-secondary">Back to Dashboard</a>
            </div>
          </div>
          <div class="rounded-[32px] bg-gradient-to-br from-slate-900 via-brand-700 to-sky-600 p-6 text-white shadow-glow">
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Momentum</p>
            <div class="mt-6 grid gap-4 sm:grid-cols-3">
              <div class="rounded-3xl bg-white/10 p-4 backdrop-blur">
                <p class="text-sm text-white/70">Recipes</p>
                <p class="mt-2 font-display text-3xl font-bold">{{ stats()?.totalRecipes ?? 0 }}</p>
              </div>
              <div class="rounded-3xl bg-white/10 p-4 backdrop-blur">
                <p class="text-sm text-white/70">Avg Rating</p>
                <p class="mt-2 font-display text-3xl font-bold">{{ stats()?.averageRating ?? 0 }}</p>
              </div>
              <div class="rounded-3xl bg-white/10 p-4 backdrop-blur">
                <p class="text-sm text-white/70">Favorites</p>
                <p class="mt-2 font-display text-3xl font-bold">{{ stats()?.totalFavorites ?? 0 }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div *ngIf="loading()" class="mt-8 grid gap-6 lg:grid-cols-2">
        <div class="glass-panel p-8">
          <div class="h-8 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
          <div class="mt-6 space-y-4">
            <div *ngFor="let item of skeletonItems" class="h-14 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10"></div>
          </div>
        </div>
        <div class="glass-panel p-8">
          <div class="h-8 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
          <div class="mt-6 space-y-4">
            <div *ngFor="let item of skeletonItems" class="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10"></div>
          </div>
        </div>
      </div>

      <div *ngIf="error()" class="mt-8 glass-panel p-10 text-center text-rose-500">{{ error() }}</div>

      <section *ngIf="!loading() && !error() && stats()" class="mt-8 grid gap-6 lg:grid-cols-2">
        <article class="glass-panel p-8">
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Category breakdown</p>
          <div *ngIf="stats()!.categoryBreakdown.length; else noCategories" class="mt-6 space-y-4">
            <div *ngFor="let item of stats()!.categoryBreakdown" class="space-y-2">
              <div class="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200">
                <span>{{ item.category }}</span>
                <span>{{ item.count }}</span>
              </div>
              <div class="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-500"
                  [style.width.%]="categoryWidth(item.count)"
                ></div>
              </div>
            </div>
          </div>
          <ng-template #noCategories>
            <p class="mt-6 text-sm text-slate-500 dark:text-slate-300">Publish recipes to start seeing category trends.</p>
          </ng-template>
        </article>

        <article class="glass-panel p-8">
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Top performing recipes</p>
          <div *ngIf="stats()!.topRecipes.length; else noTopRecipes" class="mt-6 space-y-4">
            <a
              *ngFor="let recipe of stats()!.topRecipes"
              [routerLink]="['/recipes', recipe._id]"
              class="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white/70 p-5 transition hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-white/5"
            >
              <div>
                <p class="font-display text-xl font-bold text-slate-900 dark:text-white">{{ recipe.title }}</p>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-300">{{ recipe.category }}</p>
              </div>
              <div class="text-right text-sm">
                <p class="font-semibold text-amber-500">&#9733; {{ recipe.rating }}</p>
                <p class="mt-1 text-slate-500 dark:text-slate-300">{{ recipe.favoritesCount }} saves</p>
              </div>
            </a>
          </div>
          <ng-template #noTopRecipes>
            <p class="mt-6 text-sm text-slate-500 dark:text-slate-300">Your highest-performing recipes will appear here.</p>
          </ng-template>
        </article>
      </section>

      <section *ngIf="!loading() && !error() && stats()" class="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article class="glass-panel p-8">
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">6 month trend</p>
          <div *ngIf="stats()!.monthlyTrend.length; else noTrend" class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div
              *ngFor="let point of stats()!.monthlyTrend"
              class="rounded-3xl border border-slate-100 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5"
            >
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{{ point.label }}</p>
              <div class="mt-4 space-y-3">
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Published</p>
                  <p class="font-display text-3xl font-bold text-slate-900 dark:text-white">{{ point.recipesPublished }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Favorites Earned</p>
                  <p class="text-lg font-semibold text-brand-600 dark:text-brand-300">{{ point.favoritesEarned }}</p>
                </div>
              </div>
            </div>
          </div>
          <ng-template #noTrend>
            <p class="mt-6 text-sm text-slate-500 dark:text-slate-300">Publish consistently to unlock trend history.</p>
          </ng-template>
        </article>

        <article class="glass-panel p-8">
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Best saved recipe</p>
          <div *ngIf="stats()!.bestSavedRecipe as spotlight; else noSpotlight" class="mt-6 rounded-[32px] bg-gradient-to-br from-brand-500 to-sky-500 p-6 text-white shadow-glow">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">{{ spotlight.category }}</p>
            <h2 class="mt-3 font-display text-3xl font-bold">{{ spotlight.title }}</h2>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-3xl bg-white/10 p-4 backdrop-blur">
                <p class="text-xs text-white/75">Rating</p>
                <p class="mt-2 text-2xl font-bold">&#9733; {{ spotlight.rating }}</p>
              </div>
              <div class="rounded-3xl bg-white/10 p-4 backdrop-blur">
                <p class="text-xs text-white/75">Saves</p>
                <p class="mt-2 text-2xl font-bold">{{ spotlight.favoritesCount }}</p>
              </div>
            </div>
          </div>
          <ng-template #noSpotlight>
            <p class="mt-6 text-sm text-slate-500 dark:text-slate-300">Your breakout recipe will appear here once people start saving it.</p>
          </ng-template>
        </article>
      </section>
    </main>
  `
})
export class AnalyticsComponent {
  private readonly recipeService = inject(RecipeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly authService = inject(AuthService);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly stats = signal<CreatorStats | null>(null);
  readonly skeletonItems = Array.from({ length: 4 });

  constructor() {
    this.recipeService
      .getCreatorStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
          this.loading.set(false);
        },
        error: (errorResponse) => {
          this.error.set(errorResponse.error?.message || 'Unable to load analytics right now.');
          this.loading.set(false);
        }
      });
  }

  categoryWidth(count: number) {
    const max = Math.max(...(this.stats()?.categoryBreakdown.map((item) => item.count) ?? [1]));
    return (count / max) * 100;
  }
}
