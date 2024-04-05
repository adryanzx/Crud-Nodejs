const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert('./serviceAccountKey.json'),
    databaseURL: "https://projetocrud-469bd-default-rtdb.firebaseio.com"
});

module.exports = admin;