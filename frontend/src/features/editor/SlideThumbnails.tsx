import { Copy, Plus, Trash2 } from 'lucide-react';
import type { Slide } from '../../types/carousel';
import { SlideCanvas } from './SlideCanvas';

type Props = {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (slideId: string) => void;
  onAddSlide: () => void;
  onDuplicateSlide: () => void;
  onRemoveSlide: () => void;
};

export function SlideThumbnails({ slides, activeSlideId, onSelectSlide, onAddSlide, onDuplicateSlide, onRemoveSlide }: Props) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div>
          <span className="text-sm font-semibold text-slate-900">Slides</span>
          <p className="text-xs text-slate-500">{slides.length} páginas</p>
        </div>
        <div className="flex gap-1">
          <button title="Adicionar slide" onClick={onAddSlide} className="rounded p-2 text-slate-600 hover:bg-slate-100">
            <Plus size={16} />
          </button>
          <button title="Duplicar slide" onClick={onDuplicateSlide} className="rounded p-2 text-slate-600 hover:bg-slate-100">
            <Copy size={16} />
          </button>
          <button title="Remover slide" onClick={onRemoveSlide} className="rounded p-2 text-slate-600 hover:bg-red-50 hover:text-red-700">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="grid gap-3 overflow-y-auto p-4">
        {slides.map((slide) => (
          <button
            key={slide.id}
            onClick={() => onSelectSlide(slide.id)}
            className={`grid grid-cols-[32px_1fr] items-start gap-3 rounded-lg border p-3 text-left transition ${
              slide.id === activeSlideId ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${slide.id === activeSlideId ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {slide.position}
            </span>
            <div>
              <div className="pointer-events-none h-[128px] w-[128px] overflow-hidden rounded-md bg-slate-100 shadow-sm">
                <SlideCanvas slide={slide} selectedElementId={null} scale={128 / 900} onSelectElement={() => undefined} onUpdateElement={() => undefined} />
              </div>
              <span className="mt-2 block truncate text-xs font-semibold text-slate-700">Slide {slide.position}</span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
