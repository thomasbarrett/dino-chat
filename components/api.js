import { store } from './store.js'

const api = {
  get: function(method) {
    return fetch(`${store.url}/api/${method}`, {
      headers: {
        'Accept': 'application/json',
      },
    }).then(response => {
      if (response.status === 200) {
        return response.json(); 
      } else {
        return Promise.reject({ message: `status code: ${response.status}` });
      }
    }).then(data => {
      if (data.success) {
        return data; 
      } else {
        return Promise.reject({ message: data.message });
      }
    });
  },
  post: function(method, params) {
    return fetch(`${store.url}/api/${method}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params)
    }).then(response => {
      if (response.status === 200) {
        return response.json(); 
      } else {
        return Promise.reject({ message: `status code: ${response.status}` });
      }
    }).then(data => {
      if (data.success) {
        return data; 
      } else {
        return Promise.reject({ message: data.message });
      }
    });
  }
}

function authenticate(username, password) {
  return api.post('authenticate', {username, password});
}

function createAccount(username, password) {
  return api.post('createAccount', {username, password});
}

function queryUsers(query, page, count) {
  return api.get(`users?query=${query}&page=${page}&count=${count}`);
}

function addFriends(user, friends) {
  return api.post(`users/${user}/friends`, {friends});
}

function getFriends(user) {
  return api.get(`users/${user}/friends`);
}

function loadChat(members) {
  return api.get(`chats?members=${members.join('|')}`);
}

function createChat(members) {
  return api.post(`chats/create?members=${members.join('|')}`);
}

export {authenticate, createAccount, queryUsers, loadChat, createChat, addFriends, getFriends};