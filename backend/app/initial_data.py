import logging
from datetime import time
from app.core.database import SessionLocal
from app.models.user import User, UserType
from app.models.professional import Professional
from app.models.service import Service
from app.models.working_hours import WorkingHours
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

        # ── Clients ──
        client1 = User(
            email="client@example.com",
            password=get_password_hash("password123"),
            name="João Silva",
            phone="11888888888",
            type=UserType.CLIENT,
            active=True
        )
        client2 = User(
            email="maria@example.com",
            password=get_password_hash("password123"),
            name="Maria Oliveira",
            phone="11877777777",
            type=UserType.CLIENT,
            active=True
        )
        db.add_all([client1, client2])
        db.commit()

        # ── Professional 1: Barber ──
        prof_user1 = User(
            email="prof@example.com",
            password=get_password_hash("password123"),
            name="Dr. Felipe Gomes",
            phone="11999999999",
            type=UserType.PROFESSIONAL,
            active=True
        )
        db.add(prof_user1)
        db.commit()
        db.refresh(prof_user1)

        prof1 = Professional(
            user_id=prof_user1.id,
            speciality="Barber",
            description="Barbeiro especialista com 10 anos de experiência em cortes modernos e clássicos.",
            address="Rua Augusta, 1200 - São Paulo, SP",
            photo_url="https://randomuser.me/api/portraits/men/32.jpg"
        )
        db.add(prof1)
        db.commit()
        db.refresh(prof1)

        # Services for Prof 1
        db.add_all([
            Service(name="Corte de Cabelo", description="Corte masculino completo", price=50.00, duration=30, professional_id=prof1.id),
            Service(name="Barba", description="Barba completa e desenhada", price=30.00, duration=20, professional_id=prof1.id),
            Service(name="Corte + Barba", description="Combo corte e barba", price=70.00, duration=45, professional_id=prof1.id),
            Service(name="Sobrancelha", description="Design de sobrancelha masculina", price=15.00, duration=15, professional_id=prof1.id),
        ])

        # Working Hours for Prof 1 (Mon-Fri: 09:00-18:00, Sat: 09:00-13:00)
        for day in range(5):  # Monday(0) to Friday(4)
            db.add(WorkingHours(professional_id=prof1.id, day_of_week=day, start_time=time(9, 0), end_time=time(18, 0), active=True))
        db.add(WorkingHours(professional_id=prof1.id, day_of_week=5, start_time=time(9, 0), end_time=time(13, 0), active=True))
        db.commit()

        # ── Professional 2: Dentist ──
        prof_user2 = User(
            email="ana.dentista@example.com",
            password=get_password_hash("password123"),
            name="Dra. Ana Costa",
            phone="11966666666",
            type=UserType.PROFESSIONAL,
            active=True
        )
        db.add(prof_user2)
        db.commit()
        db.refresh(prof_user2)

        prof2 = Professional(
            user_id=prof_user2.id,
            speciality="Dentista",
            description="Dentista especializada em clareamento e estética dental. Atendimento humanizado.",
            address="Av. Paulista, 1578 - São Paulo, SP",
            photo_url="https://randomuser.me/api/portraits/women/44.jpg"
        )
        db.add(prof2)
        db.commit()
        db.refresh(prof2)

        # Services for Prof 2
        db.add_all([
            Service(name="Limpeza Dental", description="Profilaxia completa", price=120.00, duration=40, professional_id=prof2.id),
            Service(name="Clareamento", description="Clareamento dental a laser", price=350.00, duration=60, professional_id=prof2.id),
            Service(name="Consulta Avaliação", description="Avaliação dental completa com raio-x", price=80.00, duration=30, professional_id=prof2.id),
        ])

        # Working Hours for Prof 2 (Mon-Thu: 08:00-17:00, Fri: 08:00-14:00)
        for day in range(4):  # Monday(0) to Thursday(3)
            db.add(WorkingHours(professional_id=prof2.id, day_of_week=day, start_time=time(8, 0), end_time=time(17, 0), active=True))
        db.add(WorkingHours(professional_id=prof2.id, day_of_week=4, start_time=time(8, 0), end_time=time(14, 0), active=True))
        db.commit()

        # ── Professional 3: Personal Trainer ──
        prof_user3 = User(
            email="rafael.personal@example.com",
            password=get_password_hash("password123"),
            name="Rafael Santos",
            phone="11955555555",
            type=UserType.PROFESSIONAL,
            active=True
        )
        db.add(prof_user3)
        db.commit()
        db.refresh(prof_user3)

        prof3 = Professional(
            user_id=prof_user3.id,
            speciality="Personal Trainer",
            description="Personal trainer certificado CREF. Especialista em hipertrofia e emagrecimento.",
            address="Rua Oscar Freire, 890 - São Paulo, SP",
            photo_url="https://randomuser.me/api/portraits/men/75.jpg"
        )
        db.add(prof3)
        db.commit()
        db.refresh(prof3)

        # Services for Prof 3
        db.add_all([
            Service(name="Treino Individual", description="Sessão de treino personalizado", price=100.00, duration=60, professional_id=prof3.id),
            Service(name="Avaliação Física", description="Avaliação corporal completa com bioimpedância", price=150.00, duration=45, professional_id=prof3.id),
            Service(name="Treino em Dupla", description="Sessão de treino para duas pessoas", price=140.00, duration=60, professional_id=prof3.id),
        ])

        # Working Hours for Prof 3 (Mon-Sat: 06:00-20:00)
        for day in range(6):  # Monday(0) to Saturday(5)
            db.add(WorkingHours(professional_id=prof3.id, day_of_week=day, start_time=time(6, 0), end_time=time(20, 0), active=True))
        db.commit()

        # ── Professional 4: Psychologist ──
        prof_user4 = User(
            email="carla.psicologa@example.com",
            password=get_password_hash("password123"),
            name="Dra. Carla Mendes",
            phone="11944444444",
            type=UserType.PROFESSIONAL,
            active=True
        )
        db.add(prof_user4)
        db.commit()
        db.refresh(prof_user4)

        prof4 = Professional(
            user_id=prof_user4.id,
            speciality="Psicóloga",
            description="Psicóloga clínica com abordagem cognitivo-comportamental. Atendimento online e presencial.",
            address="Rua Bela Cintra, 456 - São Paulo, SP",
            photo_url="https://randomuser.me/api/portraits/women/68.jpg"
        )
        db.add(prof4)
        db.commit()
        db.refresh(prof4)

        # Services for Prof 4
        db.add_all([
            Service(name="Sessão Individual", description="Sessão de terapia individual (50 min)", price=200.00, duration=50, professional_id=prof4.id),
            Service(name="Sessão de Casal", description="Sessão de terapia de casal", price=300.00, duration=60, professional_id=prof4.id),
            Service(name="Primeira Consulta", description="Sessão inicial de acolhimento e avaliação", price=180.00, duration=60, professional_id=prof4.id),
        ])

        # Working Hours for Prof 4 (Mon-Fri: 10:00-19:00)
        for day in range(5):  # Monday(0) to Friday(4)
            db.add(WorkingHours(professional_id=prof4.id, day_of_week=day, start_time=time(10, 0), end_time=time(19, 0), active=True))
        db.commit()

        logger.info("Initial data created successfully! 4 professionals with services and working hours seeded.")

    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
