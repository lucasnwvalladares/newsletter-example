const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require('https');
const config = require('./config');
const audienceID = config.audienceID;
const apiKey = config.apiKey;

const app = express();

const dc = 'us12';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/signup.html');
});

app.post('/', function(req, res) {
  const firstName = req.body.firstNameInput;
  const lastName = req.body.lastNameInput;
  const email = req.body.emailInput;

  const data = {
    members: [
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  const jsonData = JSON.stringify(data);
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${audienceID}`;
  const options = {
    method: 'POST',
    auth: `apikey:${apiKey}`,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': jsonData.length
    }
  }
  const request = https.request(url, options, function(response) {
    if (response.statusCode === 200) {
      res.sendFile(__dirname + '/src/pages/success.html');
    } else {
      res.sendFile(__dirname + '/src/pages/failure.html');
    }

    response.on('data', function(data) {
      console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Server running on port 3000.');
});
