const fetch = require('node-fetch');
var auth = require('./bnet-authentication');

class HearthstoneAPIHandler {

  async generateAccessToken() {
    try {
      this.accessToken = await auth.getOAuthAccessToken(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET
      );
      console.log('Got the access token! ' + this.accessToken);
    }
    catch (err) {
      console.error(err);
    }
  }

  async getMetadata(region, locale) {
    console.log("Getting metadata...");
    if (!this.accessToken) {
      console.log("No accessToken, generating a new one...");
      await this.generateAccessToken();
    }

    const requestUrl = `https://${region}.api.blizzard.com/hearthstone/metadata?locale=${locale}&access_token=${this.accessToken}`;
    console.log("Request URL is " + requestUrl);
    const metadata = await fetch(requestUrl)
    .then((response) => response.json())
    .then((data) => this.metadata = data)
    .catch((error) => {
      console.error('Error:', error);
    });
    
    return metadata;
  }

  async fetchCardData() {
    if (!this.accessToken) {
      console.error('Error: no access token was generated.');
    }
  }
}

exports.HearthstoneAPIHandler = HearthstoneAPIHandler;