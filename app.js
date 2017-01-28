'use strict';
// var Alexa = require('alexa-sdk');
var alexa_verifier = require('alexa-verifier');
var http = require('http');
var PORT = 8080;
var definitions = require('./definitions.js');
var meta = require('./package.json');

function generateSpeechObject(protocol, res) {
    return {
        type: "SSML",
        text: "The port number for " + protocol + " is " + res,
        ssml: "<speak>The port number for " + definitions.ssml[protocol.toLowerCase()] + " is " + res + "</speak>"
    }
}

function generateErrorResponse() {
    var response = {
        version: meta.version,
        response: {
            outputSpeech: {
                type: "PlainText",
                text: "Sorry, I don't know that protocol."
            },
            shouldEndSession: true
        }
    };
    return JSON.stringify(response);
}
function generateAlexaResponse(protocol, res) {
    var response = {
        version: meta.version,
        response: {
            outputSpeech: generateSpeechObject(protocol, res),
            card: {
                type: "Simple",
                title: "Port number for " + definitions.spellings[protocol.toLowerCase()],
                content: "The port number for " + definitions.spellings[protocol.toLowerCase()] + " is " + res
            },
            shouldEndSession: true
        }
    };
    return JSON.stringify(response);
}

function getPortNumber(intent) {
    var protocol = intent.slots.Protocol.value;
    if(protocol == undefined) return;

    // Trim
    protocol = protocol.replace(/^\W*/,'').replace(/\W*$/,'');
    var num = definitions.ports[protocol.toLowerCase()];
    if(num == undefined)
        return;
    return generateAlexaResponse(protocol, "" + num);
}

function portNumbers(request_body) {

    try {
        var req = JSON.parse(request_body)['request'];
        var intent = req.intent;
        switch(intent.name) {
            case "GetPortNumberIntent":
                return getPortNumber(intent)
        }
    } catch(SyntaxError) {}
    return;

}

function checkRequest(headers, body, callback) {
    alexa_verifier(headers.signaturecertchainurl, headers.signature, body, callback);
}

var server = http.createServer().listen(PORT);
console.log("Listening on " + PORT)
server.on('request', function(request, response) {
    var method = request.method;
    var url = request.url;
    var headers = request.headers;
    // console.log(headers);
    var userAgent = headers['user-agent'];
    var body = [];
    console.log(Date.now() + ": Request started");
    request.on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        body = Buffer.concat(body).toString();

        var setStatus = false;

        checkRequest(headers, body, function(isNotAlexa){

            try {

                if(isNotAlexa) {
                    response.statusCode = 400;
                    console.log("Received non-Alexa request");
                    return response.end("This is not Alexa");
                }

                var output = portNumbers(body);

                var date = Date.now();
                console.log(date + ": " + output);

                if(output === undefined) {
                    output = generateErrorResponse();
                }

                response.statusCode = 200;
                setStatus = true;
                response.setHeader('Content-Type', 'application/json');
                response.write(output);
                response.end();

            } catch(Exception) {
                if(!setStatus)
                    response.statusCode = 500;
                response.end("Server error");
            }

        });

    }).on('error', function(err) {
        console.err(err.stack);
    });
});
