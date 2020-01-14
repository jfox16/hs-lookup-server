const fetch = require('node-fetch');
var auth = require('./bnet-authentication');

class HearthstoneAPIHandler {

  async generateAccessToken() {
    try {
      console.log(`Generating Access Token with CLIENT_ID ${process.env.CLIENT_ID} and CLIENT_SECRET ${process.env.CLIENT_SECRET}...`)
      this.accessToken = await auth.getOAuthAccessToken(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET
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