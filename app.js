// Load app dependencies
var http = require('http'),
    path = require('path'),
    express = require('express'),
    twilio = require('twilio');

// Load configuration information from system environment variables.
var TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN,
    TWILIO_NUMBER = process.env.TWILIO_NUMBER;

// Create an authenticated client to access the Twilio REST API
var client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Create an Express web application with some basic configuration
var app = express();
console.log('about to stop debugger');
debugger;
app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

// render our home page
app.get('/', function(request, response) {
    response.render('index');
});

app.post('/sendsms1', function(request, response) {
    client.sendSms({
        to: '+31624543741',
        from: TWILIO_NUMBER,
        body: 'Twilio Doer test 1!'
    }, function(err, data) {
        response.send('Message sendsms1 is really inbound!');
    });
});

app.post('/sendsms2', function(request, response) {
    client.sendSms({
        to: '+31624543741',
        from: TWILIO_NUMBER,
        body: 'Twilio Doer test 1!'
    }, function(err, data) {
        response.send('Message sendsms1 is really inbound!');
    });
});


// handle a POST request to send a text message.  This is sent via ajax on our
// home page
app.post('/message', function(request, response) {

    console.log('post message');
    // Use the REST client to send a text message
    client.sendSms({
        to: request.param('to'),
        from: TWILIO_NUMBER,
        body: 'Have fun with your Twilio development!'
    }, function(err, data) {
        // When we get a response from Twilio, respond to the HTTP POST request
        response.send('Message is inbound!');
    });
});

// handle a POST request to make an outbound call.  This is sent via ajax on our
// home page
app.post('/call', function(request, response) {
    // Use the REST client to send a text message
    client.makeCall({
        to: request.param('to'),
        from: TWILIO_NUMBER,
        url: 'http://twilio-elearning.herokuapp.com/starter/voice.php'
    }, function(err, data) {
        // When we get a response from Twilio, respond to the HTTP POST request
        response.send('Call incoming!');
    });
});

// Create a TwiML document to provide instructions for an outbound call
//app.get('/hello', function(request, response) {
//    // Create a TwiML generator
//    var twiml = new twilio.TwimlResponse();
//    twiml.say('Hello there! You have successfully configured a web hook.');
//    twiml.say('Have fun with your Twilio development!', {
//        voice:'woman'
//    });
//
//    // Return an XML response to this request
//    response.set('Content-Type','text/xml');
//    response.send(twiml.toString());
//});

app.get('/hello', function(request, response) {
    // Create a TwiML generator
    var twiml = new twilio.TwimlResponse();
    twiml.say('Hello');
    twiml.redirect('/step2')
    // Return an XML response to this request
    response.set('Content-Type','text/xml');
    response.send(twiml.toString());
});

app.post('/step2', function(request, response) {
    // Create a TwiML generator
    var twiml = new twilio.TwimlResponse();
    twiml.say('Hello from step 2');
    twiml.redirect('/step3')
    twiml.say('I\'m never executed');
    // Return an XML response to this request
    response.set('Content-Type','text/xml');
    response.send(twiml.toString());
});

app.post('/step3', function(request, response) {
    // Create a TwiML generator
    var twiml = new twilio.TwimlResponse();
    twiml.say('Hello from step 3');
    // Return an XML response to this request
    response.set('Content-Type','text/xml');
    response.send(twiml.toString());
});

// Create a TwiML document to provide instructions for an outbound call
app.get('/incoming', function(request, response) {
    // Create a TwiML generator
    var resp = new twilio.TwimlResponse();
    resp.gather({
        action: '/parsenumber',
        numDigits: '1',
        timeout: '3'
    }, function() {
        this.say('Press 1 for store hours');
        this.say('Press 2 for weekly specials');
        this.say('Press 3 to select an extension');
    });
    resp.say('Please make a choice from the menu');
    resp.redirect({method: 'GET'}, '/incoming');
    response.set('Content-Type','text/xml');
    response.send(resp.toString());
});

app.post('/parsenumber', function(request, response) {
    // Create a TwiML generator
    var resp = new twilio.TwimlResponse();
    var digits = request.body.Digits;
    console.log('parsenumber:', digits);
    if (digits == 1) {
        resp.say('ACME Widgets is open from 9 am to 7 pm, Monday through Friday.');
    } else if (digits == 2) {
        resp.say('This week you can buy a 12 pack of widgets for only $9.');
    } else if (digits == 3) {
        resp.gather({
            action: '/dialnumber',
            numDigits: '1',
            timeout: '3'
        }, function() {
            this.say('Please enter an extension to call.');
        });
    } else {
        resp.say('I\'m sorry, that is not a valid choice. Please make a choice from the menu');
        resp.redirect({method: 'GET'}, '/incoming');
    }
    resp.say('Thank you for calling ACME Widgets. Goodbye.');
    resp.hangup();
    response.set('Content-Type','text/xml');
    response.send(resp.toString());
});

app.post('/handlescreeninput', function(request, response) {
    // Create a TwiML generator
    var twiml = new twilio.TwimlResponse();
    var digits = request.body.Digits;
    console.log('handlescreeninput:', digits);
    if( digits == 1 ){
        twiml.say('Connecting you to the caller');
    } else {
        twiml.hangup();
    }
    response.writeHead(200, {'Content-Type': 'text/xml'});
    response.end(twiml.toString());
});

app.post('/dialnumber', function(request, response) {
    // Create a TwiML generator
    var resp = new twilio.TwimlResponse();
    var digits = request.body.Digits;
    console.log('dialnumber:', digits);
    if (digits == 1) {
        resp.say('Connecting you to agent 1');
        resp.dial({action: '/dialcallstatus'}, function(node) {
//            node.number('+31527203011', {method: 'GET', url: 'screen-caller.xml'});
            node.number('+31618285851', {method: 'GET', url: 'screen-caller.xml'});
        });
    }  else {
        resp.say('I\'m sorry, that is not a valid choice. Please make a choice from the menu');
        resp.redirect({method: 'GET'}, '/incoming');
    }
    resp.say('Thank you for trying to call extension. Goodbye.');
    resp.hangup();
    response.set('Content-Type','text/xml');
    response.send(resp.toString());
});



app.post('/handlecall', function(request, response) {
    // Create a TwiML generator
    var resp = new twilio.TwimlResponse();
    resp.say('Thank you for calling ACME Widgets. Goodbye.');
    resp.hangup();
    response.set('Content-Type','text/xml');
    response.send(resp.toString());
});

app.post('/statuscallback', function(request, response) {
    // Create a TwiML generator
    var resp = new twilio.TwimlResponse();
    resp.say('The caller has disconnected');
    response.set('Content-Type','text/xml');
    response.send(resp.toString());
});

app.post('/dialcallstatus', function(request, response) {
    // Create a TwiML generator
    var resp = new twilio.TwimlResponse();
    resp.say('The caller has disconnected');
    response.set('Content-Type','text/xml');
    response.send(resp.toString());
});


// Start our express app, by default on port 3000
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});