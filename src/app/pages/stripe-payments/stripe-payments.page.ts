import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApisService } from "src/app/services/apis.service";
import { UtilService } from "src/app/services/util.service";
import * as moment from "moment";
import swal from "sweetalert2";
import { NavController } from "@ionic/angular";
import { Stripe } from '@ionic-native/stripe/ngx';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AddCardPage } from '../add-card/add-card.page'; 
import Swal from "sweetalert2";

@Component({
  selector: "app-stripe-payments",
  templateUrl: "./stripe-payments.page.html",
  styleUrls: ["./stripe-payments.page.scss"]
})
export class StripePaymentsPage implements OnInit {
  cid: any;
  cards: any = [];
  card_token: any;
  totalPrice: any = 0;
  totalItem: any = 0;
  serviceTax: any = 0;
  deliveryCharge: any = 0;
  grandTotal: any = 0;
  deliveryAddress: any;
  venueFCM: any = "";
  vid: any = "";
  payKey: any = "";
  coupon: any;
  dicount: any;
  cardBrand: string;
  cart: any = [];
  constructor(
    private router: Router,
    private api: ApisService,
    private util: UtilService,
    private navCtrl: NavController,
    private stripe: Stripe,
    private http: HttpClient
  ) {}

  getCards() {
    const stripeCustomerId = localStorage.getItem('stripeCustomerId'); // Usar stripeCustomerId
    if (!stripeCustomerId) {
      this.util.showErrorAlert(this.util.translate('Customer not found'));
      return;
    }

    this.api.httpGet(`https://api.stripe.com/v1/customers/${stripeCustomerId}/sources?object=card`)
      .subscribe(
        (cards: any) => {
          this.util.hide();
          if (cards && cards.data) {
            this.cards = cards.data;
          }
        },
        error => {
          this.util.hide();
          this.util.errorToast(this.util.translate("Something went wrong"));
        }
      );
  }

  deleteCard(cardId: string) {
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('To delete this card'),
      showCancelButton: true,
      confirmButtonText: this.util.translate('Yes'),
      cancelButtonText: this.util.translate('Cancel')
    }).then((data) => {
      if (data && data.value) { // Si el usuario confirma
        const stripeCustomerId = localStorage.getItem('stripeCustomerId'); // Usar stripeCustomerId
        if (!stripeCustomerId) {
          this.util.showErrorAlert(this.util.translate('Customer not found'));
          return;
        }

        // Eliminar tarjeta
        this.api.httpDelete(`https://api.stripe.com/v1/customers/${stripeCustomerId}/sources/${cardId}`)
          .subscribe(
            () => {
              this.getCards(); // Refrescar la lista de tarjetas
            },
            error => {
              this.util.showErrorAlert(this.util.translate('Something went wrong'));
            }
          );
      }
    });
  }

  getProfile() {
    this.util.show();
    console.log("loca", localStorage.getItem("uid"));
    this.api
      .getProfile(localStorage.getItem("uid"))
      .then(
        (data: any) => {
          console.log("data", data);
          if (data && data.cid) {
            this.cid = data.cid;
            this.getCards();
          } else {
            this.util.hide();
          }
        },
        error => {
          console.log(error);
          this.util.hide();
          this.util.errorToast(this.util.translate("Something went wrong"));
        }
      )
      .catch(error => {
        console.log(error);
        this.util.hide();
        this.util.errorToast(this.util.translate("Something went wrong"));
      });
  }
  

  loadCards() {
    const stripeCustomerId = localStorage.getItem('stripeCustomerId'); // Usar stripeCustomerId, no uid
    console.log(`Loading cards for Customer ID: ${stripeCustomerId}`); // Verifica el ID del cliente
  
    if (!stripeCustomerId || stripeCustomerId.trim() === '') {
      console.error('No valid Stripe Customer ID found in localStorage.');
      this.util.showErrorAlert(this.util.translate('Customer not found'));
      return;
    }
  
    // this.util.show(); // Mostrar overlay de carga antes de la solicitud
  
    // Realiza la solicitud para obtener las tarjetas
    this.api.httpGet(`https://api.stripe.com/v1/customers/${stripeCustomerId}/sources`)
      .subscribe(
        (response: any) => {
          this.cards = response.data; // Almacena las tarjetas en 'this.cards'
          console.log('Cards loaded successfully:', this.cards);
          this.util.hide(); // Oculta el overlay después de cargar las tarjetas
        },
        error => {
          console.error('Error loading cards:', error);
          this.util.showErrorAlert(this.util.translate('Error loading cards'));
          this.util.hide(); // Oculta el overlay también en caso de error
        }
      );
  }
  

  addCard(cardDetails) {
    const stripeCustomerId = localStorage.getItem('uid');
  
    if (!stripeCustomerId) {
      this.util.showErrorAlert(this.util.translate('Customer not found'));
      return;
    }
  
   
    this.api.httpPost(`https://api.stripe.com/v1/customers/${stripeCustomerId}/sources`, cardDetails)
      .subscribe(
        (response: any) => {
          console.log('Card added successfully:', response);
          this.loadCards(); // Carga tarjetas después de agregar una nueva
          this.util.showToast("Tarjeta agregada con éxito.", "success", "bottom"); // Mensaje de éxito
        },
        error => {
          if (error?.error?.error) {
            console.error('Stripe error:', error.error.error);
            this.util.showErrorAlert(error.error.error.message);
          } else {
            console.error('General error:', error);
            this.util.showErrorAlert(this.util.translate('Something went wrong'));
          }
        }
      );
  }


  async ngOnInit() {
    this.loadCards();
    this.calculate();
    const foods = await JSON.parse(localStorage.getItem("foods"));
    let recheck = await foods.filter(x => x.quantiy > 0);
    console.log(recheck);
    const add = JSON.parse(localStorage.getItem("deliveryAddress"));
    this.vid = localStorage.getItem("vid");
    this.api
      .getVenueUser(this.vid)
      .then(
        data => {
          console.log("venue", data);
          if (data && data.fcm_token) {
            this.venueFCM = data.fcm_token;
          }
        },
        error => {
          this.util.errorToast(this.util.translate("Something went wrong"));
          this.router.navigate(["tabs"]);
        }
      )
      .catch(error => {
        this.util.errorToast(this.util.translate("Something went wrong"));
        this.router.navigate(["tabs"]);
        console.log(error);
      });
    if (add && add.address) {
      this.deliveryAddress = add;
    }
    this.coupon = JSON.parse(localStorage.getItem("coupon"));
    const cart = localStorage.getItem("userCart");
    try {
      if (
        cart &&
        cart !== "null" &&
        cart !== undefined &&
        cart !== "undefined"
      ) {
        this.cart = JSON.parse(localStorage.getItem("userCart"));
        // this.calculate();
      } else {
        this.cart = [];
      }
    } catch (error) {
      console.log(error);
      this.cart = [];
    }
  }
  

  async calculate() {
    console.log("cart--->,", this.cart);
    // new
    let item = this.cart.filter(x => x.quantiy > 0);
    this.cart.forEach(element => {
      if (element.quantiy === 0) {
        element.selectedItem = [];
      }
    });
    console.log("item=====>>", item);
    this.totalPrice = 0;
    this.totalItem = 0;
    this.cart = [];
    console.log("cart emplth", this.cart, item);
    item.forEach(element => {
      this.totalItem = this.totalItem + element.quantiy;
      console.log("itemsss----->>>", element);
      if (element && element.selectedItem && element.selectedItem.length > 0) {
        let subPrice = 0;
        element.selectedItem.forEach(subItems => {
          subItems.item.forEach(realsItems => {
            subPrice = subPrice + realsItems.value;
          });
          subPrice = subPrice * subItems.total;
        });
        this.totalPrice = this.totalPrice + subPrice;
        // this.totalPrice = this.totalPrice + (subPrice * parseInt(element.quantiy));
      } else {
        this.totalPrice =
          this.totalPrice +
          parseFloat(element.price) * parseInt(element.quantiy);
      }
      this.cart.push(element);
    });
    localStorage.removeItem("userCart");
    console.log("carrrrrrr---->>>", this.cart);
    localStorage.setItem("userCart", JSON.stringify(this.cart));
    this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
    // new

    const totalFinal = localStorage.getItem('grandTotalT');
    // console.log('chacalito', storedCharge);

    console.log("total item", this.totalItem);
    console.log("=====>", this.totalPrice);
    const tax = (parseFloat(this.totalPrice) * 21) / 100;
    this.serviceTax = tax.toFixed(2);
    console.log("tax->", this.serviceTax);
    // this.deliveryCharge = 25;
    // this.grandTotal =
    //   parseFloat(this.totalPrice) +
    //   parseFloat(this.serviceTax) +
    //   parseFloat(this.deliveryCharge);
    this.grandTotal = totalFinal;
    this.grandTotal = this.grandTotal.toFixed(2);
    if (this.coupon && this.coupon.code && this.totalPrice >= this.coupon.min) {
      if (this.coupon.type === "%") {
        console.log("per");
        function percentage(num, per) {
          return (num / 100) * per;
        }
        const totalPrice = percentage(
          parseFloat(this.totalPrice).toFixed(2),
          this.coupon.discout
        );
        console.log("============>>>>>>>>>>>>>>>", totalPrice);
        this.dicount = totalPrice.toFixed(2);
        this.totalPrice = parseFloat(this.totalPrice) - totalPrice;
        console.log("------------>>>>", this.totalPrice);
        this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
        const tax = (parseFloat(this.totalPrice) * 21) / 100;
        this.serviceTax = tax.toFixed(2);
        console.log("tax->", this.serviceTax);
        // this.deliveryCharge = 25;
        // this.grandTotal =
        //   parseFloat(this.totalPrice) +
        //   parseFloat(this.serviceTax) +
        //   parseFloat(this.deliveryCharge);
        this.grandTotal = totalFinal;
        this.grandTotal = this.grandTotal.toFixed(2);
      } else {
        console.log("$");
        const totalPrice = parseFloat(this.totalPrice) - this.coupon.discout;
        console.log("============>>>>>>>>>>>>>>>", totalPrice);
        this.dicount = this.coupon.discout;
        this.totalPrice = totalPrice;
        console.log("------------>>>>", this.totalPrice);
        this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
        const tax = (parseFloat(this.totalPrice) * 21) / 100;
        this.serviceTax = tax.toFixed(2);
        console.log("Service Tax: ", this.serviceTax);
        // this.deliveryCharge = 25;
        // this.grandTotal =
        //   parseFloat(this.totalPrice) +
        //   parseFloat(this.serviceTax) +
        //   parseFloat(this.deliveryCharge);
        this.grandTotal = totalFinal;
        this.grandTotal = this.grandTotal.toFixed(2);
      }
    } else {
      console.log("not satisfied");
      this.coupon = null;
      localStorage.removeItem("coupon");
    }
    console.log("Grand Total: ", this.grandTotal);
    if (this.totalItem === 0) {
      const lng = localStorage.getItem("language");
      const selectedCity = localStorage.getItem("selectedCity");
      await localStorage.clear();
      localStorage.setItem("language", lng);
      localStorage.setItem("selectedCity", selectedCity);
      this.totalItem = 0;
      this.totalPrice = 0;
    }
  }


  /**
   * Registra el pago con Stripe
   */
  payment() {
    if (!this.card_token) {
      this.util.showErrorAlert(this.util.translate('Please select a card.'));
      return;
    }
    console.log("place order");
  
    swal
      .fire({
        title: this.util.translate("Are you sure?"),
        text: this.util.translate("Orders once placed cannot be cancelled and are non-refundable"),
        icon: "question",
        confirmButtonText: this.util.translate("Yes"),
        cancelButtonText: this.util.translate("Cancel"),
        showCancelButton: true,
        backdrop: false,
        background: "white"
      })
      .then(data => {
        console.log(data);
        if (data && data.value) {
          console.log("Go to processed");
  
          const stripeCustomerId = localStorage.getItem("stripeCustomerId"); // Usar stripeCustomerId en lugar de uid
  
          if (!stripeCustomerId) {
            this.util.showErrorAlert(this.util.translate('Customer not found'));
            return;
          }
  
          const options = {
            amount: parseInt(this.grandTotal) * 100,
            currency: "mxn",
            customer: stripeCustomerId, // Usar stripeCustomerId
            source: this.card_token // Token de la tarjeta seleccionada
          };
  
          console.log("options", options);
          const url = "https://api.stripe.com/v1/charges";
          this.util.show();
          this.api.httpPost(url, options).subscribe(
            (data: any) => {
              console.log("Stripe charge: ", data);
              this.payKey = data.id;
              this.cardBrand = data.payment_method_details.card.brand;
              this.util.hide();
              this.util.showToast(
                this.util.translate("Payment Success"),
                "success",
                "bottom"
              );
              this.createOrder();
            },
            error => {
              this.util.hide();
              console.log(error);
              if (
                error &&
                error.error &&
                error.error.error &&
                error.error.error.message
              ) {
                this.util.showErrorAlert(error.error.error.message);
                return false;
              }
              this.util.errorToast("Something went wrong");
            }
          );
        }
      });
  }
  
  async createOrder() {
    this.util.show("Orden Creada");
    this.api
      .checkAuth()
      .then(async (data: any) => {
        if (data) {
          // Si la dirección no está guardada, crear una nueva
          if (!this.deliveryAddress.id || this.deliveryAddress.id === "") {
            const addressId = this.util.makeid(10);
            const newAddress = {
              id: addressId,
              uid: data.uid,
              address: this.deliveryAddress.address,
              lat: this.deliveryAddress.lat,
              lng: this.deliveryAddress.lng,
              title: "home",
              house: "",
              landmark: ""
            };
            await this.api
              .addNewAddress(data.uid, addressId, newAddress)
              .then(data => {
                this.deliveryAddress.id = addressId;
              })
              .catch(error => {
                console.log(error);
              });
          }
  
          let id = this.util.makeid(10);
  
         
          const uid = localStorage.getItem("uid");
          const lng = localStorage.getItem("language");
          const selectedCity = localStorage.getItem("selectedCity");
          const stripeCustomerId = localStorage.getItem("stripeCustomerId");


          const storedCharge = localStorage.getItem('deliveryCharge');
          // Limpiar el localStorage 
          await localStorage.clear();
          localStorage.setItem("uid", uid);
          localStorage.setItem("language", lng);
          localStorage.setItem("selectedCity", selectedCity);
          localStorage.setItem("stripeCustomerId", stripeCustomerId); // Mantener stripeCustomerId
          
  
          const param = {
            uid: data.uid,
            userId: data.uid,
            orderId: id,
            vid: this.vid,
            cardBrand: this.cardBrand,
            order: JSON.stringify(this.cart),
            time: moment().format("llll"),
            address: this.deliveryAddress,
            total: this.totalPrice,
            grandTotal: this.grandTotal,
            serviceTax: this.serviceTax,
            deliveryCharge: storedCharge,
            status: "created",
            restId: this.vid,
            paid: "stripe",
            paykey: this.payKey,
            appliedCoupon: this.coupon ? true : false,
            couponId: this.coupon ? this.coupon.id : "NA",
            coupon: this.coupon ? JSON.stringify(this.coupon) : "NA",
            dicount: this.coupon ? this.dicount : 0
          };
  
          // Crear la orden en Firestore
          this.api.createOrder(id, param)
            .then(async data => {
              this.util.hide();
              if (this.venueFCM && this.venueFCM !== "") {
                this.api.sendNotification(
                  this.util.translate("New Order Received"),
                  this.util.translate("New Order"),
                  this.venueFCM
                ).subscribe(data => {
                  console.log("send notifications", data);
                });
              }
              swal.fire({
                title: this.util.translate("Success"),
                text: this.util.translate("Your order is created successfully"),
                icon: "success",
                backdrop: false
              });
              this.navCtrl.navigateRoot(["tabs/tab2"]);
              console.log(data);
            })
            .catch(error => {
              this.util.hide();
              // this.util.errorToast(this.util.translate("Something went wrong"));
              this.router.navigate(["tabs"]);
            });
        } else {
          this.util.hide();
          this.util.errorToast(this.util.translate("Session expired"));
          this.router.navigate(["login"]);
        }
      })
      .catch(error => {
        this.util.hide();
        this.util.errorToast(this.util.translate("Session expired"));
        this.router.navigate(["login"]);
      });
  }
  

  ionViewWillEnter() {
    this.getProfile();
    this.loadCards();
    this.calculate();
  }

  onAdd() {
    this.router.navigate(["add-card"]);
  }

  changeMethod(id) {
    this.card_token = id;
  }

  getCurrency() {
    return this.util.getCurrecySymbol();
  }


goBack() {
  this.router.navigate(['/payments']); // O usa: this.location.back(); si has importado Location
  }
}