require('dotenv').config(); //initialize dotenv
const express = require('express');
const app = express();
var cors = require('cors');
var api = require('./modules/hearthstone-api');
var apiHandler = new api.HearthstoneAPIHandler();

app.use(
  cors({
    credentials: true,
    origin: true
  })
);
app.options('*', cors());

app.get('/', (req, res) => {
  res.send({
    Me: 'thinks',
    this: 'is',
    working: '?!'
  });
});

app.get('/metadata/:something', async (req, res) => {
  console.log("is this on?");
  res.send(`This is the metadata page, your param is ${req.params.something}`);
});

app.get('/metadata/:region/:locale', async (req, res) => {
  console.log(`Trying to fetch data using region ${req.params.region} and locale ${req.params.locale}...`);
  try {
    let metadata = await apiHandler.getMetadata(
      req.params.region,
      req.params.locale
    );
    res.send(metadata);
  }
  catch (error) {
    throw new Error(error);
  }
  res.send("whats happneing");
});

app.listen(process.env.PORT || 3000, () => console.log(`App is listening`));