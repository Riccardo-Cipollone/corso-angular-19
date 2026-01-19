import { Routes } from '@angular/router';
import { CorsoListComponent } from './components/corso/corso-list.component';
import { CorsoFormComponent } from './components/corso/corso-form.component';
import { StudenteListComponent } from './components/studente/studente-list.component';
import { StudenteFormComponent } from './components/studente/studente-form.component';
import { DocenteListComponent } from './components/docente/docente-list.component';
import { DocenteFormComponent } from './components/docente/docente-form.component';
import { AulaListComponent } from './components/aula/aula-list.component';
import { AulaFormComponent } from './components/aula/aula-form.component';
import { CorsoStudenteListComponent } from './components/corso-studente/corso-studente-list.component';
import { CorsoStudenteFormComponent } from './components/corso-studente/corso-studente-form.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { aulaListResolver } from './resolvers/aula-list.resolver';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: '/corsi', pathMatch: 'full' },
      { path: 'corsi', component: CorsoListComponent },
      // Form routes with CanDeactivate guard for unsaved changes warning
      {
        path: 'corsi/new',
        component: CorsoFormComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'corsi/:id',
        component: CorsoFormComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      { path: 'studenti', component: StudenteListComponent },
      {
        path: 'studenti/new',
        component: StudenteFormComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'studenti/:id',
        component: StudenteFormComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      { path: 'docenti', component: DocenteListComponent },
      {
        path: 'docenti/new',
        component: DocenteFormComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'docenti/:id',
        component: DocenteFormComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      // Route with resolver - data is pre-loaded before component renders
      {
        path: 'aule',
        component: AulaListComponent,
        resolve: { data: aulaListResolver },
      },
      {
        path: 'aule/new',
        component: AulaFormComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'aule/:id',
        component: AulaFormComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      { path: 'iscrizioni', component: CorsoStudenteListComponent },
      {
        path: 'iscrizioni/new',
        component: CorsoStudenteFormComponent,
        canDeactivate: [unsavedChangesGuard],
      },
    ],
  },
];
