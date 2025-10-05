import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BooksService } from '../../shared/books.service';
import { ThumbnailSizeService } from '../../shared/thumbnail-size.service';
import { BookCoverComponent } from '../../shared/book-cover';
import { SearchBoxComponent } from '../../shared/search-box';
import { SizeControlComponent } from '../../shared/size-control';

@Component({
  selector: 'covers-page',
  imports: [BookCoverComponent, SearchBoxComponent, SizeControlComponent],
  template: `
    <div class="p-3 flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3 sticky top-0 z-10 bg-gray-900/70 supports-[backdrop-filter]:bg-gray-900/60 backdrop-blur border-b border-gray-700 shadow-sm px-3 py-2 rounded-md">
        <search-box />
        <size-control />
      </div>

      <div
        class="grid gap-2"
        [style.gridTemplateColumns]="gridTemplate()"
      >
        @for (b of books.filteredSorted(); track b.id) {
          <book-cover [book]="b" [height]="sizes.size()" [width]="sizes.size() * 2/3" />
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CoversComponent {
  protected readonly books = inject(BooksService);
  protected readonly sizes = inject(ThumbnailSizeService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    // Handle language filter from query params
    effect(() => {
      this.route.queryParams.subscribe(params => {
        if (params['language']) {
          const language = params['language'];
          this.books.selectedLanguages.set([language]);
        }
      });
    });
  }

  protected readonly gridTemplate = computed(() => {
    const w = this.sizes.size() * 2/3;
    return `repeat(auto-fill, minmax(${Math.round(w)}px, 1fr))`;
  });
}
