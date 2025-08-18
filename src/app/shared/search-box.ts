import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BooksService } from './books.service';

@Component({
  selector: 'search-box',
  imports: [FormsModule],
  template: `
    <input
      type="search"
      [ngModel]="books.search()"
      (ngModelChange)="books.search.set($event)"
      placeholder="Search author / title / series"
      class="w-full max-w-xs rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBoxComponent {
  protected readonly books = inject(BooksService);
}
