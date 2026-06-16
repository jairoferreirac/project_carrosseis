"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-15
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)
    op.create_table(
        "templates",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("config", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_templates_slug"), "templates", ["slug"], unique=True)
    op.create_table(
        "carousels",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("topic", sa.String(length=255), nullable=False),
        sa.Column("language", sa.String(length=20), nullable=False),
        sa.Column("tone", sa.String(length=80), nullable=False),
        sa.Column("audience", sa.String(length=255), nullable=False),
        sa.Column("platform", sa.String(length=40), nullable=False),
        sa.Column("template_slug", sa.String(length=80), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "slides",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("carousel_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("background", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.ForeignKeyConstraint(["carousel_id"], ["carousels.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "exports",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("carousel_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("url", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["carousel_id"], ["carousels.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "slide_elements",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slide_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(length=40), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("src", sa.Text(), nullable=True),
        sa.Column("x", sa.Integer(), nullable=False),
        sa.Column("y", sa.Integer(), nullable=False),
        sa.Column("width", sa.Integer(), nullable=False),
        sa.Column("height", sa.Integer(), nullable=False),
        sa.Column("font_size", sa.Integer(), nullable=True),
        sa.Column("font_weight", sa.String(length=40), nullable=True),
        sa.Column("color", sa.String(length=20), nullable=True),
        sa.Column("align", sa.String(length=20), nullable=True),
        sa.Column("font_family", sa.String(length=120), nullable=True),
        sa.ForeignKeyConstraint(["slide_id"], ["slides.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("slide_elements")
    op.drop_table("exports")
    op.drop_table("slides")
    op.drop_table("carousels")
    op.drop_index(op.f("ix_templates_slug"), table_name="templates")
    op.drop_table("templates")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
