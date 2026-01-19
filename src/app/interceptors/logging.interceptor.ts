import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

/**
 * LOGGING INTERCEPTOR
 *
 * An HTTP Interceptor is a function that intercepts ALL HTTP requests/responses
 * in your application. It's useful for:
 * - Adding authentication headers
 * - Logging requests (like this one)
 * - Showing/hiding loading indicators
 * - Handling errors globally
 *
 * This interceptor logs every HTTP request with colored console output.
 * Using the functional interceptor approach (Angular 15+).
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();

  // Color codes for different HTTP methods
  const methodColors: Record<string, string> = {
    GET: 'color: #61affe; font-weight: bold',    // Blue
    POST: 'color: #49cc90; font-weight: bold',   // Green
    PUT: 'color: #fca130; font-weight: bold',    // Orange
    PATCH: 'color: #50e3c2; font-weight: bold',  // Teal
    DELETE: 'color: #f93e3e; font-weight: bold', // Red
  };

  const methodStyle = methodColors[req.method] || 'color: gray; font-weight: bold';

  // Log the outgoing request
  console.log(
    `%c[${req.method}]%c ${req.url}`,
    methodStyle,
    'color: inherit'
  );

  // Pass the request to the next handler and intercept the response
  return next(req).pipe(
    tap({
      next: (event) => {
        // Check if this is the final response (not intermediate events)
        if (event.type === 4) { // HttpEventType.Response = 4
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
