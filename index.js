//Import Modules
const mosca = require('mosca');
const express = require('express');
var mysql = require('mysql');
var config = require('./config');
require('dotenv').config();
const port = process.env.PORT || 3000;

//Connection
var db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});
var server = new mosca.Server(config.settings);
const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

db.connect(()=>{
    // db.query('SHOW DATABASES;',(err,res)=>{
    //     if(err){
    //         console.log(err)
    //     }else{
    //         console.log(res)
    //     }
    // });
    console.log('Database Connected!')
});

app.post('/',(req,res) =>{
    const data = {msg: "success"};
    const body = req.body;
    //console.log(req.body);
    const query = "INSERT INTO MqttProject.user (`firstname`, `lastname`, `province`)" + ` VALUES ('${body.name}','${body.surname}','${body.province}');`;
    //INSERT INTO `MqttProject`.`user` (`firstname`, `lastname`, `province`) VALUES ('no', 'one', 'Lampang');
    //console.log(query);
    db.query(query,(err,result)=>{
        if(err){
            res.json({msg:"There is error"});
        }
        else{
            //console.log(result);
            data.userid = result.insertId
            data.data = req.body
            res.json(data);
        }
    })
    
    //res.json(data)

});
app.listen(port, () => {
    console.log(`Start server at port ${port}.`);
})

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
server.on('clientConnected', (client) => {console.log('Client Connected:',client.id);});
server.on('clientDisconnected', (client) => {console.log('Client Disconnected:',client.id);});


server.on('published', (packet,client) => {
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
        query(topic, user_id, payload.data); 
        
    }
});

const query = (topic, user_id, payload) => {
        if(topic == "homeIsolation"){
            const query = `Insert into MqttProject.data values (${user_id}, ${payload.timestamp}, ${payload.temperature}, ${payload.o2}, ${payload.heartrate});`;
            //const query2 = 'select * from MqttProject.data;'
            console.log(query)
            db.query(query, (err, result) => {
                if(err) console.log(err);
                else console.log(result);
            });
        };
};