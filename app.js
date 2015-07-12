var config = require('./config.json'),
    io = require('socket.io-client'),
    socket = io.connect('ws://' + config.server_ip + ":" + config.server_port),
    // colors are super important
    colors = require('colors');

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
