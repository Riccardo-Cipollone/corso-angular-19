import { Component, inject, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AulaService } from '../../services/aula.service';
import { CorsoService } from '../../services/corso.service';

/**
 * APPROACH 4: ROUTE RESOLVER
 *
 * This component demonstrates using a Route Resolver to pre-load data.
 * The resolver runs BEFORE the component is activated, so when ngOnInit runs,
 * all data is already available in the services' signals.
 *
 * Notice:
 * - NO ngOnInit needed for loading data
 * - NO loading state needed (data is already there when component renders)
 * - The component is simpler and focuses only on displaying data
 *
 * Pros:
 * - Data is guaranteed to be available when component loads
 * - No loading spinner needed in the component
 * - Clean separation of data fetching and display logic
 *
 * Cons:
 * - Navigation appears to pause while data loads
 * - User doesn't see the page until all data is ready
 * - Might need a global loading indicator during route transitions
 */
@Component({
  selector: 'app-aula-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aula-list.component.html',
  styleUrl: './aula-list.component.css',
})
export class AulaListComponent {
  private aulaService = inject(AulaService);
  private corsoService = inject(CorsoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Data is already loaded by the resolver - no need to call load methods!
  aule = this.aulaService.aule;
  corsi = this.corsoService.corsi;

  /**
   * With a resolver, loading is always false because data is pre-loaded.
   * We can optionally access the resolved data from the route:
   * this.route.snapshot.data['data'] contains { aule, corsi }
   */
  loading = computed(() => false); // Data is always ready with resolver!

  /** Total number of aule */
  totalAule = computed(() => this.aule().length);

  /** Sum of all posti across all aule */
  capacitaTotale = computed(() =>
    this.aule().reduce((sum, aula) => sum + aula.numero_posti, 0)
  );

  /** Average capacity per aula */
  capacitaMedia = computed(() => {
    const total = this.totalAule();
    return total > 0 ? Math.round(this.capacitaTotale() / total) : 0;
  });

  /** Aula with maximum capacity */
  aulaMaxCapacita = computed(() => {
    const list = this.aule();
    if (list.length === 0) return 'N/A';
    const max = list.reduce((prev, curr) =>
      prev.numero_posti > curr.numero_posti ? prev : curr
    );
    return `${max.name} (${max.numero_posti})`;
  });

  /** Number of aule currently in use (assigned to at least one corso) */
  auleInUso = computed(() => {
    const auleIds = new Set(this.corsi().map((c) => c.aula_id));
    return this.aule().filter((a) => auleIds.has(a.id)).length;
  });

  /** Number of aule not in use */
  auleLibere = computed(() => {
    return this.totalAule() - this.auleInUso();
  });

  // NO ngOnInit needed! The resolver already loaded the data.
  // If you want to see the resolved data:
  // constructor() {
  //   const resolvedData = this.route.snapshot.data['data'];
  //   console.log('Resolved data:', resolvedData);
  // }

  editAula(id: string): void {
    this.router.navigate(['/aule', id]);
  }

  deleteAula(id: string): void {
    if (confirm("Sei sicuro di voler eliminare quest'aula?")) {
      this.aulaService.deleteAula(id).subscribe({
        next: () => {
          alert('Aula eliminata con successo!');
          // Re-navigate to trigger resolver again and refresh data
          this.router.navigate(['/aule']);
        },
        error: (err) => {
          console.error("Errore durante l'eliminazione dell'aula:", err);
          alert("Errore durante l'eliminazione dell'aula. Riprova più tardi.");
        },
      });
    }
  }

  createNew(): void {
    this.router.navigate(['/aule/new']);
  }
}
