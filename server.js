const webSocket = require('ws')
const http = require('http')
const url = require('url')


const application = http.createServer();

const wsServer = new webSocket.Server({noServer : true})

const systemUsers = [
    {id : 1 ,  token : 12345 ,               name :"hatem mohamed"},
    {id : 2 ,  token : 123456 ,              name :"sara hassan"},
    {id : 3 ,  token : 1234567 ,             name :"yara ahmed"},
    {id : 4 ,  token : 12345678 ,            name :"yasser ali"},
    {id : 5 ,  token : 123456789 ,           name :"ibrahim hosny"},
    {id : 6 ,  token : 12345678910 ,         name :"aya naser"},
    {id : 7 ,  token : 1234567891011 ,       name :"zizo hassan"},
    {id : 8 ,  token : 123456789101112 ,     name :"tawfeek ahmed"},
    {id : 9 ,  token : 12345678910111213 ,   name :"abeer ahmed"},
    {id : 10 , token : 1234567891011121314 , name :"heba samir"}
];



const onlineUsers = []


const NOTIFICATION_CHANNEL = 'notification';
const CHAT_CHANNEL = 'chat';
const BROADCAST_CHANNEL = 'broadcast';


wsServer.on('connection', function connection(socket){

    socket.on('message',function incommingMessage(message){
        let parsed_message = JSON.parse(message)

        switch(parsed_message.channel){
            case NOTIFICATION_CHANNEL:
                notification(parsed_message)
                break;
            case CHAT_CHANNEL:
                sendToUser(parsed_message)
                break;
            case BROADCAST_CHANNEL:
                broadcast(parsed_message)
                break; 
        }
    
    });


})


application.on('upgrade', function upgrade(request, socket, head) {
    

    const queryString = url.parse(request.url,true).query;
  
    const userToken = queryString.token;

    userInfo = authenticate(userToken);

    if(typeof userInfo === 'boolean'){
       
        socket.write('HTTP/1.1 401 Unauthorized');
        socket.destroy();
        return;

    }

    wsServer.handleUpgrade(request, socket, head, function done(userSocketConnection) {
        userSocketConnection.is_live = true;
        onlineUsers.push({token : userToken , authUser : userInfo , connection : userSocketConnection});

        wsServer.emit('connection', userSocketConnection);
      });
  });



function authenticate(token){
    
    if(typeof token === 'undefined' || token.length === 0){
        return false;
    }

    for(var i = 0 ; i < systemUsers.length ; i++){    
        if(systemUsers[i].token == token)
            return systemUsers[i];
    }

    return false;
}



function sendToUser(message){
    for(var i = 0 ; i < onlineUsers.length ; i++){    
        if(onlineUsers[i].authUser.id == message.to){
            onlineUsers[i].connection.send(JSON.stringify(message));
            return;
        }    
    }
}

//{"message" : "hi user" , "user_id" : 1, "channel" : "broadcast" }
function broadcast(message){
    for(var i = 0 ; i < onlineUsers.length ; i++){
       
        if(onlineUsers[i].authUser.id != message.user_id){
            onlineUsers[i].connection.send(JSON.stringify(message));
        }     
           
    } 
    return;
}



//{"message" : "hi user" , "user_id" : 1 , "to" : 2 , "channel" : "notification" }
function notification(message){
    sendToUser(message)
}

application.listen(3000);