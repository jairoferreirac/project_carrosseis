import { Check, Loader2, Sparkles } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { GenerateCarouselPayload, Platform } from '../../types/carousel';
import { templates } from './templates';

type Props = {
  loading: boolean;
  onGenerate: (payload: GenerateCarouselPayload) => Promise<void>;
};

export function GeneratorForm({ loading, onGenerate }: Props) {
  const [topic, setTopic] = useState('AWS Glue para iniciantes');
  const [slidesCount, setSlidesCount] = useState(8);
  const [language, setLanguage] = useState('pt-BR');
  const [tone, setTone] = useState('educativo');
  const [audience, setAudience] = useState('engenheiros de dados iniciantes');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [templateSlug, setTemplateSlug] = useState('minimal-dark');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onGenerate({
      topic,
      language,
      tone,
      audience,
      slides_count: slidesCount,
      platform,
      template_slug: templateSlug,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Tema</span>
        <textarea
          className="min-h-32 resize-none rounded-lg border border-slate-200 bg-white p-4 text-lg leading-relaxed shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Ex: AWS Glue para iniciantes"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Quantidade de slides</span>
          <input
            type="number"
            min={1}
            max={20}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
            value={slidesCount}
            onChange={(event) => setSlidesCount(Number(event.target.value))}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Idioma</span>
          <select className="h-11 rounded-lg border border-slate-200 bg-white px-3 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100" value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="pt-BR">Português do Brasil</option>
            <option value="pt-PT">Português de Portugal</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Tom de voz</span>
          <select className="h-11 rounded-lg border border-slate-200 bg-white px-3 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100" value={tone} onChange={(event) => setTone(event.target.value)}>
            <option value="educativo">Educativo</option>
            <option value="profissional">Profissional</option>
            <option value="direto">Direto</option>
            <option value="inspirador">Inspirador</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Público-alvo</span>
          <input className="h-11 rounded-lg border border-slate-200 bg-white px-3 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100" value={audience} onChange={(event) => setAudience(event.target.value)} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Formato</span>
          <select className="h-11 rounded-lg border border-slate-200 bg-white px-3 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100" value={platform} onChange={(event) => setPlatform(event.target.value as Platform)}>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="pdf">PDF</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Template
          <div className="grid grid-cols-1 gap-2">
            {templates.map((template) => (
              <button
                key={template.slug}
                type="button"
                onClick={() => setTemplateSlug(template.slug)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                  templateSlug === template.slug ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="h-7 w-7 rounded-md border border-white shadow-sm" style={{ background: template.background }} />
                <span className="min-w-0 flex-1 text-sm font-semibold text-slate-800">{template.name}</span>
                {templateSlug === template.slug && <Check size={16} className="text-blue-700" />}
              </button>
            ))}
          </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || topic.trim().length < 3}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        Gerar Carrossel
      </button>
    </form>
  );
}
