import logging
import threading
from datetime import datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from app.core.email import send_email

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


def send_appointment_confirmation(
    client_name: str,
    client_email: str,
    date_time: datetime,
    service_name: str,
    professional_name: str,
    duration: int,
) -> None:
    def _do_send():
        try:
            template = _jinja_env.get_template("appointment_confirmation.html")
            html = template.render(
                client_name=client_name,
                date_time=_format_datetime_br(date_time),
                service_name=service_name,
                professional_name=professional_name,
                duration=duration,
            )
            send_email(
                to=client_email,
                subject=f"Confirmação de Agendamento - {service_name}",
                html_body=html,
            )
        except Exception as e:
            logger.error("Failed to send appointment confirmation to %s: %s", client_email, e)

    thread = threading.Thread(target=_do_send, daemon=True)
    thread.start()
    logger.info("Appointment confirmation email queued for %s", client_email)
