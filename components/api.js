import { store } from './store.js'

export default {
  get: function(method, params) {
    fetch(`http://localhost:3000/api/${method}`, {
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
      return response.json();

    }).catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
  },
  post: function(method, params) {
    fetch(`http://localhost:3000/api/${method}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${store.token}`
      },
      body: JSON.stringify(params)
    }).then((response) => {
      if (response.status !== 200) {
        console.log('Error: Status Code: ' + response.status);
        return;
      }
      // Examine the text in the response
      return response.json();

    }).catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
  }
}
