// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    //USER
    // apiKey: "AIzaSyDiukyca-NMpzoxy5hd68inYATrm18wlPQ",
    // authDomain: "deliveryapp-54574.firebaseapp.com",
    // databaseURL: "https://deliveryapp-54574-default-rtdb.firebaseio.com",
    // projectId: "deliveryapp-54574",
    // storageBucket: "deliveryapp-54574.appspot.com",
    // messagingSenderId: "239509151869",
    // appId: "1:239509151869:web:ca31cfa2bcd81834ead114",
    // measurementId: "G-4H52VG2VBB"

    // Yoshivoy
    apiKey: "AIzaSyDiukyca-NMpzoxy5hd68inYATrm18wlPQ",
    authDomain: "deliveryapp-54574.firebaseapp.com",
    databaseURL: "https://deliveryapp-54574-default-rtdb.firebaseio.com",
    projectId: "deliveryapp-54574",
    storageBucket: "deliveryapp-54574.appspot.com",
    messagingSenderId: "239509151869",
    appId: "1:239509151869:web:c9dd19ccf686ea20ead114",
    measurementId: "G-RCCQB4JT47"
  },
  onesignal: {
    appId: "520e7fdc-7d98-4e27-8b7b-106f7765dedb",
    googleProjectNumber: "540145033481",
    restKey: "NzAyZWQ5NzAtYTNlYS00MjRjLTk5MTktZjU0Y2I0MTU0MjBm"
  },
  stripe: {
    publicKey: "pk_test_51PxRvdIIXWFer6qKLrUTEsblKHp46OGTMocj4Qt2AcuFRaAl7FU9Nn6iElE2SI1O15UBMmMPLPEAHyiBltJS1Hdc00GbpkXpvj",
    secretKey: "sk_test_51PxRvdIIXWFer6qK7hb7a5UDA6BKtwjVwhW1OKqbBjHxluvTF4FkzVUoIPwPNp3caKa1myrYkYzZ1DlLs91a1ozi00qYlpgAHR"
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
