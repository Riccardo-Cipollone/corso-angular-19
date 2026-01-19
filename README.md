# 📚 Corso Angular 19 - Pattern e Best Practices

Progetto didattico per apprendere i pattern più comuni di Angular 19.

## 🚀 Come Avviare il Progetto

```bash
# Installa le dipendenze
npm install

# Avvia il server JSON (mock API)
npx json-server db.json

# In un altro terminale, avvia l'applicazione Angular
ng serve

# ALTRIMENTI utilizza il seguente comando per fare le cose contemporanamente
npm run dev
```

Apri il browser su `http://localhost:4200/`

---

## 📖 Pattern Implementati

### 1. HTTP Interceptor (Logging)

**File:** `src/app/interceptors/logging.interceptor.ts`

Un **Interceptor HTTP** è una funzione che intercetta TUTTE le richieste/risposte HTTP dell'applicazione. È utile per:
- Aggiungere header di autenticazione
- Loggare le richieste (come in questo caso)
- Mostrare/nascondere indicatori di caricamento
- Gestire errori globalmente

#### Come funziona

```typescript
// interceptors/logging.interceptor.ts
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  
  // Logga la richiesta in uscita
  console.log(`[${req.method}] ${req.url}`);
  
  // Passa la richiesta al prossimo handler e intercetta la risposta
  return next(req).pipe(
    tap({
      next: (event) => { /* risposta OK */ },
      error: (error) => { /* errore */ }
    })
  );
};
```

#### Registrazione in `app.config.ts`

```typescript
import { loggingInterceptor } from './interceptors/logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([loggingInterceptor]))
  ]
};
```

#### Output nella Console

```
[GET]  http://localhost:3000/corsi  ✓ 23ms    // Blu
[POST] http://localhost:3000/corsi  ✓ 15ms    // Verde
[DELETE] http://localhost:3000/corsi/1  ✗ 404  // Rosso
```

---

### 2. CanDeactivate Guard (Modifiche Non Salvate)

**File:** `src/app/guards/unsaved-changes.guard.ts`

Un **Guard CanDeactivate** viene eseguito quando l'utente cerca di LASCIARE una route. È perfetto per avvisare l'utente quando ha dati non salvati nel form.

#### Interface del Contratto

I componenti che usano questo guard DEVONO implementare questa interface:

```typescript
export interface HasUnsavedChanges {
  form: FormGroup;      // Il form reattivo da controllare
  submitted: boolean;   // Se il form è stato inviato
}
```

#### Il Guard

```typescript
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  // Se non c'è un form, permetti navigazione
  if (!component.form) return true;
  
  // Se il form è stato inviato, permetti navigazione
  if (component.submitted) return true;
  
  // Se il form è dirty (modificato), chiedi conferma
  if (component.form.dirty) {
    return confirm('Hai delle modifiche non salvate. Sei sicuro di voler uscire?');
  }
  
  return true;
};
```

#### Implementazione nel Componente

```typescript
export class CorsoFormComponent implements OnInit, HasUnsavedChanges {
  corsoForm!: FormGroup;
  submitted = false;

  // Getter richiesto dall'interface
  get form(): FormGroup {
    return this.corsoForm;
  }

  onSubmit(): void {
    // ... validazione ...
    this.submitted = true;  // Imposta prima della navigazione
    this.router.navigate(['/corsi']);
  }
}
```

#### Registrazione nelle Routes

```typescript
export const routes: Routes = [
  {
    path: 'corsi/:id',
    component: CorsoFormComponent,
    canDeactivate: [unsavedChangesGuard]  // <-- Aggiungi qui
  }
];
```

---

### 3. Toast Notifications (Service con Signals)

**Files:** `src/app/shared/toast/toast.service.ts`, `toast.component.ts`

Un sistema di notifiche che usa **Angular Signals** per la comunicazione service-to-component.

#### ToastService

```typescript
@Injectable({ providedIn: 'root' })
export class ToastService {
  // Signal con la lista dei toast attivi
  toasts = signal<Toast[]>([]);

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
  info(message: string): void { this.show(message, 'info'); }
  warning(message: string): void { this.show(message, 'warning'); }

  private show(message: string, type: ToastType): void {
    const toast = { id: this.nextId++, message, type };
    this.toasts.update(current => [...current, toast]);
    
    // Rimozione automatica dopo 4 secondi
    setTimeout(() => this.remove(toast.id), 4000);
  }
}
```

#### ToastComponent

```typescript
@Component({
  selector: 'app-toast',
  template: `
    <div class="fixed top-4 right-4 z-50">
      @for (toast of toasts(); track toast.id) {
        <div [class]="getToastClasses(toast.type)" (click)="dismiss(toast.id)">
          {{ toast.message }}
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;  // Espone il signal
}
```

#### Utilizzo

```typescript
// In qualsiasi componente o service
private toast = inject(ToastService);

this.toast.success('Operazione completata!');
this.toast.error('Qualcosa è andato storto');
```

---

### 4. Smart/Dumb Components (Container/Presentational)

**Files:** `src/app/components/corso/corso-list.component.ts` (Smart), `components/corso-statistics.component.ts` (Dumb)

Un pattern che separa la logica dalla presentazione.

#### Componente "Dumb" (Presentazionale)

Caratteristiche:
- **NON** inietta servizi
- Riceve TUTTI i dati tramite `@Input()`
- Emette eventi tramite `@Output()` (se necessario)
- Usa `ChangeDetectionStrategy.OnPush` per performance migliori
- Facile da testare (nessun mock di servizi)

```typescript
@Component({
  selector: 'app-corso-statistics',
  changeDetection: ChangeDetectionStrategy.OnPush,  // Migliora le performance
  template: `
    <div class="stats-panel">
      <div>Totale: {{ totalCorsi }}</div>
      <div>Capacità: {{ capacitaTotale }}</div>
    </div>
  `
})
export class CorsoStatisticsComponent {
  @Input() totalCorsi = 0;
  @Input() capacitaTotale = 0;
  @Input() capacitaMedia = 0;
  // ... altri input
}
```

#### Componente "Smart" (Container)

Caratteristiche:
- Inietta servizi e gestisce la logica
- Gestisce lo stato (loading, dati, etc.)
- Calcola valori derivati dai dati grezzi
- Passa i dati ai componenti "dumb" figli

```typescript
@Component({
  selector: 'app-corso-list',
  imports: [CorsoStatisticsComponent],
  template: `
    <!-- Passa i dati al componente dumb -->
    <app-corso-statistics
      [totalCorsi]="totalCorsi()"
      [capacitaTotale]="capacitaTotale()"
      [capacitaMedia]="capacitaMedia()"
    />
    <!-- ... resto del template -->
  `
})
export class CorsoListComponent {
  private corsoService = inject(CorsoService);  // Inietta servizi
  
  corsi = this.corsoService.corsi;
  
  // Calcola statistiche (computed signals)
  totalCorsi = computed(() => this.corsi().length);
  capacitaTotale = computed(() => /* ... */);
}
```

---

### 5. Gestione Loading State (3 Approcci)

#### Approccio 1: Computed Loading (CorsoListComponent)

Combina più signal di loading in uno usando `computed()`.

```typescript
export class CorsoListComponent {
  // Ogni servizio ha il suo signal loading
  private corsoService = inject(CorsoService);
  private docenteService = inject(DocenteService);

  // Computed che combina tutti i loading
  loading = computed(() =>
    this.corsoService.loading() ||
    this.docenteService.loading()
  );

  ngOnInit(): void {
    // Chiamate indipendenti
    this.corsoService.loadCorsi();
    this.docenteService.loadDocenti();
  }
}
```

**Pro:** Semplice, usa il sistema reattivo di Angular  
**Contro:** Le chiamate API restano indipendenti

---

#### Approccio 2: forkJoin (DocenteListComponent)

Usa `forkJoin` di RxJS per coordinare più chiamate API.

```typescript
import { forkJoin } from 'rxjs';

export class DocenteListComponent {
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loading.set(true);
    
    // forkJoin aspetta che TUTTE le Observable completino
    forkJoin({
      docenti: this.docenteService.loadDocenti$(),
      corsi: this.corsoService.loadCorsi$()
    }).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        // Gestisci errore
      }
    });
  }
}
```

**Pro:** Controllo preciso, gestione errori centralizzata  
**Contro:** Richiede metodi che ritornano Observable

---

#### Approccio 3: Route Resolver (AulaListComponent)

Il resolver carica i dati PRIMA che la route sia attivata.

**Resolver:**

```typescript
// resolvers/aula-list.resolver.ts
export const aulaListResolver: ResolveFn<AulaListResolverData> = () => {
  const aulaService = inject(AulaService);
  const corsoService = inject(CorsoService);

  return forkJoin({
    aule: aulaService.loadAule$(),
    corsi: corsoService.loadCorsi$()
  });
};
```

**Routes:**

```typescript
{
  path: 'aule',
  component: AulaListComponent,
  resolve: { data: aulaListResolver }  // <-- Resolver
}
```

**Componente:**

```typescript
export class AulaListComponent {
  // NO ngOnInit per caricare dati - sono già pronti!
  aule = this.aulaService.aule;
  loading = computed(() => false);  // Sempre false, dati pre-caricati
}
```

**Pro:** Dati garantiti all'avvio, componente semplificato  
**Contro:** Navigazione appare più lenta

---

### 6. Computed Signals per Statistiche

**Esempio da:** Tutti i list components

I `computed()` signals derivano automaticamente valori da altri signals.

```typescript
export class CorsoListComponent {
  corsi = this.corsoService.corsi;
  aule = this.aulaService.aule;

  // Si aggiorna automaticamente quando corsi() cambia
  totalCorsi = computed(() => this.corsi().length);

  // Può dipendere da più signals
  capacitaTotale = computed(() => {
    return this.corsi().reduce((total, corso) => {
      const aula = this.aule().find(a => a.id === corso.aula_id);
      return total + (aula?.numero_posti ?? 0);
    }, 0);
  });

  // Può dipendere da altri computed
  capacitaMedia = computed(() => {
    const total = this.totalCorsi();
    return total > 0 ? Math.round(this.capacitaTotale() / total) : 0;
  });
}
```

---

## 📁 Struttura del Progetto

```
src/app/
├── components/
│   ├── corso/
│   │   ├── components/              # Dumb components
│   │   │   └── corso-statistics.component.ts
│   │   ├── corso-list.component.ts  # Smart component
│   │   └── corso-form.component.ts
│   ├── docente/                     # forkJoin demo
│   ├── studente/
│   ├── aula/                        # Resolver demo
│   └── corso-studente/
├── guards/
│   └── unsaved-changes.guard.ts     # CanDeactivate guard
├── interceptors/
│   └── logging.interceptor.ts       # HTTP interceptor
├── layout/
│   ├── main-layout.component.ts
│   └── sidebar.component.ts
├── models/
├── resolvers/
│   └── aula-list.resolver.ts        # Route resolver
├── services/
└── shared/
    └── toast/
        ├── toast.service.ts         # Toast con signals
        └── toast.component.ts
```

---

## 🔗 Risorse Utili

- [Documentazione Angular](https://angular.dev)
- [RxJS Operators](https://rxjs.dev/guide/operators)
- [Angular Signals](https://angular.dev/guide/signals)

---

## 📝 Note per gli Studenti

1. **Interceptor**: Guarda la console del browser mentre navighi per vedere i log colorati
2. **CanDeactivate**: Modifica un campo in un form e prova a navigare via senza salvare
3. **Toast**: Osserva le notifiche in alto a destra dopo ogni operazione CRUD
4. **Smart/Dumb**: Confronta `corso-list.component.ts` con `corso-statistics.component.ts`
5. **Loading**: Confronta come Corsi, Docenti e Aule gestiscono il loading in modo diverso
