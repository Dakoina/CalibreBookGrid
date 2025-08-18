import { Injectable, signal } from '@angular/core';

const KEY = 'thumbSize';
const STEPS = [64, 96, 120, 144, 168, 192, 224, 256, 320, 360, 400]; // px heights to match grid sizing (max 400)

@Injectable({ providedIn: 'root' })
export class ThumbnailSizeService {
  readonly steps = STEPS;
  private idx = signal(this.loadIndex());

  size = signal(this.steps[this.idx()]);

  increase() {
    const next = Math.min(this.idx() + 1, this.steps.length - 1);
    this.idx.set(next);
    this.size.set(this.steps[next]);
    this.persist(next);
  }

  decrease() {
    const next = Math.max(this.idx() - 1, 0);
    this.idx.set(next);
    this.size.set(this.steps[next]);
    this.persist(next);
  }

  private loadIndex(): number {
    try {
      const raw = localStorage.getItem(KEY);
      const i = raw != null ? Number(raw) : 2;
      return Number.isFinite(i) && i >= 0 && i < this.steps.length ? i : 2;
    } catch {
      return 2;
    }
  }

  private persist(i: number) {
    try {
      localStorage.setItem(KEY, String(i));
    } catch {}
  }
}
