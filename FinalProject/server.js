const express = require("express");
// const http = require("http");
const socketIo = require("socket.io");

var https = require('https');
var fs = require('fs');

var credentials = {
  key: fs.readFileSync('/etc/letsencrypt/live/zw3454.imany.io/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/zw3454.imany.io/fullchain.pem')
};

var app = express();

var httpsServer = https.createServer(credentials, app);


// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);
const io = socketIo(httpsServer);

app.use(express.static("public"));

var Datastore = require("nedb");
var db = new Datastore({ filename: "data.db", autoload: true });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("logMyTeam", (data) => {
    db.insert(data, (err, newDoc) => {
      if (err) {
        // console.error("Error inserting document:", err);
        return;
      }
      // console.log("Inserted document:", newDoc);
    });
  });

  socket.on("nextOpponent", (data) => {
    const phaseNum = data.gamePhase;
    db.find({ phaseNum: phaseNum }, (err, decks) => {
      if (err) {
        console.error("Error finding decks:", err);
        return;
      }
      const randomIndex = Math.floor(Math.random() * decks.length);
      const randomDeck = decks[randomIndex];
      console.log("Random deck:", decks[randomIndex]);
      socket.emit("nextOpponent", randomDeck);
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 8888;

// server.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

httpsServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});