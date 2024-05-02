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
                            <th>Nome do talhao</th>
                            <th>longitude</th>
                            <th>latitude</th>
                            <th>area</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>`;
    for (let chave in dados) {
        tabela += `<tr>
                        <td>${chave}</td>
                        <td>${dados[chave].nome}</td>
                        <td>${dados[chave].longitude}</td>
                        <td>${dados[chave].latitude}</td>
                        <td>${dados[chave].area}</td>
                        <td>
                            <a class="btn btn-outline-warning" href="/talhoes/editar/${chave}">Alterar</a>
                        </td>
                        <td>
                            <a class="btn btn-outline-danger" href="/talhoes/excluir/${chave}">Excluir</a>
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
            fs.readFile('src/talhoes/talhoes.html', (e, dados) => {
                let tabela = "";
                let mensagem = "";
                const doctalhoes = db.ref("talhoes");
                doctalhoes.once("value", function (snapshot) {
                    tabela = criarTabela(snapshot.val());
                    dados = dados.toString().replace("{tabela}", tabela);
                    if (req.query.acao) {
                        let acao = req.query.acao;
                        if (req.query.status) {
                            let status = req.query.status;
                            if (acao == "inserir" && status == "true")
                                mensagem = "Talhão inserido com sucesso !"
                            else if (acao == "inserir" && status == "false")
                                mensagem = "Erro ao inserir talhao!";

                            if (acao == "editar" && status == "true")
                                mensagem = "Talhao editado com sucesso !"
                            else if (acao == "editar" && status == "false")
                                mensagem = "Erro ao editar talhao!";

                            if (acao == "excluir" && status == "true")
                                mensagem = "talhao excluido com sucesso !"
                            else if (acao == "excluir" && status == "false")
                                mensagem = "Erro ao excluir talhao!";

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
            fs.readFile('src/talhoes/novo_talhao.html', (e, dados) => {
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
        const doctalhoes = db.ref("talhoes").push();
        const talhoes = {
            nome: req.body.nome,
            longitude: req.body.longitude,
            latitude: req.body.latitude,
            area: req.body.area,
            status: "true"
        };
        doctalhoes.set(talhoes);
        res.redirect("/talhoes/?acao=inserir&status=true");
    } catch (e) {
        console.log(e);
        res.redirect("/tahoes/?acao=inserir&status=false");
    }
});

// Rota da página para abrir formuário para editar os dados de um registro de agricultor
app.get('/editar/:id', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/talhoes/editar_talhoes.html', (e, dados) => {
                let id = req.params.id;
                const doctalhoes = db.ref("talhoes/" + id)
                doctalhoes.once("value", function (snapshot) {
                    let nome = snapshot.val().nome;
                    let longitude = snapshot.val().longitude;
                    let latitude = snapshot.val().latitude;
                    let area = snapshot.val().area;

                    dados = dados.toString().replace("{nome}", nome);
                    dados = dados.toString().replace("{longitude}", longitude);
                    dados = dados.toString().replace("{latitude}", latitude);
                    dados = dados.toString().replace("{area}", area);
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
        let longitude = req.body.longitude;
        let latitude = req.body.latitude;
        let area = req.body.area;
        let doctalhoes = db.ref("talhoes");
        doctalhoes.child(id).update(
            {
                'nome': nome,
                'email': longitude,
                'senha': latitude,
                'cpf': area
            }
        );

        res.redirect("/talhoes/?acao=editar&status=true")
    } catch (e) {
        console.log(e)
        res.redirect("/talhoes/?acao=editar&status=false")
    }
});

// Rota da página para abrir formulário para excluir um registro de um agricultor
app.get('/excluir/:id', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/talhoes/excluir_talhao.html', (e, dados) => {
                let id = req.params.id;
                const doctalhoes = db.ref("talhoes/" + id)
                doctalhoes.once("value", function (snapshot) {
                    let nome = snapshot.val().nome;
                    let longitude = snapshot.val().longitude;
                    let latitude = snapshot.val().latitude;
                    let area = snapshot.val().area;

                    dados = dados.toString().replace("{nome}", nome);
                    dados = dados.toString().replace("{longitude}", longitude);
                    dados = dados.toString().replace("{latitude}", latitude);
                    dados = dados.toString().replace("{area}", area);
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
        const doctalhoes = db.ref("talhoes/" + id);
        doctalhoes.remove();
        res.redirect("/talhoes/?acao=excluir&status=true");
    } catch (e) {
        console.log(e)
        res.redirect("/talhoes/?acao=excluir&status=false")
    }
});


module.exports = app;