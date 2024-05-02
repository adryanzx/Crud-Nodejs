const fs = require("fs");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const express = require("express");
const app = express();

const admin = require("./firebase");
const db = admin.database();

function criarTabela(dados) {
  let tabela = `<table class="table table-striped zebrado">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome do produto</th>
                            <th>descricao</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>`;
  for (let chave in dados) {
    tabela += `<tr>
                        <td>${chave}</td>
                        <td>${dados[chave].nome}</td>
                        <td>${dados[chave].descricao}</td>
                        <td>
                            <a class="btn btn-outline-warning" href="/produto/editar/${chave}">Alterar</a>
                        </td>
                        <td>
                            <a class="btn btn-outline-danger" href="/produto/excluir/${chave}">Excluir</a>
                        </td>
                    </tr>`;
  }
  tabela += `</tbody >
            </table > `;
  return tabela;
}

app.get("/", (req, res) => {
  fs.readFile("src/cabecalho.html", (e, cabecalho) => {
    fs.readFile("src/rodape.html", (e, rodape) => {
      fs.readFile("src/produto/produto.html", (e, dados) => {
        let tabela = "";
        let mensagem = "";

        const docproduto = db.ref("produto");
        docproduto.once("value", function (snapshot) {
          tabela = criarTabela(snapshot.val());
          dados = dados.toString().replace("{tabela}", tabela);
          if (req.query.acao) {
            let acao = req.query.acao;

            if (req.query.status) {
              let status = req.query.status;
              if (acao == "inserir" && status == "true") {
                mensagem = "Produto inserido com sucesso!";
              } else if (acao == "inserir" && status == "false") {
                mensagem = "Erro ao inserir o produto!";
              }

              //editar
              if (acao == "editar" && status == "true") {
                mensagem = "Produto editado com sucesso!";
              } else if (acao == "editar" && status == "false") {
                mensagem = "Erro ao editar o produto!";
              }

              //excluir
              if (acao == "excluir" && status == "true") {
                mensagem = "Produto excluido com sucesso!";
              } else if (acao == "excluir" && status == "false") {
                mensagem = "Erro ao excluir o Produto!";
              }
            }
          }
          dados = dados.toString().replace("{mensagem}", mensagem);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(cabecalho + dados + rodape);
          res.end();
        });
      });
    });
  });
});

app.get("/novo", (req, res) => {
  fs.readFile("src/cabecalho.html", (e, cabecalho) => {
    fs.readFile("src/rodape.html", (e, rodape) => {
      fs.readFile("src/produto/novo_produto.html", (e, dados) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(cabecalho + dados + rodape);
        res.end();
      });
    });
  });
});

app.post("/novo", urlencodedParser, (req, res) => {
  try {
    const docproduto = db.ref("produto").push();
    const produto = {
      nome: req.body.nome,
      descricao: req.body.descricao,
    };
    docproduto.set(produto);
    res.redirect("/produto/?acao=inserir&status=true");
  } catch (e) {
    res.redirect("/produto/?acao=inserir&status=false");
  }
});

app.get("/editar/:id", (req, res) => {
  fs.readFile("src/cabecalho.html", (e, cabecalho) => {
    fs.readFile("src/rodape.html", (e, rodape) => {
      fs.readFile("src/produto/editar_produto.html", (e, dados) => {
        let id = req.params.id;
        const docproduto = db.ref("produto/" + id);
        docproduto.once("value", function (snapshot) {
          let nome = snapshot.val().nome;
          let descricao = snapshot.val().descricao;

          dados = dados.toString().replace("{nome}", nome);
          dados = dados.toString().replace("{descricao}", descricao);
          dados = dados.toString().replace("{id}", id);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(cabecalho + dados + rodape);
          res.end();
        });
      });
    });
  });
});

// Rota da página para editar os dados de um registro de livro
app.post("/editar", urlencodedParser, (req, res) => {
  try {
    let id = req.body.id;
    let nome = req.body.nome;
    let descricao = req.body.descricao;
    let docproduto = db.ref("produto");
    docproduto.child(id).update({
      nome: nome,
      descricao: descricao,
    });
    res.redirect("/produto/?acao=editar&status=true");
  } catch (e) {
    res.redirect("/produto/?acao=editar&status=false");
  }
});

// Rota da página para abrir formulário para excluir um registro de um livro
app.get("/excluir/:id", (req, res) => {
  fs.readFile("src/cabecalho.html", (e, cabecalho) => {
    fs.readFile("src/rodape.html", (e, rodape) => {
      fs.readFile("src/produto/excluir_produto.html", (e, dados) => {
        let id = req.params.id;
        const docproduto = db.ref("produto/" + id);
        docproduto.once("value", function (snapshot) {
          let nome = snapshot.val().nome;
          let descricao = snapshot.val().descricao;

          dados = dados.toString().replace("{nome}", nome);
          dados = dados.toString().replace("{descricao}", descricao);
          dados = dados.toString().replace("{id}", id);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(cabecalho + dados + rodape);
          res.end();
        });
      });
    });
  });
});

// Rota da página para excluir um registro de um livro
app.post("/excluir", urlencodedParser, (req, res) => {
  try {
    let id = req.body.id;
    const docproduto = db.ref("produto/" + id);
    docproduto.remove();
    res.redirect("/produto/?acao=excluir&status=true");
  } catch (e) {
    res.redirect("/produto/?acao=excluir&status=false");
  }
});

module.exports = app;
