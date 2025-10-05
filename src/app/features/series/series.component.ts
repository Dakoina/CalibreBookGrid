import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
      <div class="flex items-center justify-between gap-3 sticky top-0 z-10 bg-gray-900/70 supports-[backdrop-filter]:bg-gray-900/60 backdrop-blur border-b border-gray-700 shadow-sm px-3 py-2 rounded-md">
        <search-box />
        <size-control />
      </div>

      @for (s of seriesList(); track s) {
        <section class="mt-1" [id]="'series-' + getSeriesId(s)">
          <h2 class="text-sm font-semibold text-gray-200 mb-1">{{ s }}</h2>
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
  private readonly route = inject(ActivatedRoute);

  constructor() {
    // Handle fragment scrolling after view is ready
    effect(() => {
      // Access the series list to ensure it's loaded
      this.seriesList();

      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        this.route.fragment.subscribe(fragment => {
          if (fragment) {
            const element = document.getElementById(fragment);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      }, 100);
    });
  }

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

  protected getSeriesId(seriesName: string): string {
    return encodeURIComponent(seriesName);
  }
}
