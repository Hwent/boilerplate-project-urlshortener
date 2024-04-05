require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const url = require("url");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

let urls = [];
let id = 1;

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/all", function (req, res) {
  res.json(urls);
});

// URL Shortener Microservice

app.post("/api/shorturl", (req, res) => {
  try {
    const original_url = req.body.url;
    const urlObject = new URL(original_url);
    const host = urlObject.hostname;

    dns.lookup(host, (err) => {
      if (err) {
        res.status(400).json({ error: "Invalid URL" });
      } else if (urls.find((url) => url.original_url === original_url)) {
        res.json(urls.find((url) => url.original_url === original_url));
      } else {
        let url = {
          original_url: original_url,
          short_url: id,
        };
        urls.push(url);
        res.json(url);
        id++;
      }
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid URL" });
  }
});

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  const url = urls.find((url) => url.short_url == id);
  if (url) {
    res.redirect(url.original_url);
  }
  res.status(404).json({ error: "No short url found for given input" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
