import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CorsoStudenteService } from '../../services/corso-studente.service';
import { CorsoService } from '../../services/corso.service';
import { StudenteService } from '../../services/studente.service';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';

/**
 * Form Iscrizioni - Implementa HasUnsavedChanges per il guard.
 */
@Component({
  selector: 'app-corso-studente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './corso-studente-form.component.html',
  styleUrl: './corso-studente-form.component.css',
})
export class CorsoStudenteFormComponent implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private corsoStudenteService = inject(CorsoStudenteService);
  private corsoService = inject(CorsoService);
  private studenteService = inject(StudenteService);
  private router = inject(Router);

  corsoStudenteForm!: FormGroup;
  corsi = this.corsoService.corsi;
  studenti = this.studenteService.studenti;

  submitted = false;

  get form(): FormGroup {
    return this.corsoStudenteForm;
  }

  ngOnInit(): void {
    this.corsoService.loadCorsi();
    this.studenteService.loadStudenti();

    this.corsoStudenteForm = this.fb.group({
      corso_id: ['', Validators.required],
      studente_id: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.corsoStudenteForm.valid) {
      const corsoStudenteData = this.corsoStudenteForm.value;
      this.corsoStudenteService
        .createCorsoStudente(corsoStudenteData)
        .subscribe({
          next: () => {
            this.submitted = true;
            alert('Iscrizione creata con successo!');
            this.router.navigate(['/iscrizioni']);
          },
          error: (err) => {
            console.error("Errore durante la creazione dell'iscrizione:", err);
            alert("Errore durante la creazione dell'iscrizione. Riprova.");
          },
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/iscrizioni']);
  }
}
