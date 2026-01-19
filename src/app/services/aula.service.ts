import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Aula } from '../models/aula.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AulaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/aule';

  aule = signal<Aula[]>([]);
  loading = signal<boolean>(false);

  /**
   * Original load method - fires and forgets, manages its own loading state
   */
  loadAule(): void {
    this.loading.set(true);
    this.http
      .get<Aula[]>(this.apiUrl)
      .pipe(tap(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.aule.set(data),
        error: () => this.loading.set(false),
      });
  }

  /**
   * Observable version for use with forkJoin/combineLatest
   * Returns the Observable so it can be combined with other calls
   */
  loadAule$(): Observable<Aula[]> {
    return this.http.get<Aula[]>(this.apiUrl).pipe(
      tap((data) => this.aule.set(data))
    );
  }

  getAula(id: string): Observable<Aula> {
    return this.http.get<Aula>(`${this.apiUrl}/${id}`);
  }

  createAula(aula: Omit<Aula, 'id'>): Observable<Aula> {
    return this.http
      .post<Aula>(this.apiUrl, aula)
      .pipe(tap(() => this.loadAule()));
  }

  updateAula(id: string, aula: Partial<Aula>): Observable<Aula> {
    return this.http
      .patch<Aula>(`${this.apiUrl}/${id}`, aula)
      .pipe(tap(() => this.loadAule()));
  }

  deleteAula(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.loadAule()));
  }
}
