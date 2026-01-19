import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Corso } from '../models/corso.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CorsoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/corsi';

  corsi = signal<Corso[]>([]);
  loading = signal<boolean>(false);

  /**
   * Original load method - fires and forgets, manages its own loading state
   */
  loadCorsi(): void {
    this.loading.set(true);
    this.http
      .get<Corso[]>(this.apiUrl)
      .pipe(tap(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.corsi.set(data),
        error: () => this.loading.set(false),
      });
  }

  /**
   * Observable version for use with forkJoin/combineLatest
   * Returns the Observable so it can be combined with other calls
   */
  loadCorsi$(): Observable<Corso[]> {
    return this.http.get<Corso[]>(this.apiUrl).pipe(
      tap((data) => this.corsi.set(data))
    );
  }

  getCorso(id: string): Observable<Corso> {
    return this.http.get<Corso>(`${this.apiUrl}/${id}`);
  }

  createCorso(corso: Omit<Corso, 'id'>): Observable<Corso> {
    return this.http
      .post<Corso>(this.apiUrl, corso)
      .pipe(tap(() => this.loadCorsi()));
  }

  updateCorso(id: string, corso: Partial<Corso>): Observable<Corso> {
    return this.http
      .patch<Corso>(`${this.apiUrl}/${id}`, corso)
      .pipe(tap(() => this.loadCorsi()));
  }

  deleteCorso(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.loadCorsi()));
  }
}
