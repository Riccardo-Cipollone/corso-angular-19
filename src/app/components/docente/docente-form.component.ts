import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DocenteService } from '../../services/docente.service';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';

/**
 * Form Docenti - Implementa HasUnsavedChanges per il guard.
 */
@Component({
  selector: 'app-docente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './docente-form.component.html',
  styleUrl: './docente-form.component.css',
})
export class DocenteFormComponent implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private docenteService = inject(DocenteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  docenteForm!: FormGroup;
  isEdit = false;
  docenteId: string | null = null;

  submitted = false;

  get form(): FormGroup {
    return this.docenteForm;
  }

  ngOnInit(): void {
    this.docenteForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.docenteId = id;
      this.docenteService.getDocente(this.docenteId).subscribe({
        next: (docente) => {
          this.docenteForm.patchValue({
            firstname: docente.firstname,
            lastname: docente.lastname,
          });
          this.docenteForm.markAsPristine();
        },
        error: (err) => {
          console.error('Errore durante il caricamento del docente:', err);
          alert('Errore durante il caricamento del docente. Torna alla lista.');
          this.submitted = true;
          this.router.navigate(['/docenti']);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.docenteForm.valid) {
      const docenteData = this.docenteForm.value;
      if (this.isEdit && this.docenteId) {
        this.docenteService
          .updateDocente(this.docenteId, docenteData)
          .subscribe({
            next: () => {
              this.submitted = true;
              alert('Docente aggiornato con successo!');
              this.router.navigate(['/docenti']);
            },
            error: (err) => {
              console.error(
                "Errore durante l'aggiornamento del docente:",
                err
              );
              alert("Errore durante l'aggiornamento del docente. Riprova.");
            },
          });
      } else {
        this.docenteService.createDocente(docenteData).subscribe({
          next: () => {
            this.submitted = true;
            alert('Docente creato con successo!');
            this.router.navigate(['/docenti']);
          },
          error: (err) => {
            console.error('Errore durante la creazione del docente:', err);
            alert('Errore durante la creazione del docente. Riprova.');
          },
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/docenti']);
  }
}
