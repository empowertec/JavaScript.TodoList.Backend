import express from 'express'
import cors from 'cors'
import { lerTarefas, gravarTarefas } from './tarefas.js'
import * as bancoDeDados from './tarefas.js'
import passport from 'passport'
import session from 'express-session'
import { Strategy as GitHubStrategy } from 'passport-github2'
import configuracao from './configuracao.js'

const app = express()

app.use(cors({ origin: configuracao.corsOrigin.split(','), credentials: true }))
app.use(express.json())

app.use(session({
  secret: configuracao.sessionSecret,
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new GitHubStrategy({
  clientID: configuracao.githubClientID,
  clientSecret: configuracao.githubClientSecret,
  callbackURL: configuracao.githubCallbackURL
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile)
}))

passport.serializeUser((user, done) => {
  done(null, { usuario: user.displayName })
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }))

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  (request, response) => {
    response.redirect(configuracao.authRedirect || '/usuario')
  }
)

app.get('/logout', (request, response, next) => {
  request.logout(function (err) {
    if (err) { return next(err) }
    response.redirect('/')
  })
})

function validarAutenticacao(request, response, next) {
  if (!configuracao.githubClientSecret) {
    console.warn('A autenticação com o GitHub não está configurada.')
    return next()
  }
  if (request.isAuthenticated()) {
    return next()
  }
  response.status(401).json({ error: 'Não autenticado com GitHub' })
}

app.get('/usuario', validarAutenticacao, (request, response) => response.json(request.user))

app.get('/', (request, response) => response.send('Olá Tarefas'))

app.get('/tarefas', validarAutenticacao, async (request, response) => {
  try {
    const tarefas = await bancoDeDados.obterTarefas()
    response.json(tarefas)
  } catch (error) {
    if (error instanceof bancoDeDados.ErroDeBancoDeDados) {
      return response.status(404).json({ error: error.message })  
    }
    response.status(500).json({ error: 'Erro ao obter tarefas' })
  }
})

app.get('/tarefa/:id', validarAutenticacao, async (request, response) => {
  try {
    const tarefa = await bancoDeDados.obterTarefa(request.params.id)
    response.json(tarefa)
  } catch (error) {
    if (error instanceof bancoDeDados.ErroDeBancoDeDados) {
      return response.status(404).json({ error: error.message })  
    }
    response.status(500).json({ error: 'Erro ao obter a tarefa' })
  }
})

app.post('/tarefa', validarAutenticacao, async (request, response) => {
  try {
    const novaTarefa = await bancoDeDados.criarTarefa(request.body)
    response.status(201).json(novaTarefa)
  } catch (error) {
    if (error instanceof bancoDeDados.ErroDeBancoDeDados) {
      return response.status(400).json({ error: error.message })  
    }
    response.status(500).json({ error: 'Erro ao criar tarefa' })
  }
})

app.put('/tarefa/:id', validarAutenticacao, async (request, response) => {
  try {
    const { descricao, completa } = request.body
    const tarefas = await lerTarefas()
    const index = tarefas.findIndex(t => t.id === request.params.id)

    if (index === -1) {
      return response.status(404).json({ error: 'Tarefa não encontrada' })
    }

    if (typeof descricao !== 'string' || descricao.trim() === "") {
      return response.status(400).json({ error: 'O campo "descricao" é obrigatório e deve ser uma string.' })
    }

    if (typeof completa !== 'boolean' && completa !== undefined) {
      return response.status(400).json({ error: 'O campo "completa" deve ser boolean.' })
    }

    if (descricao !== undefined) {
      tarefas[index].descricao = descricao
    }

    if (completa !== undefined) {
      tarefas[index].completa = completa
    }

    await gravarTarefas(tarefas)

    response.json(tarefas[index])
  } catch (error) {
    response.status(500).json({ error: 'Erro ao atualizar a tarefa' })
  }
})

app.delete('/tarefa/:id', validarAutenticacao, async (request, response) => {
  try {
    const tarefas = await lerTarefas()
    const index = tarefas.findIndex(t => t.id === request.params.id)

    if (index === -1) {
      return response.status(404).json({ error: 'Tarefa não encontrada' })
    }

    tarefas.splice(index, 1)

    await gravarTarefas(tarefas)

    response.status(204).send()
  } catch (error) {
    response.status(500).json({ error: 'Erro ao deletar a tarefa' })
  }
})

app.patch('/tarefa/:id/completa', validarAutenticacao, async (request, response) => {
  try {
    const tarefas = await lerTarefas()
    const index = tarefas.findIndex(t => t.id === request.params.id)

    if (index === -1) {
      return response.status(404).json({ error: 'Tarefa não encontrada' })
    }

    tarefas[index].completa = true

    await gravarTarefas(tarefas)

    response.json(tarefas[index])
  } catch (error) {
    response.status(500).json({ error: 'Erro ao marcar a tarefa como completa' })
  }
})

app.patch('/tarefa/:id/incompleta', validarAutenticacao, async (request, response) => {
  try {
    const tarefas = await lerTarefas()
    const index = tarefas.findIndex(t => t.id === request.params.id)

    if (index === -1) {
      return response.status(404).json({ error: 'Tarefa não encontrada' })
    }

    tarefas[index].completa = false

    await gravarTarefas(tarefas)

    response.json(tarefas[index])
  } catch (error) {
    response.status(500).json({ error: 'Erro ao marcar a tarefa como incompleta' })
  }
})

function iniciar(port) {
  app.listen(port, () => console.log(`Aplicação executando em http://localhost:${port}/`))
}

export default {
  iniciar,
  express: app,
}