const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Load the credentials from your json file
const credentials = require('./credentials.json');

// If modifying these scopes, delete the file token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Token file
const TOKEN_PATH = 'token.json';

// Authorize and create an OAuth2 client
const authorize = async () => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token
  let token;
  if (fs.existsSync(TOKEN_PATH)) {
    token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } else {
    return getNewToken(oAuth2Client);
  }
};

console.log(authorize);

// Get a new token
const getNewToken = (oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
    
  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error while trying to retrieve access token', err);
        return;
      }
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('Token stored to', TOKEN_PATH);
    });
  });
};

module.exports = { authorize };
