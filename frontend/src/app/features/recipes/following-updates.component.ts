import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Recipe } from '../../core/models';
import { RecipeService } from '../../core/services/recipe.service';
import { UpdatesService } from '../../core/services/updates.service';
import { RecipeCardComponent } from '../../shared/components/recipe-card.component';
import { RecipeCardSkeletonComponent } from '../../shared/components/recipe-card-skeleton.component';

@Component({
  selector: 'app-following-updates',
  standalone: true,
  imports: [CommonModule, RouterLink, RecipeCardComponent, RecipeCardSkeletonComponent],
  template: `
    <main class="section-shell py-10">
      <section class="glass-panel overflow-hidden p-8 md:p-10">
        <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Following updates</p>
            <h1 class="mt-3 font-display text-4xl font-bold text-slate-900 dark:text-white">
              Fresh recipes from the creators you follow
            </h1>
            <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Stay close to the chefs you care about and catch their newest dishes in one streamlined feed.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <a routerLink="/" class="btn-secondary">Back to Dashboard</a>
              <a routerLink="/analytics" class="btn-primary">Open Analytics</a>
            </div>
          </div>
          <div class="rounded-[32px] bg-gradient-to-br from-slate-900 via-brand-700 to-sky-600 p-6 text-white shadow-glow">
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Live signal</p>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-3xl bg-white/10 p-4 backdrop-blur">
                <p class="text-sm text-white/70">New Since Last Visit</p>
                <p class="mt-2 font-display text-3xl font-bold">{{ unreadRecipes().length }}</p>
              </div>
              <div class="rounded-3xl bg-white/10 p-4 backdrop-blur">
                <p class="text-sm text-white/70">Creators Active</p>
                <p class="mt-2 font-display text-3xl font-bold">{{ creatorCount() }}</p>
              </div>
            </div>
            <p class="mt-4 text-sm text-white/70">
              {{ lastViewedAt() ? ('Last checked ' + (lastViewedAt() | date: 'medium')) : 'Everything here is brand new for you.' }}
            </p>
          </div>
        </div>
      </section>

      <div *ngIf="loading()" class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <app-recipe-card-skeleton *ngFor="let item of skeletonItems" />
      </div>

      <div *ngIf="error()" class="mt-8 glass-panel p-10 text-center text-rose-500">{{ error() }}</div>

      <section *ngIf="!loading() && !error()" class="mt-8">
        <div *ngIf="highlights().length; else emptyState" class="space-y-10">
          <section *ngIf="unreadRecipes().length" class="space-y-5">
            <div class="flex items-end justify-between gap-4">
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">Fresh arrivals</p>
                <h2 class="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
                  New since your last check-in
                </h2>
              </div>
              <div class="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                {{ unreadRecipes().length }} new
              </div>
            </div>

            <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <app-recipe-card
                *ngFor="let recipe of unreadRecipes(); trackBy: trackById"
                [recipe]="recipe"
                [highlightLabel]="cardBadge(recipe)"
                (recipeUpdated)="handleRecipeUpdated($event)"
              />
            </div>
          </section>

          <section *ngIf="earlierRecipes().length" class="space-y-5">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Earlier updates</p>
              <h2 class="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">Still worth a look</h2>
            </div>

            <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <app-recipe-card
                *ngFor="let recipe of earlierRecipes(); trackBy: trackById"
                [recipe]="recipe"
                (recipeUpdated)="handleRecipeUpdated($event)"
              />
            </div>
          </section>
        </div>

        <ng-template #emptyState>
          <div class="glass-panel p-10 text-center">
            <h2 class="font-display text-2xl font-bold text-slate-900 dark:text-white">No updates yet</h2>
            <p class="mt-3 text-slate-500 dark:text-slate-300">
              Follow more creators from their public profiles to start filling this feed with fresh recipes.
            </p>
          </div>
        </ng-template>
      </section>
    </main>
  `
})
export class FollowingUpdatesComponent {
  private readonly recipeService = inject(RecipeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly updatesService = inject(UpdatesService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly highlights = signal<Recipe[]>([]);
  readonly unreadRecipes = signal<Recipe[]>([]);
  readonly earlierRecipes = signal<Recipe[]>([]);
  readonly lastViewedAt = signal<string | null>(null);
  readonly skeletonItems = Array.from({ length: 6 });

  constructor() {
    this.lastViewedAt.set(this.updatesService.lastViewedAt());

    this.recipeService
      .getFollowingHighlights()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.highlights.set(response.highlights);
          this.unreadRecipes.set(
            response.highlights.filter((recipe) =>
              this.updatesService.isUnread(recipe.createdAt, this.lastViewedAt())
            )
          );
          this.earlierRecipes.set(
            response.highlights.filter((recipe) =>
              !this.updatesService.isUnread(recipe.createdAt, this.lastViewedAt())
            )
          );
          this.updatesService.markViewed();
          this.loading.set(false);
        },
        error: (errorResponse) => {
          this.error.set(errorResponse.error?.message || 'Unable to load following updates right now.');
          this.loading.set(false);
        }
      });
  }

  creatorCount() {
    return new Set(this.highlights().map((recipe) => recipe.createdBy._id)).size;
  }

  trackById(_index: number, recipe: Recipe) {
    return recipe._id;
  }

  handleRecipeUpdated(updatedRecipe: Recipe) {
    this.highlights.update((recipes) => recipes.map((recipe) => (recipe._id === updatedRecipe._id ? updatedRecipe : recipe)));
    this.unreadRecipes.update((recipes) => recipes.map((recipe) => (recipe._id === updatedRecipe._id ? updatedRecipe : recipe)));
    this.earlierRecipes.update((recipes) => recipes.map((recipe) => (recipe._id === updatedRecipe._id ? updatedRecipe : recipe)));
  }

  cardBadge(recipe: Recipe) {
    return this.updatesService.isUnread(recipe.createdAt, this.lastViewedAt()) ? 'New Drop' : '';
  }
}
