import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Recipe } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article
      class="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[32px] border border-white/80 bg-white/90 shadow-soft transition duration-300 hover:-translate-y-2 hover:shadow-glow dark:border-white/10 dark:bg-white/5"
      [routerLink]="['/recipes', recipe._id]"
    >
      <div class="relative h-56 overflow-hidden">
        <img
          [src]="recipeService.imageUrl(recipe.image)"
          [alt]="recipe.title"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        >
        <div
          *ngIf="highlightLabel"
          class="absolute left-4 top-4 rounded-full bg-[#1a1a1a]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-md backdrop-blur"
        >
          {{ highlightLabel }}
        </div>
        <button
          *ngIf="authService.isAuthenticated()"
          type="button"
          class="absolute right-4 top-4 rounded-full bg-white/92 px-3 py-2 text-sm font-semibold text-slate-800 shadow-md backdrop-blur transition hover:scale-105 dark:bg-slate-900/80"
          (click)="toggleFavorite($event)"
        >
          {{ isFavorited() ? 'Saved' : 'Save' }}
        </button>
      </div>

      <div class="flex flex-1 flex-col gap-4 p-5">
        <div class="flex items-center justify-between gap-3">
          <span class="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
            {{ recipe.category }}
          </span>
          <span class="text-sm font-medium text-brand-700">&#9733; {{ recipe.rating || 0 }}</span>
        </div>

        <div class="space-y-2">
          <h3 class="font-display text-xl font-bold text-slate-900 dark:text-white">{{ recipe.title }}</h3>
          <p class="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {{ recipe.instructions }}
          </p>
        </div>

        <div class="mt-auto flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
          <a
            [routerLink]="['/creators', recipe.createdBy._id]"
            class="relative z-10 font-medium transition hover:text-brand-700 dark:hover:text-brand-300"
            (click)="$event.stopPropagation()"
          >
            By {{ recipe.createdBy.name || 'RecipeHub Chef' }}
          </a>
          <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">{{ recipe.favorites.length }} saves</span>
        </div>
      </div>
    </article>
  `
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: Recipe;
  @Input() highlightLabel = '';
  @Output() recipeUpdated = new EventEmitter<Recipe>();

  readonly authService = inject(AuthService);
  readonly recipeService = inject(RecipeService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  isFavorited() {
    const userId = this.authService.currentUser()?._id;
    return !!userId && this.recipe?.favorites?.includes(userId);
  }

  toggleFavorite(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    if (!this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.recipeService.toggleFavorite(this.recipe._id).subscribe({
      next: (updatedRecipe) => {
        const wasFavorited = this.isFavorited();
        this.recipe = updatedRecipe;
        this.recipeUpdated.emit(updatedRecipe);
        this.toastService.success(wasFavorited ? 'Removed from favorites.' : 'Saved to favorites.');
      },
      error: () => {
        this.toastService.error('Unable to update favorites right now.');
      }
    });
  }
}
