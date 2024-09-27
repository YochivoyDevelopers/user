import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { AlertController, NavController } from '@ionic/angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-history-detail',
  templateUrl: './history-detail.page.html',
  styleUrls: ['./history-detail.page.scss'],
})
export class HistoryDetailPage implements OnInit {
  id: any;
  grandTotal: any;
  orders: any = [];
  serviceTax: any;
  deliveryCharge: any;
  status: any;
  time: any;
  total: any;
  uid: any;
  address: any;
  restName: any;
  deliveryAddress: any;
  paid: any;
  restPhone: any;
  coupon: boolean = false;
  dicount: any;
  dname: any;
  orderData: any;
  loaded: boolean;
  restFCM: any;
  driverFCM: any;
  dId: any;
  payKey: any;
  refund: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private api: ApisService,
    private router: Router,
    private util: UtilService,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {
    this.loaded = false;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      console.log('data=>', data);
      if (data.hasOwnProperty('id')) {
        this.id = data.id;
        this.getOrder();
      }
    });
  }

  getOrder() {
    this.api.getOrderById(this.id).then((data) => {
      this.loaded = true;
      console.log(data);
      if (data) {
        this.orderData = data;
        this.grandTotal = data.grandTotal;
        this.orders = JSON.parse(data.order);
        this.serviceTax = data.serviceTax;
        this.deliveryCharge = data.deliveryCharge;
        this.status = data.status;
        this.time = data.time;
        if (data && data.dId && data.dId.fullname) {
          this.dname = data.dId.fullname;
          this.driverFCM = data.dId.fcm_token;
          console.log('driver FCM-------->', this.driverFCM);
          this.dId = data.dId.uid;
        }
        this.total = data.total;
        this.address = data.vid.address;
        this.restName = data.vid.name;
        this.deliveryAddress = data.address.address;
        this.paid = data.paid;
        console.log('this', this.orders);
        this.getRest(data.vid.uid);
        this.coupon = data.appliedCoupon;
        this.dicount = data.dicount;
        // if (this.status === 'delivered') {
        //   this.presentAlertConfirm();
        // }
        if (data.paykey && data.paid !== 'paypal') {
          this.refund = true;
          this.payKey = data.paykey; // Almacena el key para el reembolso
        } else {
          this.refund = false;
        }
      }
    }, error => {
      console.log('error in orders', error);
      this.loaded = true;
      this.util.errorToast('Something went wrong');
    }).catch(error => {
      console.log('error in order', error);
      this.loaded = true;
      this.util.errorToast('Something went wrong');
    });
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: this.util.translate('How was your experience?'),
      message: 'Califica a ' + this.restName + ' y a tu repartidor ',
      buttons: [
        {
          text: 'Cancelar',
          role: 'canceled',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            console.log('Confirm Okay');
            this.util.setOrders(this.orderData);
            this.router.navigate(['rate']);
          }
        }
      ]
    });

    await alert.present();
  }

  getRest(id) {
    this.api.getProfile(id).then((data) => {
      console.log(data);
      this.restFCM = data.fcm_token;
      console.log('rest FCM------------->', this.restFCM);
      if (data && data.phone) {
        this.restPhone = data.phone;
      }
    }, error => {
      console.log('error in orders', error);
      this.util.errorToast('Something went wrong');
    }).catch(error => {
      console.log('error in order', error);
      this.util.errorToast('Something went wrong');
    });
  }
  trackMyOrder() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.id
      }
    };
    this.router.navigate(['/tracker'], navData);
    //
  }
  call() {
    if (this.restPhone) {
      window.open('tel:' + this.restPhone);
    }
  }

  chat() {
    this.router.navigate(['inbox']);
  }

  changeStatus() {
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('To Cancel this order and process refund'),
      showCancelButton: true,
      cancelButtonText: this.util.translate('Cancel'),
      showConfirmButton: true,
      confirmButtonText: this.util.translate('Yes'),
      backdrop: false,
      background: 'white'
    }).then((data) => {
      if (data && data.value) {
        this.util.show();
        this.api.updateOrderStatus(this.id, 'canceled').then((data: any) => {
          
          // Procesar reembolso si es posible
          if (this.refund && this.payKey) {
            const param = {
              charge: this.payKey,
            };
            this.api.httpPost('https://api.stripe.com/v1/refunds', param).subscribe((refundData) => {
              console.log('Refund successful', refundData);
              Swal.fire({
                title: this.util.translate('Success'),
                text: this.util.translate('Order refund successfully'),
                icon: 'success',
              });
              this.navCtrl.back();
            }, error => {
              console.log('Refund error', error);
              this.util.errorToast('Something went wrong with the refund');
            });
          } else {
            Swal.fire({
              title: this.util.translate('Success'),
              text: this.util.translate('Order canceled without refund'),
              icon: 'success',
            });
            this.navCtrl.back();
          }

          this.util.hide();
          this.util.hide();
          const message = this.util.translate('Order ') + this.id + ' ' + this.util.translate(' cancelled by user');
          const title = this.util.translate('Order cancelled');
          
          this.api.sendNotification(message, title, this.driverFCM).subscribe(data => {
            console.log(data);
          });
          this.api.sendNotification(message, title, this.restFCM).subscribe(data => {
            console.log(data);
          });

          if (this.dId && this.dname) {
            const parm = {
              current: 'active',
            };
            this.api.updateProfile(this.dId, parm).then((data) => {
              console.log('driver status cahcnage----->', data);
            }).catch(error => {
              console.log(error);
            });
          }

          // this.navCtrl.back();
          



        }, error => {
          this.util.hide();
          this.util.errorToast('Something went wrong');
        }).catch(error => {
          this.util.hide();
          this.util.errorToast('Something went wrong');
        });
      }
    });
  }


  getCurrency() {
    return this.util.getCurrecySymbol();
  }

}
