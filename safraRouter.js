const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const express = require('express');
const app = express();

const admin = require("./firebase");
const db = admin.database();

app.get('/', (req, res) => {
    fs.readFile('src/cabecalho.html', (e, cabecalho) =>{
        fs.readFile('src/rodape.html', (e, rodape) =>{
            fs.readFile('src/safra/safra.html', (e, dados) =>{
                res.writeHead(200, {"Content-Type": 'text/html'});
                res.write(cabecalho+dados+rodape);
                res.end();
            });
        });
    });
});

app.get('/novo', async (req,res) =>{
    const docsafra = db.ref("safra").push();
    const safra = {
        dataini: req.query.dataini,
        datafim: req.query.datafim,
        status: "aberto",
        tempo: ""
    };
    docsafra.set(safra);
    res.json({id : docsafra.key });
});

app.get('/cultura', async(req, res) => {
    const doccultura = db.ref("cultura");
    await doccultura.once("value", function(snapshot){
        const cultura = snapshot.val();
        return res.json(cultura);
    })
});

app.get("/cultura/:id", async (req, res) => {
    let cultura = req.params.id;
    const doccultura = db.ref("cultura/"+cultura);
    await doccultura.once("value", function(snapshot){
        cultura = snapshot.val();
        res.json(cultura);
    });
});

app.get("/adicionarcultura/:safraId/:culturaId/:culturaNome/:culturaTempo", async (req, res) => {
    let safraId = req.params.safraId;
    let culturaId = req.params.culturaId;
    let culturaNome = req.params.culturaNome;
    let culturaTempo = req.params.culturaTempo;
    const docsafra = db.ref("safra/"+safraId+"/cultura").push();
    const cultura = {
        id: culturaId,
        nome: culturaNome,
        cultura: culturaTempo
        
    }
    docsafra.set(cultura)
        .then(() => res.json({ sucesso: true }))
        .catch((error) => res.json({ sucesso: false }));
});

app.get('/excluircultura/:safraId/:culturaId', async (req, res) => {
    const safraId = req.params.safraId;
    const culturaId = req.params.culturaId;
    const docsafra = db.ref('safra/'+safraId+'/cultura/'+culturaId);
    docsafra.remove()
        .then( () => res.json({sucesso : true}) )
        .catch( (error) => res.json({sucesso: false}) );
});

app.get('/fechar/:idsafra', async (req, res) => {
    const idsafra = req.params.idsafra;
    const docsafra = db.ref('safra/'+idsafra);
    docsafra.once("value", (snapshot) => {
        const cultura = snapshot.val().cultura;
        if (cultura){
            let total = 0;
            Object.keys(cultura).forEach(culturaId => {
                const cultura = cultura[culturaId];
                const tempo = parseFloat(cultura.tempo);
                total += tempo;
            });
            docsafra.update({status: "Fechado", tempo: total})
                .then(() => res.json({sucesso: true}))
                .catch((error) => res.json({sucesso: false}));
        }
    });
});

module.exports = app;