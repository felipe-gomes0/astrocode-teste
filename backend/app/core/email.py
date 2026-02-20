import logging
import asyncio
import resend

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, html_body: str) -> bool:
    if not settings.EMAILS_ENABLED:
        logger.info("Emails disabled. Skipping send to %s", to)
        return False

    if not settings.RESEND_API_KEY:
        logger.error("RESEND_API_KEY not configured. Cannot send email.")
        return False

    try:
        resend.api_key = settings.RESEND_API_KEY

        params: resend.Emails.SendParams = {
            "from": f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_ADDRESS}>",
            "to": [to],
            "subject": subject,
            "html": html_body,
        }

        # Run the synchronous resend IO call in a threadpool to not block the asyncio event loop
        response = await asyncio.to_thread(resend.Emails.send, params)
        logger.info("Email sent to %s (id: %s)", to, response.get("id", "unknown"))
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to, e)
        return False
