import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../core/services/recipe.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="section-shell py-10">
      <section class="mx-auto max-w-5xl glass-panel p-6 sm:p-10">
        <div class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              {{ isEditMode() ? 'Update recipe' : 'Create recipe' }}
            </p>
            <h1 class="mt-3 font-display text-4xl font-bold text-slate-900 dark:text-white">
              {{ isEditMode() ? 'Refine your signature dish' : 'Publish a recipe worth saving' }}
            </h1>
            <form class="mt-8 space-y-5" [formGroup]="form" (ngSubmit)="submit()">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Title</label>
                <input type="text" formControlName="title" class="input-field" placeholder="Truffle Mushroom Risotto">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Category</label>
                <input type="text" formControlName="category" class="input-field" placeholder="Dinner">
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Ingredients</label>
                <textarea
                  formControlName="ingredients"
                  rows="7"
                  class="input-field"
                  placeholder="One ingredient per line"
                ></textarea>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Instructions</label>
                <textarea
                  formControlName="instructions"
                  rows="9"
                  class="input-field"
                  placeholder="Walk readers through the process"
                ></textarea>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Recipe Image</label>
                <input type="file" accept="image/*" class="input-field" (change)="onFileSelected($event)">
                <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">PNG, JPG, WEBP up to 2MB.</p>
              </div>
              <p *ngIf="error()" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-200">
                {{ error() }}
              </p>
              <button type="submit" class="btn-primary w-full" [disabled]="loading() || form.invalid">
                {{ loading() ? 'Saving...' : isEditMode() ? 'Update Recipe' : 'Publish Recipe' }}
              </button>
            </form>
          </div>

          <div class="rounded-[32px] bg-slate-950 p-6 text-white shadow-glow">
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Live preview</p>
            <div class="mt-6 overflow-hidden rounded-[28px] bg-white/10">
              <img [src]="previewImage()" alt="Recipe preview" class="h-64 w-full object-cover">
              <div class="space-y-4 p-6">
                <div class="flex items-center justify-between gap-3">
                  <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                    {{ form.controls.category.value || 'Category' }}
                  </span>
                  <span class="text-amber-300">&#9733; 0.0</span>
                </div>
                <h2 class="font-display text-3xl font-bold">
                  {{ form.controls.title.value || 'Your recipe title' }}
                </h2>
                <p class="line-clamp-6 text-sm text-white/70">
                  {{ form.controls.instructions.value || 'Your cooking instructions will appear here as you type.' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  `
})
export class RecipeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly recipeService = inject(RecipeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly currentRecipeId = signal('');
  readonly selectedFile = signal<File | null>(null);
  readonly existingImage = signal('');
  readonly initialSnapshot = signal('');
  readonly isEditMode = computed(() => !!this.currentRecipeId());
  readonly previewImage = computed(
    () =>
      this.existingImage() ||
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80'
  );

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    category: ['', [Validators.required]],
    ingredients: ['', [Validators.required]],
    instructions: ['', [Validators.required]]
  });

  constructor() {
    this.captureSnapshot();

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        return;
      }

      this.currentRecipeId.set(id);
      this.loadRecipe(id);
    });
  }

  loadRecipe(id: string) {
    this.loading.set(true);
    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe) => {
        this.form.patchValue({
          title: recipe.title,
          category: recipe.category,
          ingredients: recipe.ingredients.join('\n'),
          instructions: recipe.instructions
        });
        this.existingImage.set(this.recipeService.imageUrl(recipe.image));
        this.captureSnapshot();
        this.loading.set(false);
      },
      error: (errorResponse) => {
        this.error.set(errorResponse.error?.message || 'Unable to load recipe.');
        this.loading.set(false);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.existingImage.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const formData = new FormData();
    formData.append('title', this.form.controls.title.value);
    formData.append('category', this.form.controls.category.value);
    formData.append('ingredients', this.form.controls.ingredients.value);
    formData.append('instructions', this.form.controls.instructions.value);

    if (this.selectedFile()) {
      formData.append('image', this.selectedFile() as Blob);
    }

    const request$ = this.isEditMode()
      ? this.recipeService.updateRecipe(this.currentRecipeId(), formData)
      : this.recipeService.createRecipe(formData);

    request$.subscribe({
      next: (recipe) => {
        this.loading.set(false);
        this.captureSnapshot();
        this.toastService.success(this.isEditMode() ? 'Recipe updated successfully.' : 'Recipe published successfully.');
        this.router.navigate(['/recipes', recipe._id]);
      },
      error: (errorResponse) => {
        const message = errorResponse.error?.message || 'Unable to save recipe.';
        this.error.set(message);
        this.toastService.error(message);
        this.loading.set(false);
      }
    });
  }

  canDeactivate() {
    if (this.loading()) {
      return false;
    }

    if (!this.hasUnsavedChanges()) {
      return true;
    }

    return window.confirm('You have unsaved recipe changes. Leave this page anyway?');
  }

  private hasUnsavedChanges() {
    return this.buildSnapshot() !== this.initialSnapshot();
  }

  private captureSnapshot() {
    this.initialSnapshot.set(this.buildSnapshot());
    this.form.markAsPristine();
  }

  private buildSnapshot() {
    return JSON.stringify({
      title: this.form.controls.title.value,
      category: this.form.controls.category.value,
      ingredients: this.form.controls.ingredients.value,
      instructions: this.form.controls.instructions.value,
      selectedFileName: this.selectedFile()?.name ?? '',
      image: this.existingImage()
    });
  }
}
