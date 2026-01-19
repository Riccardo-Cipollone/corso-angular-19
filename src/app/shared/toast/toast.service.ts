import { Injectable, signal } from '@angular/core';

/**
 * Service per notifiche toast usando Angular Signals.
 * Vedi README.md per dettagli sul pattern.
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
  toasts = signal<Toast[]>([]);
  private nextId = 0;
  private defaultDuration = 4000;

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  private show(
    message: string,
    type: ToastType,
    duration = this.defaultDuration
  ): void {
    const id = this.nextId++;
    const toast: Toast = { id, message, type };

    this.toasts.update((current) => [...current, toast]);
    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
