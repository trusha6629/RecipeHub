import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Recipe, RecipeStats } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';
import { CategoryCardComponent } from '../../shared/components/category-card.component';
import { RecipeCardComponent } from '../../shared/components/recipe-card.component';
import { StatsCardComponent } from '../../shared/components/stats-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CategoryCardComponent, RecipeCardComponent, StatsCardComponent],
  template: `
    <main class="space-y-8">
      <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <app-stats-card
          title="Total Recipes"
          [value]="stats()?.totalRecipes ?? totalRecipes()"
          subtitle="Published on the dashboard"
          tone="accent"
        />
        <app-stats-card
          title="Avg Rating"
          [value]="stats()?.averageRating ?? 0"
          subtitle="Average recipe score"
          tone="dark"
        />
        <app-stats-card
          title="Favorites"
          [value]="stats()?.totalFavorites ?? 0"
          subtitle="Times recipes were saved"
          tone="default"
        />
        <app-stats-card
          title="Visible Categories"
          [value]="stats()?.topCategories?.length ?? categories.length"
          subtitle="Meal types in the dashboard"
          tone="default"
        />
      </section>

      <section class="rounded-[32px] bg-white p-8 shadow-soft dark:bg-slate-900">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Categories</p>
            <h3 class="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">Quick category access</h3>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400">Select a category to filter the dashboard feed.</p>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <app-category-card
            *ngFor="let category of categories"
            [title]="category.title"
            [subtitle]="categorySubtitle(category.title)"
            [icon]="category.icon"
            [active]="selectedCategory() === category.title"
            (select)="toggleCategory(category.title)"
          />
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="rounded-[32px] bg-white p-8 shadow-soft dark:bg-slate-900">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Popular Recipes</p>
              <h3 class="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">Most engaging dishes</h3>
            </div>
            <a routerLink="/recipes" class="text-sm font-semibold text-brand-800">View full board</a>
          </div>

          <div *ngIf="loading()" class="mt-8 rounded-[28px] bg-[#fffdf4] p-8 text-slate-500 dark:bg-slate-800 dark:text-slate-300">Loading recipe dashboard...</div>
          <div *ngIf="error()" class="mt-8 rounded-[28px] bg-[#fffdf4] p-8 text-rose-500 dark:bg-slate-800">{{ error() }}</div>

          <div *ngIf="!loading() && !error() && popularRecipes().length" class="mt-8 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            <app-recipe-card
              *ngFor="let recipe of popularRecipes(); trackBy: trackById"
              [recipe]="recipe"
              (recipeUpdated)="handleRecipeUpdated($event)"
            />
          </div>

          <div *ngIf="!loading() && !error() && !popularRecipes().length" class="mt-8 rounded-[28px] bg-[#fffdf4] p-8 text-center dark:bg-slate-800">
            <h4 class="font-display text-2xl font-bold text-slate-900 dark:text-white">No recipes yet</h4>
            <p class="mt-3 text-slate-500 dark:text-slate-400">Try another category or add a new recipe to populate this dashboard.</p>
          </div>
        </div>

        <div class="rounded-[32px] bg-white p-8 shadow-soft dark:bg-slate-900">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Best Seller</p>
              <h3 class="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">Top saved dishes</h3>
            </div>
          </div>

          <div class="mt-8 space-y-4" *ngIf="bestSellerRecipes().length; else noBestSellers">
            <article
              *ngFor="let recipe of bestSellerRecipes(); let index = index; trackBy: trackById"
              class="flex items-center gap-4 rounded-[28px] bg-[#fffdf4] p-4 transition duration-300 hover:-translate-y-1 hover:shadow-soft dark:bg-slate-800"
            >
              <img
                [src]="recipeService.imageUrl(recipe.image)"
                [alt]="recipe.title"
                class="h-20 w-20 rounded-full object-cover"
              >
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">#{{ index + 1 }} Best Seller</p>
                <h4 class="mt-1 truncate font-display text-xl font-bold text-slate-900 dark:text-white">{{ recipe.title }}</h4>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ recipe.category }} · {{ recipe.favorites.length }} saves</p>
              </div>
              <div class="rounded-2xl bg-brand-500 px-3 py-2 text-sm font-semibold text-slate-950">
                {{ recipe.rating || 0 }} ★
              </div>
            </article>
          </div>

          <ng-template #noBestSellers>
            <div class="mt-8 rounded-[28px] bg-[#fffdf4] p-8 text-center text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Best seller dishes will appear here once recipes start getting saved.
            </div>
          </ng-template>
        </div>
      </section>
    </main>
  `
})
export class HomeComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly recipeService = inject(RecipeService);
  readonly authService = inject(AuthService);

  readonly recipes = signal<Recipe[]>([]);
  readonly stats = signal<RecipeStats | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly selectedCategory = signal('');
  readonly query = signal('');
  readonly totalRecipes = signal(0);

  readonly categories = [
    { title: 'Breakfast', icon: '🍳' },
    { title: 'Lunch', icon: '🥗' },
    { title: 'Dinner', icon: '🍝' },
    { title: 'Dessert', icon: '🧁' },
    { title: 'Vegan', icon: '🥬' },
    { title: 'Snacks', icon: '🍪' },
    { title: 'Drinks', icon: '🥤' },
    { title: 'Quick Meals', icon: '⚡' }
  ];

  readonly popularRecipes = computed(() =>
    [...this.recipes()]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.favorites.length - a.favorites.length)
      .slice(0, 6)
  );

  readonly bestSellerRecipes = computed(() =>
    [...this.recipes()]
      .sort((a, b) => b.favorites.length - a.favorites.length || (b.rating || 0) - (a.rating || 0))
      .slice(0, 4)
  );

  constructor() {
    this.fetchStats();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const query = params.get('q') ?? '';
      this.query.set(query);
      this.fetchRecipes();
    });
  }

  toggleCategory(category: string) {
    this.selectedCategory.set(this.selectedCategory() === category ? '' : category);
    this.fetchRecipes();
  }

  categorySubtitle(category: string) {
    const topCategory = this.stats()?.topCategories?.find((item) => item.category.toLowerCase() === category.toLowerCase());
    return topCategory ? `${topCategory.count} recipes available` : 'Browse dishes in this category';
  }

  handleRecipeUpdated(updatedRecipe: Recipe) {
    this.recipes.update((recipes) => recipes.map((recipe) => (recipe._id === updatedRecipe._id ? updatedRecipe : recipe)));
    this.fetchStats();
  }

  trackById(_index: number, recipe: Recipe) {
    return recipe._id;
  }

  private fetchRecipes() {
    this.loading.set(true);
    this.error.set('');

    this.recipeService
      .getRecipes({
        q: this.query(),
        category: this.selectedCategory(),
        limit: 12,
        sort: 'favorites'
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.recipes.set(response.recipes);
          this.totalRecipes.set(response.pagination.total);
          this.loading.set(false);
        },
        error: (errorResponse) => {
          this.error.set(errorResponse.error?.message || 'Unable to load the dashboard right now.');
          this.loading.set(false);
        }
      });
  }

  private fetchStats() {
    this.recipeService
      .getRecipeStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => this.stats.set(stats),
        error: () => this.stats.set(null)
      });
  }
}
