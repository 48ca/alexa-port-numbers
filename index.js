'use strict';
var Alexa = require('alexa-sdk');
var http = require('http');
var PORT = 8080;

var APP_ID = undefined; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var SKILL_NAME = 'Space Facts';

var PROTOCOL_MAP = {
    ftp:21,
    ssh:22,
    scp:22,
    sftp:22,
    telnet:23,
    smtp:25,
    whois:43,
    dns:53,
    https:443,
    http:80,
    bootp:68,
    tftp:69,
    kerberos:88,
    ftps:990,
    rdp:3389
}

var PROTOCOL_SPELLINGS = {
    ftp:"FTP",
    ssh:"SSH",
    scp:"SCP",
    sftp:"SFTP",
    telnet:"Telnet",
    smtp:"SMTP",
    whois:"WHOIS",
    dns:"DNS",
    https:"HTTPS",
    http:"HTTP",
    bootp:"BOOTP",
    tftp:"TFTP",
    kerberos:"Kerberos",
    ftps:"FTPS",
    rdp:"RDP"
}

function spellOut(prot) {
    return "<say-as interpret-as='spell-out'>" + prot + "</say-as>";
}

var ssml = {
    ftp:spellOut("FTP"),
    ssh:spellOut("SSH"),
    scp:spellOut("SCP"),
    sftp:spellOut("SFTP"),
    telnet:"telnet",
    smtp:spellOut("SMTP"),
    whois:"<phoneme alphabet='ipa' ph='huɪz'>WHOIS</phoneme>",
    dns:spellOut("DNS"),
    https:spellOut("HTTPS"),
    http:spellOut("HTTP"),
    bootp:"<phoneme alphabet='ipa' ph='ˈbutpi'>BOOTP</phoneme>",
    tftp:spellOut("TFTP"),
    kerberos:"Kerberos",
    ftps:spellOut("FTPS"),
    rdp:spellOut("RDP")
}

function generateSpeechObject(protocol, res) {
    return {
        type: "SSML",
        text: "The port number for " + protocol + " is " + res,
        ssml: "<speak>The port number for " + ssml[protocol.toLowerCase()] + " is " + res + "</speak>"
    }
}

function generateErrorResponse() {
    var response = {
        version: "1.0",
        response: {
            outputSpeech: {
                type: "PlainText",
                text: "Sorry, I didn't understand that request"
            },
            shouldEndSession: true
        }
    };
    return JSON.stringify(response);
}
function generateAlexaResponse(protocol, res) {
    var response = {
        version: "1.0",
        response: {
            outputSpeech: generateSpeechObject(protocol, res),
            card: {
                type: "Simple",
                title: "Port number for " + PROTOCOL_SPELLINGS[protocol.toLowerCase()],
                content: "The port number for " + PROTOCOL_SPELLINGS[protocol.toLowerCase()] + " is " + res
            },
            shouldEndSession: true
        }
    };
    return JSON.stringify(response);
}

function getPortNumber(intent) {
    var protocol = intent.slots.Protocol.value;
    if(protocol === undefined) return;
    var num = PROTOCOL_MAP[protocol.toLowerCase()];
    if(typeof(num) == undefined)
        return;
    return generateAlexaResponse(protocol, "" + num);
}

function portNumbers(request_body) {

    var req = JSON.parse(request_body)['request'];
    var intent = req.intent;
    switch(intent.name) {
        case "GetPortNumberIntent":
            return getPortNumber(intent)
    }

    return null;

}

function checkHeaders(headers) {
`
{ host: 'alexa.jhoughton.me',
  'x-real-ip': '72.21.217.164',
  connection: 'close',
  'content-length': '701',
  'content-type': 'application/json; charset=utf-8',
  accept: 'application/json',
  'accept-charset': 'utf-8',
  signature: 'Ya4vBTnrcyfDetOUJkKiRqIlxoyJw9oiXwAaGJd3kkYJ4+DaBaasPBZvg80BwV/8aZW7PSAdRvMhUX+pOEkQ0b5v3wElmmhgw/SK5N08lofqzkEJ2qIM6cQXle6MyVp/Hy3bXz2tQXCxbTawo7CIr9IRn2x7BP23SzSyFdZD5d5TfglQQqB2/V+rJbRLJRaqHHSSLSE7HjAsubIo/hmA/0kaE+TzBLJDabaVxxQP9MsAyZPDKvU+sPeZefhl9W1pg4joc1ghhyjir4YoKGh67WzpvfOOGC3cttNmTZeZeVyZPTJ9KMPT+3ioOYfVwWgIVxjFh5uQBlSLV00cHzv2fQ==',
  signaturecertchainurl: 'https://s3.amazonaws.com/echo.api/echo-api-cert-4.pem',
  'user-agent': 'Apache-HttpClient/UNAVAILABLE (Java/1.8.0_112)' }

`
    return true;
}

var server = http.createServer().listen(PORT);
console.log("Listening on " + PORT)
server.on('request', function(request, response) {
    var method = request.method;
    var url = request.url;
    var headers = request.headers;
    console.log(headers);
    var userAgent = headers['user-agent'];
    var body = [];
    request.on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        body = Buffer.concat(body).toString();

        var isAlexa = checkHeaders(headers);
        if(!isAlexa) {
            response.statusCode = 400;
            return response.end("This is not Alexa");
        }

        var output = portNumbers(body);

        var date = Date.now();
        console.log(date + ": " + output);

        if(output === undefined) {
            output = generateErrorResponse();
        }

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.write(output);
        response.end();

    }).on('error', function(err) {
        console.err(err.stack);
    });
});
