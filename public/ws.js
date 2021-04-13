var ws = new WebSocket('ws://localhost:40510');

// event emmited when connected
ws.onopen = function () {
  log('WebSocket is connected ...')
  
  // sending a send event to websocket server
  ws.send('connected')
}

// event emmited when receiving message 
ws.onmessage = function (event) {
  var data = JSON.parse(event.data)
  if (useWebsocket) {
    log(data.text);
    data.prices.forEach(function(price) {
      change(price);	
    });
  }
}