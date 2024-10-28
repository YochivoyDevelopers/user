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
  ) {}

  ngOnInit() {
    this.stripe = Stripe('pk_test_51PxRvdIIXWFer6qKLrUTEsblKHp46OGTMocj4Qt2AcuFRaAl7FU9Nn6iElE2SI1O15UBMmMPLPEAHyiBltJS1Hdc00GbpkXpvj');
    this.elements = this.stripe.elements();
    this.card = this.elements.create('card', {
      hidePostalCode: true,
    });
    this.card.mount('#card-element');
    this.loadCards(); // Cargar tarjetas guardadas
  }

  loadCards() {
    const stripeCustomerId = localStorage.getItem('stripeCustomerId'); // Usar stripeCustomerId
    if (!stripeCustomerId) {
      console.error('No se encontró stripeCustomerId en localStorage');
      return;
    }
    this.api.httpGet(`https://api.stripe.com/v1/customers/${stripeCustomerId}/sources`)
      .subscribe((response: any) => {
        this.cards = response.data; // Actualiza la lista de tarjetas
      }, error => {
        console.error('Error al cargar las tarjetas:', error);
      });
  }

  updateRest(body) {
    const uid = body.uid;
    this.api.getProfile(uid).then((userData: any) => {
      const cards = userData.cards || [];
      const cardExists = cards.some(card => card.last4 === body.last4 && card.brand === body.brand);
      if (!cardExists) {
        cards.push({
          cid: body.cid,
          last4: body.last4,
          brand: body.brand,
          exp_month: body.exp_month,
          exp_year: body.exp_year
        });
        this.api.updateProfile(uid, { cards }).then(() => {
          console.log('Perfil actualizado con nuevas tarjetas');
        });
      }
    });
    this.navCtrl.back();
  }

  addcard() {
    const stripeCustomerId = localStorage.getItem('stripeCustomerId'); // Usar stripeCustomerId
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
        const cardExists = this.cards.some(card => card.last4 === token.card.last4 && card.brand === token.card.brand);
        if (cardExists) {
          this.util.hide();
          Swal.fire({
            title: this.util.translate('Card already added'),
            text: this.util.translate('This card has already been added.'),
            icon: 'warning',
            confirmButtonText: this.util.translate('OK')
          });
          return;
        }
        if (!stripeCustomerId) {
          const customer = {
            description: 'Customer for food app',
            source: token.id,
            email: this.email
          };
          this.api.httpPost('https://api.stripe.com/v1/customers', customer).subscribe((customer: any) => {
            if (customer && customer.id) {
              localStorage.setItem('stripeCustomerId', customer.id); // Guardar stripeCustomerId
              const cid = {
                uid: localStorage.getItem('uid'),
                cid: customer.id,
                last4: token.card.last4,
                brand: token.card.brand,
                exp_month: token.card.exp_month,
                exp_year: token.card.exp_year
              };
              this.updateRest(cid);
              this.loadCards();
              this.util.hide();
            }
          }, error => {
            this.util.showErrorAlert(error?.error?.error?.message || this.util.translate('Something went wrong'));
            this.util.hide();
          });
        } else {
          this.api.httpPost(`https://api.stripe.com/v1/customers/${stripeCustomerId}/sources`, { source: token.id })
            .subscribe((response: any) => {
              const cid = {
                uid: localStorage.getItem('uid'),
                cid: stripeCustomerId,
                last4: token.card.last4,
                brand: token.card.brand,
                exp_month: token.card.exp_month,
                exp_year: token.card.exp_year
              };
              this.updateRest(cid);
              this.loadCards();
              this.util.hide();
            }, error => {
              this.util.showErrorAlert(error?.error?.error?.message || this.util.translate('Something went wrong'));
              this.util.hide();
            });
        }
      }
    }, error => {
      this.util.showErrorAlert(error?.error?.error?.message || this.util.translate('Something went wrong'));
      this.util.hide();
    });
  }
}
