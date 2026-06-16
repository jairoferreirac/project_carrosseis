export type Platform = 'instagram' | 'linkedin' | 'pdf';

export type Background = {
  type: 'color' | 'gradient';
  value: string;
};

export type SlideElement = {
  id: string;
  type: 'text' | 'image';
  content?: string | null;
  src?: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number | null;
  fontWeight?: string | null;
  color?: string | null;
  align?: 'left' | 'center' | 'right' | null;
  fontFamily?: string | null;
};

export type Slide = {
  id: string;
  position: number;
  background: Background;
  elements: SlideElement[];
};

export type Carousel = {
  carousel_id: string;
  title: string;
  topic: string;
  language: string;
  tone: string;
  audience: string;
  platform: Platform;
  template_slug: string;
  slides: Slide[];
};

export type GenerateCarouselPayload = {
  topic: string;
  language: string;
  tone: string;
  audience: string;
  slides_count: number;
  platform: Platform;
  template_slug: string;
};
