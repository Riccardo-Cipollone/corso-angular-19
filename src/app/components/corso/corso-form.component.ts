import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CorsoService } from '../../services/corso.service';
import { DocenteService } from '../../services/docente.service';
import { AulaService } from '../../services/aula.service';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';
import { ToastService } from '../../shared/toast/toast.service';

/**
 * TOAST SERVICE INTEGRATION
 *
 * This component demonstrates replacing alert() with ToastService.
 * Benefits:
 * - Better UX (non-blocking notifications)
 * - Consistent styling across the app
 * - Auto-dismiss with configurable duration
 * - Different types for different scenarios
 *
 * Also implements HasUnsavedChanges for the CanDeactivate guard.
 */
@Component({
  selector: 'app-corso-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './corso-form.component.html',
  styleUrl: './corso-form.component.css',
})
export class CorsoFormComponent implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private corsoService = inject(CorsoService);
  private docenteService = inject(DocenteService);
  private aulaService = inject(AulaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  corsoForm!: FormGroup;
  isEdit = false;
  corsoId: string | null = null;
  docenti = this.docenteService.docenti;
  aule = this.aulaService.aule;

  submitted = false;

  get form(): FormGroup {
    return this.corsoForm;
  }

  ngOnInit(): void {
    this.docenteService.loadDocenti();
    this.aulaService.loadAule();

    this.corsoForm = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      docente_id: ['', Validators.required],
      aula_id: ['', Validators.required],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.corsoId = id;
      this.corsoService.getCorso(this.corsoId).subscribe({
        next: (corso) => {
          this.corsoForm.patchValue({
            name: corso.name,
            date: corso.date,
            docente_id: corso.docente_id,
            aula_id: corso.aula_id,
          });
          this.corsoForm.markAsPristine();
        },
        error: (err) => {
          console.error('Errore durante il caricamento del corso:', err);
          // Using ToastService instead of alert()
          this.toast.error('Errore durante il caricamento del corso.');
          this.submitted = true;
          this.router.navigate(['/corsi']);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.corsoForm.valid) {
      const corsoData = this.corsoForm.value;
      if (this.isEdit && this.corsoId) {
        this.corsoService.updateCorso(this.corsoId, corsoData).subscribe({
          next: () => {
            this.submitted = true;
            // Using ToastService for success message
            this.toast.success('Corso aggiornato con successo!');
            this.router.navigate(['/corsi']);
          },
          error: (err) => {
            console.error("Errore durante l'aggiornamento del corso:", err);
            // Using ToastService for error message
            this.toast.error("Errore durante l'aggiornamento del corso.");
          },
        });
      } else {
        this.corsoService.createCorso(corsoData).subscribe({
          next: () => {
            this.submitted = true;
            // Using ToastService for success message
            this.toast.success('Corso creato con successo!');
            this.router.navigate(['/corsi']);
          },
          error: (err) => {
            console.error('Errore durante la creazione del corso:', err);
            // Using ToastService for error message
            this.toast.error('Errore durante la creazione del corso.');
          },
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/corsi']);
  }
}
