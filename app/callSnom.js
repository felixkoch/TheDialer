const electron = require('electron');

export default function callSnom(options, cb) {
  
  const request = (electron.net || electron.remote.net).request(
    //`http://${options.ip}/command.htm?number=${options.number}`
    `http://${options.ip}/command.php?number=${options.number}`
  );

  request.on('response', response => {
    console.log('response');
    console.log(response);

    console.log(`STATUS: ${response.statusCode}`);
    if(response.statusCode == 200)
    {
      cb({status: 'SUCCESSS', error: "Löppt"});
    }
    else if(response.statusCode == 401)
    {
      cb({status: 'FAILURE', error: "Bitte Zugangsdaten prüfen."});
    }
    else
    {
      cb({status: 'FAILURE', error: "Es ist ein Fehler aufgetreten."});
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
    cb({status: 'FAILURE', error: "IP / Host nicht gefunden."});
  });

  request.end();
}

