import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BooksService } from '../../shared/books.service';

interface LanguageStats {
  code: string;
  name: string;
  count: number;
  percentage: number;
}

interface SeriesInfo {
  name: string;
  count: number;
  isComplete: boolean;
  booksRead: number;
  isStarted: boolean;
  isFinished: boolean;
}

interface SeriesCountDistribution {
  bookCount: number;
  seriesCount: number;
}

interface AuthorInfo {
  name: string;
  count: number;
}

interface AuthorCountDistribution {
  bookCount: number;
  authorCount: number;
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
          <div class="space-y-2">
            @for (lang of languageStats(); track lang.code) {
              <div class="flex items-center gap-3">
                <div class="w-24 text-sm text-gray-200 font-medium truncate">{{ lang.name }}</div>
                <div class="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden relative">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    [style.width.%]="lang.percentage"
                    [style.backgroundColor]="getBarColor(lang.code)"
                  ></div>
                </div>
                <div class="w-28 text-right text-xs text-gray-400">{{ lang.count }} ({{ lang.percentage.toFixed(1) }}%)</div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Author Statistics -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-200 mb-4">Author Statistics</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <!-- Most Prolific Authors -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 class="text-lg font-semibold text-gray-200 mb-3">Most Prolific Authors (most books)</h3>
            <div class="space-y-2">
              @for (author of topAuthors(); track author.name) {
                <div class="flex items-center gap-3">
                  <div class="flex-1 text-sm text-gray-200 truncate" [title]="author.name">{{ author.name }}</div>
                  <div class="w-16 text-right">
                    <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300">
                      {{ author.count }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Author Metrics -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 class="text-lg font-semibold text-gray-200 mb-3">Books per Author</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-300">Average</span>
                <span class="text-2xl font-bold text-indigo-400">{{ authorMetrics().average }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-300">Median</span>
                <span class="text-2xl font-bold text-violet-400">{{ authorMetrics().median }}</span>
              </div>
              <div class="text-xs text-gray-400 mt-4">
                {{ totalBooks() }} books across {{ uniqueAuthors() }} authors
              </div>
            </div>
          </div>
        </div>

        <!-- Author Distribution -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold text-gray-200 mb-3">Author Distribution</h3>
          <div class="space-y-2">
            @for (dist of authorDistribution(); track dist.bookCount) {
              <div class="flex items-center gap-3">
                <div class="w-32 text-sm text-gray-200">{{ dist.bookCount }} {{ dist.bookCount === 1 ? 'book' : 'books' }}</div>
                <div class="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden relative">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    [style.width.%]="(dist.authorCount / maxAuthorCount()) * 100"
                  ></div>
                </div>
                <div class="w-20 text-right text-xs text-gray-400">{{ dist.authorCount }} {{ dist.authorCount === 1 ? 'author' : 'authors' }}</div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Reading Progress -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-200 mb-4">Reading Progress</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <!-- Total Books Read -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="text-gray-400 text-sm uppercase tracking-wide mb-2">Total Books Read</div>
            <div class="text-4xl font-bold text-indigo-400">{{ readingProgress().totalBooksRead }}</div>
            <div class="text-gray-400 text-xs mt-2">{{ readingProgress().readPercentage.toFixed(1) }}% of library</div>
          </div>

          <!-- Standalone Books Read -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="text-gray-400 text-sm uppercase tracking-wide mb-2">Standalone Books Read</div>
            <div class="text-4xl font-bold text-violet-400">{{ readingProgress().standaloneBooksRead }}</div>
            <div class="text-gray-400 text-xs mt-2">of {{ readingProgress().totalStandaloneBooks }} standalone</div>
          </div>

          <!-- Series Books Read -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="text-gray-400 text-sm uppercase tracking-wide mb-2">Series Books Read</div>
            <div class="text-4xl font-bold text-cyan-400">{{ readingProgress().seriesBooksRead }}</div>
            <div class="text-gray-400 text-xs mt-2">of {{ readingProgress().totalSeriesBooks }} in series</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <!-- Series Started -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="text-gray-400 text-sm uppercase tracking-wide mb-2">Series Started</div>
            <div class="text-4xl font-bold text-blue-400">{{ readingProgress().started }}</div>
          </div>

          <!-- Series In Progress -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="text-gray-400 text-sm uppercase tracking-wide mb-2">In Progress</div>
            <div class="text-4xl font-bold text-amber-400">{{ readingProgress().inProgress }}</div>
          </div>

          <!-- Series Finished -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="text-gray-400 text-sm uppercase tracking-wide mb-2">Series Finished</div>
            <div class="text-4xl font-bold text-emerald-400">{{ readingProgress().finished }}</div>
          </div>

          <!-- Series Not Started -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="text-gray-400 text-sm uppercase tracking-wide mb-2">Not Started</div>
            <div class="text-4xl font-bold text-gray-500">{{ readingProgress().notStarted }}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Longest Series Being Read -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 class="text-lg font-semibold text-gray-200 mb-3">Longest Series Being Read</h3>
            <div class="space-y-2">
              @for (series of longestSeriesBeingRead(); track series.name) {
                <div class="flex items-center gap-3">
                  <a
                    (click)="navigateToSeries(series.name)"
                    class="flex-1 text-sm text-gray-200 truncate hover:text-indigo-400 cursor-pointer transition-colors"
                    [title]="series.name"
                  >{{ series.name }}</a>
                  <div class="text-xs text-gray-400">{{ series.booksRead }}/{{ series.count }}</div>
                  <div class="w-16 text-right">
                    <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-300">
                      {{ series.count }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Longest Series Finished -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 class="text-lg font-semibold text-gray-200 mb-3">Longest Series Finished</h3>
            <div class="space-y-2">
              @for (series of longestSeriesFinished(); track series.name) {
                <div class="flex items-center gap-3">
                  <a
                    (click)="navigateToSeries(series.name)"
                    class="flex-1 text-sm text-gray-200 truncate hover:text-indigo-400 cursor-pointer transition-colors"
                    [title]="series.name"
                  >{{ series.name }}</a>
                  <div class="w-16 text-right">
                    <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300">
                      {{ series.count }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Series Statistics -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-200 mb-4">Series Statistics</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <!-- Top 10 Largest Series -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 class="text-lg font-semibold text-gray-200 mb-3">Largest Series</h3>
            <div class="space-y-2">
              @for (series of top10Series(); track series.name) {
                <div class="flex items-center gap-3">
                  <a
                    (click)="navigateToSeries(series.name)"
                    class="flex-1 text-sm text-gray-200 truncate hover:text-indigo-400 cursor-pointer transition-colors"
                    [title]="series.name"
                  >{{ series.name }}</a>
                  <div class="w-16 text-right">
                    <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300">
                      {{ series.count }}
                    </span>
                  </div>
                  @if (series.isComplete) {
                    <div class="w-5 text-emerald-400" title="Complete series">✓</div>
                  } @else {
                    <div class="w-5 text-amber-400" title="Has gaps">⚠</div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Series Completion -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 class="text-lg font-semibold text-gray-200 mb-3">Series Completion</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-300">Complete Series</span>
                <span class="text-2xl font-bold text-emerald-400">{{ seriesCompletion().complete }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-300">Series with Gaps</span>
                <span class="text-2xl font-bold text-amber-400">{{ seriesCompletion().withGaps }}</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  class="h-full bg-emerald-500 float-left"
                  [style.width.%]="seriesCompletion().completePercentage"
                ></div>
                <div
                  class="h-full bg-amber-500"
                  [style.width.%]="seriesCompletion().gapsPercentage"
                ></div>
              </div>
              <div class="text-xs text-gray-400 text-center">
                {{ seriesCompletion().completePercentage.toFixed(1) }}% complete
              </div>
            </div>
          </div>
        </div>

        <!-- Series Size Distribution -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold text-gray-200 mb-3">Series Size Distribution</h3>
          <div class="space-y-2">
            @for (dist of seriesDistribution(); track dist.bookCount) {
              <div class="flex items-center gap-3">
                <div class="w-32 text-sm text-gray-200">{{ dist.bookCount }} {{ dist.bookCount === 1 ? 'book' : 'books' }}</div>
                <div class="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden relative">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                    [style.width.%]="(dist.seriesCount / maxSeriesCount()) * 100"
                  ></div>
                </div>
                <div class="w-20 text-right text-xs text-gray-400">{{ dist.seriesCount }} {{ dist.seriesCount === 1 ? 'series' : 'series' }}</div>
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
  private readonly router = inject(Router);

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

  protected readonly allSeriesInfo = computed((): SeriesInfo[] => {
    const seriesMap = new Map<string, { books: any[], indices: number[] }>();

    for (const book of this.books.books()) {
      if (!book.series?.trim()) continue;

      const series = book.series.trim();
      if (!seriesMap.has(series)) {
        seriesMap.set(series, { books: [], indices: [] });
      }

      const info = seriesMap.get(series)!;
      info.books.push(book);
      if (book.series_index != null) {
        info.indices.push(book.series_index);
      }
    }

    const result: SeriesInfo[] = [];
    for (const [name, info] of seriesMap) {
      // Check if series is complete (no gaps in indices)
      let isComplete = true;
      if (info.indices.length > 0) {
        // Filter out zeros and non-integers (0.5, 1.5, etc.), keep only positive integers
        const integerIndices = info.indices.filter(idx => Number.isInteger(idx) && idx >= 1);

        if (integerIndices.length > 0) {
          const sortedIndices = [...integerIndices].sort((a, b) => a - b);
          // Must start at 1
          if (sortedIndices[0] !== 1) {
            isComplete = false;
          } else {
            // Check for gaps in consecutive integers
            for (let i = 1; i < sortedIndices.length; i++) {
              if (sortedIndices[i] !== sortedIndices[i - 1] + 1) {
                isComplete = false;
                break;
              }
            }
          }
        } else {
          // No valid integer indices means we can't determine completeness
          isComplete = false;
        }
      } else {
        // No indices means we can't determine completeness
        isComplete = false;
      }

      // Calculate reading progress
      const booksRead = info.books.filter(b => b.is_read === 1).length;
      const isStarted = booksRead > 0;
      const isFinished = booksRead === info.books.length;

      result.push({
        name,
        count: info.books.length,
        isComplete,
        booksRead,
        isStarted,
        isFinished,
      });
    }

    return result;
  });

  protected readonly top10Series = computed(() => {
    return [...this.allSeriesInfo()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  });

  protected readonly seriesDistribution = computed((): SeriesCountDistribution[] => {
    const distribution = new Map<number, number>();

    for (const series of this.allSeriesInfo()) {
      const count = distribution.get(series.count) || 0;
      distribution.set(series.count, count + 1);
    }

    const result: SeriesCountDistribution[] = [];
    for (const [bookCount, seriesCount] of distribution) {
      result.push({ bookCount, seriesCount });
    }

    return result.sort((a, b) => a.bookCount - b.bookCount);
  });

  protected readonly maxSeriesCount = computed(() => {
    const dist = this.seriesDistribution();
    return dist.length > 0 ? Math.max(...dist.map(d => d.seriesCount)) : 1;
  });

  protected readonly seriesCompletion = computed(() => {
    const allSeries = this.allSeriesInfo();
    const complete = allSeries.filter(s => s.isComplete).length;
    const withGaps = allSeries.length - complete;
    const total = allSeries.length;

    return {
      complete,
      withGaps,
      completePercentage: total > 0 ? (complete / total) * 100 : 0,
      gapsPercentage: total > 0 ? (withGaps / total) * 100 : 0,
    };
  });

  protected navigateToSeries(seriesName: string): void {
    const seriesId = encodeURIComponent(seriesName);
    this.router.navigate(['/series'], { fragment: `series-${seriesId}` });
  }

  protected readonly allAuthorInfo = computed((): AuthorInfo[] => {
    const authorMap = new Map<string, number>();

    for (const book of this.books.books()) {
      const author = book.author?.trim() || 'Unknown';
      authorMap.set(author, (authorMap.get(author) || 0) + 1);
    }

    const result: AuthorInfo[] = [];
    for (const [name, count] of authorMap) {
      result.push({ name, count });
    }

    return result;
  });

  protected readonly topAuthors = computed(() => {
    return [...this.allAuthorInfo()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  });

  protected readonly authorDistribution = computed((): AuthorCountDistribution[] => {
    const distribution = new Map<number, number>();

    for (const author of this.allAuthorInfo()) {
      const count = distribution.get(author.count) || 0;
      distribution.set(author.count, count + 1);
    }

    const result: AuthorCountDistribution[] = [];
    for (const [bookCount, authorCount] of distribution) {
      result.push({ bookCount, authorCount });
    }

    return result.sort((a, b) => a.bookCount - b.bookCount);
  });

  protected readonly maxAuthorCount = computed(() => {
    const dist = this.authorDistribution();
    return dist.length > 0 ? Math.max(...dist.map(d => d.authorCount)) : 1;
  });

  protected readonly authorMetrics = computed(() => {
    const total = this.totalBooks();
    const authors = this.uniqueAuthors();
    const average = authors > 0 ? (total / authors).toFixed(1) : '0.0';

    // Calculate median
    const authorCounts = this.allAuthorInfo().map(a => a.count).sort((a, b) => a - b);
    let median = 0;
    if (authorCounts.length > 0) {
      const mid = Math.floor(authorCounts.length / 2);
      if (authorCounts.length % 2 === 0) {
        median = Math.round((authorCounts[mid - 1] + authorCounts[mid]) / 2);
      } else {
        median = authorCounts[mid];
      }
    }

    return { average, median };
  });

  protected readonly readingProgress = computed(() => {
    const allSeries = this.allSeriesInfo();
    const started = allSeries.filter(s => s.isStarted).length;
    const finished = allSeries.filter(s => s.isFinished).length;
    const inProgress = started - finished;
    const notStarted = allSeries.length - started;

    // Calculate total books read
    const allBooks = this.books.books();
    const totalBooksRead = allBooks.filter(b => b.is_read === 1).length;
    const totalBooks = allBooks.length;
    const readPercentage = totalBooks > 0 ? (totalBooksRead / totalBooks) * 100 : 0;

    // Calculate standalone books (books without series)
    const standaloneBooks = allBooks.filter(b => !b.series?.trim());
    const standaloneBooksRead = standaloneBooks.filter(b => b.is_read === 1).length;
    const totalStandaloneBooks = standaloneBooks.length;

    // Calculate series books
    const seriesBooks = allBooks.filter(b => b.series?.trim());
    const seriesBooksRead = seriesBooks.filter(b => b.is_read === 1).length;
    const totalSeriesBooks = seriesBooks.length;

    return {
      started,
      inProgress,
      finished,
      notStarted,
      totalBooksRead,
      readPercentage,
      standaloneBooksRead,
      totalStandaloneBooks,
      seriesBooksRead,
      totalSeriesBooks,
    };
  });

  protected readonly longestSeriesBeingRead = computed(() => {
    return [...this.allSeriesInfo()]
      .filter(s => s.isStarted && !s.isFinished)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  });

  protected readonly longestSeriesFinished = computed(() => {
    return [...this.allSeriesInfo()]
      .filter(s => s.isFinished)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  });
}
