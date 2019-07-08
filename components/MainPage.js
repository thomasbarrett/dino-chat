import { store } from './store.js'
import TabContainer from './TabContainer.js'
import DiscoverView from './DiscoverView.js'
import FriendsView from './FriendsView.js'
import ChatsView from './ChatsView.js'
import ChatView from './ChatView.js'
import PlaceholderView from './PlaceholderView.js'
import CreateChatView from './CreateChatView.js'


export default Vue.component('main-page', {

  data: function() {
    return {
      store: store,
      members: [],
      tabElements: [
        { name: 'Discover', element: 'discover-view' },
        { name: 'Friends',  element: 'friends-view' },
        { name: 'Chats',  element: 'chats-view' },
      ]
    }
  },
  
  methods: {
    dologout() {
      this.$router.go();
    },
    loadChat(friend) {
      this.members = [this.store.user.username, friend];
      this.store.mainState = 'chat';
    },
  },
  template:
  `<div class="main-page">
    <header>
      <span style="display: flex">
        <img src="images/logo-graphic.png" height="50"/>
        <img src="images/logo-title.png" height="50"/>
      </span>
      <span>
        <button @click="dologout()">Logout {{ store.user.username}}</button>
      </span>
    </header>
    <div class="main-page-left">
      <tab-container v-bind:tabs="tabElements" @load-chat="loadChat($event)"></tab-container>
    </div>
    <chat-view v-if="store.mainState === 'chat'" class="main-page-right" v-bind:members="members"></chat-view>
    <create-chat-view v-else-if="store.mainState === 'create-chat'"/>
    <placeholder-view v-else message="Choose a Chat"/>
  </div>`
});
