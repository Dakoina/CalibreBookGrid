
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BooksService } from './books.service';

@Component({
  selector: 'language-filter',
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="isOpen.set(!isOpen())"
        class="flex items-center gap-2 rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        [class.bg-indigo-900]="books.selectedLanguages().length > 0"
        [class.border-indigo-700]="books.selectedLanguages().length > 0"
      >
        <span>Languages</span>
        @if (books.selectedLanguages().length > 0) {
          <span class="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
            {{ books.selectedLanguages().length }}
          </span>
        }
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      @if (isOpen()) {
        <div class="absolute right-0 z-10 mt-2 w-56 rounded-md border border-gray-700 bg-gray-900 shadow-xl">
          <div class="p-2">
            <button
              type="button"
              (click)="toggleAll()"
              class="w-full rounded px-3 py-2 text-left text-sm text-gray-100 transition-colors hover:bg-gray-800"
              [class.font-semibold]="books.selectedLanguages().length === 0"
              [class.text-indigo-400]="books.selectedLanguages().length === 0"
            >
              All Languages
            </button>

            <div class="my-2 border-t border-gray-700"></div>

            @for (lang of books.availableLanguages(); track lang) {
              <label class="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-gray-100 transition-colors hover:bg-gray-800">
                <input
                  type="checkbox"
                  [checked]="books.selectedLanguages().includes(lang)"
                  (change)="toggleLanguage(lang)"
                  class="h-4 w-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
                />
                <span>{{ getLanguageName(lang) }}</span>
              </label>
            }
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class LanguageFilterComponent {
  protected readonly books = inject(BooksService);
  protected readonly isOpen = signal(false);

  private readonly languageNames: Record<string, string> = {
    dan: 'Danish',
    deu: 'German',
    eng: 'English',
    fra: 'French',
    ita: 'Italian',
    nld: 'Dutch',
    nob: 'Norwegian Bokmål',
    nor: 'Norwegian',
    spa: 'Spanish',
    swe: 'Swedish',
  };

  protected getLanguageName(code: string): string {
    return this.languageNames[code] || code.toUpperCase();
  }

  toggleLanguage(lang: string): void {
    const current = this.books.selectedLanguages();
    if (current.includes(lang)) {
      this.books.selectedLanguages.set(current.filter((l) => l !== lang));
    } else {
      this.books.selectedLanguages.set([...current, lang]);
    }
  }

  toggleAll(): void {
    this.books.selectedLanguages.set([]);
    this.isOpen.set(false);
  }

  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('language-filter')) {
      this.isOpen.set(false);
    }
  }
}
