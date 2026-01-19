import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DocenteService } from '../../services/docente.service';
import { CorsoService } from '../../services/corso.service';

/**
 * APPROACH 2: FORKJOIN FOR COORDINATED API CALLS
 *
 * This component demonstrates using RxJS forkJoin to coordinate multiple API calls.
 * forkJoin waits for ALL Observables to complete before emitting a single value
 * containing the results of all calls.
 *
 * Pros:
 * - All API calls are truly coordinated - we know exactly when ALL data is ready
 * - Single loading state managed in one place
 * - Can handle errors centrally
 * - More explicit control over the loading lifecycle
 *
 * Cons:
 * - Requires Observable-returning methods in services
 * - If one call fails, by default all fail (can be handled with catchError)
 * - Slightly more complex than the computed approach
 */
@Component({
  selector: 'app-docente-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './docente-list.component.html',
  styleUrl: './docente-list.component.css',
})
export class DocenteListComponent implements OnInit {
  private docenteService = inject(DocenteService);
  private corsoService = inject(CorsoService);
  private router = inject(Router);

  docenti = this.docenteService.docenti;
  corsi = this.corsoService.corsi;

  /**
   * Local loading signal managed by this component.
   * We control when it's true/false based on forkJoin completion.
   */
  loading = signal<boolean>(true);

  /** Total number of docenti */
  totalDocenti = computed(() => this.docenti().length);

  /** Number of docenti with at least one corso assigned */
  docentiConCorsi = computed(() => {
    const docentiIds = new Set(this.corsi().map((c) => c.docente_id));
    return this.docenti().filter((d) => docentiIds.has(d.id)).length;
  });

  /** Number of docenti without any corso */
  docentiSenzaCorsi = computed(() => {
    return this.totalDocenti() - this.docentiConCorsi();
  });

  /** Average corsi per docente */
  mediaCorsiPerDocente = computed(() => {
    const total = this.totalDocenti();
    if (total === 0) return 0;
    return (this.corsi().length / total).toFixed(1);
  });

  /** Docente with most corsi */
  docentePiuAttivo = computed(() => {
    const corsiList = this.corsi();
    const docentiList = this.docenti();
    if (corsiList.length === 0 || docentiList.length === 0) return 'N/A';

    const counts = corsiList.reduce(
      (acc, corso) => {
        acc[corso.docente_id] = (acc[corso.docente_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return 'N/A';

    const topDocenteId = sorted[0][0];
    const topDocente = docentiList.find((d) => d.id === topDocenteId);
    return topDocente
      ? `${topDocente.firstname} ${topDocente.lastname} (${sorted[0][1]})`
      : 'N/A';
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  /**
   * FORKJOIN PATTERN
   * Uses forkJoin to wait for ALL API calls to complete before updating the UI.
   * The loading signal is set to false ONLY when both calls have completed.
   */
  private loadAllData(): void {
    this.loading.set(true);

    // forkJoin takes an object of Observables and waits for all to complete
    forkJoin({
      docenti: this.docenteService.loadDocenti$(),
      corsi: this.corsoService.loadCorsi$(),
    }).subscribe({
      next: () => {
        // Both calls completed successfully
        // The services have already updated their signals via tap()
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore durante il caricamento dei dati:', err);
        this.loading.set(false);
        alert('Errore durante il caricamento dei dati. Riprova più tardi.');
      },
    });
  }

  editDocente(id: string): void {
    this.router.navigate(['/docenti', id]);
  }

  deleteDocente(id: string): void {
    if (confirm('Sei sicuro di voler eliminare questo docente?')) {
      this.docenteService.deleteDocente(id).subscribe({
        next: () => {
          alert('Docente eliminato con successo!');
          // Reload all data to keep everything in sync
          this.loadAllData();
        },
        error: (err) => {
          console.error("Errore durante l'eliminazione del docente:", err);
          alert(
            "Errore durante l'eliminazione del docente. Riprova più tardi."
          );
        },
      });
    }
  }

  createNew(): void {
    this.router.navigate(['/docenti/new']);
  }
}
