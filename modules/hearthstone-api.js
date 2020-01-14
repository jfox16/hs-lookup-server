const fetch = require('node-fetch');
var auth = require('./bnet-authentication');

class HearthstoneAPIHandler {

  constructor(client_id, client_secret) {
    this.client_id = client_id;
    this.client_secret = client_secret;
  }

  async generateOrRefreshAccessToken() {
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
    // Access token does not exist or is no longer valid, so generate a new one.
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

  async getMetadata(region, locale) {
    console.log(`Getting metadata using region ${region} and locale ${locale}...`);

    try {
      await this.generateOrRefreshAccessToken(); // Make sure token is valid
      const requestUrl = `https://${region}.api.blizzard.com/hearthstone/metadata?locale=${locale}&access_token=${this.accessToken}`;
      console.log("Metadata request URL: " + requestUrl);
      const metadata = await fetch(requestUrl)
      .then((response) => response.json());
  
      if (metadata) {
        console.log("Metadata get!");
      }
      return metadata;
    }
    catch(error) {
      console.error(error);
    }
  }

  async fetchCardData() {
    if (!this.accessToken) {
      console.error('Error: no access token was generated.');
    }
  }
}

exports.HearthstoneAPIHandler = HearthstoneAPIHandler;