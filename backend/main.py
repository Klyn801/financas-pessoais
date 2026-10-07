from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from backend.database import engine, Base, SessionLocal
from backend.models import MovimentacaoDB
from backend.schemas import Movimentacao, MovimentacaoResposta


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gerenciador de Finanças Pessoais",
    description="API para controle de receitas e despesas",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
   allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def obter_banco():
    banco = SessionLocal()

    try:
        yield banco
    finally:
        banco.close()


@app.get("/")
def inicio():
    return {
        "mensagem": "Gerenciador de Finanças Pessoais funcionando!"
    }


@app.post("/movimentacoes")
def criar_movimentacao(
    movimentacao: Movimentacao,
    banco: Session = Depends(obter_banco)
):
    nova_movimentacao = MovimentacaoDB(
        tipo=movimentacao.tipo,
        descricao=movimentacao.descricao,
        categoria=movimentacao.categoria,
        valor=movimentacao.valor,
        data=movimentacao.data
    )

    banco.add(nova_movimentacao)
    banco.commit()
    banco.refresh(nova_movimentacao)

    return {
        "mensagem": "Movimentação cadastrada com sucesso!",
        "id": nova_movimentacao.id
    }


@app.get(
    "/movimentacoes",
    response_model=list[MovimentacaoResposta]
)
def listar_movimentacoes(
    banco: Session = Depends(obter_banco)
):
    movimentacoes = banco.query(MovimentacaoDB).all()

    return movimentacoes
    nova_movimentacao = MovimentacaoDB(
        tipo=movimentacao.tipo,
        descricao=movimentacao.descricao,
        categoria=movimentacao.categoria,
        valor=movimentacao.valor,
        data=movimentacao.data
    )

    banco.add(nova_movimentacao)
    banco.commit()
    banco.refresh(nova_movimentacao)

    return {
        "mensagem": "Movimentação cadastrada com sucesso!",
        "id": nova_movimentacao.id
    }


@app.get("/movimentacoes")
def listar_movimentacoes(
    banco: Session = Depends(obter_banco)
):
    movimentacoes = banco.query(MovimentacaoDB).all()

    return movimentacoes


@app.get("/movimentacoes/{movimentacao_id}")
def buscar_movimentacao(
    movimentacao_id: int,
    banco: Session = Depends(obter_banco)
):
    movimentacao = banco.query(
        MovimentacaoDB
    ).filter(
        MovimentacaoDB.id == movimentacao_id
    ).first()

    if movimentacao is None:
        raise HTTPException(
            status_code=404,
            detail="Movimentação não encontrada."
        )

    return movimentacao


@app.put("/movimentacoes/{movimentacao_id}")
def atualizar_movimentacao(
    movimentacao_id: int,
    dados: Movimentacao,
    banco: Session = Depends(obter_banco)
):
    movimentacao = banco.query(
        MovimentacaoDB
    ).filter(
        MovimentacaoDB.id == movimentacao_id
    ).first()

    if movimentacao is None:
        raise HTTPException(
            status_code=404,
            detail="Movimentação não encontrada."
        )

    movimentacao.tipo = dados.tipo
    movimentacao.descricao = dados.descricao
    movimentacao.categoria = dados.categoria
    movimentacao.valor = dados.valor
    movimentacao.data = dados.data

    banco.commit()
    banco.refresh(movimentacao)

    return {
        "mensagem": "Movimentação atualizada com sucesso!",
        "movimentacao": movimentacao
    }


@app.delete("/movimentacoes/{movimentacao_id}")
def excluir_movimentacao(
    movimentacao_id: int,
    banco: Session = Depends(obter_banco)
):
    movimentacao = banco.query(
        MovimentacaoDB
    ).filter(
        MovimentacaoDB.id == movimentacao_id
    ).first()

    if movimentacao is None:
        raise HTTPException(
            status_code=404,
            detail="Movimentação não encontrada."
        )

    banco.delete(movimentacao)
    banco.commit()

    return {
        "mensagem": "Movimentação excluída com sucesso."
    }
@app.get("/resumo")
def resumo_financeiro(
    banco: Session = Depends(obter_banco)
):
    movimentacoes = banco.query(MovimentacaoDB).all()

    total_receitas = sum(
        movimentacao.valor
        for movimentacao in movimentacoes
        if movimentacao.tipo == "Receita"
    )

    total_despesas = sum(
        movimentacao.valor
        for movimentacao in movimentacoes
        if movimentacao.tipo == "Despesa"
    )

    saldo = total_receitas - total_despesas

    return {
        "total_receitas": total_receitas,
        "total_despesas": total_despesas,
        "saldo": saldo
    }
@app.get("/despesas-por-categoria")
def despesas_por_categoria(
    banco: Session = Depends(obter_banco)
):
    movimentacoes = banco.query(MovimentacaoDB).all()

    categorias = {}

    for movimentacao in movimentacoes:

        if movimentacao.tipo == "Despesa":

            categoria = movimentacao.categoria

            if categoria not in categorias:
                categorias[categoria] = 0

            categorias[categoria] += movimentacao.valor

    return categorias