import { store } from './store.js'

export default Vue.component('friends-view', {
    data: function() {
        return {
            user: store.user
        }
    },
    template: `
    <div>
        <h1>Friends</h1>
        <ul class="find-friends-list">
            <li v-for="friend in user.friends">
                <span>{{ friend }}</span>
                <span><button v-on:click="$emit('load-chat', friend)">message</button></span>
            </li>
        </ul>
    </div>
    `
});