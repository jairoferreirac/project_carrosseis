import uuid

from app.core.config import settings
from app.schemas.carousel import GenerateCarouselRequest
from app.services.templates import get_template


class AIService:
    def generate_carousel(self, payload: GenerateCarouselRequest) -> dict:
        if settings.ai_provider != "mock":
            raise NotImplementedError("OpenAI/Gemini providers are prepared but not implemented yet.")
        return self._mock_generate(payload)

    def regenerate_slide_text(self, topic: str, position: int) -> dict:
        return {
            "title": f"Nova abordagem #{position}",
            "subtitle": f"Um angulo pratico sobre {topic}",
            "body": "Texto regenerado em modo mock. Troque o provider para conectar OpenAI ou Gemini.",
            "cta": "Salve este slide",
        }

    def regenerate_slide_image(self, topic: str, position: int) -> str:
        return f"https://placehold.co/900x540/111827/ffffff?text={topic[:28].replace(' ', '+')}+{position}"

    def _mock_generate(self, payload: GenerateCarouselRequest) -> dict:
        template = get_template(payload.template_slug)
        config = template["config"]
        slides = []
        legacy_slides = []

        for index in range(payload.slides_count):
            position = index + 1
            title = self._title_for(position, payload.topic, payload.slides_count)
            subtitle = f"{payload.tone.title()} para {payload.audience}"
            body = self._body_for(position, payload.topic)
            cta = "Comente sua maior duvida" if position == payload.slides_count else "Continue para o proximo slide"
            image_prompt = f"Ilustracao editorial sobre {payload.topic}, slide {position}, estilo {template['name']}"

            slides.append(
                {
                    "id": uuid.uuid4(),
                    "position": position,
                    "background": {"type": "color", "value": config["background"]},
                    "elements": [
                        {
                            "id": uuid.uuid4(),
                            "type": "text",
                            "content": title,
                            "x": 72,
                            "y": 76,
                            "width": 756,
                            "height": 110,
                            "fontSize": 44 if position == 1 else 38,
                            "fontWeight": "bold",
                            "color": config["text"],
                            "align": "center",
                            "fontFamily": config["font"],
                        },
                        {
                            "id": uuid.uuid4(),
                            "type": "text",
                            "content": subtitle,
                            "x": 92,
                            "y": 198,
                            "width": 716,
                            "height": 70,
                            "fontSize": 22,
                            "fontWeight": "600",
                            "color": config["accent"],
                            "align": "center",
                            "fontFamily": config["font"],
                        },
                        {
                            "id": uuid.uuid4(),
                            "type": "text",
                            "content": body,
                            "x": 108,
                            "y": 306,
                            "width": 684,
                            "height": 190,
                            "fontSize": 28,
                            "fontWeight": "400",
                            "color": config["muted"],
                            "align": "center",
                            "fontFamily": config["font"],
                        },
                        {
                            "id": uuid.uuid4(),
                            "type": "text",
                            "content": cta,
                            "x": 150,
                            "y": 594,
                            "width": 600,
                            "height": 58,
                            "fontSize": 24,
                            "fontWeight": "bold",
                            "color": config["text"],
                            "align": "center",
                            "fontFamily": config["font"],
                        },
                    ],
                }
            )
            legacy_slides.append(
                {
                    "slide_number": position,
                    "title": title,
                    "subtitle": subtitle,
                    "body": body,
                    "cta": cta,
                    "image_prompt": image_prompt,
                    "background_style": config["background"],
                    "layout": "title_center",
                }
            )

        return {
            "title": f"{payload.topic}: guia rapido",
            "slides": slides,
            "generated_slides": legacy_slides,
        }

    @staticmethod
    def _title_for(position: int, topic: str, total: int) -> str:
        if position == 1:
            return f"{topic}"
        if position == total:
            return "Como colocar em pratica"
        return f"Passo {position - 1}: conceito essencial"

    @staticmethod
    def _body_for(position: int, topic: str) -> str:
        bodies = [
            f"Entenda o problema que {topic} resolve antes de escolher ferramentas ou arquitetura.",
            "Comece pelos conceitos principais e conecte cada termo a um exemplo real de trabalho.",
            "Evite complexidade inicial. Defina entrada, processamento, saida e criterio de sucesso.",
            "Use checklists para transformar teoria em execucao consistente no dia a dia.",
        ]
        return bodies[(position - 1) % len(bodies)]
