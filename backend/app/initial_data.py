import logging
from app.core.database import SessionLocal
from app.models.user import User, UserType
from app.models.professional import Professional
from app.models.service import Service
from passlib.context import CryptContext

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def init_db() -> None:
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).first():
            logger.info("Database already seeded. Skipping.")
            return

        logger.info("Creating initial data...")

        # Create Professional User
        professional_user = User(
            email="prof@example.com",
            password=get_password_hash("password123"),
            name="Dr. Felipe Gomes",
            phone="11999999999",
            type=UserType.PROFESSIONAL,
            active=True
        )
        db.add(professional_user)
        db.commit()
        db.refresh(professional_user)

        # Create Professional Profile
        professional_profile = Professional(
            user_id=professional_user.id,
            speciality="Barber",
            description="Expert barber with 10 years of experience.",
            address="Rua Exemplo, 123",
            photo_url="https://example.com/photo.jpg"
        )
        db.add(professional_profile)
        db.commit()
        db.refresh(professional_profile)

        # Create Client User
        client_user = User(
            email="client@example.com",
            password=get_password_hash("password123"),
            name="João Silva",
            phone="11888888888",
            type=UserType.CLIENT,
            active=True
        )
        db.add(client_user)
        db.commit()

        # Create Services
        service1 = Service(
            name="Corte de Cabelo",
            description="Corte masculino completo",
            price=50.00,
            duration=30,
            professional_id=professional_profile.id
        )
        service2 = Service(
            name="Barba",
            description="Barba completa e desenhada",
            price=30.00,
            duration=20,
            professional_id=professional_profile.id
        )
        db.add(service1)
        db.add(service2)
        db.commit()

        logger.info("Initial data created successfully!")

    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
