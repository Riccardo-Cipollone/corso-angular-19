import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AulaService } from '../services/aula.service';
import { CorsoService } from '../services/corso.service';
import { Aula } from '../models/aula.model';
import { Corso } from '../models/corso.model';

/**
 * Route Resolver per pre-caricare dati prima dell'attivazione della route.
 * Approccio per la gestione del loading.
 * Vedi README.md per dettagli.
 */

export interface AulaListResolverData {
  aule: Aula[];
  corsi: Corso[];
}

export const aulaListResolver: ResolveFn<AulaListResolverData> = () => {
  const aulaService = inject(AulaService);
  const corsoService = inject(CorsoService);

  return forkJoin({
    aule: aulaService.loadAule$(),
    corsi: corsoService.loadCorsi$(),
  }).pipe(map((result) => result));
};
