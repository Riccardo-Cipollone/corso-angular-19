import { Component, OnInit, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CorsoService } from '../../services/corso.service';
import { DocenteService } from '../../services/docente.service';
import { AulaService } from '../../services/aula.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CorsoStatisticsComponent } from './components/corso-statistics.component';

/**
 * Componente "Smart" (Container) - Dimostra:
 * 1. Pattern Smart/Dumb (usa CorsoStatisticsComponent come figlio dumb)
 * 2. Computed loading combinando più servizi
 * Vedi README.md per dettagli.
 */
@Component({
  selector: 'app-corso-list',
  standalone: true,
  imports: [CommonModule, CorsoStatisticsComponent],
  templateUrl: './corso-list.component.html',
  styleUrl: './corso-list.component.css',
})
export class CorsoListComponent implements OnInit {
  private corsoService = inject(CorsoService);
  private docenteService = inject(DocenteService);
  private aulaService = inject(AulaService);
  private router = inject(Router);
  private toast = inject(ToastService);

  corsi = this.corsoService.corsi;
  docenti = this.docenteService.docenti;
  aule = this.aulaService.aule;

  // Computed loading combinato
  loading = computed(
    () =>
      this.corsoService.loading() ||
      this.docenteService.loading() ||
      this.aulaService.loading()
  );

  // Statistiche calcolate (computed signals)
  totalCorsi = computed(() => this.corsi().length);

  capacitaTotale = computed(() => {
    const corsiList = this.corsi();
    const auleList = this.aule();
    return corsiList.reduce((total, corso) => {
      const aula = auleList.find((a) => a.id === corso.aula_id);
      return total + (aula?.numero_posti ?? 0);
    }, 0);
  });

  docentiAttivi = computed(() => {
    const uniqueDocenti = new Set(this.corsi().map((c) => c.docente_id));
    return uniqueDocenti.size;
  });

  auleInUso = computed(() => {
    const uniqueAule = new Set(this.corsi().map((c) => c.aula_id));
    return uniqueAule.size;
  });

  capacitaMedia = computed(() => {
    const total = this.totalCorsi();
    return total > 0 ? Math.round(this.capacitaTotale() / total) : 0;
  });

  ngOnInit(): void {
    this.corsoService.loadCorsi();
    this.docenteService.loadDocenti();
    this.aulaService.loadAule();
  }

  getDocenteName(docenteId: string): string {
    const docente = this.docenti().find((d) => d.id === docenteId);
    return docente ? `${docente.firstname} ${docente.lastname}` : 'N/A';
  }

  getAulaName(aulaId: string): string {
    const aula = this.aule().find((a) => a.id === aulaId);
    return aula ? aula.name : 'N/A';
  }

  editCorso(id: string): void {
    this.router.navigate(['/corsi', id]);
  }

  deleteCorso(id: string): void {
    if (confirm('Sei sicuro di voler eliminare questo corso?')) {
      this.corsoService.deleteCorso(id).subscribe({
        next: () => this.toast.success('Corso eliminato con successo!'),
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
