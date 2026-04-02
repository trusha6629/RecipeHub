import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Recipe } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="section-shell py-10">
      <div *ngIf="loading()" class="overflow-hidden rounded-[36px] border border-white/60 bg-white/80 shadow-glow dark:border-white/10 dark:bg-white/5">
        <div class="h-[320px] animate-pulse bg-slate-200 dark:bg-white/10 md:h-[420px]"></div>
        <div class="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.75fr_0.25fr]">
          <div class="space-y-8">
            <div class="glass-panel p-6">
              <div class="h-8 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
              <div class="mt-5 grid gap-3 sm:grid-cols-2">
                <div *ngFor="let item of stars" class="h-12 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10"></div>
              </div>
            </div>
            <div class="glass-panel p-6">
              <div class="h-8 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
              <div class="mt-5 space-y-3">
                <div class="h-4 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
                <div class="h-4 w-11/12 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
                <div class="h-4 w-4/5 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
              </div>
            </div>
          </div>
          <div class="glass-panel p-6">
            <div class="h-8 w-24 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
            <div class="mt-5 space-y-3">
              <div class="h-12 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10"></div>
              <div class="h-12 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10"></div>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="error()" class="glass-panel p-10 text-center text-rose-500">{{ error() }}</div>

      <article *ngIf="recipe()" class="overflow-hidden rounded-[36px] border border-white/60 bg-white/80 shadow-glow dark:border-white/10 dark:bg-white/5">
        <div class="relative h-[320px] overflow-hidden md:h-[420px]">
          <img [src]="recipeImage()" [alt]="recipe()!.title" class="h-full w-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div class="flex flex-wrap items-center gap-3">
              <span class="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                {{ recipe()!.category }}
              </span>
              <span class="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                &#9733; {{ recipe()!.rating || 0 }}
              </span>
              <span class="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                {{ recipe()!.favorites.length }} favorites
              </span>
            </div>
            <h1 class="mt-5 max-w-3xl font-display text-4xl font-bold text-white md:text-6xl">{{ recipe()!.title }}</h1>
            <a
              class="mt-3 inline-block text-sm text-white/85 underline-offset-4 transition hover:text-white hover:underline"
              [routerLink]="['/creators', recipe()!.createdBy._id]"
            >
              Created by {{ recipe()!.createdBy.name }}
            </a>
          </div>
        </div>

        <div class="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.75fr_0.25fr]">
          <div class="space-y-8">
            <section class="glass-panel p-6">
              <h2 class="font-display text-2xl font-bold text-slate-900 dark:text-white">Ingredients</h2>
              <ul class="mt-5 grid gap-3 sm:grid-cols-2">
                <li
                  *ngFor="let ingredient of recipe()!.ingredients"
                  class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200"
                >
                  {{ ingredient }}
                </li>
              </ul>
            </section>

            <section class="glass-panel p-6">
              <h2 class="font-display text-2xl font-bold text-slate-900 dark:text-white">Instructions</h2>
              <p class="mt-5 whitespace-pre-line leading-8 text-slate-600 dark:text-slate-300">
                {{ recipe()!.instructions }}
              </p>
            </section>
          </div>

          <aside class="space-y-5">
            <div class="glass-panel p-6">
              <h3 class="font-display text-xl font-bold text-slate-900 dark:text-white">Actions</h3>
              <div class="mt-5 grid gap-3">
                <button type="button" class="btn-primary w-full" *ngIf="authService.isAuthenticated()" (click)="toggleFavorite()">
                  {{ isFavorited() ? 'Remove Favorite' : 'Add to Favorites' }}
                </button>
                <a *ngIf="canEdit()" [routerLink]="['/recipes', recipe()!._id, 'edit']" class="btn-secondary w-full">
                  Edit Recipe
                </a>
                <button
                  type="button"
                  *ngIf="canEdit()"
                  class="w-full rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                  (click)="deleteRecipe()"
                >
                  Delete Recipe
                </button>
              </div>
            </div>

            <div class="glass-panel p-6">
              <h3 class="font-display text-xl font-bold text-slate-900 dark:text-white">Rate this recipe</h3>
              <div class="mt-5 flex gap-2">
                <button
                  type="button"
                  *ngFor="let star of stars"
                  class="rounded-2xl px-3 py-2 text-xl transition"
                  [ngClass]="
                    star <= selectedRating()
                      ? 'bg-amber-400 text-white'
                      : 'bg-slate-100 dark:bg-white/10'
                  "
                  (click)="submitRating(star)"
                >
                  &#9733;
                </button>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </main>
  `
})
export class RecipeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly recipeService = inject(RecipeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly authService = inject(AuthService);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly recipe = signal<Recipe | null>(null);
  readonly selectedRating = signal(0);
  readonly stars = [1, 2, 3, 4, 5];

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadRecipe(id);
      }
    });
  }

  loadRecipe(id: string) {
    this.loading.set(true);
    this.error.set('');

    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe) => {
        this.recipe.set(recipe);
        const userId = this.authService.currentUser()?._id;
        const myRating = recipe.ratings.find((rating) => rating.user === userId)?.value ?? 0;
        this.selectedRating.set(myRating);
        this.loading.set(false);
      },
      error: (errorResponse) => {
        const message = errorResponse.error?.message || 'Unable to load recipe.';
        this.error.set(message);
        this.toastService.error(message);
        this.loading.set(false);
      }
    });
  }

  recipeImage() {
    return this.recipeService.imageUrl(this.recipe()?.image || '');
  }

  isFavorited() {
    const userId = this.authService.currentUser()?._id;
    return !!userId && !!this.recipe()?.favorites.includes(userId);
  }

  canEdit() {
    const userId = this.authService.currentUser()?._id;
    return !!userId && this.recipe()?.createdBy?._id === userId;
  }

  toggleFavorite() {
    if (!this.authService.isAuthenticated() || !this.recipe()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.recipeService.toggleFavorite(this.recipe()!._id).subscribe({
      next: (recipe) => {
        const wasFavorited = this.isFavorited();
        this.recipe.set(recipe);
        this.toastService.success(wasFavorited ? 'Removed from favorites.' : 'Added to favorites.');
      },
      error: () => this.toastService.error('Unable to update favorites right now.')
    });
  }

  submitRating(star: number) {
    if (!this.authService.isAuthenticated() || !this.recipe()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.recipeService.rateRecipe(this.recipe()!._id, star).subscribe({
      next: (recipe) => {
        this.recipe.set(recipe);
        this.selectedRating.set(star);
        this.toastService.success(`Saved your ${star}-star rating.`);
      },
      error: () => this.toastService.error('Unable to save your rating right now.')
    });
  }

  deleteRecipe() {
    if (!this.recipe()) {
      return;
    }

    this.recipeService.deleteRecipe(this.recipe()!._id).subscribe({
      next: () => {
        this.toastService.success('Recipe deleted successfully.');
        this.router.navigateByUrl('/');
      }
    ,
      error: () => this.toastService.error('Unable to delete this recipe right now.')
    });
  }
}
