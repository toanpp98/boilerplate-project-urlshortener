require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');

const app = express();

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

const urlModel = require(__dirname + '/models/url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.post('*', bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Solution
app.post('/api/shorturl', (req, res) => {
  const resInvalid = () => {
    res.json({
      error: 'Invalid URL',
    });
  };
  
  const url = req.body.url;
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch (err) {
    resInvalid();
    return;
  }
  
  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      resInvalid();
      return;
    }

    const urlDoc = new urlModel({
      val: url,
    });
    urlDoc.save((saveErr, { _id, val }) => {
      if (saveErr) {
        res.json({
          error: 'System Error',
        })
        return;
      }
      res.json({ original_url: val, short_url: _id });
    });
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  const resInvalid = () => {
    res.json({
      error: 'Invalid short URL',
    });
  };
  
  const id = req.params.id;
  if (!/^\d+$/.test(id)) {
      resInvalid();
      return;
  }
  urlModel.findById(id).exec((err, url) => {
    if (err) {
      res.json({
        error: 'System Error',
      });
      return;
    }
    
    if (!url) {
      resInvalid();
      return;
    }
    res.redirect(url.val);
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
