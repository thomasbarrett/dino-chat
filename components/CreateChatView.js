import { store } from './store.js'
import QueryUsersView from './QueryUsersView.js'

export default Vue.component('create-chat-view', {
    data: function() {
        return {
            user: store.user,
            members: [store.user.username]
        }
    },
    methods: {
        addMember: function(username) {
            if (!this.members.includes(username)) {
                this.members.push(username);
            }
        },
        createChat: function() {

        }
    },
    template: `
    <div style="padding: 20px; width: 100%; height: 100%; box-sizing: border-box;">
        <h1>Create Chat</h1>
        <input style="width: 100%; margin: 10px 0;" type="text" placeholder="chat name"><br/>
        <div style="margin: 10px 0; min-height: 32px; border-top: 1px solid #eeeeee; border-bottom: 1px solid #eeeeee;">
            <div style="display: inline-block; margin: 5px; background: #eeeeee; border-radius: 16px; padding: 5px; box-sizing: border-box;" v-for="member in members">{{ member }}</div>
        </div>
        <query-users-view action="add to group" @action="addMember($event.username)"></query-users-view>
        <button @click="">Create</button>
    </div>
    `
});