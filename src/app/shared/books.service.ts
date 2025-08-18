import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Book {
  id: number;
  author: string;
  title: string;
  series: string;
  series_index: number | null;
  cover_path: string;
  is_read: 0 | 1;
}

@Injectable({ providedIn: 'root' })
export class BooksService {
  private http = inject(HttpClient);

  // raw load once
  private books$ = this.http
    .get<Book[]>('data/books.json')
    .pipe(
      map((books) => books.map(this.normalizeBook)),
      shareReplay(1)
    );

  // Expose as signal for template ergonomics
  readonly books = toSignal(this.books$, { initialValue: [] as Book[] });

  // Search text as signal
  readonly search = signal('');

  // derived filtered + sorted list
  readonly filteredSorted = computed(() => {
    const q = this.search().trim().toLowerCase();
    const list = this.books();
    const filtered = q
      ? list.filter((b) => {
          const a = b.author?.toLowerCase() ?? '';
          const t = b.title?.toLowerCase() ?? '';
          const s = b.series?.toLowerCase() ?? '';
          return a.includes(q) || t.includes(q) || s.includes(q);
        })
      : list;
    return [...filtered].sort(this.compareForCovers);
  });

  // Utilities
  private normalizeBook = (b: any): Book => ({
    id: Number(b.id),
    author: String(b.author || '').trim(),
    title: String(b.title || '').trim(),
    series: String(b.series || '').trim(),
    series_index: b.series_index != null ? Number(b.series_index) : null,
    cover_path: String(b.cover_path || ''),
    is_read: Number(b.is_read || 0) as 0 | 1,
  });

  private compareForCovers = (a: Book, b: Book): number => {
    // author, series, series_index, title
    const byAuthor = a.author.localeCompare(b.author);
    if (byAuthor !== 0) return byAuthor;

    const bySeries = (a.series || '').localeCompare(b.series || '');
    if (bySeries !== 0) return bySeries;

    const ai = a.series_index ?? Number.POSITIVE_INFINITY;
    const bi = b.series_index ?? Number.POSITIVE_INFINITY;
    if (ai !== bi) return ai - bi;

    return a.title.localeCompare(b.title);
  };

  // Group helpers
  groupByAuthorSeries(books: Book[]): Map<string, Map<string, Book[]>> {
    const mapA = new Map<string, Map<string, Book[]>>();
    for (const b of books) {
      const author = b.author || 'Unknown';
      const series = b.series?.trim() ? b.series : 'Various';
      if (!mapA.has(author)) mapA.set(author, new Map());
      const seriesMap = mapA.get(author)!;
      if (!seriesMap.has(series)) seriesMap.set(series, []);
      seriesMap.get(series)!.push(b);
    }
    // sort within series by series_index then title
    for (const [, seriesMap] of mapA) {
      for (const [seriesName, arr] of seriesMap) {
        seriesMap.set(
          seriesName,
          [...arr].sort((a, b) => {
            const ai = a.series_index ?? Number.POSITIVE_INFINITY;
            const bi = b.series_index ?? Number.POSITIVE_INFINITY;
            if (ai !== bi) return ai - bi;
            return a.title.localeCompare(b.title);
          })
        );
      }
    }
    return mapA;
  }

  listSeries(books: Book[]): string[] {
    const s = new Set<string>();
    for (const b of books) {
      if (b.series?.trim()) s.add(b.series.trim());
    }
    return [...s].sort((a, b) => a.localeCompare(b));
  }

  booksInSeries(books: Book[], series: string): Book[] {
    return books
      .filter((b) => (b.series || '').trim() === series)
      .sort((a, b) => {
        const ai = a.series_index ?? Number.POSITIVE_INFINITY;
        const bi = b.series_index ?? Number.POSITIVE_INFINITY;
        if (ai !== bi) return ai - bi;
        return a.title.localeCompare(b.title);
      });
  }
}
