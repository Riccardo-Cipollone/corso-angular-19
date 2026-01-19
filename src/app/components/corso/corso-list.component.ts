import { Component, OnInit, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CorsoService } from '../../services/corso.service';
import { DocenteService } from '../../services/docente.service';
import { AulaService } from '../../services/aula.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CorsoStatisticsComponent } from './components/corso-statistics.component';

/**
 * SMART (CONTAINER) COMPONENT
 *
 * This is a "smart" or "container" component. Key characteristics:
 *
 * 1. Injects services and handles business logic
 * 2. Manages state (loading, data, etc.)
 * 3. Computes derived values from raw data
 * 4. Passes data to child "dumb" components via @Input()
 * 5. Handles events from child components via @Output()
 *
 * The CorsoStatisticsComponent is a "dumb" child component that:
 * - Receives data through @Input() properties
 * - Doesn't know about services
 * - Only responsible for displaying data
 *
 * This pattern is called "Smart/Dumb" or "Container/Presentational"
 *
 * Also demonstrates:
 * - APPROACH 1: Computed loading state combining multiple services
 */
@Component({
  selector: 'app-corso-list',
  standalone: true,
  imports: [CommonModule, CorsoStatisticsComponent],
  templateUrl: './corso-list.component.html',
  styleUrl: './corso-list.component.css',
})
export class CorsoListComponent implements OnInit {
  // ========== SERVICE INJECTIONS (Smart component responsibility) ==========
  private corsoService = inject(CorsoService);
  private docenteService = inject(DocenteService);
  private aulaService = inject(AulaService);
  private router = inject(Router);
  private toast = inject(ToastService);

  // ========== DATA SIGNALS ==========
  corsi = this.corsoService.corsi;
  docenti = this.docenteService.docenti;
  aule = this.aulaService.aule;

  /**
   * COMPUTED LOADING STATE
   * Combines all three loading signals into one.
   */
  loading = computed(
    () =>
      this.corsoService.loading() ||
      this.docenteService.loading() ||
      this.aulaService.loading()
  );

  // ========== COMPUTED STATISTICS (Smart component computes, dumb displays) ==========

  /** Total number of courses */
  totalCorsi = computed(() => this.corsi().length);

  /** Total capacity: sum of posti for all aule used by courses */
  capacitaTotale = computed(() => {
    const corsiList = this.corsi();
    const auleList = this.aule();
    return corsiList.reduce((total, corso) => {
      const aula = auleList.find((a) => a.id === corso.aula_id);
      return total + (aula?.numero_posti ?? 0);
    }, 0);
  });

  /** Number of unique docenti teaching courses */
  docentiAttivi = computed(() => {
    const uniqueDocenti = new Set(this.corsi().map((c) => c.docente_id));
    return uniqueDocenti.size;
  });

  /** Number of unique aule being used */
  auleInUso = computed(() => {
    const uniqueAule = new Set(this.corsi().map((c) => c.aula_id));
    return uniqueAule.size;
  });

  /** Average capacity per course */
  capacitaMedia = computed(() => {
    const total = this.totalCorsi();
    return total > 0 ? Math.round(this.capacitaTotale() / total) : 0;
  });

  // ========== LIFECYCLE ==========

  ngOnInit(): void {
    this.corsoService.loadCorsi();
    this.docenteService.loadDocenti();
    this.aulaService.loadAule();
  }

  // ========== HELPER METHODS ==========

  getDocenteName(docenteId: string): string {
    const docente = this.docenti().find((d) => d.id === docenteId);
    return docente ? `${docente.firstname} ${docente.lastname}` : 'N/A';
  }

  getAulaName(aulaId: string): string {
    const aula = this.aule().find((a) => a.id === aulaId);
    return aula ? aula.name : 'N/A';
  }

  // ========== ACTIONS ==========

  editCorso(id: string): void {
    this.router.navigate(['/corsi', id]);
  }

  deleteCorso(id: string): void {
    if (confirm('Sei sicuro di voler eliminare questo corso?')) {
      this.corsoService.deleteCorso(id).subscribe({
        next: () => {
          this.toast.success('Corso eliminato con successo!');
        },
        error: (err) => {
          console.error("Errore durante l'eliminazione del corso:", err);
          this.toast.error("Errore durante l'eliminazione del corso.");
        },
      });
    }
  }

  createNew(): void {
    this.router.navigate(['/corsi/new']);
  }
}
