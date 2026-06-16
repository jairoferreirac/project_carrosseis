import { LegacyRef } from 'react';
import type { Slide, SlideElement } from '../../types/carousel';

type Props = {
  slide: Slide;
  selectedElementId: string | null;
  scale?: number;
  canvasRef?: LegacyRef<HTMLDivElement>;
  onSelectElement: (id: string) => void;
  onUpdateElement: (elementId: string, patch: Partial<SlideElement>) => void;
};

export function SlideCanvas({ slide, selectedElementId, scale = 1, canvasRef, onSelectElement, onUpdateElement }: Props) {
  return (
    <div
      ref={canvasRef}
      className="relative overflow-hidden bg-white shadow-2xl ring-1 ring-black/10"
      style={{
        width: 900 * scale,
        height: 900 * scale,
        background: slide.background.value,
      }}
    >
      <div style={{ width: 900, height: 900, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {slide.elements.map((element) => (
          <SlideNode
            key={element.id}
            element={element}
            selected={selectedElementId === element.id}
            onSelect={() => onSelectElement(element.id)}
            onUpdate={(patch) => onUpdateElement(element.id, patch)}
          />
        ))}
      </div>
    </div>
  );
}

type NodeProps = {
  element: SlideElement;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<SlideElement>) => void;
};

function SlideNode({ element, selected, onSelect, onUpdate }: NodeProps) {
  const commonStyle = {
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
  };

  if (element.type === 'image') {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`absolute overflow-hidden border bg-black/10 ${selected ? 'border-blue-500' : 'border-transparent'}`}
        style={commonStyle}
      >
        {element.src ? <img src={element.src} className="h-full w-full object-cover" alt="" /> : <span className="text-sm text-gray-500">Imagem</span>}
      </button>
    );
  }

  return (
    <div
      role="textbox"
      tabIndex={0}
      contentEditable
      suppressContentEditableWarning
      onClick={onSelect}
      onFocus={onSelect}
      onBlur={(event) => onUpdate({ content: event.currentTarget.innerText })}
      className={`absolute flex items-center whitespace-pre-wrap border p-1 leading-tight transition ${selected ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_0_3px_rgba(37,99,235,0.18)]' : 'border-transparent hover:border-white/50'}`}
      style={{
        ...commonStyle,
        color: element.color ?? '#111827',
        fontSize: element.fontSize ?? 24,
        fontWeight: element.fontWeight ?? '400',
        fontFamily: element.fontFamily ?? 'Inter',
        textAlign: element.align ?? 'left',
        justifyContent: alignToFlex(element.align),
      }}
    >
      {element.content}
    </div>
  );
}

function alignToFlex(align?: string | null) {
  if (align === 'center') return 'center';
  if (align === 'right') return 'flex-end';
  return 'flex-start';
}
