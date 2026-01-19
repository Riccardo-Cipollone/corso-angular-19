import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Docente } from '../models/docente.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocenteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/docenti';

  docenti = signal<Docente[]>([]);
  loading = signal<boolean>(false);

  /**
   * Original load method - fires and forgets, manages its own loading state
   */
  loadDocenti(): void {
    this.loading.set(true);
    this.http
      .get<Docente[]>(this.apiUrl)
      .pipe(tap(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.docenti.set(data),
        error: () => this.loading.set(false),
      });
  }

  /**
   * Observable version for use with forkJoin/combineLatest
   * Returns the Observable so it can be combined with other calls
   */
  loadDocenti$(): Observable<Docente[]> {
    return this.http.get<Docente[]>(this.apiUrl).pipe(
      tap((data) => this.docenti.set(data))
    );
  }

  getDocente(id: string): Observable<Docente> {
    return this.http.get<Docente>(`${this.apiUrl}/${id}`);
  }

  createDocente(docente: Omit<Docente, 'id'>): Observable<Docente> {
    return this.http
      .post<Docente>(this.apiUrl, docente)
      .pipe(tap(() => this.loadDocenti()));
  }

  updateDocente(id: string, docente: Partial<Docente>): Observable<Docente> {
    return this.http
      .patch<Docente>(`${this.apiUrl}/${id}`, docente)
      .pipe(tap(() => this.loadDocenti()));
  }

  deleteDocente(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.loadDocenti()));
  }
}
