import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BooksService } from '../../shared/books.service';

interface LanguageStats {
  code: string;
  name: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'statistics-page',
  imports: [],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-100 mb-6">Library Statistics</h1>

      <!-- Library Size Statistics -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-200 mb-4">Library Size</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Total Books -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="text-gray-400 text-sm uppercase tracking-wide mb-2">Total Books</div>
            <div class="text-4xl font-bold text-indigo-400">{{ totalBooks() }}</div>
          </div>

          <!-- Unique Authors -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="text-gray-400 text-sm uppercase tracking-wide mb-2">Unique Authors</div>
            <div class="text-4xl font-bold text-emerald-400">{{ uniqueAuthors() }}</div>
          </div>

          <!-- Unique Series -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="text-gray-400 text-sm uppercase tracking-wide mb-2">Unique Series</div>
            <div class="text-4xl font-bold text-amber-400">{{ uniqueSeries() }}</div>
            <div class="text-gray-400 text-xs mt-2">{{ booksWithoutSeries() }} books without series</div>
          </div>
        </div>
      </section>

      <!-- Language Distribution -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-200 mb-4">Language Distribution</h2>
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div class="space-y-4">
            @for (lang of languageStats(); track lang.code) {
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-200 font-medium">{{ lang.name }}</span>
                  <span class="text-gray-400">{{ lang.count }} books ({{ lang.percentage.toFixed(1) }}%)</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    [style.width.%]="lang.percentage"
                    [style.backgroundColor]="getBarColor(lang.code)"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatisticsComponent {
  protected readonly books = inject(BooksService);

  private readonly languageNames: Record<string, string> = {
    'eng': 'English',
    'en': 'English',
    'dut': 'Dutch',
    'nl': 'Dutch',
    'nld': 'Dutch',
    'fra': 'French',
    'fr': 'French',
    'ger': 'German',
    'de': 'German',
    'deu': 'German',
    'spa': 'Spanish',
    'es': 'Spanish',
    'ita': 'Italian',
    'it': 'Italian',
    'por': 'Portuguese',
    'pt': 'Portuguese',
    'rus': 'Russian',
    'ru': 'Russian',
    'jpn': 'Japanese',
    'ja': 'Japanese',
    'chi': 'Chinese',
    'zh': 'Chinese',
    'zho': 'Chinese',
    'ara': 'Arabic',
    'ar': 'Arabic',
    'hin': 'Hindi',
    'hi': 'Hindi',
    'pol': 'Polish',
    'pl': 'Polish',
    'swe': 'Swedish',
    'sv': 'Swedish',
    'nor': 'Norwegian',
    'no': 'Norwegian',
    'dan': 'Danish',
    'da': 'Danish',
    'fin': 'Finnish',
    'fi': 'Finnish',
    'tur': 'Turkish',
    'tr': 'Turkish',
    'kor': 'Korean',
    'ko': 'Korean',
  };

  protected readonly totalBooks = computed(() => {
    return this.books.books().length;
  });

  protected readonly uniqueAuthors = computed(() => {
    const authors = new Set<string>();
    for (const book of this.books.books()) {
      if (book.author?.trim()) {
        authors.add(book.author.trim());
      }
    }
    return authors.size;
  });

  protected readonly uniqueSeries = computed(() => {
    const series = new Set<string>();
    for (const book of this.books.books()) {
      if (book.series?.trim()) {
        series.add(book.series.trim());
      }
    }
    return series.size;
  });

  protected readonly booksWithoutSeries = computed(() => {
    return this.books.books().filter(book => !book.series?.trim()).length;
  });

  protected readonly languageStats = computed((): LanguageStats[] => {
    const counts = new Map<string, number>();
    const total = this.books.books().length;

    for (const book of this.books.books()) {
      const lang = book.language?.trim() || 'unknown';
      counts.set(lang, (counts.get(lang) || 0) + 1);
    }

    const stats: LanguageStats[] = [];
    for (const [code, count] of counts) {
      stats.push({
        code,
        name: this.languageNames[code.toLowerCase()] || code.toUpperCase(),
        count,
        percentage: (count / total) * 100,
      });
    }

    // Sort by count descending
    return stats.sort((a, b) => b.count - a.count);
  });

  protected getBarColor(code: string): string {
    const colors = [
      '#6366f1', // indigo
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#06b6d4', // cyan
      '#f97316', // orange
      '#ec4899', // pink
      '#14b8a6', // teal
      '#84cc16', // lime
    ];

    const index = code.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
