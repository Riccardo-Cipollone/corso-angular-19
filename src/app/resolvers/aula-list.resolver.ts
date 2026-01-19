import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AulaService } from '../services/aula.service';
import { CorsoService } from '../services/corso.service';
import { Aula } from '../models/aula.model';
import { Corso } from '../models/corso.model';

/**
 * APPROACH 4: ROUTE RESOLVER
 *
 * A resolver is a function that runs BEFORE the route is activated.
 * The component will only render after all data has been fetched.
 *
 * Pros:
 * - Data is guaranteed to be available when component loads
 * - No loading state needed in the component (data is already there)
 * - Clean separation of concerns - data fetching is outside the component
 * - Better UX - the route transition only happens when data is ready
 * - Can show a global loading indicator during navigation
 *
 * Cons:
 * - Navigation appears slower (user waits before seeing the new page)
 * - Error handling needs to be done in the resolver
 * - Component can't show partial data while loading
 */

export interface AulaListResolverData {
  aule: Aula[];
  corsi: Corso[];
}

/**
 * Functional resolver using Angular's ResolveFn
 * This is the modern approach (Angular 15+) using standalone functions
 */
export const aulaListResolver: ResolveFn<AulaListResolverData> = () => {
  const aulaService = inject(AulaService);
  const corsoService = inject(CorsoService);

  // Use forkJoin to fetch all required data before component loads
  return forkJoin({
    aule: aulaService.loadAule$(),
    corsi: corsoService.loadCorsi$(),
  }).pipe(
    map((result) => {
      // Data is already set in signals via tap() in the services
      // We return the data for the component to optionally use
      return result;
    })
  );
};
