const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { authorize } = require('./auth');


const uploadFileToDrive = async (filePath, fileName) => {
    const auth = await authorize();
    console.log(auth);
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    'name': fileName,
    'mimeType': 'application/gzip',
  };
  const media = {
    mimeType: 'application/gzip',
    body: fs.createReadStream(filePath),
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });

  console.log('File uploaded to Google Drive:', res.data.id);
  return res.data.id;
};

module.exports = { uploadFileToDrive };
