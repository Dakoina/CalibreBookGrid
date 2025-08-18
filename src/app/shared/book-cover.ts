import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import type { Book } from './books.service';

@Component({
  selector: 'book-cover',
  imports: [NgOptimizedImage],
  template: `
    <div class="relative group" [style.width.px]="width()">
      <div
        class="relative overflow-hidden rounded shadow-sm bg-gray-800 cursor-pointer transform-gpu transition-transform duration-200 will-change-transform md:group-hover:scale-105"
        (click)="openDetails()"
        [style.width.px]="width()"
        [style.height.px]="height()"
      >
        <img
          [ngSrc]="imgSrc()"
          [alt]="book().title"
          class="h-full w-full object-cover"
          [style.opacity]="dimUnread() ? 0.2 : 1"
          width="200"
          height="300"
        />
        <div
          class="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border border-white"
          aria-label="Read"
          [class.hidden]="book().is_read !== 1"
        ></div>
      </div>

      @if (showDetails()) {
        <!-- Modal overlay -->
        <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3" (click)="closeDetails()">
          <!-- Stop propagation to avoid closing when clicking the card -->
          <div class="max-w-2xl w-full" (click)="$event.stopPropagation()">
            <div class="bg-gray-900 text-gray-100 rounded-lg shadow-xl overflow-hidden">
              <div class="flex flex-col sm:flex-row">
                <div class="sm:w-1/3 bg-black/20 p-3 flex items-center justify-center">
                  <img [ngSrc]="imgSrc()" [alt]="book().title" class="w-full h-auto object-contain" width="400" height="600" />
                </div>
                <div class="sm:w-2/3 p-4 flex flex-col gap-2">
                  <div class="flex items-start justify-between gap-3">
                    <h3 class="text-lg font-semibold leading-tight">{{ book().title }}</h3>
                    <button type="button" (click)="closeDetails()" class="shrink-0 rounded-full bg-gray-800 hover:bg-gray-700 p-1" aria-label="Close">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M6.225 4.811 4.811 6.225 10.586 12l-5.775 5.775 1.414 1.414L12 13.414l5.775 5.775 1.414-1.414L13.414 12l5.775-5.775-1.414-1.414L12 10.586 6.225 4.811Z"/></svg>
                    </button>
                  </div>
                  <div class="text-sm text-gray-300">by {{ book().author }}</div>
                  @if (book().series.trim()) {
                    <div class="text-sm text-gray-400">{{ book().series }} @if (book().series_index != null){#{{ book().series_index }}}</div>
                  }
                  <div class="mt-2">
                    <a [href]="goodreadsUrl()" target="_blank" rel="noopener" class="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-200 underline underline-offset-2">
                      Search on Goodreads
                      <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCoverComponent {
  book = input.required<Book>();
  height = input.required<number>();
  width = input<number>(0);
  dimUnread = input<boolean>(false);

  protected readonly showDetails = signal(false);

  openDetails() { this.showDetails.set(true); }
  closeDetails() { this.showDetails.set(false); }

  imgSrc() {
    // cover_path is relative to /data
    return `/data/${this.book().cover_path}`;
  }

  goodreadsUrl() {
    const b = this.book();
    const q = encodeURIComponent(`${b.title} ${b.author}`);
    return `https://www.goodreads.com/search?q=${q}`;
  }
}
