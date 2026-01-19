import { CanDeactivateFn } from '@angular/router';
import { FormGroup } from '@angular/forms';

/**
 * CANDEACTIVATE GUARD - Unsaved Changes Warning
 *
 * A CanDeactivate guard runs when the user tries to LEAVE a route.
 * It's perfect for warning users when they have unsaved form data.
 *
 * This guard checks if:
 * 1. The component has a form (via the HasUnsavedChanges interface)
 * 2. The form has been modified (dirty) but not submitted
 *
 * If there are unsaved changes, it shows a confirmation dialog.
 */

/**
 * Interface that form components must implement to use this guard.
 * This is a CONTRACT: any component using this guard MUST have these properties.
 */
export interface HasUnsavedChanges {
  /** The reactive form to check for changes */
  form: FormGroup;
  /** Whether the form has been submitted (to avoid false positives after save) */
  submitted: boolean;
}

/**
 * Functional guard using Angular's CanDeactivateFn (Angular 15+)
 *
 * Usage in routes:
 * { path: 'corsi/:id', component: CorsoFormComponent, canDeactivate: [unsavedChangesGuard] }
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (
  component
) => {
  // If component doesn't have a form, allow navigation
  if (!component.form) {
    return true;
  }

  // If form was submitted successfully, allow navigation
  if (component.submitted) {
    return true;
  }

  // If form is dirty (modified), ask for confirmation
  if (component.form.dirty) {
    return confirm(
      'Hai delle modifiche non salvate. Sei sicuro di voler uscire?'
    );
  }

  // No unsaved changes, allow navigation
  return true;
};
