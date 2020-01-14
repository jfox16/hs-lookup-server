const fetch = require('node-fetch');

const requestAccessToken = async function(client_id, client_secret, region='us') {

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

const checkAccessToken = async function(token, region='us') {
  const tokenIsValid = await fetch(`https://${region}.battle.net/oauth/check_token?token=${token}`, {
    method: 'POST'
  })
  .then((response) => response.json())
  .then((data) => (data.error === undefined))
  .catch((error) => {
    console.error('Error:', error);
  });

  return tokenIsValid;
}

exports.requestAccessToken = requestAccessToken;
exports.checkAccessToken = checkAccessToken;