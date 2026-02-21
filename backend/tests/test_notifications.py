import pytest
from datetime import datetime
from unittest.mock import patch, MagicMock

@pytest.mark.asyncio
class TestSendEmail:
    @patch("app.core.email.settings")
    @patch("app.core.email.resend")
    async def test_send_email_success(self, mock_resend, mock_settings):
        # We need to mock asyncio.to_thread correctly for the resend call
        mock_settings.EMAILS_ENABLED = True
        mock_settings.RESEND_API_KEY = "re_test_key"
        mock_settings.EMAILS_FROM_NAME = "Test"
        mock_settings.EMAILS_FROM_ADDRESS = "test@example.com"
        
        # mock_resend.Emails.send needs to be mockable by to_thread
        mock_resend.Emails.send.return_value = {"id": "abc123"}

        from app.core.email import send_email
        result = await send_email("user@example.com", "Test Subject", "<h1>Test</h1>")

        assert result is True
        mock_resend.Emails.send.assert_called_once()

    @patch("app.core.email.settings")
    async def test_send_email_disabled(self, mock_settings):
        mock_settings.EMAILS_ENABLED = False

        from app.core.email import send_email
        result = await send_email("user@example.com", "Test", "<h1>Hi</h1>")

        assert result is False

    @patch("app.core.email.settings")
    async def test_send_email_no_api_key(self, mock_settings):
        mock_settings.EMAILS_ENABLED = True
        mock_settings.RESEND_API_KEY = None

        from app.core.email import send_email
        result = await send_email("user@example.com", "Test", "<h1>Hi</h1>")

        assert result is False

    @patch("app.core.email.settings")
    @patch("app.core.email.resend")
    async def test_send_email_failure_logs_error(self, mock_resend, mock_settings):
        mock_settings.EMAILS_ENABLED = True
        mock_settings.RESEND_API_KEY = "re_test_key"
        mock_settings.EMAILS_FROM_NAME = "Test"
        mock_settings.EMAILS_FROM_ADDRESS = "test@example.com"
        mock_resend.Emails.send.side_effect = Exception("SMTP down")

        from app.core.email import send_email
        result = await send_email("user@example.com", "Test", "<h1>Hi</h1>")

        assert result is False

@pytest.mark.asyncio
class TestSendAppointmentConfirmation:
    @patch("app.services.notifications.send_email")
    @patch("app.services.notifications.get_log_service")
    async def test_renders_template_and_calls_send(self, mock_get_log_service, mock_send_email):
        # Setup mocks
        mock_send_email.return_value = True
        
        # Configure log service mock methods as async
        from unittest.mock import AsyncMock
        mock_log_svc = MagicMock()
        mock_log_svc.info = AsyncMock()
        mock_log_svc.error = AsyncMock()
        mock_get_log_service.return_value = mock_log_svc
        
        from app.services.notifications import send_appointment_confirmation

        await send_appointment_confirmation(
            client_name="João Silva",
            client_email="joao@example.com",
            date_time=datetime(2026, 3, 10, 14, 30),
            service_name="Corte de Cabelo",
            professional_name="Dr. Carlos",
            duration=60,
        )

        mock_send_email.assert_called_once()
        call_args = mock_send_email.call_args
        assert call_args.kwargs["to"] == "joao@example.com"
        assert "Corte de Cabelo" in call_args.kwargs["subject"]
        assert "João Silva" in call_args.kwargs["html_body"]
        assert "Dr. Carlos" in call_args.kwargs["html_body"]
        assert "60 minutos" in call_args.kwargs["html_body"]

    @patch("app.services.notifications.send_email")
    @patch("app.services.notifications.get_log_service")
    async def test_failure_does_not_propagate(self, mock_get_log_service, mock_send_email):
        mock_send_email.side_effect = Exception("Render failed")
        
        # Configure log service mock methods as async
        from unittest.mock import AsyncMock
        mock_log_svc = MagicMock()
        mock_log_svc.info = AsyncMock()
        mock_log_svc.error = AsyncMock()
        mock_get_log_service.return_value = mock_log_svc

        from app.services.notifications import send_appointment_confirmation

        # Should NOT raise
        await send_appointment_confirmation(
            client_name="Test",
            client_email="test@example.com",
            date_time=datetime(2026, 1, 1, 10, 0),
            service_name="Test Service",
            professional_name="Test Pro",
            duration=30,
        )
