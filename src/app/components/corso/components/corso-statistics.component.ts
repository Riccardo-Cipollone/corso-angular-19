import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente "Dumb" (Presentazionale) per le statistiche.
 * NON inietta servizi, riceve dati solo via @Input().
 * Vedi README.md per dettagli sul pattern Smart/Dumb.
 */
@Component({
  selector: 'app-corso-statistics',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div
        class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
      >
        <p class="text-sm text-blue-600 font-medium">Totale Corsi</p>
        <p class="text-2xl font-bold text-blue-800">{{ totalCorsi }}</p>
      </div>
      <div
        class="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
      >
        <p class="text-sm text-green-600 font-medium">Capacità Totale</p>
        <p class="text-2xl font-bold text-green-800">{{ capacitaTotale }}</p>
      </div>
      <div
        class="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center"
      >
        <p class="text-sm text-purple-600 font-medium">Capacità Media</p>
        <p class="text-2xl font-bold text-purple-800">{{ capacitaMedia }}</p>
      </div>
      <div
        class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center"
      >
        <p class="text-sm text-orange-600 font-medium">Docenti Attivi</p>
        <p class="text-2xl font-bold text-orange-800">{{ docentiAttivi }}</p>
      </div>
      <div
        class="bg-pink-50 border border-pink-200 rounded-lg p-4 text-center"
      >
        <p class="text-sm text-pink-600 font-medium">Aule in Uso</p>
        <p class="text-2xl font-bold text-pink-800">{{ auleInUso }}</p>
      </div>
    </div>
  `,
})
export class CorsoStatisticsComponent {
  @Input() totalCorsi = 0;
  @Input() capacitaTotale = 0;
  @Input() capacitaMedia = 0;
  @Input() docentiAttivi = 0;
  @Input() auleInUso = 0;
}
