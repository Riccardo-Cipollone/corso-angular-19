import { Component, OnInit, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudenteService } from '../../services/studente.service';

@Component({
  selector: 'app-studente-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './studente-list.component.html',
  styleUrl: './studente-list.component.css',
})
export class StudenteListComponent implements OnInit {
  private studenteService = inject(StudenteService);
  private router = inject(Router);

  studenti = this.studenteService.studenti;
  loading = this.studenteService.loading;

  // ========== COMPUTED VALUES ==========
  // These are reactive derived values that automatically update when source signals change

  /** Total number of students */
  totalStudenti = computed(() => this.studenti().length);

  /** First matricola in the list (alphabetically) */
  primaMatricola = computed(() => {
    const list = this.studenti();
    if (list.length === 0) return 'N/A';
    const sorted = [...list].sort((a, b) =>
      a.matricola.localeCompare(b.matricola)
    );
    return sorted[0].matricola;
  });

  /** Last matricola in the list (alphabetically) */
  ultimaMatricola = computed(() => {
    const list = this.studenti();
    if (list.length === 0) return 'N/A';
    const sorted = [...list].sort((a, b) =>
      a.matricola.localeCompare(b.matricola)
    );
    return sorted[sorted.length - 1].matricola;
  });

  /** Number of unique first names */
  nomiUnici = computed(() => {
    const uniqueNames = new Set(
      this.studenti().map((s) => s.firstname.toLowerCase())
    );
    return uniqueNames.size;
  });

  /** Most common last name initial */
  inizialePiuComune = computed(() => {
    const list = this.studenti();
    if (list.length === 0) return 'N/A';

    const initials = list.map((s) => s.lastname.charAt(0).toUpperCase());
    const counts = initials.reduce(
      (acc, initial) => {
        acc[initial] = (acc[initial] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? `${sorted[0][0]} (${sorted[0][1]})` : 'N/A';
  });

  ngOnInit(): void {
    this.studenteService.loadStudenti();
  }

  editStudente(id: string): void {
    this.router.navigate(['/studenti', id]);
  }

  deleteStudente(id: string): void {
    if (confirm('Sei sicuro di voler eliminare questo studente?')) {
      this.studenteService.deleteStudente(id).subscribe({
        next: () => {
          alert('Studente eliminato con successo!');
        },
        error: (err) => {
          console.error("Errore durante l'eliminazione dello studente:", err);
          alert(
            "Errore durante l'eliminazione dello studente. Riprova più tardi."
          );
        },
      });
    }
  }

  createNew(): void {
    this.router.navigate(['/studenti/new']);
  }
}
