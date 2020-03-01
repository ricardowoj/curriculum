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

app.get('/', (request, response) => {
    response.render('home')
})

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

app.get('/admin', (request, response, next) => {
    if(request.hostname == 'localhost'){
        next()
    } else {
        response.send("NOT ALLOWED")
    }
})

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

app.get('/admin/formacao', async(request, response) => {
    const db = await dbConnection
    const formacoes = await db.all('select * from formacoes;')
    response.render('admin/formacao-admin', { formacoes })
})

app.get('/admin/formacao/delete/:id', async(request, response) => {
    const db = await dbConnection
    await db.run('delete from formacoes where id = ' + request.params.id + '')
    response.redirect('/admin/formacao')
})

const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists experiencias (id INTEGER PRIMARY KEY, empresa TEXT, cargo TEXT, tempoCargo TEXT, descricao TEXT);')
    await db.run('create table if not exists formacoes (id INTEGER PRIMARY KEY, curso TEXT, periodo TEXT);')
}
init()

app.listen(port, (erro) => {
    if(erro){
        console.log('Não foi possível carregar o servidor...')
    }else{
        console.log('Servidor rodando...')
    }
})