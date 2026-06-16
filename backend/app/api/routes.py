import uuid

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models import Carousel, Export, Slide
from app.schemas.carousel import (
    CarouselResponse,
    CarouselSummary,
    CarouselUpdateRequest,
    ExportResponse,
    GenerateCarouselRequest,
    SlideBase,
)
from app.services.carousel_service import CarouselService, ensure_seed_data

router = APIRouter()


def get_current_user_id(db: Session = Depends(get_db)) -> uuid.UUID:
    user = ensure_seed_data(db, settings.mock_user_id)
    return user.id


def serialize_element(element) -> dict:
    return {
        "id": element.id,
        "type": element.type,
        "content": element.content,
        "src": element.src,
        "x": element.x,
        "y": element.y,
        "width": element.width,
        "height": element.height,
        "fontSize": element.font_size,
        "fontWeight": element.font_weight,
        "color": element.color,
        "align": element.align,
        "fontFamily": element.font_family,
    }


def serialize_slide(slide: Slide) -> dict:
    return {
        "id": slide.id,
        "position": slide.position,
        "background": slide.background,
        "elements": [serialize_element(element) for element in slide.elements],
    }


def serialize_carousel(carousel: Carousel) -> CarouselResponse:
    return CarouselResponse(
        carousel_id=carousel.id,
        title=carousel.title,
        topic=carousel.topic,
        language=carousel.language,
        tone=carousel.tone,
        audience=carousel.audience,
        platform=carousel.platform,
        template_slug=carousel.template_slug,
        slides=[serialize_slide(slide) for slide in carousel.slides],
    )


def serialize_export(export: Export) -> ExportResponse:
    return ExportResponse(export_id=export.id, type=export.type, status=export.status, url=export.url)


@router.get("/carousels", response_model=list[CarouselSummary])
def list_carousels(db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    carousels = CarouselService(db).list_carousels(user_id)
    return [
        CarouselSummary(
            carousel_id=carousel.id,
            title=carousel.title,
            topic=carousel.topic,
            platform=carousel.platform,
            slides_count=len(carousel.slides),
        )
        for carousel in carousels
    ]


@router.get("/carousels/{carousel_id}", response_model=CarouselResponse)
def get_carousel(carousel_id: uuid.UUID, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    return serialize_carousel(CarouselService(db).get_carousel(carousel_id, user_id))


@router.post("/carousels/generate", response_model=CarouselResponse)
def generate_carousel(payload: GenerateCarouselRequest, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    return serialize_carousel(CarouselService(db).generate(payload, user_id))


@router.put("/carousels/{carousel_id}", response_model=CarouselResponse)
def update_carousel(
    carousel_id: uuid.UUID,
    payload: CarouselUpdateRequest,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return serialize_carousel(CarouselService(db).update(carousel_id, payload, user_id))


@router.delete("/carousels/{carousel_id}", status_code=204)
def delete_carousel(carousel_id: uuid.UUID, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    CarouselService(db).delete(carousel_id, user_id)
    return Response(status_code=204)


@router.post("/carousels/{carousel_id}/export/png", response_model=ExportResponse)
def export_png(carousel_id: uuid.UUID, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    return serialize_export(CarouselService(db).create_export(carousel_id, "png", user_id))


@router.post("/carousels/{carousel_id}/export/pdf", response_model=ExportResponse)
def export_pdf(carousel_id: uuid.UUID, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    return serialize_export(CarouselService(db).create_export(carousel_id, "pdf", user_id))


@router.post("/slides/{slide_id}/regenerate-text", response_model=SlideBase)
def regenerate_text(slide_id: uuid.UUID, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    return serialize_slide(CarouselService(db).regenerate_text(slide_id, user_id))


@router.post("/slides/{slide_id}/regenerate-image", response_model=SlideBase)
def regenerate_image(slide_id: uuid.UUID, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    return serialize_slide(CarouselService(db).regenerate_image(slide_id, user_id))
