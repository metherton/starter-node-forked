'use strict';

//var twilio = require('twilio');

// Load configuration information from system environment variables.
var TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN,
    TWILIO_NUMBER = process.env.TWILIO_NUMBER;

// Create an authenticated client to access the Twilio REST API
//var client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
//
//
//try {
//    client.sendSms({
//        to: '+31624543741',
//        from: TWILIO_NUMBER,
//        body: 'Erna please?! I love you'
//    }, function(err, message) {
//        process.stdout.write(message.sid);
//    });
//}


var twilio = require('twilio');
var client = new twilio.RestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
client.sms.messages.create({
    to:'+31624543741',
    from:TWILIO_NUMBER,
    body:'Daisy Daisy give me your answer do'
}, function(error, message) {
    if (error) {
        console.log(error.message);
    } else {
        process.stdout.write(message.sid);
    }
});
