const express = require("express");
const bodyParser = require("body-parser");
const address = require("address");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "images")));

require("./app/route")(app);

// listen for requests
app.listen(8080, () => {
  address((err, addrs) => {
    console.log("listening on: http://" + addrs.ip + ":8080");
  });
});
