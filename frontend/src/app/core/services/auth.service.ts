import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly storageKey = 'recipehub_auth';
  private readonly authState = signal<{ token: string; user: User } | null>(this.readStoredAuth());

  readonly currentUser = computed(() => this.authState()?.user ?? null);
  readonly token = computed(() => this.authState()?.token ?? '');
  readonly isAuthenticated = computed(() => !!this.authState()?.token);

  register(payload: { name: string; email: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  login(payload: { email: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  getMe() {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(tap((user) => this.updateCurrentUser(user)));
  }

  toggleFollowCreator(creatorId: string) {
    return this.http
      .post<{ message: string; user: User }>(`${environment.apiUrl}/auth/follow/${creatorId}`, {})
      .pipe(tap((response) => this.updateCurrentUser(response.user)));
  }

  logout() {
    this.clearSession();
    this.toastService.info('You have been signed out.');
    this.router.navigateByUrl('/login');
  }

  clearSession() {
    localStorage.removeItem(this.storageKey);
    this.authState.set(null);
  }

  private updateCurrentUser(user: User) {
    const current = this.authState();
    if (!current) {
      return;
    }

    const auth = {
      ...current,
      user
    };
    localStorage.setItem(this.storageKey, JSON.stringify(auth));
    this.authState.set(auth);
  }

  private setSession(response: AuthResponse) {
    const auth = {
      token: response.token,
      user: response.user
    };

    localStorage.setItem(this.storageKey, JSON.stringify(auth));
    this.authState.set(auth);
  }

  private readStoredAuth() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as { token: string; user: User };
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
