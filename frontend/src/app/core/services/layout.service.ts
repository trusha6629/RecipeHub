import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly sidebarCollapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarCollapsed.update((value) => !value);
  }

  openMobileSidebar() {
    this.mobileSidebarOpen.set(true);
  }

  closeMobileSidebar() {
    this.mobileSidebarOpen.set(false);
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen.update((value) => !value);
  }
}
