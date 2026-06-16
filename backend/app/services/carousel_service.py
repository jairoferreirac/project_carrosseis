import uuid

from fastapi import HTTPException
from sqlalchemy.orm import Session, selectinload

from app.models import Carousel, Export, Slide, SlideElement, Template, User
from app.schemas.carousel import CarouselUpdateRequest, GenerateCarouselRequest
from app.services.ai_service import AIService
from app.services.templates import TEMPLATES


def ensure_seed_data(db: Session, user_id: str) -> User:
    user_uuid = uuid.UUID(user_id)
    user = db.get(User, user_uuid)
    if not user:
        user = User(id=user_uuid, email="mock@example.com", name="Mock User")
        db.add(user)

    existing_templates = {row.slug for row in db.query(Template).all()}
    for template in TEMPLATES:
        if template["slug"] not in existing_templates:
            db.add(Template(slug=template["slug"], name=template["name"], config=template["config"]))

    db.commit()
    db.refresh(user)
    return user


class CarouselService:
    def __init__(self, db: Session):
        self.db = db
        self.ai = AIService()

    def list_carousels(self, user_id: uuid.UUID) -> list[Carousel]:
        return (
            self.db.query(Carousel)
            .options(selectinload(Carousel.slides))
            .filter(Carousel.user_id == user_id)
            .order_by(Carousel.created_at.desc())
            .all()
        )

    def get_carousel(self, carousel_id: uuid.UUID, user_id: uuid.UUID) -> Carousel:
        carousel = (
            self.db.query(Carousel)
            .options(selectinload(Carousel.slides).selectinload(Slide.elements))
            .filter(Carousel.id == carousel_id, Carousel.user_id == user_id)
            .first()
        )
        if not carousel:
            raise HTTPException(status_code=404, detail="Carousel not found")
        return carousel

    def generate(self, payload: GenerateCarouselRequest, user_id: uuid.UUID) -> Carousel:
        generated = self.ai.generate_carousel(payload)
        carousel = Carousel(
            user_id=user_id,
            title=generated["title"],
            topic=payload.topic,
            language=payload.language,
            tone=payload.tone,
            audience=payload.audience,
            platform=payload.platform,
            template_slug=payload.template_slug,
        )
        self.db.add(carousel)
        self.db.flush()
        self._replace_slides(carousel, generated["slides"])
        self.db.commit()
        return self.get_carousel(carousel.id, user_id)

    def update(self, carousel_id: uuid.UUID, payload: CarouselUpdateRequest, user_id: uuid.UUID) -> Carousel:
        carousel = self.get_carousel(carousel_id, user_id)
        carousel.title = payload.title
        carousel.template_slug = payload.template_slug
        self._replace_slides(carousel, [slide.model_dump() for slide in payload.slides])
        self.db.commit()
        return self.get_carousel(carousel.id, user_id)

    def delete(self, carousel_id: uuid.UUID, user_id: uuid.UUID) -> None:
        carousel = self.get_carousel(carousel_id, user_id)
        self.db.delete(carousel)
        self.db.commit()

    def create_export(self, carousel_id: uuid.UUID, export_type: str, user_id: uuid.UUID) -> Export:
        carousel = self.get_carousel(carousel_id, user_id)
        export = Export(carousel_id=carousel.id, type=export_type, status="ready", url=f"mock://exports/{carousel.id}.{export_type}")
        self.db.add(export)
        self.db.commit()
        self.db.refresh(export)
        return export

    def regenerate_text(self, slide_id: uuid.UUID, user_id: uuid.UUID) -> Slide:
        slide = self._get_slide(slide_id, user_id)
        text = self.ai.regenerate_slide_text(slide.carousel.topic, slide.position)
        text_values = [text["title"], text["subtitle"], text["body"], text["cta"]]
        for element, content in zip([el for el in slide.elements if el.type == "text"], text_values, strict=False):
            element.content = content
        self.db.commit()
        return self._get_slide(slide_id, user_id)

    def regenerate_image(self, slide_id: uuid.UUID, user_id: uuid.UUID) -> Slide:
        slide = self._get_slide(slide_id, user_id)
        url = self.ai.regenerate_slide_image(slide.carousel.topic, slide.position)
        images = [element for element in slide.elements if element.type == "image"]
        if images:
            images[0].src = url
        else:
            self.db.add(
                SlideElement(
                    slide_id=slide.id,
                    position=len(slide.elements),
                    type="image",
                    src=url,
                    x=180,
                    y=270,
                    width=540,
                    height=270,
                )
            )
        self.db.commit()
        return self._get_slide(slide_id, user_id)

    def _get_slide(self, slide_id: uuid.UUID, user_id: uuid.UUID) -> Slide:
        slide = (
            self.db.query(Slide)
            .join(Carousel)
            .options(selectinload(Slide.elements), selectinload(Slide.carousel))
            .filter(Slide.id == slide_id, Carousel.user_id == user_id)
            .first()
        )
        if not slide:
            raise HTTPException(status_code=404, detail="Slide not found")
        return slide

    def _replace_slides(self, carousel: Carousel, slides_payload: list[dict]) -> None:
        carousel.slides.clear()
        self.db.flush()
        for slide_data in slides_payload:
            slide = Slide(
                id=slide_data.get("id") or uuid.uuid4(),
                carousel_id=carousel.id,
                position=slide_data["position"],
                background=slide_data["background"],
            )
            self.db.add(slide)
            self.db.flush()
            for index, element_data in enumerate(slide_data["elements"]):
                self.db.add(
                    SlideElement(
                        id=element_data.get("id") or uuid.uuid4(),
                        slide_id=slide.id,
                        position=index,
                        type=element_data["type"],
                        content=element_data.get("content"),
                        src=element_data.get("src"),
                        x=element_data["x"],
                        y=element_data["y"],
                        width=element_data["width"],
                        height=element_data["height"],
                        font_size=element_data.get("fontSize"),
                        font_weight=element_data.get("fontWeight"),
                        color=element_data.get("color"),
                        align=element_data.get("align"),
                        font_family=element_data.get("fontFamily"),
                    )
                )
