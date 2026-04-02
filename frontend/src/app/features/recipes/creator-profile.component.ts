import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreatorProfile } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';
import { ToastService } from '../../core/services/toast.service';
import { RecipeCardComponent } from '../../shared/components/recipe-card.component';
import { RecipeCardSkeletonComponent } from '../../shared/components/recipe-card-skeleton.component';

@Component({
  selector: 'app-creator-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, RecipeCardComponent, RecipeCardSkeletonComponent],
  template: `
    <main class="section-shell py-10">
      <section *ngIf="loading()" class="space-y-8">
        <div class="glass-panel p-8">
          <div class="h-8 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
          <div class="mt-6 grid gap-4 sm:grid-cols-3">
            <div *ngFor="let item of [1,2,3]" class="h-24 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10"></div>
          </div>
        </div>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <app-recipe-card-skeleton *ngFor="let item of skeletonItems" />
        </div>
      </section>

      <div *ngIf="error()" class="glass-panel p-10 text-center text-rose-500">{{ error() }}</div>

      <section *ngIf="!loading() && !error() && profile()" class="space-y-8">
        <div class="glass-panel overflow-hidden p-8 md:p-10">
          <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Creator profile</p>
              <h1 class="mt-3 font-display text-4xl font-bold text-slate-900 dark:text-white">{{ profile()!.creator.name }}</h1>
              <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Explore this creator's top dishes, saved favorites, and overall recipe momentum on RecipeHub.
              </p>
              <p class="mt-4 text-sm text-slate-500 dark:text-slate-300">
                Joined {{ joinedLabel() }}
              </p>
              <div class="mt-6 flex flex-wrap gap-3">
                <a routerLink="/" class="btn-secondary">Back to Discover</a>
                <a routerLink="/register" class="btn-primary">Join RecipeHub</a>
                <button type="button" class="btn-secondary" (click)="copyProfileLink()">Copy Profile Link</button>
                <button
                  *ngIf="canFollow()"
                  type="button"
                  class="btn-primary"
                  (click)="toggleFollow()"
                >
                  {{ isFollowing() ? 'Following' : 'Follow Creator' }}
                </button>
              </div>
            </div>
            <div class="rounded-[32px] bg-gradient-to-br from-slate-900 via-brand-700 to-sky-600 p-6 text-white shadow-glow">
              <p class="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Creator snapshot</p>
              <div class="mt-6 grid gap-4 sm:grid-cols-4">
                <div class="rounded-3xl bg-white/10 p-4 backdrop-blur">
                  <p class="text-sm text-white/70">Recipes</p>
                  <p class="mt-2 font-display text-3xl font-bold">{{ profile()!.stats.totalRecipes }}</p>
                </div>
                <div class="rounded-3xl bg-white/10 p-4 backdrop-blur">
                  <p class="text-sm text-white/70">Avg Rating</p>
                  <p class="mt-2 font-display text-3xl font-bold">{{ profile()!.stats.averageRating }}</p>
                </div>
                <div class="rounded-3xl bg-white/10 p-4 backdrop-blur">
                  <p class="text-sm text-white/70">Favorites</p>
                  <p class="mt-2 font-display text-3xl font-bold">{{ profile()!.stats.totalFavorites }}</p>
                </div>
                <div class="rounded-3xl bg-white/10 p-4 backdrop-blur">
                  <p class="text-sm text-white/70">Followers</p>
                  <p class="mt-2 font-display text-3xl font-bold">{{ profile()!.stats.followerCount }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section>
          <div class="mb-6 flex items-end justify-between gap-4">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Featured dishes</p>
              <h2 class="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
                Recipes by {{ profile()!.creator.name }}
              </h2>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-300">
              Showing {{ filteredRecipes().length }} of {{ profile()!.recipes.length }}
            </p>
          </div>

          <div class="mb-6 flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-2xl border px-4 py-2 text-sm font-medium transition"
              [ngClass]="selectedCategory() === '' ? activePillClass : inactivePillClass"
              (click)="selectCategory('')"
            >
              All Categories
            </button>
            <button
              type="button"
              *ngFor="let category of creatorCategories()"
              class="rounded-2xl border px-4 py-2 text-sm font-medium transition"
              [ngClass]="selectedCategory() === category ? activePillClass : inactivePillClass"
              (click)="selectCategory(category)"
            >
              {{ category }}
            </button>
          </div>

          <div *ngIf="filteredRecipes().length" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <app-recipe-card
              *ngFor="let recipe of filteredRecipes(); trackBy: trackById"
              [recipe]="recipe"
              (recipeUpdated)="handleRecipeUpdated($event)"
            />
          </div>

          <div *ngIf="!filteredRecipes().length" class="glass-panel p-10 text-center">
            <p class="text-slate-500 dark:text-slate-300">No recipes match this category yet.</p>
          </div>
        </section>
      </section>
    </main>
  `
})
export class CreatorProfileComponent {
  readonly authService = inject(AuthService);
  private readonly recipeService = inject(RecipeService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly document = inject(DOCUMENT);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly profile = signal<CreatorProfile | null>(null);
  readonly selectedCategory = signal('');
  readonly skeletonItems = Array.from({ length: 6 });
  readonly activePillClass = 'border-brand-300 bg-brand-500 text-white';
  readonly inactivePillClass = 'border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-100';
  readonly creatorCategories = computed(() =>
    Array.from(new Set(this.profile()?.recipes.map((recipe) => recipe.category) ?? [])).sort((a, b) =>
      a.localeCompare(b)
    )
  );
  readonly filteredRecipes = computed(() => {
    const category = this.selectedCategory();
    const recipes = this.profile()?.recipes ?? [];
    return category ? recipes.filter((recipe) => recipe.category === category) : recipes;
  });
  readonly joinedLabel = computed(() => {
    const joinedAt = this.profile()?.creator.joinedAt;
    if (!joinedAt) {
      return 'recently';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(new Date(joinedAt));
  });
  readonly isFollowing = computed(() => {
    const creatorId = this.profile()?.creator._id;
    const currentUser = this.authService.currentUser();
    return !!creatorId && !!currentUser?.followingCreators?.includes(creatorId);
  });
  readonly canFollow = computed(() => {
    const creatorId = this.profile()?.creator._id;
    const currentUser = this.authService.currentUser();
    return !!creatorId && !!currentUser && currentUser._id !== creatorId;
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const creatorId = params.get('creatorId');
      if (!creatorId) {
        this.error.set('Creator not found.');
        this.loading.set(false);
        return;
      }

      this.loading.set(true);
      this.error.set('');
      this.recipeService.getCreatorProfile(creatorId).subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.selectedCategory.set('');
          this.loading.set(false);
        },
        error: (errorResponse) => {
          this.error.set(errorResponse.error?.message || 'Unable to load creator profile right now.');
          this.loading.set(false);
        }
      });
    });
  }

  trackById(_index: number, recipe: { _id: string }) {
    return recipe._id;
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }

  async copyProfileLink() {
    const url = this.document.location.href;

    try {
      await navigator.clipboard.writeText(url);
      this.toastService.success('Creator profile link copied.');
    } catch {
      this.toastService.info(`Copy this link: ${url}`);
    }
  }

  toggleFollow() {
    const creatorId = this.profile()?.creator._id;
    if (!creatorId) {
      return;
    }

    const wasFollowing = this.isFollowing();
    this.authService.toggleFollowCreator(creatorId).subscribe({
      next: () => {
        this.profile.update((current) =>
          current
            ? {
                ...current,
                stats: {
                  ...current.stats,
                  followerCount: wasFollowing ? Math.max(0, current.stats.followerCount - 1) : current.stats.followerCount + 1
                }
              }
            : current
        );
        this.toastService.success(wasFollowing ? 'Creator unfollowed.' : 'Creator followed.');
      },
      error: (errorResponse) => {
        this.toastService.error(errorResponse.error?.message || 'Unable to update follow state right now.');
      }
    });
  }

  handleRecipeUpdated(updatedRecipe: CreatorProfile['recipes'][number]) {
    this.profile.update((current) =>
      current
        ? {
            ...current,
            recipes: current.recipes.map((recipe) => (recipe._id === updatedRecipe._id ? updatedRecipe : recipe))
          }
        : current
    );
  }
}
