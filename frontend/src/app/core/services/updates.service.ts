import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AuthService } from './auth.service';
import { RecipeService } from './recipe.service';

@Injectable({ providedIn: 'root' })
export class UpdatesService {
  private readonly authService = inject(AuthService);
  private readonly recipeService = inject(RecipeService);
  private readonly unreadCountState = signal(0);

  readonly unreadCount = computed(() => this.unreadCountState());

  refreshUnreadCount() {
    if (!this.authService.isAuthenticated()) {
      this.unreadCountState.set(0);
      return;
    }

    const lastViewedTime = this.getLastViewedTime();

    return this.recipeService.getFollowingHighlights().pipe(
      tap((response) => {
        const unreadCount = response.highlights.filter(
          (recipe) => new Date(recipe.createdAt).getTime() > lastViewedTime
        ).length;
        this.unreadCountState.set(unreadCount);
      })
    );
  }

  markViewed() {
    const currentUser = this.authService.currentUser();
    if (!currentUser?._id) {
      return;
    }

    localStorage.setItem(this.storageKey(currentUser._id), new Date().toISOString());
    this.unreadCountState.set(0);
  }

  clear() {
    this.unreadCountState.set(0);
  }

  lastViewedAt() {
    const lastViewedTime = this.getLastViewedTime();
    return lastViewedTime ? new Date(lastViewedTime).toISOString() : null;
  }

  isUnread(createdAt: string, lastViewedAt = this.lastViewedAt()) {
    if (!lastViewedAt) {
      return true;
    }

    return new Date(createdAt).getTime() > new Date(lastViewedAt).getTime();
  }

  private getLastViewedTime() {
    const currentUser = this.authService.currentUser();
    const storageKey = this.storageKey(currentUser?._id || '');
    const lastViewed = localStorage.getItem(storageKey);
    return lastViewed ? new Date(lastViewed).getTime() : 0;
  }

  private storageKey(userId: string) {
    return `recipehub_updates_last_viewed_${userId}`;
  }
}
