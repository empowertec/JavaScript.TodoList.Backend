import { promises as fs } from 'fs'

const arquivo = 'src/lista-de-tarefas.json'

export async function lerTarefas() {
  try {
    const data = await fs.readFile(arquivo)
    return JSON.parse(data)
  } catch (error) {
    console.error(`Erro ao ler o arquivo ${arquivo}:`, error)
    return []
  }
}

export async function gravarTarefas(tarefas) {
  try {
    await fs.writeFile(arquivo, JSON.stringify(tarefas, null, 2))
  } catch (error) {
    console.error(`Erro ao gravar no arquivo ${arquivo}:`, error)
  }
}

export class ErroDeBancoDeDados extends Error {}

// CRUD - Read

export async function obterTarefas() {
  return lerTarefas()
}

// CRUD - Read

export async function obterTarefa(id) {
  const tarefas = await lerTarefas()
  const tarefa = tarefas.find(t => t.id === id)
  if (!tarefa) {
    throw new ErroDeBancoDeDados('Tarefa não encontrada')
  }
  return tarefa
}

// CRUD - Create

export async function criarTarefa(tarefa) {
  const { descricao, completa } = tarefa

  if (typeof descricao !== 'string' || descricao.trim() === "") {
    throw new ErroDeBancoDeDados('O campo "descricao" é obrigatório e deve ser uma string.')
  }

  if (typeof completa !== 'boolean' && completa !== undefined) {
    throw new ErroDeBancoDeDados('O campo "completa" deve ser boolean.')
  }

  const novaTarefa = {
    id: Date.now().toString(),
    descricao,
    completa: !!completa
  }

  const tarefas = await lerTarefas()
  tarefas.push(novaTarefa)
  await gravarTarefas(tarefas)

  return novaTarefa
}

// CRUD - Update

export async function atualizarTarefa(id, tarefa) { }

// CRUD - Delete

export async function apagarTarefa(id) { }