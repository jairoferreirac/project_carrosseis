from uuid import UUID

from pydantic import BaseModel, Field


class GenerateCarouselRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=255)
    language: str = "pt-BR"
    tone: str = "educativo"
    audience: str = "profissionais iniciantes"
    slides_count: int = Field(default=8, ge=1, le=20)
    platform: str = "instagram"
    template_slug: str = "minimal-dark"


class LegacyGeneratedSlide(BaseModel):
    slide_number: int
    title: str
    subtitle: str
    body: str
    cta: str
    image_prompt: str
    background_style: str
    layout: str


class SlideElementBase(BaseModel):
    id: UUID | None = None
    type: str
    content: str | None = None
    src: str | None = None
    x: int
    y: int
    width: int
    height: int
    fontSize: int | None = None
    fontWeight: str | None = None
    color: str | None = None
    align: str | None = None
    fontFamily: str | None = None


class SlideBase(BaseModel):
    id: UUID | None = None
    position: int
    background: dict
    elements: list[SlideElementBase]


class CarouselResponse(BaseModel):
    carousel_id: UUID
    title: str
    topic: str
    language: str
    tone: str
    audience: str
    platform: str
    template_slug: str
    slides: list[SlideBase]
    generated_slides: list[LegacyGeneratedSlide] = []


class CarouselSummary(BaseModel):
    carousel_id: UUID
    title: str
    topic: str
    platform: str
    slides_count: int


class CarouselUpdateRequest(BaseModel):
    title: str
    template_slug: str = "minimal-dark"
    slides: list[SlideBase]


class ExportResponse(BaseModel):
    export_id: UUID
    type: str
    status: str
    url: str | None = None
