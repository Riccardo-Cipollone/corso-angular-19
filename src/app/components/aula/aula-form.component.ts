import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AulaService } from '../../services/aula.service';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';

/**
 * Implements HasUnsavedChanges for the CanDeactivate guard.
 * See corso-form.component.ts for detailed comments on how this works.
 */
@Component({
  selector: 'app-aula-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './aula-form.component.html',
  styleUrl: './aula-form.component.css',
})
export class AulaFormComponent implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private aulaService = inject(AulaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  aulaForm!: FormGroup;
  isEdit = false;
  aulaId: string | null = null;

  submitted = false;

  get form(): FormGroup {
    return this.aulaForm;
  }

  ngOnInit(): void {
    this.aulaForm = this.fb.group({
      name: ['', Validators.required],
      numero_posti: ['', [Validators.required, Validators.min(1)]],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.aulaId = id;
      this.aulaService.getAula(this.aulaId).subscribe({
        next: (aula) => {
          this.aulaForm.patchValue({
            name: aula.name,
            numero_posti: aula.numero_posti,
          });
          this.aulaForm.markAsPristine();
        },
        error: (err) => {
          console.error("Errore durante il caricamento dell'aula:", err);
          alert("Errore durante il caricamento dell'aula. Torna alla lista.");
          this.submitted = true;
          this.router.navigate(['/aule']);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.aulaForm.valid) {
      const aulaData = this.aulaForm.value;
      if (this.isEdit && this.aulaId) {
        this.aulaService.updateAula(this.aulaId, aulaData).subscribe({
          next: () => {
            this.submitted = true;
            alert('Aula aggiornata con successo!');
            this.router.navigate(['/aule']);
          },
          error: (err) => {
            console.error("Errore durante l'aggiornamento dell'aula:", err);
            alert("Errore durante l'aggiornamento dell'aula. Riprova.");
          },
        });
      } else {
        this.aulaService.createAula(aulaData).subscribe({
          next: () => {
            this.submitted = true;
            alert('Aula creata con successo!');
            this.router.navigate(['/aule']);
          },
          error: (err) => {
            console.error("Errore durante la creazione dell'aula:", err);
            alert("Errore durante la creazione dell'aula. Riprova.");
          },
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/aule']);
  }
}
