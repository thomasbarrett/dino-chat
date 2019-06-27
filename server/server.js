const express = require('express');
const app = express();

let db = {
  chats: {
    '2000': {
      users: ['1232','1233'],
      messages: [
        {
          user: '1232',
          text: 'Hello'
        },
        {
          user: '1233',
          text: 'Hi...'
        },
        {
          user: '1233',
          text: 'What\'s up?'
        }
      ]
    }
  },
  users: {
    '1232': {
      id: '1232',
      name: 'ninabarrett',
      chats: ['2000'],
      contacts: ['1233','1234','1235','1236']
    },
    '1233': {
      id: '1233',
      name: 'thomasbarrett',
      chats: ['2000'],
      contacts: ['1232','1234','1235','1236']
    },
    '1234': {
      id: '1234',
      name: 'joebarrett',
      contacts: ['1232','1233','1236']
    },
    '1235': {
      id: '1235',
      name: 'ajprofaca',
      contacts: ['1232','1233']
    },
    '1236': {
      id: '1236',
      name: 'geoffbarrett',
      contacts: ['1232','1233','1234']
    }
  }
}

app.get('/api', (req, res) => {
    res.send('An alligator approaches!');
});

app.get('/api/users/:name', (req, res) => {
  let name = req.params.name;

  for (let id in db.users) {
    if (db.users[id].name === name) {
      res.json(db.users[id]);
    }
  }

  res.json(`user ${user} not found in database`);
});

app.get('/api/contacts/:user', (req, res) => {
  let user = req.params.user;

  if (db.users[user]) {
    res.json(db.users[user].contacts.map(id => db.users[id]));
  } else {
    res.json(`user ${user} not found in database`);
  }
});


app.get('/api/chats/:user', (req, res) => {
  let user = req.params.user;

  if (db.users[user]) {
    res.json(db.users[user].chats);
  } else {
    res.json(`user ${user} not found in database`);
  }
});


app.get('/api/chats/create/:user', (req, res) => {
  let user = req.params.user;

  if (db.users[user]) {
    res.json(db.users[user].chats);
  } else {
    res.json(`user ${user} not found in database`);
  }
});


app.get('/api/chat/:chat', (req, res) => {
  let chat = req.params.chat;

  if (db.chats[chat]) {
    res.json(db.chats[chat].messages);
  } else {
    res.json(`user ${user} not found in database`);
  }
});


app.listen(3000, () => console.log('Gator app listening on port 3000!'));
