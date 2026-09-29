from pydantic import BaseModel, Field
from datetime import date
from typing import Literal


class Movimentacao(BaseModel):
    tipo: Literal["Receita", "Despesa"]
    descricao: str = Field(min_length=1)
    categoria: str = Field(min_length=1)
    valor: float = Field(gt=0)
    data: date


class MovimentacaoResposta(BaseModel):
    id: int
    tipo: str
    descricao: str
    categoria: str
    valor: float
    data: date

    class Config:
        from_attributes = True