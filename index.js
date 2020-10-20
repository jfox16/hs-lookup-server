require('dotenv').config(); //initialize dotenv
const express = require('express');
const app = express();
var cors = require('cors');
const now = require('performance-now');

// Postgres client
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect();

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

// For fetching cards from pg
app.get('/:region/allcardspg', async (req, res) => {
  let t0 = now();

  const fetchAllCardsQuery = `
    SELECT * FROM cards
  `;

  try {
    const data = await client.query(fetchAllCardsQuery);
    const cards = data.rows.map(card => {
      const newCard = {};
      newCard.attack = card.attack;
      newCard.cardSetId = card.cardsetid;
      newCard.cardTypeId = card.cardtypeid;
      newCard.classId = card.classid;
      newCard.health = card.health;
      newCard.id = card.id;
      newCard.image = card.image;
      newCard.keywordIds = card.keywordids;
      newCard.manaCost = card.manacost;
      newCard.minionTypeId = card.miniontypeid;
      newCard.multiClassIds = card.multiclassids;
      newCard.name = card.name;
      newCard.rarityId = card.rarityid;
      newCard.text = card.text;
      return newCard;
    });
    res.json({cards: cards});
    let t1 = now();
    console.log("Call to pg query took " + (t1 - t0).toFixed(3) + " ms.");
  }
  catch (err) {
    console.error(err);
  }
});

app.listen(process.env.PORT || 3000, () => console.log('App is listening'));