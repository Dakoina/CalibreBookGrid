
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BooksService } from './books.service';
import { LanguageFilterComponent } from './language-filter';

@Component({
  selector: 'search-box',
  imports: [FormsModule, LanguageFilterComponent],
  template: `
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="search"
        [ngModel]="books.search()"
        (ngModelChange)="books.search.set($event)"
        placeholder="Search author / title / series"
        class="w-full max-w-xs rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <language-filter />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBoxComponent {
  protected readonly books = inject(BooksService);
}
