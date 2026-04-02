import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { Recipe } from '../../core/models';
import { RecipeService } from '../../core/services/recipe.service';
import { RecipeCardComponent } from '../../shared/components/recipe-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  template: `
    <main class="space-y-8">
      <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div class="rounded-[32px] bg-white p-8 shadow-soft">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Favorites</p>
          <h2 class="mt-3 font-display text-4xl font-bold text-slate-900">Saved recipes, ready to revisit</h2>
          <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            This board collects the recipes you have favorited so you can jump back into the dishes worth cooking again.
          </p>
        </div>
        <div class="rounded-[32px] bg-[#1a1a1a] p-8 text-white shadow-soft">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Collection stats</p>
          <p class="mt-4 font-display text-5xl font-bold">{{ recipes().length }}</p>
          <p class="mt-3 text-sm text-white/70">Favorite recipes saved to your account.</p>
        </div>
      </section>

      <div *ngIf="!authService.isAuthenticated()" class="rounded-[32px] bg-white p-10 text-center shadow-soft">
        <h3 class="font-display text-2xl font-bold text-slate-900">Sign in to view favorites</h3>
        <p class="mt-3 text-slate-500">Your saved recipes dashboard appears here once you are logged in.</p>
      </div>

      <div *ngIf="authService.isAuthenticated() && loading()" class="rounded-[32px] bg-white p-10 text-slate-500 shadow-soft">
        Loading favorites...
      </div>

      <div *ngIf="authService.isAuthenticated() && error()" class="rounded-[32px] bg-white p-10 text-rose-500 shadow-soft">
        {{ error() }}
      </div>

      <section *ngIf="authService.isAuthenticated() && !loading() && !error() && recipes().length" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <app-recipe-card *ngFor="let recipe of recipes(); trackBy: trackById" [recipe]="recipe" />
      </section>

      <div *ngIf="authService.isAuthenticated() && !loading() && !error() && !recipes().length" class="rounded-[32px] bg-white p-10 text-center shadow-soft">
        <h3 class="font-display text-2xl font-bold text-slate-900">No favorites yet</h3>
        <p class="mt-3 text-slate-500">Start saving recipes from the dashboard and they will appear here.</p>
      </div>
    </main>
  `
})
export class FavoritesComponent {
  readonly authService = inject(AuthService);
  private readonly recipeService = inject(RecipeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly recipes = signal<Recipe[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  constructor() {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.loading.set(true);
    this.recipeService
      .getSavedRecipes({ limit: 12, sort: 'favorites' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.recipes.set(response.recipes);
          this.loading.set(false);
        },
        error: (errorResponse) => {
          this.error.set(errorResponse.error?.message || 'Unable to load favorites right now.');
          this.loading.set(false);
        }
      });
  }

  trackById(_index: number, recipe: Recipe) {
    return recipe._id;
  }
}
