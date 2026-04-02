import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-recipe-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-soft dark:border-white/10 dark:bg-white/5">
      <div class="h-56 animate-pulse bg-slate-200 dark:bg-white/10"></div>
      <div class="space-y-4 p-5">
        <div class="flex items-center justify-between">
          <div class="h-6 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-white/10"></div>
          <div class="h-5 w-12 animate-pulse rounded-full bg-slate-200 dark:bg-white/10"></div>
        </div>
        <div class="h-7 w-3/4 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
          <div class="h-4 w-5/6 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
        </div>
        <div class="h-4 w-1/2 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10"></div>
      </div>
    </article>
  `
})
export class RecipeCardSkeletonComponent {}
