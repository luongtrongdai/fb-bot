const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;
      const message = webhook_event.message.text;
      
      // Tạo URL từ nội dung tin nhắn
      const url = generateUrlFromMessage(message);
      
      // Gửi lại URL cho người dùng
      sendMessage(sender_psid, url);
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

function generateUrlFromMessage(message) {
  // Tạo URL từ nội dung tin nhắn
  const baseUrl = 'https://example.com';
  return `${baseUrl}?param=${encodeURIComponent(message)}`;
}

function sendMessage(sender_psid, response) {
  const PAGE_ACCESS_TOKEN = 'your_page_access_token';
  const request_body = {
    recipient: { id: sender_psid },
    message: { text: response }
  };

  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('Message sent!');
    } else {
      console.error('Unable to send message:' + err);
    }
  });
}

app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = 'your_verify_token';
  
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
  
    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    }
  });
  

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));
