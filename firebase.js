var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://projetocrud-469bd-default-rtdb.firebaseio.com"
});

module.exports =  admin;