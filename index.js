require('dotenv').config(); //initialize dotenv
const express = require('express');
const app = express();
var cors = require('cors');
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
  res.send('Welcome to the Hearthstone Lookup server!');
});

app.get('/:region/metadata', async (req, res) => {
  try {
    let metadata = await apiHandler.getMetadata(
      req.params.region,
      req.query.locale
    );
    res.json(metadata);
  }
  catch (error) {console.log(error);}
});

app.listen(process.env.PORT || 3000, () => console.log(`App is listening`));