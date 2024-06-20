//teste att
const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: true});
const express = require('express');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 5000;

app.use(session({
    'secret' : 'adosaipoda9989ahu8uijjsd',
    'resave' : false,
    'saveUninitialized' : true,
    'cookie': {secure: false}
}));

const admin = require("./firebase");
const db = admin.database();

async function verificarToken(token){
    let status;
    await admin.auth().verifyIdToken(token)
        .then((decodedToken) => {
            status = true;
        })
        .catch((error) => {
            status = false;
        });
    return status;
}

// Inicia o servidor na porta especificada
app.listen(port, () => console.log(`Server iniciado na porta ${port}`));

// Rota da página de formulário de login
app.get('/', (req, res) => {
    fs.readFile('src/login.html', (e, dados) =>  {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(dados);
        res.end();
    });
});

// Rota da página principal
app.get('/acessar', (req, res) => {
    let token = req.query.token;
    if (verificarToken(token)){
        req.session.authToken = token;
        res.redirect("/home");
    }else {
        res.redirect("/acesso-negado")
    }
});

//Rota para cadastrar usuario
app.get('/cadastrar', (req, res) => {
    fs.readFile('src/cadastrar.html', (e, dados) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(dados);
        res.end();
    })
});

// Rota da página de logout
app.get('/sair', (req, res) => {
    delete req.session.authToken;
    res.redirect('/');  
});

// Rota da página inicial
app.get('/home', (req, res) => {
    if (req.session.authToken){
    fs.readFile('src/cabecalho.html', (e, cabecalho) => {
        fs.readFile('src/rodape.html', (e, rodape) => {
            fs.readFile('src/index.html', (e, dados) => {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(cabecalho + dados + rodape);
                res.end();
            });
        });
    });
}else{
    res.redirect('acesso-negado')
}
});

const livrosRouter = require("./livrosRouter");
app.use("/Agricultor", livrosRouter);

const produtoRouter = require("./produtoRouter");
app.use("/Produto", produtoRouter);

const propriedadeRouter = require("./propriedadeRouter");
app.use("/Propriedade", propriedadeRouter);

const maquinaRouter = require("./maquinaRouter");
app.use("/maquina", maquinaRouter);

const culturaRouter = require("./culturaRouter");
app.use("/cultura", culturaRouter);

const talhoesRouter = require("./talhoesRouter");
app.use("/talhoes", talhoesRouter);

const safraRouter = require("./safraRouter");
app.use("/safra", safraRouter);








