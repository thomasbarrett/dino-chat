import { store } from './store.js'
import { queryUsers, createChat, addFriends} from './api.js'

export default Vue.component('discover-view', {
    data: function() {
        return {
            user: store.user,
            searchUserQuery: '',
            searchedUsers: []
        }
    },
    methods: {
        searchUsers(query) {
            // search for the top ten users found with given query
            queryUsers(query, 1, 10).then(result => {
                this.searchedUsers = result.users
            }).catch(error => {
              console.log(error);
            });
        },
        addFriend(friend) {
            if (!this.user.friends.includes(friend.username)) {
                this.user.friends.push(friend.username);

                // append friend to friends list in database
                addFriends(this.user.username, [friend.username]).then(result => {
                    console.log(result);
                }).catch(error => {
                    console.log(error);
                });
        
                // create a chat with the new friend to create chat element in database
                createChat([this.user.username, friend.username]).then(response => {
                    console.log(response)
                }).catch(error => {
                    console.log(error);
                });
            }
        },
    },
    template: `
    <div>
        <h1>Discover</h1>
        <div class="input-container">
            <input type="text" placeholder="find by username" @keypress.enter="searchUsers(searchUserQuery)" v-model="searchUserQuery" />
        </div>
        <ul class="find-friends-list">
            <li v-for="user in searchedUsers"><span>{{ user.username }}</span>
            <span><button @click="addFriend(user)">add friend</button></span></li>
        </ul>
    </div>
    `
});
