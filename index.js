const line = require('@line/bot-sdk');
const express = require('express');
const { format } = require('date-fns');
const db = require('./database');
require('dotenv').config();

// const CHANNEL_ID = '1655375708';
const { CHANNEL_SECRET } = process.env;
const { CHANNEL_ACCESS_TOKEN } = process.env;

// create LINE SDK config from env variables
const config = {
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// event handler
function handleEvent(event) {
  db.get('events').push({
    type: event.type,
    mode: event.mode,
    timestamp: format(event.timestamp, 'yyyy-MM-dd HH:mm:ss'),
  }).write();
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  switch (event.type) {
    case 'message':
      break;
    default:
      break;
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };
  db.get('messages').push({
    ...event.message,
    token: event.replyToken,
    source: event.source,
  }).write();

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.get('/messages', (req, res) => {
  res.json(db.get('messages'));
});

app.get('/events', (req, res) => {
  res.json(db.get('events'));
});

app.get('/', (req, res) => {
  console.log(process.env.TEST);
  res.json(process.env);
});

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
