import { PrismaClient } from '@prisma/client'
import { ErroDeValidacao, ErroDeOperacao } from './tarefas-bd-erros.js'

const prisma = new PrismaClient()

// CRUD - Read

export async function obterTarefas() {
  return await prisma.tarefa.findMany()
}

// CRUD - Read

export async function obterTarefa(id) {
  const tarefa = prisma.tarefa.findUnique({
    where: { id }
  })

  if (!tarefa) {
    throw new ErroDeOperacao('Tarefa não encontrada')
  }
  return tarefa
}

// CRUD - Create

export async function criarTarefa(tarefa) {
  const { descricao, completa } = tarefa

  if (typeof descricao !== 'string' || descricao.trim() === "") {
    throw new ErroDeValidacao('O campo "descricao" é obrigatório e deve ser uma string.')
  }

  if (typeof completa !== 'boolean' && completa !== undefined) {
    throw new ErroDeValidacao('O campo "completa" deve ser boolean.')
  }

  const novaTarefa =  await prisma.tarefa.create({
    data: {
      descricao,
      completa: !!completa
    }
  })

  return novaTarefa
}

// CRUD - Update

export async function atualizarTarefa(id, tarefa) {
  const { descricao, completa } = tarefa

  const tarefaExistente = await prisma.tarefa.findUnique({
    where: { id }
  })

  if (!tarefaExistente) {
    throw new ErroDeOperacao('Tarefa não encontrada')
  }

  if ((typeof descricao !== 'string' && descricao !== undefined) || descricao?.trim() === "") {
    throw new ErroDeValidacao('O campo "descricao" é obrigatório e deve ser uma string.')
  }

  if (typeof completa !== 'boolean' && completa !== undefined) {
    throw new ErroDeValidacao('O campo "completa" deve ser boolean.')
  }

  const tarefaAlterada = await prisma.tarefa.update({
    data: {
      descricao: descricao ?? tarefaExistente.descricao,
      completa: completa ?? tarefaExistente.completa,
    },
    where: { id }
  })

  return tarefaAlterada
}

// CRUD - Delete

export async function apagarTarefa(id) {
  const tarefaExistente = await prisma.tarefa.findUnique({
    where: { id }
  })

  if (!tarefaExistente) {
    throw new ErroDeOperacao('Tarefa não encontrada')
  }

  const tarefaApagada = await prisma.tarefa.delete({
    where: { id: tarefaExistente.id }
  })

  return tarefaApagada
}
