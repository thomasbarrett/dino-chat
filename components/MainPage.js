import { store } from './store.js'
import api from './api.js'

export default Vue.component('main-page', {

  data: function() {
    return {
      tokenPayload: store.tokenPayload,
      friends: [],
      webSocket: null,
      messages: [],
      text: '',
      to: '',
      searchUserQuery: '',
      searchedUsers: []
    }
  },
  mounted: function() {
    let webSocket = new WebSocket(`ws://10.8.29.204:3000`,['jwt', `${store.token}`]);
    webSocket.onopen = (event) => {
      this.webSocket = webSocket;
    };
    webSocket.onmessage = (event) => {
      let dataObj = JSON.parse(event.data)
      if (dataObj.type == 'send-message') {
        this.messages = this.messages.concat(dataObj.messages);
      }
      this.scrollBottom();
    }
    fetch(`http://10.8.29.204:3000/api/users/${store.tokenPayload.username}/friends`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${store.token}`
      },
    }).then((response) => {
      if (response.status !== 200) {
        console.log('Error: Status Code: ' + response.status);
        return;
      }
      // Examine the text in the response
      // Examine the text in the response
      response.json().then((data) => {
        if (data.success) {
          this.friends = data.friends;
        } else {
          console.log(data.message)
        }
      });
    });


  },
  methods: {
    scrollBottom() {
      let elem = this.$refs.messages;
      console.log(elem);
      console.log(elem.scrollTop)
      console.log(elem.scrollHeight)
      elem.scrollTop = elem.scrollHeight;
    },
    sendMessage() {
      if (this.webSocket) {
        this.webSocket.send(JSON.stringify({
          type: 'send-message',
          timestamp: Date.now(),
          members: [store.tokenPayload.username, this.to],
          messages: [{ from: store.tokenPayload.username, text: this.text}]
        }));
        this.messages.push(
          { from: store.tokenPayload.username, text: this.text}
        );
        this.scrollBottom();
        this.text = '';
      }
    },
    searchUsers(username) {
      fetch(`http://10.8.29.204:3000/api/users?username=${username}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${store.token}`
        },
      }).then((response) => {
        if (response.status !== 200) {
          console.log('Error: Status Code: ' + response.status);
          return;
        }
        // Examine the text in the response
        // Examine the text in the response
        response.json().then((data) => {
          console.log(data.users);
          this.searchedUsers = data.users
        });
      })
    },
    addFriend(user) {
      if (this.friends.includes(user.username)) {
        return;
      }
      this.friends.push(user.username)
      fetch(`http://10.8.29.204:3000/api/users/${store.tokenPayload.username}/friends`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${store.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friends: [user.username]
        })
      }).then((response) => {
        if (response.status !== 200) {
          console.log('Error: Status Code: ' + response.status);
          return;
        }
        // Examine the text in the response
        // Examine the text in the response
        response.json().then((data) => {
          console.log(data)
        });
      });

      fetch(`http://10.8.29.204:3000/api/chats/create?members=${store.tokenPayload.username}|${user.username}`, {
        method:'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${store.token}`
        },
      }).then((response) => {
        if (response.status !== 200) {
          console.log('Error: Status Code: ' + response.status);
          return;
        }
        // Examine the text in the response
        // Examine the text in the response
        response.json().then((data) => {
          console.log(data)
        });
      })
    },
    loadChat(friend) {
      this.to = friend
      fetch(`http://10.8.29.204:3000/api/chats?members=${store.tokenPayload.username}|${friend}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${store.token}`
        },
      }).then((response) => {
        if (response.status !== 200) {
          console.log('Error: Status Code: ' + response.status);
          return;
        }
        // Examine the text in the response
        // Examine the text in the response
        response.json().then((data) => {
          console.log(data)
          this.messages = data.messages
        });
      })
    },
    dologout() {
      localStorage.removeItem('token');
      this.$router.go();
    }
  },
  template:
  `<div class="main-page">
    <header>
      <h1>{{ tokenPayload.username }} </h1>
      <a @click="dologout()">logout</a>
    </header>
    <div class="main-page-left">

      <h1>Discover</h1>
      <div class="input-container"><span>Search:</span><input type="text" @keypress.enter="searchUsers(searchUserQuery)" v-model="searchUserQuery"></input></div>
      <ul class="find-friends-list">
        <li v-for="user in searchedUsers"><span>{{ user.username }}</span><span><a @click="addFriend(user)">add friend</a></span></li>
      </ul>

      <h1>Friends</h1>
      <ul class="find-friends-list">
        <li v-for="friend in friends" @click="loadChat(friend)" ><span>{{ friend }}</span><span><a @click="addFriend(user)">message</a></span></li>
      </ul>
     
    </div>
    <div class="main-page-right">
      <h1>Messages</h1>
      <ul class="messages-list" ref="messages">
        <li v-bind:class="{ right: message.from == tokenPayload.username }" v-for="message in messages"><span>{{ message.text }}</span></li>
      </ul>
      <div class="input-container"><span>Send:</span><input type="text" @keypress.enter="sendMessage()" v-model="text"></input></div>
    </div>
  </div>`
});
