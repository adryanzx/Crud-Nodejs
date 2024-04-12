const fs = require('fs');
const bodyParser = require('body-parser') ;
const urlencodedParser = bodyParser.urlencoded({extended: true});
const express = require('express');
const app = express();

const admin = require('./firebase') ;
const db = admin.database();

function criarTabela(dados) {
    let tabela = `<table class="table table-striped zebrado">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Marca da maquina</th>
                            <th>modelo</th>
                            <th>placa</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>`;
    for (let chave in dados) {
        tabela += `<tr>
                        <td>${chave}</td>
                        <td>${dados[chave].marca}</td>
                        <td>${dados[chave].modelo}</td>
                        <td>${dados[chave].placa}</td>
                        <td>
                            <a class="btn btn-outline-warning" href="/maquina/editar/${chave}">Alterar</a>
                        </td>
                        <td>
                            <a class="btn btn-outline-danger" href="/maquina/excluir/${chave}">Excluir</a>
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
            fs.readFile('src/maquina/maquina.html', (e, dados) => {
                let tabela = "";
                const docmaquina = db.ref("maquina");
                docmaquina.once("value", function(snapshot){
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


app.get('/', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/maquina/maquina.html', (e, dados) => {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(cabecalho + dados + rodape);
                res.end();
            });
        });
    });
});


app.get('/novo', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/maquina/nova_maquina.html', (e, dados) => {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(cabecalho + dados + rodape);
                res.end();
            });
        });
    });
});


app.post('/novo', urlencodedParser, (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/maquina/maquina.html', (e, dados) => {
                let mensagem = "";
                try{
                    const docmaquina = db.ref("maquina").push();
                    const maquina = {
                        marca: req.body.marca,
                        modelo: req.body.modelo,
                        placa: req.body.placa


                    };
                    docmaquina.set(maquina);
                    mensagem = "maquina inserida com sucesso!";
                }catch(e){
                    mensagem = "Erro ao inserir a maquina!";
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
            fs.readFile('src/maquina/editar_maquina.html', (e, dados) => {
                let id = req.params.id;
                const docmaquina = db.ref("maquina/"+id);
                docmaquina.once("value", function(snapshot){
                    let marca = snapshot.val().marca;
                    let modelo = snapshot.val().modelo;
                    let placa = snapshot.val().placa;
                    dados = dados.toString().replace("{marca}", marca);
                    dados = dados.toString().replace("{modelo}", modelo);
                    dados = dados.toString().replace("{placa}", placa);
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
    let marca = req.body.marca;
    let modelo = req.body.modelo;
    let placa = req.body.placa;
    let docmaquina = db.ref("maquina");
    docmaquina.child(id).update(
        {
            'marca': marca,
            'modelo': modelo,
            'placa' : placa
        }
    );
    res.redirect("/maquina");
});
app.get('/excluir/:id', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/maquina/excluir_maquina.html', (e, dados) => {
                let id = req.params.id;
                const docmaquina = db.ref("maquina/"+id);
                docmaquina.once("value", function(snapshot){
                    let marca = snapshot.val().marca;
                    let modelo = snapshot.val().modelo;
                    let placa= snapshot.val().placa;
                    dados = dados.toString().replace("{marca}", marca);
                    dados = dados.toString().replace("{modelo}", modelo);
                    dados = dados.toString().replace("{placa}", placa);
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
    const docmaquina = db.ref("maquina/" + id);
    docmaquina.remove();
    res.redirect("/maquina");
});

module.exports = app;