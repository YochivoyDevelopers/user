// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyD0EkCSp-9CseQtwRXbVvy9bhbAMAUcEzI",
    authDomain: "yochivoy-app.firebaseapp.com",
    databaseURL: "https://yochivoy-app.firebaseio.com",
    projectId: "yochivoy-app",
    storageBucket: "yochivoy-app.appspot.com",
    messagingSenderId: "447724713752",
    appId: "1:447724713752:web:51fc86e2516b632736106d",
    measurementId: "G-9K1XHQ586D"
  },
  onesignal: {
    appId: "63a1d142-32ef-45ef-acf7-7488bf80f157",
    googleProjectNumber: "540145033481",
    restKey: "ODliODBjOWQtZjNiMC00M2E4LTlkMmEtM2YzODA0MDc0YWNk"
  },
  stripe: {
    publicKey: "pk_test_51HZSxILl147XFj5bAj40kozHfQqdXjYqjTcOrWqYGl2rXaUBD0d5SkhL922hN1Nbx86zXpdGiXJLfO68mVlYjKAj00cfuq1uo7",
    secretKey: "sk_test_51HZSxILl147XFj5b30nQ2Jx7CfQkh2LnALIgdgGMSQ2NEwR9z9KZkEw0zuk8qOa8yBUY8V7b1ePW0MrD6vyM8vHY00pr5dVHlA"
  },
  paypal: {
    sandbox: "",
    production:
      "AUQL8ZowKIFJ0F1BpAqgNR5vh3HUW3YYwnMMUXH3C8LLXpx4tZ9j6tyItEcbGpThF6lnMbPOzAf4WDWp"
  },
  general: {
    symbol: "$",
    code: "MXN"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
