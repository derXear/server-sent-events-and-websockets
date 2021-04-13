var es = new EventSource('/events');

es.addEventListener('open', function() {
  log('SSE is connected ...');
});

es.addEventListener('tick-event', function(event) {
  var data = JSON.parse(event.data)
  if (!useWebsocket) {
    log(data.text);
    data.prices.forEach(function(price) {
      change(price);	
    });
  }
});

es.addEventListener('error', function() {
  log('Server unavailable :(');
});