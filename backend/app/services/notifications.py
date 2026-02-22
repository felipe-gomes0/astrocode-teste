import logging
from datetime import datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from app.core.email import send_email
from app.core.logging.log_dependency import get_log_service

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
_jinja_env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)), autoescape=True)


def _format_datetime_br(dt: datetime) -> str:
    months = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
    ]
    weekdays = [
        "Segunda-feira", "Terça-feira", "Quarta-feira",
        "Quinta-feira", "Sexta-feira", "Sábado", "Domingo",
    ]
    day_name = weekdays[dt.weekday()]
    month_name = months[dt.month - 1]
    return f"{day_name}, {dt.day} de {month_name} de {dt.year} às {dt.strftime('%H:%M')}"


async def send_appointment_confirmation(
    client_name: str,
    client_email: str,
    date_time: datetime,
    service_name: str,
    professional_name: str,
    duration: int,
) -> None:
    """Send appointment confirmation email (designed to run in BackgroundTasks)."""
    log_service = get_log_service()
    try:
        from app.core.config import settings
        template = _jinja_env.get_template("appointment_confirmation.html")
        html = template.render(
            client_name=client_name,
            date_time=_format_datetime_br(date_time),
            service_name=service_name,
            professional_name=professional_name,
            duration=duration,
            frontend_url=settings.FRONTEND_URL,
        )
        
        # Determine if email was actually sent or skipped
        sent = await send_email(
            to=client_email,
            subject=f"Confirmação de Agendamento - {service_name}",
            html_body=html,
        )
        
        if sent:
            await log_service.info(
                action="EMAIL_SENT",
                message=f"Appointment confirmation sent to {client_email}",
                category="integration",
                metadata={"to": client_email, "service": service_name}
            )
            
    except Exception as e:
        await log_service.error(
            action="EMAIL_FAILED",
            message=f"Failed to send appointment confirmation to {client_email}",
            error=e,
            category="integration"
        )
