const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
const express = require('express');
const app = express();

const admin = require('./firebase')  ;
const db = admin.database();



function criarTabela(dados) {
    let tabela = `<table class="table table-striped zebrado">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome do Talhao</th>
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

app.get('/', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/talhoes/talhoes.html', (e, dados) => {
                let tabela = "";
                const doctalhoes = db.ref("talhoes");
                doctalhoes.once("value", function(snapshot){
                    tabela = criarTabela(snapshot.val());
                    dados = dados.toString().replace("{tabela}", tabela);
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(cabecalho + dados + rodape);
                    res.end();
                });
            });
        });
    });
});


// Rota da página para abrir formulário para inserir um novo registro d
app.get('/novo', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/talhoes/novo_talhao.html', (e, dados) => {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(cabecalho + dados + rodape);
                res.end();
            });
        });
    });
});

// Rota da página inserir um novo registro de livro
app.post('/novo', urlencodedParser, (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/talhoes/talhoes.html', (e, dados) => {
                let mensagem = "";
                try{
                    const doctalhoes = db.ref("talhoes").push();
                    const talhoes = {
                        nome: req.body.nome,
                        longitude: req.body.longitude,
                        latitude: req.body.latitude,
                        area: req.body.area
                    };
                    doctalhoes.set(talhoes);
                    mensagem = "Talhão inserido com sucesso!";
                }catch(e){
                    mensagem = "Erro ao inserir o talhão!";
                }
                dados = dados.toString().replace("{mensagem}", mensagem);
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(cabecalho + dados + rodape);
                res.end();
            });
        });
    });
});

app.get('/editar/:id', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/talhoes/editar_talhoes.html', (e, dados) => {
                let id = req.params.id;
                const doctalhoes = db.ref("talhoes/"+id);
                doctalhoes.once("value", function(snapshot){
                    let nome = snapshot.val().nome;
                    let longitude = snapshot.val().longitude;
                    let latitude = snapshot.val().latitude;
                    let area = snapshot.val().area;
                    dados = dados.toString().replace("{nome}", nome);
                    dados = dados.toString().replace("{longitude}", longitude);
                    dados = dados.toString().replace("{latitude}", latitude);
                    dados = dados.toString().replace("{area}", area);
                    dados = dados.toString().replace("{id}", id);
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(cabecalho + dados + rodape);
                    res.end();
                });
            });
        });
    });
});


app.post('/editar', urlencodedParser, (req, res) => {
    let id = req.body.id;
    let nome = req.body.nome;
    let longitude = req.body.longitude;
    let latitude = req.body.latitude;
    let area = req.body.area;
    let doctalhoes = db.ref("talhoes");
    doctalhoes.child(id).update(
        {
            'nome': nome,
            'longitude': longitude,
            'latitude' : latitude,
            'area' : area
        }
    );
    res.redirect("/talhoes");
});

app.get('/excluir/:id', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/talhoes/excluir_talhao.html', (e, dados) => {
                let id = req.params.id;
                const doctalhoes = db.ref("talhoes/"+id);
                doctalhoes.once("value", function(snapshot){
                    let nome = snapshot.val().nome;
                    let longitude = snapshot.val().longitude;
                    let latitude = snapshot.val().latitude;
                    let area = snapshot.val().area;
                    dados = dados.toString().replace("{nome}", nome);
                    dados = dados.toString().replace("{longitude}", longitude);
                    dados = dados.toString().replace("{latitude}", latitude);
                    dados = dados.toString().replace("{area}", area);
                    dados = dados.toString().replace("{id}", id);
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(cabecalho + dados + rodape);
                    res.end();
                });
            });
        });
    });
});

app.post('/excluir', urlencodedParser, (req, res) => {
    let id = req.body.id;
    const doctalhoes = db.ref("talhoes/" + id);
    doctalhoes.remove();
    res.redirect("/talhoes");
});

module.exports = app;