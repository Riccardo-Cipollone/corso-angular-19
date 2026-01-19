import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Studente } from '../models/studente.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudenteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/studenti';

  studenti = signal<Studente[]>([]);
  loading = signal<boolean>(false);

  loadStudenti(): void {
    this.loading.set(true);
    this.http
      .get<Studente[]>(this.apiUrl)
      .pipe(tap(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.studenti.set(data),
        error: () => this.loading.set(false),
      });
  }

  getStudente(id: string): Observable<Studente> {
    return this.http.get<Studente>(`${this.apiUrl}/${id}`);
  }

  createStudente(studente: Omit<Studente, 'id'>): Observable<Studente> {
    return this.http
      .post<Studente>(this.apiUrl, studente)
      .pipe(tap(() => this.loadStudenti()));
  }

  updateStudente(
    id: string,
    studente: Partial<Studente>
  ): Observable<Studente> {
    return this.http
      .patch<Studente>(`${this.apiUrl}/${id}`, studente)
      .pipe(tap(() => this.loadStudenti()));
  }

  deleteStudente(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.loadStudenti()));
  }
}
