import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudenteService } from '../../services/studente.service';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';

/**
 * Form Studenti - Implementa HasUnsavedChanges per il guard.
 */
@Component({
  selector: 'app-studente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './studente-form.component.html',
  styleUrl: './studente-form.component.css',
})
export class StudenteFormComponent implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private studenteService = inject(StudenteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  studenteForm!: FormGroup;
  isEdit = false;
  studenteId: string | null = null;

  submitted = false;

  get form(): FormGroup {
    return this.studenteForm;
  }

  ngOnInit(): void {
    this.studenteForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      matricola: ['', Validators.required],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.studenteId = id;
      this.studenteService.getStudente(this.studenteId).subscribe({
        next: (studente) => {
          this.studenteForm.patchValue({
            firstname: studente.firstname,
            lastname: studente.lastname,
            matricola: studente.matricola,
          });
          this.studenteForm.markAsPristine();
        },
        error: (err) => {
          console.error('Errore durante il caricamento dello studente:', err);
          alert(
            'Errore durante il caricamento dello studente. Torna alla lista.'
          );
          this.submitted = true;
          this.router.navigate(['/studenti']);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.studenteForm.valid) {
      const studenteData = this.studenteForm.value;
      if (this.isEdit && this.studenteId) {
        this.studenteService
          .updateStudente(this.studenteId, studenteData)
          .subscribe({
            next: () => {
              this.submitted = true;
              alert('Studente aggiornato con successo!');
              this.router.navigate(['/studenti']);
            },
            error: (err) => {
              console.error(
                "Errore durante l'aggiornamento dello studente:",
                err
              );
              alert("Errore durante l'aggiornamento dello studente. Riprova.");
            },
          });
      } else {
        this.studenteService.createStudente(studenteData).subscribe({
          next: () => {
            this.submitted = true;
            alert('Studente creato con successo!');
            this.router.navigate(['/studenti']);
          },
          error: (err) => {
            console.error('Errore durante la creazione dello studente:', err);
            alert('Errore durante la creazione dello studente. Riprova.');
          },
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/studenti']);
  }
}
