//Import Modules
const mosca = require('mosca');
var mysql = require('mysql');
require('dotenv').config()

//SQL
var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  });
  
const query = (data) => {
    con.connect((err) => {
        if (err) throw err;
        console.log("Connected!");


        con.query("CREATE DATABASE testdb", (err, result) => {
            if (err) throw err;
            console.log("Database created");
            });
    });
}
  

var settings = {
    port: 1883,
    http: {
        port: 8883
    }
};
var server = new mosca.Server(settings);
function setup() {
    server.authenticate = authenticate;
    console.log('Mosca server is up and running (auth)');
}
var authenticate = function (client, username, password, callback) {
    var authorized = (username == 'mqtt' && password == 'password');
    if(authorized) client.user = username;
    callback(null, authorized);
}
server.on('ready',setup);
server.on('clientConnected', (client)=>{
    console.log('Client Connected:',client.id);
});
server.on('clientDisconnected', (client)=>{
    console.log('Client Disconnected:',client.id);
});
server.on('published', (packet,client)=>{
    //console.log(packet)
    if(packet.topic.substring(packet.topic.length-7)!='clients'){
        console.log('Published', packet.payload.toString());
        const payload = JSON.parse(packet.payload.toString());
        console.log('B: ',payload);
    }
});