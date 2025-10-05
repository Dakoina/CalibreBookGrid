import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BooksService } from '../../shared/books.service';
import { ThumbnailSizeService } from '../../shared/thumbnail-size.service';
import { BookCoverComponent } from '../../shared/book-cover';
import { SearchBoxComponent } from '../../shared/search-box';
import { SizeControlComponent } from '../../shared/size-control';

@Component({
  selector: 'creative-page',
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
        @for (b of booksRainbowSorted(); track b.id) {
          <book-cover [book]="b" [height]="sizes.size()" [width]="sizes.size() * 2/3" />
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CreativeComponent {
  protected readonly books = inject(BooksService);
  protected readonly sizes = inject(ThumbnailSizeService);

  protected readonly gridTemplate = computed(() => {
    const w = this.sizes.size() * 2/3;
    return `repeat(auto-fill, minmax(${Math.round(w)}px, 1fr))`;
  });

  protected readonly booksRainbowSorted = computed(() => {
    const filtered = this.books.filteredSorted();

    // Sort by hue (rainbow order)
    return [...filtered].sort((a, b) => {
      const hueA = this.rgbToHue(a.cover_color);
      const hueB = this.rgbToHue(b.cover_color);
      return hueA - hueB;
    });
  });

  private rgbToHue(rgb?: [number, number, number]): number {
    if (!rgb) return 0;

    const [r, g, b] = rgb.map(v => v / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    if (delta === 0) return 0;

    let hue = 0;
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }

    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;

    return hue;
  }
}
