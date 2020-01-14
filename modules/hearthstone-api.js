const fetch = require('node-fetch');
var auth = require('./bnet-authentication');

class HearthstoneAPIHandler {

  constructor(client_id, client_secret) {
    this.client_id = client_id;
    this.client_secret = client_secret;
  }

  async generateAccessToken() {
    try {
      console.log(`Generating Access Token with client_id ${this.client_id} and client_secret ${this.client_secret}...`)
      this.accessToken = await auth.getOAuthAccessToken(
        this.client_id,
        this.client_secret
      );
      console.log('Got the access token! ' + this.accessToken);
    }
    catch (error) {console.log(error)}
  }

  async getMetadata(region, locale) {
    console.log(`Getting metadata using region ${region} and locale ${locale}...`);
    if (!this.accessToken) {
      console.log("No accessToken, generating a new one...");
      try {
        await this.generateAccessToken()
      }
      catch(error) {console.error(error);}
    }

    const requestUrl = `https://${region}.api.blizzard.com/hearthstone/metadata?locale=${locale}&access_token=${this.accessToken}`;
    console.log("Request URL is " + requestUrl);

    const metadata = await fetch(requestUrl)
    .then((response) => response.json())
    .then((data) => this.metadata = data)
    .catch((error) => console.error('Error:', error));

    if (metadata) {
      console.log("Metadata get!");
    }
    return metadata;
  }

  async fetchCardData() {
    if (!this.accessToken) {
      console.error('Error: no access token was generated.');
    }
  }
}

exports.HearthstoneAPIHandler = HearthstoneAPIHandler;