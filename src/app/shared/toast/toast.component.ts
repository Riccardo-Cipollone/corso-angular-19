import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast, ToastType } from './toast.service';

/**
 * Componente per visualizzare le notifiche toast.
 * Vedi README.md per dettagli sul pattern.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      @for (toast of toasts(); track toast.id) {
        <div
          [class]="getToastClasses(toast.type)"
          (click)="dismiss(toast.id)"
          class="cursor-pointer"
          role="alert"
        >
          <div class="flex items-center gap-2">
            <span [innerHTML]="getIcon(toast.type)"></span>
            <span>{{ toast.message }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host ::ng-deep div[role='alert'] {
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;

  getToastClasses(type: ToastType): string {
    const baseClasses =
      'px-4 py-3 rounded-lg shadow-lg flex items-center transition-all duration-300';

    const typeClasses: Record<ToastType, string> = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
      warning: 'bg-yellow-500 text-black',
    };

    return `${baseClasses} ${typeClasses[type]}`;
  }

  getIcon(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      success:
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
      error:
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
      info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      warning:
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
    };

    return icons[type];
  }

  dismiss(id: number): void {
    this.toastService.remove(id);
  }
}
