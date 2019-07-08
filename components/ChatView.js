import { store } from './store.js'
import { loadChat } from './api.js'

export default Vue.component('chat-view', {
  props: {
    members: Array
  },
  data: function() {
    return {
      user: store.user,
      ws: null,
      text: '',
      messages: [],
      stickerStyle: {
        display: 'none',
        overflow: 'scroll',
        height: '200px'
      },
    }
  },
  mounted: function() {
    let ws = new WebSocket(store.WSURL);
    ws.onopen = (event) => {
      this.ws = ws;
    };
    ws.onmessage = (event) => {
      let data = JSON.parse(event.data)
      if (data.type === 'send-message') {
        console.log('message');
        this.onMessage(data.messages);
      } else {
        console.log(`unknown event type ${data.type}`)
      }
    }
  },
  methods: {
    toggleStickers() {
      if (this.stickerStyle.display === 'flex') {
        this.stickerStyle.display = 'none';
      } else {
        this.stickerStyle.display = 'flex';
      }
    },

    sendMessage(text) {
      // notify server of message
      this.ws.send(JSON.stringify({
        type: 'send-message',
        timestamp: Date.now(),
        members: this.members,
        messages: [{ from: this.user.username, text}]
      }));

      // update ui to reflect messages
      this.messages.unshift({ from: this.user.username, type: 'text', text});

      this.text = '';
    },

     
    onMessage(messages) {
      this.messages.unshift(...messages);
    },

    isText(message) {
      if (message.type) {
        return message.type === 'text';
      } else return true;
    },

    isSticker(message) {
      if (message.type) {
        return message.type === 'sticker';
      } else return false;
    },

    sendSticker(index) {
        // notify server of message
        this.ws.send(JSON.stringify({
          type: 'send-message',
          timestamp: Date.now(),
          members: this.members,
          messages: [{ from: this.user.username, type: 'sticker', text: `images/dinosaurs/dino${index}.png`}]
        }));
  
        // update ui to reflect messages
        this.messages.unshift({ from: this.user.username, type: 'sticker', text: `images/dinosaurs/dino${index}.png`});
    }
  },
  watch: {
    members: function() {
      loadChat(this.members).then(response => {
        this.messages = response.messages.reverse();
      }).catch(error => {
        console.log(error);
      });
    }
  },
  template: `
  <div>
    <div class="mobile-toolbar">
      <h1>Messages</h1>
    </div>
    <div class="messages-list" ref="chatElement">
      <div v-bind:class="{ right: message.from == user.username }" v-for="message in messages">
        <span v-if='isText(message)'>{{ message.text }}</span>
        <img v-else-if='isSticker(message)' v-bind:src="message.text" />
      </div>
    </div>
    <div class="message-input">
      <div class="input-container">
        <button @click="toggleStickers()">Stickers</button>
        <input type="text" @keypress.enter="sendMessage(text)" placeholder="message" v-model="text"></input>
      </div>
      <div class="sticker-container" v-bind:style="stickerStyle">
        <img @click="sendSticker(1)" src="images/dinosaurs/dino1.png"></img>
        <img @click="sendSticker(2)" src="images/dinosaurs/dino2.png"></img>
        <img @click="sendSticker(3)" src="images/dinosaurs/dino3.png"></img>
        <img @click="sendSticker(4)" src="images/dinosaurs/dino4.png"></img>
        <img @click="sendSticker(5)" src="images/dinosaurs/dino5.png"></img>
        <img @click="sendSticker(6)" src="images/dinosaurs/dino6.png"></img>
        <img @click="sendSticker(7)" src="images/dinosaurs/dino7.png"></img>
        <img @click="sendSticker(8)" src="images/dinosaurs/dino8.png"></img>
        <img @click="sendSticker(9)" src="images/dinosaurs/dino9.png"></img>
        <img @click="sendSticker(10)" src="images/dinosaurs/dino10.png"></img>
        <img @click="sendSticker(11)" src="images/dinosaurs/dino11.png"></img>
        <img @click="sendSticker(12)" src="images/dinosaurs/dino12.png"></img>
        <img @click="sendSticker(13)" src="images/dinosaurs/dino13.png"></img>
        <img @click="sendSticker(14)" src="images/dinosaurs/dino14.png"></img>
        <img @click="sendSticker(15)" src="images/dinosaurs/dino15.png"></img>
        <img @click="sendSticker(16)" src="images/dinosaurs/dino16.png"></img>
        <img @click="sendSticker(17)" src="images/dinosaurs/dino17.png"></img>
        <img @click="sendSticker(18)" src="images/dinosaurs/dino18.png"></img>
        <img @click="sendSticker(19)" src="images/dinosaurs/dino19.png"></img>
        <img @click="sendSticker(20)" src="images/dinosaurs/dino20.png"></img>
        <img @click="sendSticker(21)" src="images/dinosaurs/dino21.png"></img>
        <img @click="sendSticker(22)" src="images/dinosaurs/dino22.png"></img>
        <img @click="sendSticker(23)" src="images/dinosaurs/dino23.png"></img>
        <img @click="sendSticker(24)" src="images/dinosaurs/dino24.png"></img>
        <img @click="sendSticker(25)" src="images/dinosaurs/dino25.png"></img>
        <img @click="sendSticker(26)" src="images/dinosaurs/dino26.png"></img>
      </div>
    </div>
  </div>
  `
});
