import { CanDeactivateFn } from '@angular/router';
import { FormGroup } from '@angular/forms';

/**
 * Interface che i componenti form devono implementare.
 * Vedi README.md per dettagli sul pattern CanDeactivate.
 */
export interface HasUnsavedChanges {
  form: FormGroup;
  submitted: boolean;
}

/**
 * Guard che avvisa l'utente se ci sono modifiche non salvate.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (
  component
) => {
  if (!component.form) return true;
  if (component.submitted) return true;

  if (component.form.dirty) {
    return confirm(
      'Hai delle modifiche non salvate. Sei sicuro di voler uscire?'
    );
  }

  return true;
};
