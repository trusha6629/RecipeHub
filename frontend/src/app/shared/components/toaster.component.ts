import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pointer-events-none fixed right-4 top-24 z-50 flex w-[min(92vw,24rem)] flex-col gap-3">
      <div
        *ngFor="let toast of toastService.toasts(); trackBy: trackById"
        class="pointer-events-auto overflow-hidden rounded-3xl border px-4 py-4 shadow-glow backdrop-blur-xl transition fade-in"
        [ngClass]="toastClasses(toast.type)"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{{ toast.type }}</p>
            <p class="mt-1 text-sm font-medium">{{ toast.message }}</p>
          </div>
          <button
            type="button"
            class="rounded-full px-2 py-1 text-xs font-semibold opacity-70 transition hover:opacity-100"
            (click)="toastService.dismiss(toast.id)"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `
})
export class ToasterComponent {
  readonly toastService = inject(ToastService);

  toastClasses(type: 'success' | 'error' | 'info') {
    if (type === 'success') {
      return 'border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100';
    }

    if (type === 'error') {
      return 'border-rose-200 bg-rose-50/95 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100';
    }

    return 'border-sky-200 bg-sky-50/95 text-sky-900 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-100';
  }

  trackById(_index: number, toast: { id: number }) {
    return toast.id;
  }
}
