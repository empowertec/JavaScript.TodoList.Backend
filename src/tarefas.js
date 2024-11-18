import * as erros from './tarefas-bd-erros.js'
import * as bancoDeDados from './tarefas-bd-prisma.js'

export const ErroDeBancoDeDados = erros.ErroDeBancoDeDados
export const ErroDeOperacao = erros.ErroDeOperacao
export const ErroDeValidacao = erros.ErroDeValidacao

export const obterTarefas = bancoDeDados.obterTarefas
export const obterTarefa = bancoDeDados.obterTarefa
export const criarTarefa = bancoDeDados.criarTarefa
export const atualizarTarefa = bancoDeDados.atualizarTarefa
export const apagarTarefa = bancoDeDados.apagarTarefa
