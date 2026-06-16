import { Download, FileDown, Home, ImagePlus, Save } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import type { Carousel, Slide, SlideElement } from '../types/carousel';
import { PropertiesPanel } from '../features/editor/PropertiesPanel';
import { SlideCanvas } from '../features/editor/SlideCanvas';
import { SlideThumbnails } from '../features/editor/SlideThumbnails';
import { exportNodeAsPng, exportNodesAsPdf } from '../features/editor/exporters';

type Props = {
  carousel: Carousel;
  onBack: () => void;
  onUpdateCarousel: (carousel: Carousel) => void;
};

export function EditorPage({ carousel, onBack, onUpdateCarousel }: Props) {
  const [activeSlideId, setActiveSlideId] = useState(carousel.slides[0]?.id ?? '');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(carousel.slides[0]?.elements[0]?.id ?? null);
  const [status, setStatus] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const exportRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeSlide = useMemo(() => carousel.slides.find((slide) => slide.id === activeSlideId) ?? carousel.slides[0], [activeSlideId, carousel.slides]);
  const selectedElement = activeSlide?.elements.find((element) => element.id === selectedElementId) ?? null;

  function setCarousel(next: Carousel) {
    onUpdateCarousel({ ...next, slides: next.slides.map((slide, index) => ({ ...slide, position: index + 1 })) });
  }

  function updateSlide(slideId: string, patch: Partial<Slide>) {
    setCarousel({
      ...carousel,
      slides: carousel.slides.map((slide) => (slide.id === slideId ? { ...slide, ...patch } : slide)),
    });
  }

  function updateElement(slideId: string, elementId: string, patch: Partial<SlideElement>) {
    setCarousel({
      ...carousel,
      slides: carousel.slides.map((slide) =>
        slide.id === slideId
          ? {
              ...slide,
              elements: slide.elements.map((element) => (element.id === elementId ? { ...element, ...patch } : element)),
            }
          : slide,
      ),
    });
  }

  function addSlide() {
    const base = activeSlide ?? carousel.slides[0];
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      position: carousel.slides.length + 1,
      background: base?.background ?? { type: 'color', value: '#111827' },
      elements: [
        {
          id: crypto.randomUUID(),
          type: 'text',
          content: 'Novo slide',
          x: 90,
          y: 120,
          width: 720,
          height: 100,
          fontSize: 42,
          fontWeight: 'bold',
          color: '#ffffff',
          align: 'center',
          fontFamily: 'Inter',
        },
      ],
    };
    setCarousel({ ...carousel, slides: [...carousel.slides, newSlide] });
    setActiveSlideId(newSlide.id);
    setSelectedElementId(newSlide.elements[0].id);
  }

  function duplicateSlide() {
    if (!activeSlide) return;
    const duplicated: Slide = {
      ...activeSlide,
      id: crypto.randomUUID(),
      position: carousel.slides.length + 1,
      elements: activeSlide.elements.map((element) => ({ ...element, id: crypto.randomUUID() })),
    };
    setCarousel({ ...carousel, slides: [...carousel.slides, duplicated] });
    setActiveSlideId(duplicated.id);
    setSelectedElementId(duplicated.elements[0]?.id ?? null);
  }

  function removeSlide() {
    if (carousel.slides.length <= 1) return;
    const nextSlides = carousel.slides.filter((slide) => slide.id !== activeSlideId);
    setCarousel({ ...carousel, slides: nextSlides });
    setActiveSlideId(nextSlides[0].id);
    setSelectedElementId(nextSlides[0].elements[0]?.id ?? null);
  }

  function addImage() {
    if (!activeSlide) return;
    const image: SlideElement = {
      id: crypto.randomUUID(),
      type: 'image',
      src: 'https://placehold.co/900x540/e5e7eb/111827?text=Imagem',
      x: 150,
      y: 300,
      width: 600,
      height: 300,
    };
    updateSlide(activeSlide.id, { elements: [...activeSlide.elements, image] });
    setSelectedElementId(image.id);
  }

  async function save() {
    setStatus('Salvando...');
    try {
      const saved = await api.updateCarousel(carousel);
      onUpdateCarousel(saved);
      setStatus('Salvo');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao salvar');
    }
  }

  async function regenerateText() {
    if (!activeSlide) return;
    setStatus('Regenerando texto...');
    const slide = await api.regenerateText(activeSlide.id);
    updateSlide(activeSlide.id, slide);
    setStatus('Texto regenerado');
  }

  async function regenerateImage() {
    if (!activeSlide) return;
    setStatus('Regenerando imagem...');
    const slide = await api.regenerateImage(activeSlide.id);
    updateSlide(activeSlide.id, slide);
    setStatus('Imagem regenerada');
  }

  async function exportPng() {
    if (!canvasRef.current) return;
    await api.exportPng(carousel.carousel_id);
    await exportNodeAsPng(canvasRef.current, `${carousel.title}-slide-${activeSlide.position}.png`);
  }

  async function exportPdf() {
    await api.exportPdf(carousel.carousel_id);
    const nodes = carousel.slides.map((slide) => exportRefs.current[slide.id]).filter(Boolean) as HTMLElement[];
    await exportNodesAsPdf(nodes, `${carousel.title}.pdf`);
  }

  if (!activeSlide) {
    return <div className="p-6">Nenhum slide disponível.</div>;
  }

  return (
    <main className="flex h-screen bg-slate-100 text-slate-950">
      <SlideThumbnails
        slides={carousel.slides}
        activeSlideId={activeSlide.id}
        onSelectSlide={(slideId) => {
          const slide = carousel.slides.find((item) => item.id === slideId);
          setActiveSlideId(slideId);
          setSelectedElementId(slide?.elements[0]?.id ?? null);
        }}
        onAddSlide={addSlide}
        onDuplicateSlide={duplicateSlide}
        onRemoveSlide={removeSlide}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <button title="Voltar" onClick={onBack} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950">
              <Home size={18} />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <input
              value={carousel.title}
              onChange={(event) => onUpdateCarousel({ ...carousel, title: event.target.value })}
              className="min-w-0 max-w-[440px] rounded border border-transparent px-2 py-1 text-lg font-semibold text-slate-950 focus:border-slate-300 focus:outline-none"
            />
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 md:inline-flex">
              {carousel.platform}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {status && <span className="hidden text-sm text-slate-500 md:inline">{status}</span>}
            <button title="Adicionar imagem" onClick={addImage} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50">
              <ImagePlus size={18} />
            </button>
            <button title="Salvar" onClick={save} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50">
              <Save size={18} />
            </button>
            <button title="Exportar PNG" onClick={exportPng} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50">
              <Download size={18} />
            </button>
            <button title="Exportar PDF" onClick={exportPdf} className="rounded-lg bg-slate-950 p-2 text-white shadow-sm hover:bg-blue-700">
              <FileDown size={18} />
            </button>
          </div>
        </header>

        <div className="workspace-grid flex-1 overflow-auto p-6">
          <div className="mx-auto grid w-fit gap-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/95 px-4 py-3 text-sm shadow-sm backdrop-blur">
              <div>
                <p className="font-semibold text-slate-900">Slide {activeSlide.position}</p>
                <p className="text-xs text-slate-500">{activeSlide.elements.length} elementos</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">900 x 900</div>
            </div>
            <SlideCanvas
              slide={activeSlide}
              selectedElementId={selectedElementId}
              canvasRef={canvasRef}
              onSelectElement={setSelectedElementId}
              onUpdateElement={(elementId, patch) => updateElement(activeSlide.id, elementId, patch)}
            />
          </div>
        </div>

        <div className="pointer-events-none fixed -left-[2000px] top-0">
          {carousel.slides.map((slide) => (
            <SlideCanvas
              key={slide.id}
              slide={slide}
              selectedElementId={null}
              canvasRef={(node) => {
                exportRefs.current[slide.id] = node;
              }}
              onSelectElement={() => undefined}
              onUpdateElement={() => undefined}
            />
          ))}
        </div>
      </section>

      <PropertiesPanel
        slide={activeSlide}
        selectedElement={selectedElement}
        onUpdateSlide={(patch) => updateSlide(activeSlide.id, patch)}
        onUpdateElement={(elementId, patch) => updateElement(activeSlide.id, elementId, patch)}
        onRegenerateText={regenerateText}
        onRegenerateImage={regenerateImage}
      />
    </main>
  );
}
