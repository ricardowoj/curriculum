const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const path = require('path')

const sqlite = require('sqlite')
const dbConnection = sqlite.open(path.resolve(__dirname,'banco.sqlite'), { Promise })

const port = process.env.PORT || 3000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))

// VIEW Home
app.get('/', (request, response) => {
    response.render('home')
})

// VIEW Experiencias
app.get('/experiencias', async(request, response) => {
    const db = await dbConnection
    const experienciasDb = await db.all('select * from experiencias;')
    const experiencias = experienciasDb.map(cat => {
        return {
            ...cat
        }
    })
    response.render('experiencias', {
        experiencias
    })
})

// View Formacao
app.get('/formacao', async(request, response) => {
    const db = await dbConnection
    const formacoesDb = await db.all('select * from formacoes;')
    const formacoes = formacoesDb.map(cat => {
        return {
            ...cat
        }
    })
    response.render('formacao', {
        formacoes
    })
})

// View Admin
app.get('/admin', (request, response) => {
    if(request.hostname == 'localhost'){
        response.render('admin/home-admin')
    } else {
        response.send("NOT ALLOWED")
    }
})

// Views Admin - Experiencias
app.get('/admin/experiencias', async(request, response) => {
    const db = await dbConnection
    const experiencias = await db.all('select * from experiencias;')
    response.render('admin/experiencias-admin', { experiencias })
})
app.get('/admin/experiencias/delete/:id', async(request, response) => {
    const db = await dbConnection
    await db.run('delete from experiencias where id = ' + request.params.id + '')
    response.redirect('/admin/experiencias')
})
app.get('/admin/experiencia/nova', async(request, response) => {
    const db = await dbConnection
    const experiencias = await db.all('select * from experiencias;')
    response.render('admin/experiencia-nova', { experiencias })
})
app.post('/admin/experiencia/nova', async(request, response) => {
    const { empresa, cargo, tempoCargo, descricao } = request.body
    const db = await dbConnection
    await db.run(`insert into experiencias(empresa, cargo, tempoCargo, descricao) values('${empresa}', '${cargo}', '${tempoCargo}', '${descricao}')`)
    response.redirect('/admin/experiencias')
})
app.get('/admin/experiencia/delete/:id', async(request, response) => {
    const db = await dbConnection
    await db.run('delete from experiencias where id = ' + request.params.id + '')
    response.redirect('/admin/experiencias')
})
app.get('/admin/experiencia/editar/:id', async(request, response) => {
    const db = await dbConnection
    const experiencias = await db.get('select * from experiencias where id = '+request.params.id)
    response.render('admin/experiencia-editar', { experiencias })
})
app.post('/admin/experiencia/editar/:id', async(request, response) => {
    const { empresa, cargo, tempoCargo, descricao } = request.body
    const id = request.params.id
    const db = await dbConnection
    await db.run(`update experiencias set empresa = '${empresa}', cargo = '${cargo}', tempoCargo = '${tempoCargo}', descricao = '${descricao}' where id = ${id}`)
    response.redirect('/admin/experiencias')
})

// Views Admin - Formacoes
app.get('/admin/formacoes', async(request, response) => {
    const db = await dbConnection
    const formacoes = await db.all('select * from formacoes;')
    response.render('admin/formacoes-admin', { formacoes })
})
app.get('/admin/formacao/nova', async(request, response) => {
    const db = await dbConnection
    const formacoes = await db.all('select * from formacoes;')
    response.render('admin/formacao-nova', { formacoes })
})
app.post('/admin/formacao/nova', async(request, response) => {
    const { escola, curso, periodo, data } = request.body
    const db = await dbConnection
    await db.run(`insert into formacoes(escola, curso, periodo, data) values('${escola}', '${curso}', '${periodo}', '${data}')`)
    response.redirect('/admin/formacoes')
})
app.get('/admin/formacao/delete/:id', async(request, response) => {
    const db = await dbConnection
    await db.run('delete from formacoes where id = ' + request.params.id + '')
    response.redirect('/admin/formacoes')
})
app.get('/admin/formacao/editar/:id', async(request, response) => {
    const db = await dbConnection
    const formacoes = await db.get('select * from formacoes where id = '+request.params.id)
    response.render('admin/formacao-editar', { formacoes })
})
app.post('/admin/formacao/editar/:id', async(request, response) => {
    const { escola, curso, periodo, data } = request.body
    const id = request.params.id
    const db = await dbConnection
    await db.run(`update formacoes set escola = '${escola}', curso = '${curso}', periodo = '${periodo}', data = '${data}' where id = ${id}`)
    response.redirect('/admin/formacoes')
})

// Create Table
const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists experiencias (id INTEGER PRIMARY KEY, empresa TEXT, cargo TEXT, tempoCargo TEXT, descricao TEXT);')
    await db.run('create table if not exists formacoes (id INTEGER PRIMARY KEY, escola TEXT not null, curso TEXT not null, periodo TEXT, data TEXT);')
}

// Init
init()

app.listen(port, (erro) => {
    if(erro){
        console.log('Não foi possível carregar o servidor...')
    }else{
        console.log('Servidor rodando...')
    }
})