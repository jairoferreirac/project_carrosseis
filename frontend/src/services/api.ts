import type { Carousel, GenerateCarouselPayload, Slide } from '../types/carousel';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Erro HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  generateCarousel(payload: GenerateCarouselPayload) {
    return request<Carousel>('/carousels/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateCarousel(carousel: Carousel) {
    return request<Carousel>(`/carousels/${carousel.carousel_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: carousel.title,
        template_slug: carousel.template_slug,
        slides: carousel.slides,
      }),
    });
  },
  regenerateText(slideId: string) {
    return request<Slide>(`/slides/${slideId}/regenerate-text`, { method: 'POST' });
  },
  regenerateImage(slideId: string) {
    return request<Slide>(`/slides/${slideId}/regenerate-image`, { method: 'POST' });
  },
  exportPng(carouselId: string) {
    return request(`/carousels/${carouselId}/export/png`, { method: 'POST' });
  },
  exportPdf(carouselId: string) {
    return request(`/carousels/${carouselId}/export/pdf`, { method: 'POST' });
  },
};
