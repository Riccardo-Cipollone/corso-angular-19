import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DocenteService } from '../../services/docente.service';
import { CorsoService } from '../../services/corso.service';

/**
 * Lista Docenti - Dimostra:
 * forkJoin per coordinare chiamate API multiple.
 * Vedi README.md per dettagli.
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

  // Loading locale gestito dal componente
  loading = signal<boolean>(true);

  // Statistiche
  totalDocenti = computed(() => this.docenti().length);

  docentiConCorsi = computed(() => {
    const docentiIds = new Set(this.corsi().map((c) => c.docente_id));
    return this.docenti().filter((d) => docentiIds.has(d.id)).length;
  });

  docentiSenzaCorsi = computed(() => {
    return this.totalDocenti() - this.docentiConCorsi();
  });

  mediaCorsiPerDocente = computed(() => {
    const total = this.totalDocenti();
    if (total === 0) return 0;
    return (this.corsi().length / total).toFixed(1);
  });

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

  // Pattern forkJoin: aspetta che TUTTE le chiamate completino
  private loadAllData(): void {
    this.loading.set(true);

    forkJoin({
      docenti: this.docenteService.loadDocenti$(),
      corsi: this.corsoService.loadCorsi$(),
    }).subscribe({
      next: () => this.loading.set(false),
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
