import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BooksService, Book } from '../../shared/books.service';
import { SearchBoxComponent } from '../../shared/search-box';
import { BookCoverComponent } from '../../shared/book-cover';

@Component({
  selector: 'titles-page',
  imports: [SearchBoxComponent, BookCoverComponent],
  template: `
    <div class="p-3 flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <search-box />
      </div>

      @for (author of authors(); track author.name) {
        <section class="mt-3">
          <h2 class="text-sm font-semibold text-gray-200 mb-1">{{ author.name }}</h2>
          @for (s of author.series; track s.name) {
            <div class="mb-1">
              <div class="text-xs text-gray-400 mb-1">{{ s.name }}</div>
              <ul class="pl-3">
                @for (b of s.books; track b.id) {
                  <li class="text-sm text-gray-100 flex items-center gap-1">
                    <button type="button" class="underline underline-offset-2 hover:text-indigo-200" (click)="bc.openDetails()">{{ bTitle(b) }}</button>
                    <book-cover #bc [book]="b" [height]="0" [width]="0" />
                    @if (b.is_read === 1) {
                      <span class="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                    }
                  </li>
                }
              </ul>
            </div>
          }
        </section>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TitlesComponent {
  private readonly booksSvc = inject(BooksService);

  protected readonly authors = computed(() => {
    const filtered = this.booksSvc.filteredSorted();
    const group = this.booksSvc.groupByAuthorSeries(filtered);
    return [...group.entries()].map(([author, sMap]) => ({
      name: author,
      series: [...sMap.entries()].map(([name, books]) => ({ name, books })),
    }));
  });

  protected bTitle(b: Book) {
    const idx = b.series_index ?? null;
    if (idx == null || !isFinite(idx)) return b.title;
    return `${idx} · ${b.title}`;
  }
}
