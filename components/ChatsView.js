import { store } from './store.js'

export default Vue.component('chats-view', {
    data: function() {
        return {
            store,
            chats: [],
        }
    },
    template: `
    <div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1>Chats</h1>
            <button @click="store.mainState = 'create-chat'">Create</button>
        </div>
        <ul class="find-friends-list">
            <li v-for="chat in chats"><span>{{ chat.name }}</span></li>
        </ul>
    </div>
    `
});