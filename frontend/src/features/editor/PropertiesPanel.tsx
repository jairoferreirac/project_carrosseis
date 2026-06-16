import { AlignCenter, AlignLeft, AlignRight, ImageIcon, RotateCcw } from 'lucide-react';
import type { Slide, SlideElement } from '../../types/carousel';

type Props = {
  slide: Slide;
  selectedElement: SlideElement | null;
  onUpdateSlide: (patch: Partial<Slide>) => void;
  onUpdateElement: (elementId: string, patch: Partial<SlideElement>) => void;
  onRegenerateText: () => void;
  onRegenerateImage: () => void;
};

export function PropertiesPanel({ slide, selectedElement, onUpdateSlide, onUpdateElement, onRegenerateText, onRegenerateImage }: Props) {
  return (
    <aside className="h-full w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Propriedades</h2>
        <p className="mt-1 text-xs text-slate-500">Ajuste o slide e o elemento selecionado.</p>
      </div>

      <section className="grid gap-3 border-b border-slate-200 p-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-slate-700">Cor de fundo</span>
          <input
            type="color"
            value={isHex(slide.background.value) ? slide.background.value : '#111827'}
            onChange={(event) => onUpdateSlide({ background: { type: 'color', value: event.target.value } })}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white p-1"
          />
        </label>
      </section>

      {selectedElement ? (
        <section className="grid gap-4 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">{selectedElement.type === 'text' ? 'Texto' : 'Imagem'}</span>
            <button
              onClick={selectedElement.type === 'text' ? onRegenerateText : onRegenerateImage}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              {selectedElement.type === 'text' ? <RotateCcw size={14} /> : <ImageIcon size={14} />}
              Regenerar
            </button>
          </div>

          {selectedElement.type === 'text' ? (
            <TextControls selectedElement={selectedElement} onUpdateElement={onUpdateElement} />
          ) : (
            <ImageControls selectedElement={selectedElement} onUpdateElement={onUpdateElement} />
          )}

          <div className="grid grid-cols-2 gap-3">
            {(['x', 'y', 'width', 'height'] as const).map((field) => (
              <NumberField key={field} label={field} value={selectedElement[field]} onChange={(value) => onUpdateElement(selectedElement.id, { [field]: value })} />
            ))}
          </div>
        </section>
      ) : (
        <p className="m-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Selecione um elemento no slide.</p>
      )}
    </aside>
  );
}

function TextControls({ selectedElement, onUpdateElement }: { selectedElement: SlideElement; onUpdateElement: Props['onUpdateElement'] }) {
  return (
    <>
      <label className="grid gap-2 text-sm">
        <span className="font-medium text-slate-700">Conteúdo</span>
        <textarea
          value={selectedElement.content ?? ''}
          onChange={(event) => onUpdateElement(selectedElement.id, { content: event.target.value })}
          className="min-h-28 rounded-lg border border-slate-200 p-3 leading-relaxed shadow-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Tamanho" value={selectedElement.fontSize ?? 24} onChange={(value) => onUpdateElement(selectedElement.id, { fontSize: value })} />
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-slate-700">Cor</span>
          <input
            type="color"
            value={selectedElement.color ?? '#111827'}
            onChange={(event) => onUpdateElement(selectedElement.id, { color: event.target.value })}
            className="h-10 rounded-lg border border-slate-200 bg-white p-1"
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        <span className="font-medium text-slate-700">Fonte</span>
        <select
          value={selectedElement.fontFamily ?? 'Inter'}
          onChange={(event) => onUpdateElement(selectedElement.id, { fontFamily: event.target.value })}
          className="h-10 rounded-lg border border-slate-200 px-3 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Poppins">Poppins</option>
          <option value="Space Grotesk">Space Grotesk</option>
          <option value="Georgia">Georgia</option>
        </select>
      </label>
      <div className="flex gap-2">
        {[
          { value: 'left', icon: AlignLeft },
          { value: 'center', icon: AlignCenter },
          { value: 'right', icon: AlignRight },
        ].map(({ value, icon: Icon }) => (
          <button
            key={value}
            title={value}
            onClick={() => onUpdateElement(selectedElement.id, { align: value as SlideElement['align'] })}
            className={`rounded-lg border p-2 transition ${selectedElement.align === value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </>
  );
}

function ImageControls({ selectedElement, onUpdateElement }: { selectedElement: SlideElement; onUpdateElement: Props['onUpdateElement'] }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-gray-700">URL da imagem</span>
      <input
        value={selectedElement.src ?? ''}
        onChange={(event) => onUpdateElement(selectedElement.id, { src: event.target.value })}
        className="rounded-lg border border-slate-200 p-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
        placeholder="https://..."
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium capitalize text-slate-700">{label}</span>
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-10 rounded-lg border border-slate-200 px-3 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100" />
    </label>
  );
}

function isHex(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}
