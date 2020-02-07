const fetch = require('node-fetch');
const _ = require('lodash');
const auth = require('./bnet-authentication');
const showRequestURLs = true;

class HearthstoneAPIHandler {

  constructor(client_id, client_secret) {
    this.client_id = client_id;
    this.client_secret = client_secret;

    this.regionBaseURLs = {
      'us': 'https://us.api.blizzard.com/',
      'eu': 'https://eu.api.blizzard.com/',
      'kr': 'https://kr.api.blizzard.com/',
      'tw': 'https://tw.api.blizzard.com/',
      'cn': 'https://gateway.battlenet.com.cn/'
    }

    this.cache = {};
  }

  // refreshAccessToken checks the current access token. If it does not exist or is no longer valid,
  // a new access token is requested. The access token is stored in this.accessToken
  async refreshAccessToken() {
    // Check if access token exists AND is still valid.
    if (this.accessToken) {
      try {
        let tokenIsValid = await auth.checkAccessToken(this.accessToken);
        console.log((tokenIsValid) ? "Token is still valid." : "Token is no longer valid.");
        if (tokenIsValid) return;
      }
      catch (error) {
        console.error(error);
      }
    }
    // At this point, access token does not exist or is no longer valid.
    // So request a new one!
    console.log(`Requesting a new token... (client_id: ${this.client_id} and client_secret: ${this.client_secret})`);
    try {
      this.accessToken = await auth.requestAccessToken(
        this.client_id,
        this.client_secret
      );
      console.log('Got the access token: ' + this.accessToken);
    }
    catch (error) {
      console.error(error);
    }
  }

  
  async fetchMetadata(region, query) {

    // Use en_US as default locale
    let locale = (query.locale) ? query.locale : 'en_US';

    // If this data has been previously requested, return the cached data instead.
    let cacheKey = `${region}/metadata?&locale=${locale}`;
    if (this.cache[cacheKey]) {
      console.log(`Served cached metadata!! (cache[${cacheKey}])`);
      return this.cache[cacheKey];
    }

    try {
      // Make sure access Token is valid
      await this.refreshAccessToken();
    }
    catch (error) {
      console.error(error);
      return;
    }

    const requestUrl = `${this.regionBaseURLs[region]}hearthstone/metadata?locale=${locale}&access_token=${this.accessToken}`;
    if (showRequestURLs) console.log("Requesting metadata with URL: " + requestUrl);

    let metadata;
    try {
      metadata = await fetch(requestUrl)
      .then((response) => response.json());
    }
    catch(error) {
      console.error(error);
      return;
    }

    let reducedMetadata = _.pick(metadata, ['sets', 'setGroups', 'types', 'rarities', 'classes', 'minionTypes', 'keywords']);
    reducedMetadata.classes = [];
    metadata.classes.forEach((metadataClass) => {
      reducedMetadata.classes.push(metadataClass);
    });

    console.log("Served metadata!!");
    this.cache[cacheKey] = reducedMetadata;
    return reducedMetadata;
  }

  async fetchAllCardData(region, locale='en_US') {

    // If this data has been previously requested, return the cached data instead.
    let cacheKey = `${region}/cards?locale=${locale}`;
    if (this.cache[cacheKey]) {
      console.log(`Served cached cardData!! (cache[${cacheKey}])`);
      return this.cache[cacheKey];
    }

    try {
      // Make sure access Token is valid
      await this.refreshAccessToken();
    }
    catch (error) {
      console.error(error);
      return;
    }

    const cardData={cards: []}
    const pageSize = 1000;
    let page = 1;
    let pageCount = 1;
    const keysToKeep = ['id', 'classId', 'cardTypeId', 'cardSetId', 'multiClassIds', 
      'minionTypeId', 'rarityId', 'health', 'attack', 'manaCost', 'name', 'text', 'image', 
      'keywordIds'];

    // fetch each page of cards from the Hearthstone API and add them to cards
    while (page <= pageCount) {
      const requestUrl = `${this.regionBaseURLs[region]}hearthstone/cards?locale=${locale}&pageSize=${pageSize}&page=${page}&access_token=${this.accessToken}`;
      if (showRequestURLs) console.log("Requesting cardData with URL: " + requestUrl);

      let cardDataPage;
      try {
        cardDataPage = await fetch(requestUrl)
        .then((response) => response.json());
      }
      catch (error) {
        console.error(error);
        return;
      }

      // Add cards from this page to our list of cards, 
      // only keeping the properties that we need from each card. 
      cardDataPage.cards.map((card) => {
        cardData.cards.push(_.pick(card, keysToKeep));
      });

      pageCount = cardDataPage.pageCount;
      page++;
    }

    // Get the uncollectible cards too!
    try {
      // lackeys
      cardData.lackeyCards = [];
      let lackeyCards = await fetch(`${this.regionBaseURLs[region]}hearthstone/cards?locale=${locale}&collectible=0&type=minion&keyword=evilzug&pageSize=${pageSize}&access_token=${this.accessToken}`)
      .then((response) => response.json())
      .then((json) => json.cards);
      lackeyCards.map((card) => {
        cardData.lackeyCards.push(_.pick(card, keysToKeep));
      });
    }
    catch (error) {
      console.error(error);
      return;
    }

    console.log("Served cardData!!");
    this.cache[cacheKey] = cardData;
    return cardData;
  }
}



exports.HearthstoneAPIHandler = HearthstoneAPIHandler;