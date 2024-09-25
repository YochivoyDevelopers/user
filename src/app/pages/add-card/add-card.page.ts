import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { ApisService } from 'src/app/services/apis.service';
import { NavController } from '@ionic/angular';
import Swal from 'sweetalert2';


declare var Stripe: any;

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.page.html',
  styleUrls: ['./add-card.page.scss'],
})
export class AddCardPage implements OnInit {
  cnumber: any = '';
  cname: any = '';
  cvc: any = '';
  date: any = '';
  email: any = '';
  stripe: any;
  elements: any;
  card: any;
  cards: any[] = [];

  constructor(
    private util: UtilService,
    private api: ApisService,
    private navCtrl: NavController,
    
  ) {

  }

  ngOnInit() {
    // Inicializa Stripe
    this.stripe = Stripe('pk_test_51PxRvdIIXWFer6qKLrUTEsblKHp46OGTMocj4Qt2AcuFRaAl7FU9Nn6iElE2SI1O15UBMmMPLPEAHyiBltJS1Hdc00GbpkXpvj');
    this.elements = this.stripe.elements();
    this.card = this.elements.create('card', {
      hidePostalCode: true,
    });
    this.card.mount('#card-element');
    this.loadCards(); // Cargar tarjetas guardadas al iniciar
  }

  loadCards() {
    const stripeCustomerId = localStorage.getItem('stripeCustomerId');
  
    this.api.httpGet(`https://api.stripe.com/v1/customers/${stripeCustomerId}/sources`)
      .subscribe((response: any) => {
        this.cards = response.data; // Actualiza la lista de tarjetas
      }, error => {
        console.error('Error loading cards:', error);
      });
  }
  
  updateRest(body) {
    this.api.updateProfile(body.uid, body).then((data) => {
      console.log(data);
    });
    this.navCtrl.back();
  }

  addcard() {
    const stripeCustomerId = localStorage.getItem('stripeCustomerId');
  
    if (this.cards.length >= 3) {
      this.util.errorToast(this.util.translate('You can only add up to 3 cards'));
      return;
    }
  
    if (!this.email || !this.cname) {
      this.util.errorToast(this.util.translate('All Fields are required'));
      return false;
    }
  
    const emailfilter = /^[\w.-]+[+]?[\w.-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailfilter.test(this.email)) {
      this.util.errorToast(this.util.translate('Please enter valid email'));
      return false;
    }
  
    this.util.show();
  
    this.stripe.createToken(this.card).then((result: any) => {
      if (result.error) {
        this.util.showErrorAlert(result.error.message);
        this.util.hide();
      } else {
        const token = result.token;
  
        // Verificar si la tarjeta ya existe
        const cardExists = this.cards.some(card => card.last4 === token.card.last4);
        if (cardExists) {
          this.util.hide();
          Swal.fire({
            title: this.util.translate('Card already added') || 'Error', // Maneja si la traducción no existe
            text: this.util.translate('This card has already been added.') || 'There was an issue with adding the card.', // Lo mismo aquí
            icon: 'warning',
            confirmButtonText: this.util.translate('OK') || 'OK'
          });          
          return;
        }
  
        if (!stripeCustomerId) {
          // Crear cliente si no existe
          const customer = {
            description: 'Customer for food app',
            source: token.id,
            email: this.email
          };
  
          this.api.httpPost('https://api.stripe.com/v1/customers', customer).subscribe((customer: any) => {
            this.util.hide();
            if (customer && customer.id) {
              localStorage.setItem('stripeCustomerId', customer.id);
              const cid = {
                uid: localStorage.getItem('uid'),
                cid: customer.id
              };
              this.updateRest(cid);
              this.loadCards();
              this.navCtrl.back();
            }
          }, error => {
            this.util.hide();
            this.util.showErrorAlert(error?.error?.error?.message || this.util.translate('Something went wrong'));
          });
        } else {
          // Agregar tarjeta a cliente existente
          this.api.httpPost(`https://api.stripe.com/v1/customers/${stripeCustomerId}/sources`, { source: token.id })
            .subscribe((response: any) => {
              console.log('Card added successfully:', response);
              this.loadCards();
              this.util.hide();
              this.navCtrl.back();
            }, error => {
              this.util.hide();
              this.util.showErrorAlert(error?.error?.error?.message || this.util.translate('Something went wrong'));
            });
        }
      }
    }, error => {
      this.util.hide();
      this.util.showErrorAlert(error?.error?.error?.message || this.util.translate('Something went wrong'));
    });
  }
  
  
}
