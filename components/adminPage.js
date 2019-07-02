import { store } from './store.js'

export default Vue.component('admin-page', {
  data: function() {
    return {
      users:[]
    }
  },
  template:`
  <div class='admin-page'>
    <div>
    <h1>User Data</h1>
    <table>
    <tr>
      <th>username</th>
      <th>password</th>
      <th>admin</th>
    </tr>
    <tr v-for="user in users">
      <td>{{ user.username }}</td>
      <td>{{ user.password }}</td>
      <td>{{ user.admin }}</td>
    </tr>
    </table>
    </div>
  </div>
  `,

  mounted: function() {
    this.refreshUsers();
  },
  methods: {
    refreshUsers: function() {
      fetch('http://localhost:3000/api/users', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${store.token}`
        },
      }).then((response) => {
        if (response.status !== 200) {
          console.log('Error: Status Code: ' + response.status);
          return;
        }
        // Examine the text in the response
        response.json().then((data) => {
          if (data.success) {
            console.log(data.users)
            this.users = data.users
          } else {
            this.errorMessage = data.message;
            console.log(this.errorMessage)
          }
        });

      }).catch(function(err) {
        console.log('Fetch Error :-S', err);
      });
    }
  }
});
