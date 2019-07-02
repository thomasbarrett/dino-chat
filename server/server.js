const express = require('express');
const bodyParser = require('body-parser')
const process = require('process')
var WebSocket = require('ws');
const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient;
const mongo_uri = "mongodb+srv://thomasbarrett:foobar@dino-chat-fe6ea.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(mongo_uri, { useNewUrlParser: true });
const UserDatabase = require('../dst/models/user.js').UserDatabase;
let users = null;
let messages = null;
let userDatabase = null;

const app = express();
var http = require('http').createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('superSecret', 'pip-pip-cheerio'); // secret variable

const wss = new WebSocket.Server({
  server: http,
  verifyClient: function (info, cb) {
      var token = info.req.headers['sec-websocket-protocol'].split(', ')[1]
      if (!token)
          cb(false, 401, 'Unauthorized')
      else {
          jwt.verify(token, app.get('superSecret'), function (err, decoded) {
              if (err) {
                  cb(false, 401, 'Unauthorized')
              } else {
                  info.req.user = decoded //[1]
                  cb(true)
              }
          })

      }
  }
});
webSockets = {};
// API ROUTES -------------------

// get an instance of the router for api routes
var apiRoutes = express.Router();

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

  var token = req.get('Authorization') && req.get('Authorization').split(' ')[1];
  if (token) {
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
app.post('/api/authenticate', function(req, res) {
  users.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: `Authentication failed. User ${req.body.username} not found.` });
    } else if (user) {
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else if (req.body.admin && !user.admin) {
        res.json({ success: false, message: 'Authentication failed. Admin Required' });
      } else {
        const payload = {
          username: req.body.username,
          admin: user.admin
        };
        var token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn: "24h"
        });
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token,
          user: {
            username: user.username,
            admin: user.admin
          }
        });
      }
    }
  });
});


// route to authenticate a user (POST http://localhost:8080/api/authenticate)
app.post('/api/createAccount', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({ success: false, message: 'username and password required' });
    next();
  }

  users.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    if (user) {
      res.json({ success: false, message: 'Authentication failed. Username not available.' });
    } else {
      users.insertOne({
        username: req.body.username,
        password: req.body.password,
        admin: false,
        friends: []
      }, function(error, response) {
        if (error) {
          res.json({ success: false, message: 'unknown error' });
        } else {
          const payload = {
            username: req.body.username,
            admin: false
          };
          var token = jwt.sign(payload, app.get('superSecret'), {
            expiresIn: "24h"
          });
          res.json({
            success: true,
            message: 'account created',
            token: token,
            user: {
              username: req.body.username,
              admin: false
            }
          });
        }
      });
    }
  });
});

app.use('/api', apiRoutes);

app.get('/api/users', (req, res) => {
  userDatabase.queryUsers(req.query.username || '', 1, 10).then((users) => {
    res.json({ success: true, users: users})
  });
});

app.get('/api/users/:username/friends', (req, res) => {
  userDatabase.getUser(req.params.username).then((user) => {
    if (user) {
      res.json({ success: true, friends: user.friends });
    } else {
      res.json({ success: false, message: `error: user not found: ${req.params.username}` });
    }
  });
});

app.post('/api/users/:username/friends', (req, res) => {
  if (req.user.username === req.params.username) {
    userDatabase.addFriends(req.params.username, req.body.friends).then((success) => {
      res.json({ success });
    });
  } else {
    res.json({ success: false, message: `error: permission denied` });
  }
});

app.get('/api/chats', (req, res) => {
  let members = req.query.members.split('|').sort();
  if (members.includes(req.user.username)) {
  messages.find({ members })
          .project({messages: {$slice: -20}})
          .toArray(function(error, result) {
            if (error) throw error;
            if (result) {
              res.json({ success: true, messages: result[0].messages});
            } else {
              res.json({ success: true, messages: [] });
            }
          });
  } else {
    res.json({ success: false, message: 'you do not have permission' });
  }
});


app.post('/api/chats/create', (req, res) => {
  let members = req.query.members.split('|').sort();
  if (members.includes(req.user.username)) {
    messages.insertOne({
      members,
      messages: []
    }, function(err, result) {
      if (err) {
        throw err;
      } else {
        res.json({ success: true, message: 'chat created' });
      }
    });
  } else {
    res.json({ success: false, message: 'you do not have permission' });
  }
});

app.post('/api/chats/send', (req, res) => {
  let members = req.body.members.sort();
  let newMessages = req.body.messages;
  if (members.includes(req.user.username)) {
    messages.updateOne(
      { members },
      { $push: { messages: { $each: newMessages } } },
      function(err, result) {
        if (err) {
          throw err;
        } else {
          res.json({ success: true, message: 'message sent' });
        }
      });
  } else {
    res.json({ success: false, message: 'you do not have permission' });
  }
});

wss.on('connection', function connection(ws, req) {
  ws.user = req.user;
  webSockets[ws.user.username] = ws
  ws.on('message', (message) => {
    obj = JSON.parse(message);
    if (obj.type === 'send-message') {
      messages.updateOne(
        { members: obj.members.sort() },
        { $push: { messages: { $each: obj.messages } } },
        function(err, result) {
          if (err) {
            throw err;
          } else {
            ws.send(JSON.stringify({ type: 'info', success: true, message: 'message sent' }));
          }
        }
      );
      obj.members.forEach((username) => {
        if (username != req.user.username) {
          recipient = webSockets[username];
          if (recipient) {
            console.log('message send')
            recipient.send(message);
          } else {
            console.log(`recipient ${username} not connected`)
          }
        }
      })

    }
  });
  ws.on('close', () => {
    delete webSockets[ws.user.username]
  });
});

app.use('/app*', (req, res) => {
  res.sendFile(process.cwd() + '/index.html');
});

app.use(express.static('.'));

client.connect(err => {
  users = client.db("dino-chat").collection("users");
  messages = client.db("dino-chat").collection("messages");
  userDatabase = new UserDatabase(client, 'dino-chat');
  
  http.listen(3000, () => console.log('Gator app listening on port 3000!'));
});
