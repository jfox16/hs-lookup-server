require('dotenv').config(); //initialize dotenv
const cliProgress = require('cli-progress');

const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

var api = require('./modules/hearthstone-api');
var apiHandler = new api.HearthstoneAPIHandler(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);

const dropTableQuery = `
  DROP TABLE cards;
`;

const createTableQuery = `
  CREATE TABLE cards (
    id INT NOT NULL PRIMARY KEY,
    classId INT,
    cardTypeId INT,
    cardSetId INT,
    multiClassIds INT ARRAY[15],
    minionTypeId INT,
    rarityId INT,
    health INT,
    attack INT,
    manaCost INT,
    name varchar(255),
    text varchar(255),
    image varchar(255),
    keywordIds INT ARRAY[15]
  );
`;

function querifyCard(card) {
  // console.log(card);
  const keys = [];
  const values = [];
  
  Object.keys(card).forEach(key => {

    const value = card[key];

    if (value === undefined || value === null) {
      return;
    }

    keys.push(key);

    if (typeof value === 'number') {
      values.push(value);
    }
    else if (typeof value === 'string') {
      values.push(`'${value.replace(/'/g, `''`)}'`); // surround string with quotations and escape single quotes
    }
    else if (Array.isArray(value)) {
      if (value.length > 0) {
        values.push(`ARRAY[${value.join(', ')}]`); // surround array with brackets and add commas
      }
      else {
        values.push('NULL');
      }
    }
    else {
      values.push(card[key]);
    }
  });

  const query = `
    INSERT INTO cards (${keys.join(', ')})
      VALUES (${values.join(', ')});
  `;

  // console.log(query);
  return query;
}

async function initialize() {

  // First, get cards from Blizzard API.
  
  console.log('Getting cards from Blizzard API...');

  const data = await apiHandler.fetchAllCardData('us', 'en_US');
  const cards = data.cards;

  await client.connect();

  console.log('Deleting old table.');

  try {
    await client.query(dropTableQuery);
  }
  catch (err) {
    console.error(err);
  }

  console.log('Creating new table.');

  await client.query(createTableQuery);

  console.log('Adding cards to table...');

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  progressBar.start(data.cards.length, 0);

  try {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const insertCardQuery = querifyCard(card);
      await client.query(insertCardQuery);
      progressBar.update(i+1);
    };
  }
  catch (err) {
    console.error(err);
  }

  client.end();
  progressBar.stop();

  console.log('\nDone!');
}

initialize();