import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="group flex w-full items-center gap-4 rounded-[28px] border border-white/80 bg-white p-5 text-left shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-glow dark:border-slate-800 dark:bg-slate-800 dark:text-white"
      [class.bg-brand-500]="active"
      [class.text-slate-950]="active"
      (click)="select.emit()"
    >
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff8e1] dark:bg-slate-700" [class.bg-white/30]="active">
        <span class="text-2xl">{{ icon }}</span>
      </div>
      <div class="min-w-0">
        <p class="font-display text-lg font-bold">{{ title }}</p>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400" [class.text-slate-800/70]="active">{{ subtitle }}</p>
      </div>
    </button>
  `
})
export class CategoryCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) subtitle!: string;
  @Input({ required: true }) icon!: string;
  @Input() active = false;
  @Output() select = new EventEmitter<void>();
}
