import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

/**
 * Interceptor per il logging delle chiamate HTTP.
 * Vedi README.md per dettagli sul pattern.
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();

  // Colori per i diversi metodi HTTP
  const methodColors: Record<string, string> = {
    GET: 'color: #61affe; font-weight: bold',
    POST: 'color: #49cc90; font-weight: bold',
    PUT: 'color: #fca130; font-weight: bold',
    PATCH: 'color: #50e3c2; font-weight: bold',
    DELETE: 'color: #f93e3e; font-weight: bold',
  };

  const methodStyle =
    methodColors[req.method] || 'color: gray; font-weight: bold';

  console.log(`%c[${req.method}]%c ${req.url}`, methodStyle, 'color: inherit');

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === 4) {
          const duration = Date.now() - startTime;
          console.log(
            `%c[${req.method}]%c ${req.url} %c✓ ${duration}ms`,
            methodStyle,
            'color: inherit',
            'color: #49cc90'
          );
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        console.log(
          `%c[${req.method}]%c ${req.url} %c✗ ${error.status} (${duration}ms)`,
          methodStyle,
          'color: inherit',
          'color: #f93e3e; font-weight: bold'
        );
      },
    })
  );
};
