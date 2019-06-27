var app = new Vue({
  el: '#app',
  data: {
    full_name: 'Thomas Barrett',
    location: 'Pasadena, CA',
    birthday: '2 January 2000',
    email: 'tbarrett@caltech.edu',
    star_sign: 'Capricorn',
    messages: [
      {
        from: 'Luke Juusola',
        text: 'It\'s Wednesday my dudes!'
      },
      {
        from: 'Jamie Littman',
        text: 'Bomb!'
      },
      {
        from: 'Natali Lelieur',
        text: 'Pay attention to me!'
      },
      {
        from: 'Alex Bardon',
        text: 'Thomas!'
      }
    ],
    frequent_friends: [
      {
        full_name: 'Natali Lelieur'
      },
      {
        full_name: 'Luke Juusola'
      },
      {
        full_name: 'Anshul Kamath'
      }
    ],
    chat: {
      members: [
        {
          full_name: 'Thomas Barrett'
        },
        {
          full_name: 'Luke Juusola'
        }
      ]
    }
  }
})
