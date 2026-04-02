import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);
  private nextId = 1;

  success(message: string) {
    this.push(message, 'success');
  }

  error(message: string) {
    this.push(message, 'error');
  }

  info(message: string) {
    this.push(message, 'info');
  }

  dismiss(id: number) {
    this.toasts.update((messages) => messages.filter((message) => message.id !== id));
  }

  private push(message: string, type: ToastMessage['type']) {
    const id = this.nextId++;
    this.toasts.update((messages) => [...messages, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 3500);
  }
}
