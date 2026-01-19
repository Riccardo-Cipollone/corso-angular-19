import { Component, inject, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AulaService } from '../../services/aula.service';
import { CorsoService } from '../../services/corso.service';

/**
 * Lista Aule - Dimostra:
 * Route Resolver per pre-caricare dati.
 * NO ngOnInit per caricare dati - sono già pronti!
 * Vedi README.md per dettagli.
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

  // Dati già caricati dal resolver
  aule = this.aulaService.aule;
  corsi = this.corsoService.corsi;

  // Con resolver, loading è sempre false
  loading = computed(() => false);

  // Statistiche
  totalAule = computed(() => this.aule().length);

  capacitaTotale = computed(() =>
    this.aule().reduce((sum, aula) => sum + aula.numero_posti, 0)
  );

  capacitaMedia = computed(() => {
    const total = this.totalAule();
    return total > 0 ? Math.round(this.capacitaTotale() / total) : 0;
  });

  aulaMaxCapacita = computed(() => {
    const list = this.aule();
    if (list.length === 0) return 'N/A';
    const max = list.reduce((prev, curr) =>
      prev.numero_posti > curr.numero_posti ? prev : curr
    );
    return `${max.name} (${max.numero_posti})`;
  });

  auleInUso = computed(() => {
    const auleIds = new Set(this.corsi().map((c) => c.aula_id));
    return this.aule().filter((a) => auleIds.has(a.id)).length;
  });

  auleLibere = computed(() => {
    return this.totalAule() - this.auleInUso();
  });

  editAula(id: string): void {
    this.router.navigate(['/aule', id]);
  }

  deleteAula(id: string): void {
    if (confirm("Sei sicuro di voler eliminare quest'aula?")) {
      this.aulaService.deleteAula(id).subscribe({
        next: () => {
          alert('Aula eliminata con successo!');
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
