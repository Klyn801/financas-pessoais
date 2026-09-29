from sqlalchemy import Column, Integer, String, Float, Date
from backend.database import Base


class MovimentacaoDB(Base):
    __tablename__ = "movimentacoes"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(20), nullable=False)
    descricao = Column(String(200), nullable=False)
    categoria = Column(String(100), nullable=False)
    valor = Column(Float, nullable=False)
    data = Column(Date, nullable=False)