let apiKey = null;
let apiKeys = new Map();


function genAPIKey () {
    const api_keyy = "opensesame"; 
    return api_keyy;
  }

  function setApiKey(){
    apiKey = process.env.API_KEY
    console.log("apikey is", apiKey)
    
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

module.exports = { setApiKey, authenticateKey, genAPIKey, displayApiKeys };