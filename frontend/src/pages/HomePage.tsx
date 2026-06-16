import type { Carousel, GenerateCarouselPayload } from '../types/carousel';
import { GeneratorForm } from '../features/carousel/GeneratorForm';

type Props = {
  loading: boolean;
  error: string | null;
  onGenerate: (payload: GenerateCarouselPayload) => Promise<void>;
  latestCarousel: Carousel | null;
  onOpenEditor: () => void;
};

export function HomePage({ loading, error, onGenerate, latestCarousel, onOpenEditor }: Props) {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Carousel Studio</p>
            <h1 className="text-2xl font-bold text-slate-950">Gerador de carrosséis com IA</h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 md:flex">
            Mock user
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-xl font-bold text-slate-950">Novo carrossel</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">Defina o tema e as preferências. O editor abre com slides em camadas, prontos para edição direta.</p>
          </div>
          <GeneratorForm loading={loading} onGenerate={onGenerate} />
          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </section>

        <aside className="grid content-start gap-4">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm">
            <div className="aspect-square p-7">
              <div className="flex h-full flex-col justify-between rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_left,#1d4ed8,transparent_34%),#0f172a] p-7 text-white">
                <div>
                  <p className="text-sm font-semibold text-cyan-200">Preview</p>
                  <p className="mt-4 text-4xl font-black leading-tight">Ideias em slides editáveis</p>
                </div>
                <div className="grid gap-2 text-sm text-slate-200">
                  <span className="h-2 w-24 rounded-full bg-cyan-300" />
                  <span>Instagram, LinkedIn e PDF</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Sessão atual</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <p>Usuário mock ativo. Login real, Stripe e IA real estão preparados para as próximas etapas.</p>
            {latestCarousel ? (
                <button onClick={onOpenEditor} className="rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">
                  Abrir editor
                </button>
            ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500">Nenhum carrossel gerado ainda.</div>
            )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
