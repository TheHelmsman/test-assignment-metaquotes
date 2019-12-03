var http = require('http'); 
var fs = require('fs');

//  loading files
var tempretureData = fs.readFileSync('temperature.json', 'utf8');
var precipationData = fs.readFileSync('precipitation.json', 'utf8');

// creating server
var server = http.createServer(function (req, res) {   

    //  handle incomming requests here..
    
    //check the URL of the current request
    if (req.url == '/temperature') {
        
        console.log('/temperature request, processing...')
        // set response header
        res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' });
        // set response content
        // res.write(JSON.stringify({ data: tempretureData}));
        res.write(tempretureData)
        res.end();

    } else if (req.url == "/precipitation") {
        
        console.log('/precipitation request, processing...')
        // set response header
        res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' });
        // set response content
        // res.write(JSON.stringify({ data: precipationData}));  
        res.write(precipationData)
        res.end();

    } else {
        console.log('Invalid Request! Requested url: '+req.url)
        res.end('Invalid Request!');
    }

});

server.listen(5000); //3 - listen for any incoming requests

console.log('Node.js web server at port 5000 is running..')
