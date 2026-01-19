import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CorsoStudente } from '../models/corso-studente.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CorsoStudenteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/corso_studente';

  corsoStudenti = signal<CorsoStudente[]>([]);
  loading = signal<boolean>(false);

  loadCorsoStudenti(): void {
    this.loading.set(true);
    this.http
      .get<CorsoStudente[]>(this.apiUrl)
      .pipe(tap(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.corsoStudenti.set(data),
        error: () => this.loading.set(false),
      });
  }

  getCorsoStudente(id: string): Observable<CorsoStudente> {
    return this.http.get<CorsoStudente>(`${this.apiUrl}/${id}`);
  }

  createCorsoStudente(
    corsoStudente: Omit<CorsoStudente, 'id'>
  ): Observable<CorsoStudente> {
    return this.http
      .post<CorsoStudente>(this.apiUrl, corsoStudente)
      .pipe(tap(() => this.loadCorsoStudenti()));
  }

  deleteCorsoStudente(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.loadCorsoStudenti()));
  }
}
