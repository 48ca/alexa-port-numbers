# alexa-port-numbers
This Alexa skill looks up port numbers based on protocol (as defined in definitions.js).

## Installation
Clone the repository and install the dependencies with
```shell
npm install
```

## Running
```shell
nodejs app.js
```
app.js reads the PORT environment variable for the PORT to listen to, but if none is specified it uses 8080.
