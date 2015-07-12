#! /usr/bin/env node

function build(){
  var config = require('./config.json'),
      io = require('socket.io-client'),
      socket = io.connect('ws://' + config.server_ip + ":" + config.server_port),
      // colors are super important
      colors = require('colors');

  console.log("Connecting to build server " + config.server_ip + ":" + config.server_port + "...");

  socket.on("key:send", function(){
    console.log("Authenticating...");
    socket.emit("key:send", config.auth.password);
  });

  socket.on("key:success", function(){
    console.log("Authentication success! Running build scripts...");
    socket.emit("build:run");
  });

  socket.on("stdout", function(data){
    var log = data.stdout.split("\n");
    log.forEach(function(e){
      if(e.trim() !== ""){
        var tag = "[REMOTE] ".green;
        if(data.tag)
          var tag = "[REMOTE (".green + data.tag.cyan + ")] ".green;
        console.log(tag + e);
      }
    });
  });

  socket.on("build:complete", function(status){
    process.exit(status);
  });

  socket.on("key:fail", function(){
    console.log("Authentication failed. Exiting.");
    process.exit(1);
  });
}

if(process.argv[2]){
  switch(process.argv[2]){
    case 'config':
      console.log(__dirname + "/config.json");
      break;
    case 'build':
      build();
      break;
    default:
      console.log("Command not recognized. Available commands are: config, build");
      break;
  }
}else{
  build();
}
