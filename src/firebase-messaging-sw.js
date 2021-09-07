

importScripts('https://www.gstatic.com/firebasejs/8.6.3/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.3/firebase-messaging.js');

firebase.initializeApp({
  apiKey: 'AIzaSyD_Eur_nT95G0yEmsqYggaFAjWCuxx7PVc',
  authDomain: 'pokedex-72767.firebaseapp.com',
  databaseURL: 'https://pokedex-72767-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'pokedex-72767',
  storageBucket: 'pokedex-72767.appspot.com',
  messagingSenderId: '537440639663',
  appId: '1:537440639663:web:7b2ad29907f7d4d010125a',
  measurementId: 'G-D5S1816GFX'
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('src/firebase-messaging-sw.js')
    .then(function (registration) {
      console.log('Registration successful, scope is:', registration.scope);
    }).catch(function (err) {
    console.log('Service worker registration failed, error:', err);
  });
}



const messaging = firebase.messaging();

