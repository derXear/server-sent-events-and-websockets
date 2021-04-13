var fs = require('fs');
const axios = require('axios');
var server = require('http').createServer();
var express = require('express');
var app = express();

var connectionCounter = 1;

var data = {
    prices: []
}

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(fs.readFileSync('index.html'));
    res.end();
})

// SSE Endpoint
app.get('/events', (req, res) => {
    var thisConnection = connectionCounter++;
    var thisEvent = 0;
    
    console.log('Client connected to event stream (connection #' + thisConnection + ')');
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache'
    });
    
    // Stream Event
    setInterval(function() {
        var sseData = {
            text: 'sse event #' + ++thisEvent +' of connection #' + thisConnection,
            prices: data.prices,
        }
        
        res.write('event: tick-event\n');
        res.write('id: ' + (thisConnection * 1000 + thisEvent) + '\n');
        res.write('data: ' + JSON.stringify(sseData) + '\n\n');
        
        console.log(sseData.text);
    }, 2500);
    
    req.on('close', function() {
        console.log('Client disconnected from event stream (connection #' + thisConnection + ')');
        res.end();
    });
})

// Http Connection
var server = app.listen(8000, function () {
    var port = server.address().port
    console.log('Server listening at http://localhost:%s', port)
})

// Web Socket Connection
var WebSocketServer = require('ws').Server,
wss = new WebSocketServer({port: 40510})

wss.on('connection', function (ws) {
    var thisEvent = 0;

    ws.on('message', function (message) {
        console.log('received: %s', message)
    })
    
    setInterval(function() {
        var wsData = {
            text: 'websocket event #' + ++thisEvent,
            prices: data.prices,
        }
        ws.send(JSON.stringify(wsData));
    }, 2500);
})


// Get Prices from Coindesk
function getPrices() {
    axios.all([
        axios.get("https://api.coinbase.com/v2/prices/BTC-USD/spot"), 
        axios.get("https://api.coinbase.com/v2/prices/ETH-USD/spot"),
        axios.get("https://api.coinbase.com/v2/prices/ETC-USD/spot"),
        axios.get("https://api.coinbase.com/v2/prices/BCH-USD/spot"),
        axios.get("https://api.coinbase.com/v2/prices/LTC-USD/spot"),
        axios.get("https://api.coinbase.com/v2/prices/ADA-USD/spot"),
        axios.get("https://api.coinbase.com/v2/prices/XLM-USD/spot"),
        axios.get("https://api.coinbase.com/v2/prices/UNI-USD/spot"),
        axios.get("https://api.coinbase.com/v2/prices/LINK-USD/spot"),
        axios.get("https://api.coinbase.com/v2/prices/USDC-USD/spot"),
    ]
    ).then(axios.spread((...responses) => {
        
        data.prices = [];
        responses.forEach(function (response) {
            data.prices.push(response.data)
        });
        
    })).catch(errors => {
        console.log(errors);
    });
};
setInterval(getPrices, 2500);