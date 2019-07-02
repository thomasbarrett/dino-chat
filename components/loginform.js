import { store } from './store.js'

Vue.component('login-form', {
  template: `
  <div class='login-border'>
    <h1>Login</h1>
    <form v-on:submit.prevent="onSubmit">

      <label for="username">username:</label><br/>
      <input type="text" v-model="username" name="username"/><br>

      <label for="password">password:</label><br/>
      <input type="password" v-model="password" name="password"/><br/>

      <button>Submit</button>

      <p>{{ this.errorMessage }}</p>
    </form>
    <p>Don't already have an account? <a v-on:click='$emit("toggle-login")' href="#">Create Account</a></p>
  </div>
  `,


    data: function () {
      return {
        username: '',
        password: '',
        errorMessage: ' ',
      }
    },

    methods: {

      onSubmit: function() {
        fetch('http://10.8.29.204:3000/api/authenticate', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
            admin: false
          })
        }).then((response) => {
          if (response.status !== 200) {
            console.log('Error: Status Code: ' + response.status);
            return;
          }
          // Examine the text in the response
          response.json().then((data) => {
            if (data.success) {
              store.token = data.token;
              store.user = data.user;
            } else {
              this.errorMessage = data.message;
              console.log(this.errorMessage)
            }
          });

        }).catch(function(err) {
          console.log('Fetch Error :-S', err);
        });
      }
    },
});


Vue.component('create-account-form', {
  data: function () {
    return {
      username: '',
      password: '',
      email: '',
      errorMessage: ' ',
    }
  },
  template: `
  <div class='login-border'>
    <h1>Create Account</h1>
    <form v-on:submit.prevent="onSubmit">

      <label for="username">username:</label><br/>
      <input type="text" v-model="username" name="username"/><br>

      <label for="password">password:</label><br/>
      <input type="password" v-model="password" name="password"/><br/>

      <label for="email">email:</label><br/>
      <input type="text" v-model="email" name="email"/><br>

      <button>Submit</button>

      <p>{{ this.errorMessage }}</p>
    </form>
    <p>Already have an account? <a v-on:click='$emit("toggle-login")' href="#">Login</a></p>
  </div>
  `,
  methods: {

    onSubmit: function() {
      fetch('http://10.8.29.204:3000/api/createAccount', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
          email: this.email
        })
      }).then((response) => {
        if (response.status !== 200) {
          console.log('Error: Status Code: ' + response.status);
          return;
        }
        // Examine the text in the response
        response.json().then((data) => {
          if (data.success) {
            store.token = data.token;
          } else {
            this.errorMessage = data.message;
            console.log(this.errorMessage)
          }
        });

      }).catch(function(err) {
        console.log('Fetch Error :-S', err);
      });
    }
  },
});


export default Vue.component('login-page', {
  data: function() {
    return {
      toggleLogin: true
    }
  },
  computed: {
    displayedComponent: function() {
      return this.toggleLogin ? 'login-form': 'create-account-form';
    }
  },
  methods: {
    handleToggleLogin() {
      this.toggleLogin = !this.toggleLogin;
    }
  },
  template: `
  <div class='login-container'>
      <component v-on:toggle-login='handleToggleLogin()' v-bind:is='displayedComponent'></component>
  </div>
  `
});
