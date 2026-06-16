import { useState } from 'react';
import { api } from './services/api';
import type { Carousel, GenerateCarouselPayload } from './types/carousel';
import { EditorPage } from './pages/EditorPage';
import { HomePage } from './pages/HomePage';

type View = 'home' | 'editor';

export function App() {
  const [view, setView] = useState<View>('home');
  const [carousel, setCarousel] = useState<Carousel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(payload: GenerateCarouselPayload) {
    setLoading(true);
    setError(null);
    try {
      const generated = await api.generateCarousel(payload);
      setCarousel(generated);
      setView('editor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar carrossel');
    } finally {
      setLoading(false);
    }
  }

  if (view === 'editor' && carousel) {
    return <EditorPage carousel={carousel} onBack={() => setView('home')} onUpdateCarousel={setCarousel} />;
  }

  return <HomePage loading={loading} error={error} onGenerate={generate} latestCarousel={carousel} onOpenEditor={() => setView('editor')} />;
}
