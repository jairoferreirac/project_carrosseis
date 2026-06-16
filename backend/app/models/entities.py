import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120), default="Mock User")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    carousels: Mapped[list["Carousel"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Template(Base):
    __tablename__ = "templates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    config: Mapped[dict] = mapped_column(JSONB)


class Carousel(Base):
    __tablename__ = "carousels"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    topic: Mapped[str] = mapped_column(String(255))
    language: Mapped[str] = mapped_column(String(20))
    tone: Mapped[str] = mapped_column(String(80))
    audience: Mapped[str] = mapped_column(String(255))
    platform: Mapped[str] = mapped_column(String(40))
    template_slug: Mapped[str] = mapped_column(String(80), default="minimal-dark")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="carousels")
    slides: Mapped[list["Slide"]] = relationship(back_populates="carousel", cascade="all, delete-orphan", order_by="Slide.position")
    exports: Mapped[list["Export"]] = relationship(back_populates="carousel", cascade="all, delete-orphan")


class Slide(Base):
    __tablename__ = "slides"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    carousel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("carousels.id"))
    position: Mapped[int] = mapped_column(Integer)
    background: Mapped[dict] = mapped_column(JSONB)

    carousel: Mapped["Carousel"] = relationship(back_populates="slides")
    elements: Mapped[list["SlideElement"]] = relationship(back_populates="slide", cascade="all, delete-orphan", order_by="SlideElement.position")


class SlideElement(Base):
    __tablename__ = "slide_elements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slide_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("slides.id"))
    position: Mapped[int] = mapped_column(Integer, default=0)
    type: Mapped[str] = mapped_column(String(40))
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    src: Mapped[str | None] = mapped_column(Text, nullable=True)
    x: Mapped[int] = mapped_column(Integer)
    y: Mapped[int] = mapped_column(Integer)
    width: Mapped[int] = mapped_column(Integer)
    height: Mapped[int] = mapped_column(Integer)
    font_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    font_weight: Mapped[str | None] = mapped_column(String(40), nullable=True)
    color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    align: Mapped[str | None] = mapped_column(String(20), nullable=True)
    font_family: Mapped[str | None] = mapped_column(String(120), nullable=True)

    slide: Mapped["Slide"] = relationship(back_populates="elements")


class Export(Base):
    __tablename__ = "exports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    carousel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("carousels.id"))
    type: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(40), default="queued")
    url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    carousel: Mapped["Carousel"] = relationship(back_populates="exports")
