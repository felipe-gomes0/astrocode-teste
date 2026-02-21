from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User, UserType
from app.models.professional import Professional
from app.models.service import Service
from passlib.context import CryptContext
import uuid6

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def populate():
    db: Session = SessionLocal()
    
    try:
        
        professionals_data = [
            {
                "name": "Dr. Roberto Silva",
                "email": "roberto.silva@example.com",
                "speciality": "Cardiologista",
                "description": "Especialista em saúde do coração com 20 anos de experiência. Realizo check-ups completos e acompanhamento de doenças cardíacas.",
                "address": "Av. Paulista, 1000 - São Paulo, SP",
                "services": [
                    {"name": "Consulta Cardiológica", "duration": 60, "price": 400.00},
                    {"name": "Eletrocardiograma", "duration": 30, "price": 150.00}
                ]
            },
            {
                "name": "Dra. Ana Costa",
                "email": "ana.costa@example.com",
                "speciality": "Dermatologista",
                "description": "Dermatologia clínica e estética. Tratamentos para acne, melasma e rejuvenescimento facial.",
                "address": "Rua Oscar Freire, 500 - São Paulo, SP",
                "services": [
                    {"name": "Consulta Dermatológica", "duration": 45, "price": 350.00},
                    {"name": "Limpeza de Pele", "duration": 60, "price": 200.00},
                    {"name": "Aplicação de Botox", "duration": 30, "price": 1200.00}
                ]
            },
            {
                "name": "Carlos Oliveira",
                "email": "carlos.oliveira@example.com",
                "speciality": "Personal Trainer",
                "description": "Treinamento personalizado focado em emagrecimento e hipertrofia. Atendimento em academias ou a domicílio.",
                "address": "Rua Augusta, 1200 - São Paulo, SP",
                "services": [
                    {"name": "Aula Avulsa", "duration": 60, "price": 100.00},
                    {"name": "Planejamento Mensal", "duration": 60, "price": 300.00}
                ]
            },
            {
                "name": "Mariana Santos",
                "email": "mariana.santos@example.com",
                "speciality": "Psicóloga",
                "description": "Psicoterapia cognitivo-comportamental para ansiedade, depressão e desenvolvimento pessoal.",
                "address": "Av. Faria Lima, 2000 - São Paulo, SP",
                "services": [
                    {"name": "Sessão de Terapia", "duration": 50, "price": 250.00}
                ]
            },
            {
                "name": "Pedro Souza",
                "email": "pedro.souza@example.com",
                "speciality": "Advogado Trabalhista",
                "description": "Assessoria jurídica especializada em direitos do trabalhador e empresas.",
                "address": "Rua da Consolação, 800 - São Paulo, SP",
                "services": [
                    {"name": "Consulta Jurídica", "duration": 60, "price": 300.00},
                    {"name": "Análise de Contrato", "duration": 120, "price": 500.00}
                ]
            },
            {
                "name": "Fernanda Lima",
                "email": "fernanda.lima@example.com",
                "speciality": "Arquiteta",
                "description": "Projetos residenciais e comerciais. Design de interiores e reformas.",
                "address": "Av. Brasil, 1500 - São Paulo, SP",
                "services": [
                    {"name": "Consultoria de Decoração", "duration": 90, "price": 450.00},
                    {"name": "Visita Técnica", "duration": 60, "price": 200.00}
                ]
            },
            {
                "name": "Lucas Pereira",
                "email": "lucas.pereira@example.com",
                "speciality": "Barbeiro",
                "description": "C cortes clássicos e modernos, barba terapia e ambiente descontraído.",
                "address": "Rua dos Pinheiros, 300 - São Paulo, SP",
                "services": [
                    {"name": "Corte de Cabelo", "duration": 45, "price": 60.00},
                    {"name": "Barba Completa", "duration": 30, "price": 50.00},
                    {"name": "Combo Corte + Barba", "duration": 60, "price": 100.00}
                ]
            },
            {
                "name": "Juliana Martins",
                "email": "juliana.martins@example.com",
                "speciality": "Nutricionista",
                "description": "Reeducação alimentar e nutrição esportiva. Planos individualizados para seus objetivos.",
                "address": "Av. Rebouças, 2500 - São Paulo, SP",
                "services": [
                    {"name": "Consulta Inicial", "duration": 60, "price": 300.00},
                    {"name": "Retorno", "duration": 30, "price": 150.00}
                ]
            },
            {
                "name": "Ricardo Almeida",
                "email": "ricardo.almeida@example.com",
                "speciality": "Mecânico",
                "description": "Especialista em motores e injeção eletrônica. Diagnóstico computadorizado.",
                "address": "Av. do Estado, 4000 - São Paulo, SP",
                "services": [
                    {"name": "Diagnóstico", "duration": 60, "price": 120.00},
                    {"name": "Troca de Óleo", "duration": 30, "price": 80.00}
                ]
            },
            {
                "name": "Camila Rocha",
                "email": "camila.rocha@example.com",
                "speciality": "Fotógrafa",
                "description": "Ensaios fotográficos externos e em estúdio. Casamentos, eventos e retratos corporativos.",
                "address": "Rua Lorena, 100 - São Paulo, SP",
                "services": [
                    {"name": "Ensaio Pessoal", "duration": 120, "price": 600.00},
                    {"name": "Cobertura de Evento (Hora)", "duration": 60, "price": 400.00}
                ]
            },
            {
                "name": "Chef Rodrigo",
                "email": "rodrigo.chef@example.com",
                "speciality": "Chef Personal",
                "description": "Jantares exclusivos e cursos de culinária em domicílio. Especialista em gastronomia italiana e francesa.",
                "address": "Rua Bela Cintra, 700 - São Paulo, SP",
                "services": [
                    {"name": "Jantar para 2 Pessoas", "duration": 180, "price": 800.00},
                    {"name": "Curso de Massas (4h)", "duration": 240, "price": 500.00}
                ]
            },
            {
                "name": "Beatriz Yoga",
                "email": "beatriz.yoga@example.com",
                "speciality": "Instrutora de Yoga",
                "description": "Aulas de Hatha e Vinyasa Yoga. Foco em flexibilidade, força e relaxamento mental.",
                "address": "Parque Ibirapuera, Portão 7 - São Paulo, SP",
                "services": [
                    {"name": "Aula Individual", "duration": 60, "price": 120.00},
                    {"name": "Aula em Grupo", "duration": 60, "price": 50.00}
                ]
            },
            {
                "name": "Dr. Fernando Dentista",
                "email": "fernando.dentista@example.com",
                "speciality": "Dentista",
                "description": "Clínica geral, ortodontia e estética dental. Clareamento e implantes.",
                "address": "Av. Angélica, 2000 - São Paulo, SP",
                "services": [
                    {"name": "Limpeza e Profilaxia", "duration": 45, "price": 250.00},
                    {"name": "Clareamento a Laser", "duration": 60, "price": 800.00},
                    {"name": "Avaliação Ortodôntica", "duration": 30, "price": 100.00}
                ]
            }
        ]

        print("Creating professionals...")
        
        for p_data in professionals_data:
            # Check if user exists
            existing_user = db.query(User).filter(User.email == p_data["email"]).first()
            if not existing_user:
                # Create User
                user = User(
                    email=p_data["email"],
                    password=get_password_hash("senha123"), # Default password
                    name=p_data["name"],
                    phone="11999999999", # Added phone
                    type=UserType.PROFESSIONAL,
                    active=True
                )
                db.add(user)
                db.flush() # Flush to get user ID
                
                # Create Professional profile
                professional = Professional(
                    user_id=user.id,
                    speciality=p_data["speciality"],
                    description=p_data["description"],
                    address=p_data["address"],
                    photo_url=f"https://ui-avatars.com/api/?name={p_data['name'].replace(' ', '+')}&background=random"
                )
                db.add(professional)
                db.flush()
                
                # Create Services
                for s_data in p_data["services"]:
                    service = Service(
                        professional_id=professional.id,
                        name=s_data["name"],
                        duration=s_data["duration"],
                        price=s_data["price"],
                        description=f"Serviço de {s_data['name']}"
                    )
                    db.add(service)
                
                print(f"Created professional: {p_data['name']}")
            else:
                 print(f"Skipping existing user: {p_data['email']}")

        db.commit()
        print("Database populated successfully!")

    except Exception as e:
        print(f"Error populating database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate()
