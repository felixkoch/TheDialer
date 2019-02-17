import { parseIncompletePhoneNumber } from 'libphonenumber-js';

const electron = require('electron');


export default function callSnom(options, cb) {
  
  const number = encodeURIComponent(parseIncompletePhoneNumber(options.number));

  const request = (electron.net || electron.remote.net).request(
    `${options.protocol}://${options.ip}/command.htm?number=${number}`
    //`http://${options.ip}/command.php?number=${number}`
  );

  request.on('response', response => {
    console.log('response');
    console.log(response);

    console.log(`STATUS: ${response.statusCode}`);
    if(response.statusCode == 200)
    {
      cb({status: 'SUCCESSS', error: ""});
    }
    else if(response.statusCode == 401)
    {
      cb({status: 'FAILURE', error: "Please check credentials."});
    }
    else
    {
      cb({status: 'FAILURE', error: "An error has occurred."});
    }

    /*
    response.on('error', (error) => {
      console.log(`ERROR: ${JSON.stringify(error)}`)
      cb({status: 'FAILURE', error: "Bitte Zugangsdaten prüfen."});
    })
    */
  });

  request.on('login', (authInfo, callback) => {
    console.log('login');
    callback(options.user, options.password);
    options.user = "";
    options.password = "";
  });
  

  request.on('error', error => {
    console.log('error');
    cb({status: 'FAILURE', error: "IP / Host not found."});
  });

  request.end();
}

