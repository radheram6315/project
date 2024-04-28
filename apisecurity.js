var crypto = require('crypto');
const fs = require("fs");

let apiKey = null;
let apiKeys = new Map();


function genAPIKey () {
    const api_keyy = "opensesame"; 
    return api_keyy;
  }

  function getNewApiKey(email){
    let newApiKey = crypto.randomBytes(6).toString('hex');
    apiKeys.set(email, newApiKey);
    email_key = email+":"+newApiKey
    //console.log(apiKeys)
    //writes the apikey and email to the secrets file
    fs.appendFile(__dirname + "/secretkeys", email_key, { flag: 'a+' }, err => {
      if (err) {
        console.error(err);
      } else {
        // file written successfully
  }});

    displayApiKeys();
    return email+":"+newApiKey;
  }

  function setApiKey(){
    apiKey = process.env.API_KEY
    console.log("apikey is", apiKey)

    //Check the commanline arguments for API key
    if(process.argv[2] != null){
      if(process.argv[2].indexOf('=') >= 0){
          apiKey = process.argv[2].substring(process.argv[2].indexOf('=')+1,process.argv[2].length );
          console.log("apikey from command line is", apiKey)
          if(apiKey != "opensesame"){
          console.log(apiKey , "API Key is invalid. Not matching(code:403)")
          process.exit(0);
          }
        }
  }
    
    if(apiKey && apiKey.length >0){
        apiKeys.set("default", apiKey );
        displayApiKeys();
    }else{
        console.log("apiKey has no value. Please provide a value through the API_KEY env var or --api-key cmd line parameter.");
        process.exit(0);
    }  
  }

  function displayApiKeys(){
    console.log("apiKeys:");
    for(let entry of apiKeys.entries()){
      console.log(entry)
    }
  }

  function authenticateKey (req, res, next){
    const api_key = req.header("x-api-key"); //Add API key to headers
    const auth_id = req.query.authId;// Add API key to Query param
    
    console.log("userid key is", auth_id);
    console.log("API key is", api_key);
    //Reject request if API key is not sent
    if(!api_key && !auth_id){
      res.status(401).send({ error: { code: 401, message: "API Key is missing. Is empty" } });
      console.log("API Key is missing. Is empty(code:401)", api_key)
    }
    //Reject request if API key doesn't match
    else if (req.query.authId != apiKey && api_key != apiKey) {
      res.status(403).send({ error: { code: 403, message: "API Key is invalid. Not matching" } });
      console.log("API Key is invalid. Not matching(code:403)", api_key)
    //If API key matches
    } else{
      console.log("API Key matched", api_key)
      next()
    };
}

module.exports = { setApiKey, getNewApiKey, authenticateKey, genAPIKey, displayApiKeys };