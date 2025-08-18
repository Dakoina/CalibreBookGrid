import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BooksService } from '../../shared/books.service';
import { ThumbnailSizeService } from '../../shared/thumbnail-size.service';
import { BookCoverComponent } from '../../shared/book-cover';
import { SearchBoxComponent } from '../../shared/search-box';
import { SizeControlComponent } from '../../shared/size-control';

@Component({
  selector: 'extended-covers-page',
  imports: [BookCoverComponent, SearchBoxComponent, SizeControlComponent],
  template: `
    <div class="p-3 flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <search-box />
        <size-control />
      </div>

      @for (entry of authorsGrouped(); track entry.author) {
        <section class="mt-3">
          <h2 class="text-sm font-semibold text-gray-200 mb-2">{{ entry.author }}</h2>
          @for (s of entry.series; track s.name) {
            <div class="mb-2">
              <div class="text-xs text-gray-400 mb-1">{{ s.name }}</div>
              <div class="grid gap-2" [style.gridTemplateColumns]="gridTemplate()">
                @for (b of s.books; track b.id) {
                  <book-cover [book]="b" [height]="sizes.size()" [width]="sizes.size() * 2/3" />
                }
              </div>
            </div>
          }
        </section>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExtendedCoversComponent {
  protected readonly books = inject(BooksService);
  protected readonly sizes = inject(ThumbnailSizeService);

  protected readonly authorsGrouped = computed(() => {
    const filtered = this.books.filteredSorted();
    const byAuthor = this.books.groupByAuthorSeries(filtered);
    return [...byAuthor.entries()].map(([author, sMap]) => ({
      author,
      series: [...sMap.entries()].map(([name, books]) => ({ name, books })),
    }));
  });

  protected readonly gridTemplate = computed(() => {
    const w = this.sizes.size() * 2/3;
    return `repeat(auto-fill, minmax(${Math.round(w)}px, 1fr))`;
  });
}
