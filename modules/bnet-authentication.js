const fetch = require('node-fetch');

const getOAuthAccessToken = async (client_id, client_secret, region='us') => {

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')
  };

  const body = 'grant_type=client_credentials';

  const accessToken = await fetch(`https://${region}.battle.net/oauth/token`, {
    method: 'POST',
    headers: headers,
    body: body
  })
  .then((response) => response.json())
  .then((data) => data.access_token)
  .catch((error) => {
    console.error('Error:', error);
  });
  
  return accessToken;
};

exports.getOAuthAccessToken = getOAuthAccessToken;