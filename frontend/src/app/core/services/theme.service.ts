import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'recipehub_theme';
  private readonly htmlElement = this.document.documentElement;

  readonly isDarkMode = signal(this.readStoredTheme());
  readonly darkMode = this.isDarkMode.asReadonly();

  constructor() {
    effect(() => {
      const isDark = this.isDarkMode();
      this.htmlElement.classList.toggle('dark', isDark);
      this.htmlElement.style.colorScheme = isDark ? 'dark' : 'light';
      localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
    });
  }

  toggleTheme() {
    this.isDarkMode.update((value) => !value);
  }

  private readStoredTheme() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored === 'dark') {
      return true;
    }

    if (stored === 'light') {
      return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
