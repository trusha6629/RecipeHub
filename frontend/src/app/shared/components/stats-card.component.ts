import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="rounded-[28px] p-5 shadow-soft transition duration-300 hover:-translate-y-1"
      [ngClass]="tone === 'accent' ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-slate-950' : tone === 'dark' ? 'bg-[#1a1a1a] text-white dark:bg-slate-800' : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white'"
    >
      <p class="text-sm font-medium" [class.opacity-70]="tone !== 'default'" [class.text-slate-500]="tone === 'default'">{{ title }}</p>
      <p class="mt-4 font-display text-4xl font-bold">{{ value }}</p>
      <p class="mt-2 text-sm" [class.text-slate-500]="tone === 'default'" [class.dark:text-slate-400]="tone === 'default'" [class.text-white/70]="tone === 'dark'" [class.text-slate-900/70]="tone === 'accent'">
        {{ subtitle }}
      </p>
    </article>
  `
})
export class StatsCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input({ required: true }) subtitle!: string;
  @Input() tone: 'accent' | 'dark' | 'default' = 'default';
}
