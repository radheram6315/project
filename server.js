// server.js file
console.log('This is NodeJS, Express and MongoDB app');
const express = require('express');
const path = require('path');  // for handling file paths
const da = require("./data-access");
const API = require('./apisecurity');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT; 
const api_key = process.env.API_KEY;
const mongodb_url = process.env.MONGO_URL;
const app = express();
const bodyParser = require('body-parser');
//const port = process.env.PORT || 4000;  // use env var or default to 4000

app.use(bodyParser.json());

// Set the static directory to serve files from
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// get email and create apikey
app.get("/apikey", async (req, res) => {
  let email = req.query.email;
  if(email){
      const newApiKey = API.getNewApiKey(email);
      res.send(newApiKey);
  }else{
      res.status(400);
      res.send("an email query param is required");
  }   
});

//setting the apikey to environment variable
API.setApiKey();

//Get all customers
app.get("/customers", API.authenticateKey, async (req, res) => {
  
  const [cust, err] = await da.getCustomers();
    if(cust){
        res.send(cust);
    }
});

//Reset the Customers
app.get("/reset", API.authenticateKey, async (req, res) => {
  const [result, err] = await da.resetCustomers();
  if(result){
      res.send(result);
  }else{
      res.status(500);
      res.send(err);
  }   
});

//Add Customers
app.post('/customers', API.authenticateKey, async (req, res) => {
  const newCustomer = req.body;
  // Check if the request body is missing
  if (Object.keys(req.body).length === 0) {
  res.status(400).send("missing request body");
  } else {
 // Check if the required properties are present
   if (!newCustomer.name || !newCustomer.email) {
   res.status(400).send("missing required properties");
   return;
  }
 // Handle the request
  const [status, id, errMessage] = await da.addCustomer(newCustomer);
  if (status === "success") {
  res.status(201).send({ ...newCustomer, _id: id });
   } else {
   res.status(400).send(errMessage);
   }
 }
  });

  
//search Customers
app.get("/customers/find/", async (req, res) => {
  const customerData = req.query.body
  let id = +req.query.id;
  let email = req.query.email;
  let password = req.query.password;
  let query = null;
  if (id > -1) {
      query = { "id": id };
  } else if (email) {
      query = { "email": email };
  } else if (password) {
      query = { "password": password }
  }

  if(query){
  console.log("customer data:", query)
  const [cust, err] = await da.searchCustomer(query);
  if(cust){
      res.send(cust);
  }else{
      res.status(404);
      res.send(err);
  } 
} else {
    res.status(400);
    res.send("query string is required");
}
});

//get Customer by Id
app.get("/customers/:id", API.authenticateKey, async (req, res) => {
  const id = req.params.id;
  // return array [customer, errMessage]
  const [cust, err] = await da.getCustomerById(id);
  if(cust){
      res.send(cust);
  }else{
      res.status(404);
      res.send(err);
  }   
});

//update Customer by Id
app.put('/customers/:id', API.authenticateKey, async (req, res) => {
  const id = req.params.id;
  const updatedCustomer = req.body;
  if (Object.keys(req.body).length === 0) {
    res.status(400).send("missing request body");
  } else {
      delete updatedCustomer._id;
      // return array format [message, errMessage]
      const [message, errMessage] = await da.updateCustomer(updatedCustomer);
      if (message) {
          res.send(message);
      } else {
          res.status(400);
          res.send(errMessage);
      }
  }
});

//Delete Customer by Id
app.delete("/customers/:id", API.authenticateKey, async (req, res) => {
  const id = req.params.id;
  // return array [message, errMessage]
  const [message, errMessage] = await da.deleteCustomerById(id);
  if (message) {
      res.send(message);
  } else {
      res.status(404);
      res.send(errMessage);
  }
});

