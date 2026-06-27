// google official node js client: https://github.com/googleapis/google-api-nodejs-client
const { google } = require('googleapis');
const drive = google.drive('v3');

// file system module
const fs = require('fs');

// google service account private key (https://developers.google.com/identity/protocols/OAuth2ServiceAccount#creatinganaccount)
const key = require('./credentials.json');
// create jwt client for 2-legged oAuth (https://github.com/googleapis/google-auth-library-nodejs#json-web-tokens)
const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/drive'], //here you add scopes
    null
);

function authorize() {
    return new Promise((resolve, reject) => {
        jwtClient.authorize((authErr) => {
            if (authErr) reject(authErr);
            else resolve(jwtClient);
        });
    });
}

async function getAuthenticatedDrive() {
    await authorize();
    return google.drive({ version: 'v3', auth: jwtClient });
}

// upload function
async function upload_file_on_google_drive(filename, parent_folder_id, delete_after_upload = false) {
    await authorize();

    // create file meta data
    const fileMetadata = {
        name: filename, //name of the file to be created on google drive
        parents: [parent_folder_id] // id of the parent folder
    };

    console.log(fileMetadata);
    // create data object (from file contents)
    const media = {
        mimeType: 'text/plain',
        body: fs.createReadStream(filename)
    };
    // initate create request
    const file = await drive.files.create({
        auth: jwtClient,
        resource: fileMetadata,
        media,
        fields: 'id'
    });

    console.log('File created with ID: ', file.data.id);

    // if allowed, delete the file once upload from local
    if (file.data.id) {
        fs.unlink(filename, (err) => {
            if (err) {
                console.log('An error occurred while deleting th DB file: ' + err)
            }
        })
    }

    return file.data.id;
}

upload_file_on_google_drive.getAuthenticatedDrive = getAuthenticatedDrive;

module.exports = upload_file_on_google_drive;
