const express = require('express');
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
const process = require('process')
var WebSocket = require('ws');
const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient;
const mongo_uri = "mongodb+srv://thomasbarrett:foobar@dino-chat-fe6ea.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(mongo_uri, { useNewUrlParser: true });
const {UserDatabase, sanitize, sanitizeUsers} = require('../dst/models/user.js');
let users = null;
let messages = null;
let userDatabase = null;

const app = express();
var http = require('http').createServer(app);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('superSecret', 'pip-pip-cheerio'); // secret variable

/*==-----------------------------------------------------------------------==*\
| WEBSOCKETS MESSAGE FORWARDING
\*==-----------------------------------------------------------------------==*/

const wss = new WebSocket.Server({
  server: http,
  verifyClient: function (info, callback) {
    var token = info.req.headers['cookie'].split('=')[1];
    if (!token) {
      callback(false, 401, 'unauthorized');
    } else {
      jwt.verify(token, app.get('superSecret'), function (error, decoded) {
        if (error) {
          callback(false, 401, 'unauthorized');
        } else {
          info.req.user = decoded;
          callback(true);
        }
      })
    }
  }
});

sockets = {};

wss.on('connection', function connection(ws, req) {
  // create a new entry in username -> socket mapping
  sockets[req.user.username] = ws

  // delete entry in username -> socket mapping
  ws.on('close', () => {
    delete sockets[req.user.username]
  });

  ws.on('message', (message) => {
    data = JSON.parse(message);

    if (data.type === 'send-message') {

      messages.updateOne(
        { members: data.members.sort() },
        { $push: { messages: { $each: data.messages } } }
      );

      // forward message to all recipients
      data.members.forEach((username) => {
        // do not forward message to sender
        if (username != req.user.username) {
          // recipient will have a socket if connected
          recipientSocket = sockets[username];
          // send message to recipient if connected
          if (recipientSocket) {
            recipientSocket.send(message);
          }
        }
      })
    }
  });
});

/*==-----------------------------------------------------------------------==*\
| API ROUTES - PUBLIC
\*==-----------------------------------------------------------------------==*/

app.use('/app*', (req, res) => {
  res.sendFile(process.cwd() + '/index.html');
});

app.use(express.static('.'));

// get an instance of the router for api routes
var apiRoutes = express.Router();

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, app.get('superSecret'), function(error, decoded) {
      if (error) {
        return res.json({
          success: false,
          message: 'failed to authenticate token'
        });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
        success: false,
        message: 'failed to authenticate token'
    });
  }
});

function create_token(user, duration) {

  const payload = {
    _id: user._id,
    username: user.username,
    admin: user.admin
  };

  return jwt.sign(payload, app.get('superSecret'), {
    expiresIn: duration
  });
}

app.post('/api/authenticate', function(req, res) {
  const duration = 86400;
  userDatabase.getUser(req.body.username).then(user => {
    if (user) {
      if (user.password === req.body.password) {
        res.cookie('token', create_token(user, duration), { httpOnly: true, expire: duration })
           .json({ success: true, message: 'login successful', user: sanitize(user) });
      } else {
        console.log(user.password + ' ' + req.body.password);
        res.json({ success: false, message: 'incorrect password' });
      }
    } else {
      res.json({ success: false, message: `user not found: ${req.body.username}` });
    }
  });
});

app.post('/api/createAccount', function(req, res) {
  if (req.body.username && req.body.password) {
    userDatabase.getUser(req.body.username).then(existingUser => {
      if (!existingUser) {

        const user = {
          username: req.body.username,
          password: req.body.password,
          admin: false,
          friends: []
        };

        users.insertOne(user, function(error, response) {
          if (error) {
            res.json({ success: false, message: 'try again later' });
          } else {
            const duration = 86400;
            res.cookie('token', create_token(user, duration), { httpOnly: true, expire: duration })
               .json({ success: true, message: 'account creation successful', user: sanitize(user)});
          }
        });
      } else {
        res.json({ success: false, message: 'username not available' });
      }
    });
  } else {
    res.json({ success: false, message: 'invalid username and password' });
  }
});

/*==-----------------------------------------------------------------------==*\
| API ROUTES - PROTECTED
\*==-----------------------------------------------------------------------==*/

app.use('/api', apiRoutes);

app.get('/api/users/:username', (req, res) => {
  userDatabase.getUser(req.params.username).then(user => {
    res.json({ success: true, user: santizie(user)})
  });
});

app.get('/api/users', (req, res) => {
  const query = req.query.query || '';
  const page = parseInt(req.query.page) || 1;
  const count = parseInt(req.query.count) || 10;
  userDatabase.queryUsers(query, page, count).then((users) => {
    res.json({ success: true, users: sanitizeUsers(users)})
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
          .project({messages: {$slice: -50}})
          .toArray(function(error, result) {
            if (error) throw error;
            if (result && result[0]) {
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

/*==-----------------------------------------------------------------------==*\
| STARTUP ROUTINE
\*==-----------------------------------------------------------------------==*/

client.connect(err => {
  users = client.db("dino-chat").collection("users");
  messages = client.db("dino-chat").collection("messages");
  userDatabase = new UserDatabase(client, 'dino-chat');
  http.listen(3000, () => console.log('Triceratalk Server Initiated'));
});
