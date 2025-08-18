import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThumbnailSizeService } from './thumbnail-size.service';

@Component({
  selector: 'size-control',
  template: `
    <div class="flex items-center gap-2">
      <button type="button" (click)="sizes.decrease()" class="px-2 py-1 rounded bg-gray-100 text-gray-700 active:scale-95">−</button>
      <div class="text-sm text-gray-600">{{ sizes.size() }}px</div>
      <button type="button" (click)="sizes.increase()" class="px-2 py-1 rounded bg-gray-100 text-gray-700 active:scale-95">+</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SizeControlComponent {
  protected readonly sizes = inject(ThumbnailSizeService);
}
