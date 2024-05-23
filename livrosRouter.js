//teste att

const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const express = require('express');
const app = express();

const admin = require('./firebase');
const db = admin.database();

function criarTabela(dados) {
    let tabela = `<table class="table table-striped zebrado">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome do agricultor</th>
                            <th>email</th>
                            <th>senha</th>
                            <th>cpf</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>`;
    for (let chave in dados) {
        tabela += `<tr>
                        <td>${chave}</td>
                        <td>${dados[chave].nome}</td>
                        <td>${dados[chave].email}</td>
                        <td>${dados[chave].senha}</td>
                        <td>${dados[chave].cpf}</td>
                        <td>
                            <a class="btn btn-outline-warning" href="/agricultor/editar/${chave}">Alterar</a>
                        </td>
                        <td>
                            <a class="btn btn-outline-danger" href="/agricultor/excluir/${chave}">Excluir</a>
                        </td>
                    </tr>`;
    }
    tabela += `</tbody >
            </table > `;
    return tabela;
}


// Rota da página que exibe os agricultor registrados no banco de dados
app.get('/', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/agricultor/agricultor.html', (e, dados) => {
                let tabela = "";
                let mensagem = "";
                const docagricultor = db.ref("agricultor");
                docagricultor.once("value", function (snapshot) {
                    tabela = criarTabela(snapshot.val());
                    dados = dados.toString().replace("{tabela}", tabela);
                    if (req.query.acao) {
                        let acao = req.query.acao;
                        if (req.query.status) {
                            let status = req.query.status;
                            if (acao == "inserir" && status == "true")
                                mensagem = "Agricultor inserido com sucesso !"
                            else if (acao == "inserir" && status == "false")
                                mensagem = "Erro ao inserir Agricultor!";

                            if (acao == "editar" && status == "true")
                                mensagem = "Agricultor editado com sucesso !"
                            else if (acao == "editar" && status == "false")
                                mensagem = "Erro ao editar Agricultor!";

                            if (acao == "excluir" && status == "true")
                                mensagem = "Agricultor excluido com sucesso !"
                            else if (acao == "excluir" && status == "false")
                                mensagem = "Erro ao excluir Agricultor!";

                        }
                    }

                    dados = dados.toString().replace("{mensagem}", mensagem);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(cabecalho + dados + rodape);
                    res.end();
                });
            });
        });
    });
});

// Rota da página para abrir formulário para inserir um novo registro de agricultor
app.get('/novo', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/agricultor/novo_agricultor.html', (e, dados) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(cabecalho + dados + rodape);
                res.end();
            });
        });
    });
});

// Rota da página inserir um novo registro de agricultor
app.post('/novo', urlencodedParser, (req, res) => {
    try {
        const docagricultor = db.ref("agricultor").push();
        const agricultor = {
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
            cpf: req.body.cpf,
            status: "true"
        };
        docagricultor.set(agricultor);
        res.redirect("/Agricultor/?acao=inserir&status=true");
    } catch (e) {
        console.log(e);
        res.redirect("/Agricultor/?acao=inserir&status=false");
    }
});

// Rota da página para abrir formuário para editar os dados de um registro de agricultor
app.get('/editar/:id', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/agricultor/editar_agricultor.html', (e, dados) => {
                let id = req.params.id;
                const docagricultor = db.ref("agricultor/" + id)
                docagricultor.once("value", function (snapshot) {
                    let nome = snapshot.val().nome;
                    let email = snapshot.val().email;
                    let senha = snapshot.val().senha;
                    let cpf = snapshot.val().cpf;

                    dados = dados.toString().replace("{nome}", nome);
                    dados = dados.toString().replace("{email}", email);
                    dados = dados.toString().replace("{senha}", senha);
                    dados = dados.toString().replace("{cpf}", cpf);
                    dados = dados.toString().replace("{id}", id);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(cabecalho + dados + rodape);
                    res.end();
                })

            });
        });
    });
});

// Rota da página para editar os dados de um registro de agricultor
app.post('/editar', urlencodedParser, (req, res) => {
    try {
        let id = req.body.id;
        let nome = req.body.nome;
        let email = req.body.email;
        let senha = req.body.senha;
        let cpf = req.body.cpf;
        let docagricultor = db.ref("agricultor");
        docagricultor.child(id).update(
            {
                'nome': nome,
                'email': email,
                'senha': senha,
                'cpf': cpf
            }
        );

        res.redirect("/agricultor/?acao=editar&status=true")
    } catch (e) {
        console.log(e)
        res.redirect("/agricultor/?acao=editar&status=false")
    }
});

// Rota da página para abrir formulário para excluir um registro de um agricultor
app.get('/excluir/:id', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/agricultor/excluir_agricultor.html', (e, dados) => {
                let id = req.params.id;
                const docagricultor = db.ref("agricultor/" + id)
                docagricultor.once("value", function (snapshot) {
                    let nome = snapshot.val().nome;
                    let email = snapshot.val().email;
                    let senha = snapshot.val().senha;
                    let cpf = snapshot.val().cpf;

                    dados = dados.toString().replace("{nome}", nome);
                    dados = dados.toString().replace("{email}", email);
                    dados = dados.toString().replace("{senha}", senha);
                    dados = dados.toString().replace("{cpf}", cpf);
                    dados = dados.toString().replace("{id}", id);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(cabecalho + dados + rodape);
                    res.end();
                })
            });
        });
    });
});

// Rota da página para excluir um registro de um agricultor
app.post('/excluir', urlencodedParser, (req, res) => {
    try {
        let id = req.body.id;
        const docagricultor = db.ref("agricultor/" + id);
        docagricultor.remove();
        res.redirect("/agricultor/?acao=excluir&status=true");
    } catch (e) {
        console.log(e)
        res.redirect("/agricultor/?acao=excluir&status=false")
    }
});


module.exports = app;