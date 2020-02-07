require('dotenv').config(); //initialize dotenv
const express = require('express');
const app = express();
var cors = require('cors');
const now = require('performance-now');

var api = require('./modules/hearthstone-api');
var apiHandler = new api.HearthstoneAPIHandler(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);

app.use(
  cors({
    credentials: true,
    origin: true
  })
);
app.options('*', cors());

app.get('/', (req, res) => {
  res.send('Welcome to the HSLookup.net server!');
});

// For fetching metadata
app.get('/:region/metadata', async (req, res) => {
  let t0 = now();
  try {
    let metadata = await apiHandler.fetchMetadata(req.params.region, req.query);
    res.json(metadata);
  }
  catch (error) {
    console.error(error);
  }
  let t1 = now();
  console.log("Call to apiHandler.fetchMetadata took " + (t1 - t0).toFixed(3) + " ms.");
});

// For fetching cards
app.get('/:region/allcards', async (req, res) => {
  let t0 = now();
  try {
    let cards = await apiHandler.fetchAllCardData(req.params.region, req.query.locale);
    res.json(cards);
  }
  catch (error) {
    console.error(error);
  }
  let t1 = now();
  console.log("Call to apiHandler.fetchCardData took " + (t1 - t0).toFixed(3) + " ms.");
});

app.listen(process.env.PORT || 3000, () => console.log('App is listening'));