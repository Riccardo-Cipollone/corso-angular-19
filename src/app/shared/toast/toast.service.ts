import { Injectable, signal } from '@angular/core';

/**
 * TOAST SERVICE
 *
 * A simple notification service that uses Angular Signals.
 * This demonstrates:
 * - Service-to-component communication via signals
 * - Managing temporary UI state
 * - Auto-dismissing notifications
 *
 * Usage:
 * ```typescript
 * // In any component or service
 * private toast = inject(ToastService);
 *
 * this.toast.success('Operation completed!');
 * this.toast.error('Something went wrong');
 * this.toast.info('Here is some info');
 * this.toast.warning('Be careful!');
 * ```
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  /** Signal containing the list of active toasts */
  toasts = signal<Toast[]>([]);

  /** Counter for generating unique toast IDs */
  private nextId = 0;

  /** Default duration in milliseconds */
  private defaultDuration = 4000;

  /**
   * Show a success toast (green)
   */
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show an error toast (red)
   */
  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  /**
   * Show an info toast (blue)
   */
  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  /**
   * Show a warning toast (yellow/orange)
   */
  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Internal method to add a toast and schedule its removal
   */
  private show(
    message: string,
    type: ToastType,
    duration = this.defaultDuration
  ): void {
    const id = this.nextId++;
    const toast: Toast = { id, message, type };

    // Add the new toast to the list
    this.toasts.update((current) => [...current, toast]);

    // Schedule automatic removal
    setTimeout(() => this.remove(id), duration);
  }

  /**
   * Remove a toast by ID (can be called manually or by timeout)
   */
  remove(id: number): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
