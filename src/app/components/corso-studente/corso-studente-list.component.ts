import { Component, OnInit, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CorsoStudenteService } from '../../services/corso-studente.service';
import { CorsoService } from '../../services/corso.service';
import { StudenteService } from '../../services/studente.service';

@Component({
  selector: 'app-corso-studente-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './corso-studente-list.component.html',
  styleUrl: './corso-studente-list.component.css',
})
export class CorsoStudenteListComponent implements OnInit {
  private corsoStudenteService = inject(CorsoStudenteService);
  private corsoService = inject(CorsoService);
  private studenteService = inject(StudenteService);
  private router = inject(Router);

  corsoStudenti = this.corsoStudenteService.corsoStudenti;
  corsi = this.corsoService.corsi;
  studenti = this.studenteService.studenti;
  loading = this.corsoStudenteService.loading;

  // ========== COMPUTED VALUES ==========
  // These are reactive derived values that automatically update when source signals change

  /** Total number of enrollments */
  totalIscrizioni = computed(() => this.corsoStudenti().length);

  /** Number of unique students enrolled in at least one corso */
  studentiIscritti = computed(() => {
    const uniqueStudenti = new Set(
      this.corsoStudenti().map((cs) => cs.studente_id)
    );
    return uniqueStudenti.size;
  });

  /** Number of unique corsi with at least one enrollment */
  corsiConIscrizioni = computed(() => {
    const uniqueCorsi = new Set(this.corsoStudenti().map((cs) => cs.corso_id));
    return uniqueCorsi.size;
  });

  /** Average enrollments per corso */
  mediaIscrizioniPerCorso = computed(() => {
    const corsiCount = this.corsiConIscrizioni();
    if (corsiCount === 0) return '0';
    return (this.totalIscrizioni() / corsiCount).toFixed(1);
  });

  /** Corso with most enrollments */
  corsoPiuPopolare = computed(() => {
    const iscrizioni = this.corsoStudenti();
    const corsiList = this.corsi();
    if (iscrizioni.length === 0) return 'N/A';

    const counts = iscrizioni.reduce(
      (acc, cs) => {
        acc[cs.corso_id] = (acc[cs.corso_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return 'N/A';

    const topCorsoId = sorted[0][0];
    const topCorso = corsiList.find((c) => c.id === topCorsoId);
    return topCorso ? `${topCorso.name} (${sorted[0][1]})` : 'N/A';
  });

  /** Student enrolled in most corsi */
  studentePiuAttivo = computed(() => {
    const iscrizioni = this.corsoStudenti();
    const studentiList = this.studenti();
    if (iscrizioni.length === 0) return 'N/A';

    const counts = iscrizioni.reduce(
      (acc, cs) => {
        acc[cs.studente_id] = (acc[cs.studente_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return 'N/A';

    const topStudenteId = sorted[0][0];
    const topStudente = studentiList.find((s) => s.id === topStudenteId);
    return topStudente
      ? `${topStudente.firstname} ${topStudente.lastname} (${sorted[0][1]})`
      : 'N/A';
  });

  ngOnInit(): void {
    this.corsoStudenteService.loadCorsoStudenti();
    this.corsoService.loadCorsi();
    this.studenteService.loadStudenti();
  }

  getCorsoName(corsoId: string): string {
    const corso = this.corsi().find((c) => c.id === corsoId);
    return corso ? corso.name : 'N/A';
  }

  getStudenteName(studenteId: string): string {
    const studente = this.studenti().find((s) => s.id === studenteId);
    return studente
      ? `${studente.firstname} ${studente.lastname} (${studente.matricola})`
      : 'N/A';
  }

  deleteCorsoStudente(id: string): void {
    if (confirm('Sei sicuro di voler eliminare questa iscrizione?')) {
      this.corsoStudenteService.deleteCorsoStudente(id).subscribe({
        next: () => {
          alert('Iscrizione eliminata con successo!');
        },
        error: (err) => {
          console.error("Errore durante l'eliminazione dell'iscrizione:", err);
          alert(
            "Errore durante l'eliminazione dell'iscrizione. Riprova più tardi."
          );
        },
      });
    }
  }

  createNew(): void {
    this.router.navigate(['/iscrizioni/new']);
  }
}
