from sqlalchemy import text
from app.core.database import SessionLocal

def fix_alembic():
    db = SessionLocal()
    try:
        # Check current version
        result = db.execute(text("SELECT * FROM alembic_version"))
        versions = result.fetchall()
        print(f"Current versions: {versions}")
        
        # Clear table
        # db.execute(text("DELETE FROM alembic_version"))
        # db.commit()
        # print("Cleared alembic_version table.")
        
        # Truncate working_hours to fix migration
        db.execute(text("TRUNCATE TABLE working_hours RESTART IDENTITY CASCADE"))
        db.commit()
        print("Truncated working_hours table.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_alembic()
