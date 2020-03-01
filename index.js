const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const sqlite = require('sqlite')
const dbConnection = sqlite.open('banco.sqlite', { Promise })

app.set('view engine', 'ejs')
app.use(express.static('public'))
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

app.get('/admin', (request, response) => {
    response.render('admin/home-admin')
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

    //const curso = 'Análise e Desenvolvimento de Sistemas'
    //const periodo = 'Cursando o 2º período'

    //const empresa = 'Atento Brasil S/A'
    //const cargo = 'Analista de atendimento'
    //const tempoCargo = 'Agosto de 2015 - até dias atuais (4 anos e 8 meses)'
    //const descricao = ' Relatórios sobre as suas atividades mensais, participar de treinamentos e garantir a efetividade e aderência, realizar os lançamentos de dados de clientes e comerciais referentes aos contratos, elaboração do controle e acompanhamento de planilhas. Realização do atendimento ao cliente com qualidade, no prazo estabelecido, solucionando os problemas de maneira estrutural e contribuindo para que ele tenha a melhor experiência. Controle de contrato, análise crítica e performance de equipe.Responsável por programar e analisar indicadores orientando a equipe de atendimento, visando propor e analisar soluções.'

   //await db.run(`insert into experiencias(empresa, cargo, tempoCargo, descricao) values('${empresa}', '${cargo}', '${tempoCargo}', '${descricao}')`)
    //await db.run(`insert into formacoes(curso, periodo) values('${curso}', '${periodo}')`)
}
init()

app.listen(3000, (erro) => {
    if(erro){
        console.log('Não foi possível carregar o servidor...')
    }else{
        console.log('Servidor rodando...')
    }
})