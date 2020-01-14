const express = require('express');
const app = express();
var cors = require('cors');

app.use(cors());
app.options('*', cors());

app.get('/', (req, res) => {
  res.send({
    Me: 'thinks',
    this: 'is',
    working: '?!'
  });
});

app.get('/cards', (req, res) => {
  res.send({
    card1: {
      name: 'Ace of Spades',
      value: '1',
      suit: 'Spades'
    },
    card2: {
      name: 'King of Clubs',
      value: 13,
      suit: 'Clubs'
    }
  });
});

app.listen(process.env.PORT || 3000);