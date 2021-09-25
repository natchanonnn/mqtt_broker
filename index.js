//Import Modules
const mosca = require('mosca');
var mysql = require('mysql');
var config = require('./config')
require('dotenv').config();

//Connection
var db = mysql.createConnection(config.connection);
var server = new mosca.Server(config.settings);

function setup() {
    server.authenticate = authenticate;
    console.log('Mosca server is up and running (auth)');
}

var authenticate = (client, username, password, callback) => {
    var authorized = (username == 'mqtt' && password == 'password');
    if(authorized) client.user = username;
    callback(null, authorized);
}

server.on('ready',setup);
server.on('clientConnected', (client)=>{console.log('Client Connected:',client.id);});
server.on('clientDisconnected', (client)=>{console.log('Client Disconnected:',client.id);});


server.on('published', (packet,client)=>{
    //console.log(packet)
    const topic = packet.topic;
    if(packet.topic.substring(packet.topic.length-7)!='clients'){
        console.log('Published', packet.payload.toString());
        const payload = JSON.parse(packet.payload.toString());
        const user_id = client.id;
        const topic = packet.topic;
        console.log('Payload: ',payload);
        console.log('User ID: ',user_id);
        console.log('Topic :',topic);
        query(topic,user_id,payload.data);
    }
});

const query = (topic, user_id, payload) => {
    db.connect((err) => { if(err) throw err;
        if(topic == "homeIsolation"){
            const query = `Insert into MqttProject.data values (${user_id}, ${payload.timestamp}, ${payload.temperature}, ${payload.o2}, ${payload.heartrate})`;
            db.query(query, (err, result) => {
                if(err) throw err;
                console.log(result);
            });
        }
    });
};