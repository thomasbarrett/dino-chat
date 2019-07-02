let store = {
  token_: '',
  get token() {
    var t = localStorage.getItem('token');
    if (typeof(t) != undefined && t) {
      let payload = JSON.parse(atob(t.split('.')[1]));
      console.log(Date.now()/1000);
      console.log(payload.exp)
      if (Date.now()/1000 < payload.exp) {
        console.log('not expired')
        return t;
      } else {
        console.log('expired')
        return null;
      }
    } else {
      return null;
    }
    //return this.token_;
  },
  set token(t) {
    localStorage.setItem('token', t);
    //this.token_ = t;
  },
  get tokenPayload() {
    let payload = JSON.parse(atob(this.token.split('.')[1]));
    return payload;
  }

}

export { store }
