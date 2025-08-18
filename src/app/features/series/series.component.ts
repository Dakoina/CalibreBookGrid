import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BooksService } from '../../shared/books.service';
import { ThumbnailSizeService } from '../../shared/thumbnail-size.service';
import { BookCoverComponent } from '../../shared/book-cover';
import { SearchBoxComponent } from '../../shared/search-box';
import { SizeControlComponent } from '../../shared/size-control';

@Component({
  selector: 'series-page',
  imports: [BookCoverComponent, SearchBoxComponent, SizeControlComponent],
  template: `
    <div class="p-3 flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <search-box />
        <size-control />
      </div>

      @for (s of seriesList(); track s) {
        <section class="mt-3">
          <h2 class="text-sm font-semibold text-gray-700 mb-2">{{ s }}</h2>
          <div class="grid gap-2" [style.gridTemplateColumns]="gridTemplate()">
            @for (b of booksInSeries(s); track b.id) {
              <book-cover [book]="b" [height]="sizes.size()" [width]="sizes.size() * 2/3" [dimUnread]="b.is_read !== 1" />
            }
          </div>
        </section>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SeriesComponent {
  protected readonly books = inject(BooksService);
  protected readonly sizes = inject(ThumbnailSizeService);

  protected readonly seriesList = computed(() => {
    const filtered = this.books.filteredSorted();
    // Only books with series
    return this.books.listSeries(filtered);
  });

  protected booksInSeries = (s: string) => {
    const filtered = this.books.filteredSorted();
    return this.books.booksInSeries(filtered, s);
  };

  protected readonly gridTemplate = computed(() => {
    const w = this.sizes.size() * 2/3;
    return `repeat(auto-fill, minmax(${Math.round(w)}px, 1fr))`;
  });
}
