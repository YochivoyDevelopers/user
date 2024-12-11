import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { Router, NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  haveItems: boolean = false;
  vid: any = '';
  foods: any;
  name: any;
  descritions: any;
  cover: any;
  address: any;
  time: any;
  totalPrice: any = 0;
  totalItem: any = 0;
  serviceTax: any = 0;
  deliveryCharge: any = 0;
  grandTotal: any = 0;
  deliveryAddress: any = '';
  totalRatting: any = 0;
  coupon: any;
  dicount: any;
  selectedAddress: any;
  userLat: number | null = null;
  userLng: number | null = null;
  restaurantLat: number | null = null;
  restaurantLng: number | null = null;
  totalDistance: number | null = null;

  cart: any = [];
  constructor(
    private api: ApisService,
    private router: Router,
    private util: UtilService,
    private navCtrl: NavController,
    private chMod: ChangeDetectorRef
  ) {
    this.util.getCouponObservable().subscribe(data => {
      if (data) {
        console.log(data);
        this.coupon = data;
        console.log('coupon', this.coupon);
        console.log(this.totalPrice);
        localStorage.setItem('coupon', JSON.stringify(data));
        this.calculate();
      }
    });
  }

  ngOnInit() {
    this.loadSelectedAddress();
  }


  loadSelectedAddress() {
    
    const storedAddress = localStorage.getItem('deliveryAddress');
    if (storedAddress) {
      this.selectedAddress = JSON.parse(storedAddress);
  
      // Extraer latitud y longitud si están disponibles
      const userLat = this.selectedAddress.lat;
      const userLng = this.selectedAddress.lng;
  
      if (userLat && userLng) {
        console.log('Latitud:', userLat, 'Longitud:', userLng);
        // this.getUserDetails(userLat, userLng);
        this.getUserLocation(userLat, userLng);
        // this.getUserDetails();
      } else {
        console.error('No se encontraron coordenadas en la dirección almacenada.');
      }
    }
  }

  getUserLocation(restaurantLat: number, restaurantLng: number) {
    // Cargar el ID de la dirección desde localStorage
    const storedAddress = localStorage.getItem('deliveryAddress');
    if (storedAddress) {
      const selectedAddress = JSON.parse(storedAddress);
      const addressId = selectedAddress.id;  // Suponiendo que el ID está aquí
      const userLat = selectedAddress.lat;
      const userLng = selectedAddress.lng;
      console.log('Usuario:', userLat, userLng);
      console.log(addressId, selectedAddress.id);
    } else {
      console.error('No se encontró ninguna dirección almacenada.');
    }
  }
  
  

  
  getAddress() {
    const add = JSON.parse(localStorage.getItem('deliveryAddress'));
    if (add && add.address) {
      this.deliveryAddress = add.address;
    }
    return this.deliveryAddress;
  }
  
   getVenueDetails() {

    // Venue Details
    this.api.getVenueDetails(this.vid).then(data => {
      console.log(data);
      if (data) {
        this.name = data.name;
        this.descritions = data.descritions;
        this.cover = data.cover;
        this.address = data.address;
        this.time = data.time;
        this.totalRatting = data.totalRatting;

        const restaurantLat = data.lat;
        const restaurantLng = data.lng;
        console.log('Restaurante:', restaurantLat, restaurantLng);
        return restaurantLat;

        // this.getUserLocation(restaurantLat, restaurantLng);
      }
    }, error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  validate() {

    this.api.checkAuth().then(async (user) => {
      if (user) {
        const id = await localStorage.getItem('vid');
        console.log('id', id);
        if (id) {
          this.vid = id;
          this.getVenueDetails();
          this.loadSelectedAddress();
          // const foods = await localStorage.getItem('foods');
          // if (foods) {
          //   this.foods = await JSON.parse(foods);
          //   let recheck = await this.foods.filter(x => x.quantiy > 0);
          //   console.log('vid', this.vid);
          //   console.log('foods', this.foods);
          //   if (this.vid && this.foods && recheck.length > 0) {
          //     this.haveItems = true;
          //     this.calculate();
          //     this.chMod.detectChanges();
          //   }
          // }
          const cart = localStorage.getItem('userCart');
          try {
            if (cart && cart !== 'null' && cart !== undefined && cart !== 'undefined') {
              this.cart = JSON.parse(localStorage.getItem('userCart'));
              this.loadSelectedAddress();
              this.calculate();
            } else {
              this.cart = [];
            }
          } catch (error) {
            console.log(error);
            this.cart = [];
          }

          console.log('========================>', this.cart);
        } else {
          this.haveItems = false;
          this.chMod.detectChanges();
        }
        this.chMod.detectChanges();
        return true;
      } else {
        this.router.navigate(['login']);
      }
    }).catch(error => {
      console.log(error);
    });
  }

  ionViewWillEnter() {
    this.loadSelectedAddress();
    this.validate();
    this.refreshAfterPay();
    const savedAddress = localStorage.getItem('selectedAddress');
    if (savedAddress) {
      this.selectedAddress = JSON.parse(savedAddress);
    }
    
  }

  refreshAfterPay(){
    this.navCtrl.navigateRoot(['tabs/tab3']);
  }

  getCart() {
    this.navCtrl.navigateRoot(['tabs/tab1']);
  }
  addQ(index) {
    this.cart[index].quantiy = this.cart[index].quantiy + 1;
    this.calculate();
  }
  removeQ(index) {
    if (this.cart[index].quantiy !== 0) {
      this.cart[index].quantiy = this.cart[index].quantiy - 1;
    } else {
      this.cart[index].quantiy = 0;
    }
    localStorage.setItem('userCart', JSON.stringify(this.foods));
    this.calculate();
  }

  addQAddos(i, j) {
    console.log(this.cart[i].selectedItem[j]);
    this.cart[i].selectedItem[j].total = this.cart[i].selectedItem[j].total + 1;
    this.calculate();
  }
  removeQAddos(i, j) {
    console.log(this.cart[i].selectedItem[j]);
    if (this.cart[i].selectedItem[j].total !== 0) {
      this.cart[i].selectedItem[j].total = this.cart[i].selectedItem[j].total - 1;
      if (this.cart[i].selectedItem[j].total === 0) {
        const newCart = [];
        this.cart[i].selectedItem.forEach(element => {
          if (element.total > 0) {
            newCart.push(element);
          }
        });
        console.log('newCart', newCart);
        this.cart[i].selectedItem = newCart;
        this.cart[i].quantiy = newCart.length;
      }
    }
    this.calculate();
  }

  /// OLD calc

  // async calculate() {
  //   console.log(this.foods);
  //   // new
  //   let item = this.cart.filter(x => x.quantiy > 0);
  //   this.cart.forEach(element => {
  //     if (element.quantiy === 0) {
  //       element.selectedItem = [];
  //     }
  //   });
  //   console.log('item=====>>', item);
  //   this.totalPrice = 0;
  //   this.totalItem = 0;
  //   this.cart = [];
  //   console.log('cart emplth', this.cart, item);
  //   item.forEach(element => {
  //     this.totalItem = this.totalItem + element.quantiy;
  //     console.log('itemsss----->>>', element);
  //     if (element && element.selectedItem && element.selectedItem.length > 0) {
  //       let subPrice = 0;
  //       element.selectedItem.forEach(subItems => {
  //         subItems.item.forEach(realsItems => {
  //           subPrice = subPrice + (realsItems.value);
  //         });
  //         subPrice = subPrice * subItems.total;
  //       });
  //       this.totalPrice = this.totalPrice + subPrice;
  //     } else {
  //       this.totalPrice = this.totalPrice + (parseFloat(element.price) * parseInt(element.quantiy));
  //     }
  //     this.cart.push(element);
  //   });
  //   localStorage.removeItem('userCart');
  //   console.log('carrrrrrr---->>>', this.cart);
  //   localStorage.setItem('userCart', JSON.stringify(this.cart));
  //   this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
  //   // new

  //   console.log('total item', this.totalItem);
  //   console.log('=====>', this.totalPrice);
  //   const tax = (parseFloat(this.totalPrice) * 21) / 100;
  //   this.serviceTax = tax.toFixed(2);
  //   console.log('tax->', this.serviceTax);
  //   this.deliveryCharge = 25;
  //   this.grandTotal = parseFloat(this.totalPrice)+ parseFloat(this.deliveryCharge); // + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
  //   this.grandTotal = this.grandTotal.toFixed(2);
  //   if (this.coupon && this.coupon.code && this.totalPrice >= this.coupon.min) {
  //     if (this.coupon.type === '%') {
  //       console.log('per');
  //       function percentage(num, per) {
  //         return (num / 100) * per;
  //       }
  //       const totalPrice = percentage(parseFloat(this.totalPrice).toFixed(2), this.coupon.discout);
  //       console.log('============>>>>>>>>>>>>>>>', totalPrice);
  //       this.dicount = totalPrice.toFixed(2);
  //       this.totalPrice = parseFloat(this.totalPrice) - totalPrice;
  //       // this.totalPrice = totalPrice;
  //       console.log('------------>>>>', this.totalPrice);
  //       this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
  //       const tax = (parseFloat(this.totalPrice) * 21) / 100;
  //       this.serviceTax = tax.toFixed(2);
  //       console.log('tax->', this.serviceTax);
  //       this.deliveryCharge = 25;
  //       this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.deliveryCharge); // + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
  //       this.grandTotal = this.grandTotal.toFixed(2);
  //     } else {
  //       console.log('curreny');
  //       const totalPrice = parseFloat(this.totalPrice) - this.coupon.discout;
  //       console.log('============>>>>>>>>>>>>>>>', totalPrice);
  //       this.dicount = this.coupon.discout;
  //       this.totalPrice = totalPrice;
  //       console.log('------------>>>>', this.totalPrice);
  //       this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
  //       const tax = (parseFloat(this.totalPrice) * 21) / 100;
  //       this.serviceTax = tax.toFixed(2);
  //       console.log('tax->', this.serviceTax);
  //       this.deliveryCharge = 25;
  //       this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.deliveryCharge); // + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
  //       this.grandTotal = this.grandTotal.toFixed(2);
  //     }
  //   } else {
  //     console.log('not satisfied');
  //     this.coupon = null;
  //     localStorage.removeItem('coupon');
  //   }
  //   console.log('grand totla', this.grandTotal);
  //   if (this.totalItem === 0) {
  //     const lng = localStorage.getItem('language');
  //     const selectedCity = localStorage.getItem('selectedCity');
  //     await localStorage.clear();
  //     localStorage.setItem('language', lng);
  //     localStorage.setItem('selectedCity', selectedCity);
  //     this.totalItem = 0;
  //     this.totalPrice = 0;
  //     this.haveItems = false;
  //   }
  // }
  
  // NEW calc

  async calculate() {
   


    // Coordenadas del restaurante
    this.api.getVenueDetails(this.vid).then(data => {
      console.log(this.foods);
      // new
      let item = this.cart.filter(x => x.quantiy > 0);
      this.cart.forEach(element => {
        if (element.quantiy === 0) {
          element.selectedItem = [];
        }
      });
      console.log('item=====>>', item);
      this.totalPrice = 0;
      this.totalItem = 0;
      this.cart = [];
      console.log('cart emplth', this.cart, item);
      item.forEach(element => {
        this.totalItem = this.totalItem + element.quantiy;
        console.log('itemsss----->>>', element);
        if (element && element.selectedItem && element.selectedItem.length > 0) {
          let subPrice = 0;
          element.selectedItem.forEach(subItems => {
            subItems.item.forEach(realsItems => {
              subPrice = subPrice + (realsItems.value);
            });
            subPrice = subPrice * subItems.total;
          });
          this.totalPrice = this.totalPrice + subPrice;
        } else {
          this.totalPrice = this.totalPrice + (parseFloat(element.price) * parseInt(element.quantiy));
        }
        this.cart.push(element);
      });
      localStorage.removeItem('userCart');
      console.log('carrrrrrr---->>>', this.cart);
      localStorage.setItem('userCart', JSON.stringify(this.cart));
      this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
      // new
  
      console.log('total item', this.totalItem);
      console.log('=====>', this.totalPrice);
      const tax = (parseFloat(this.totalPrice) * 15) / 100;
      this.serviceTax = tax.toFixed(2);
      console.log('tax->', this.serviceTax);
      // this.deliveryCharge = 25;
      
  
      // Coordenadas del usuario
      const storedAddress = localStorage.getItem('deliveryAddress');
      if (storedAddress) {
        const selectedAddress = JSON.parse(storedAddress);
        const addressId = selectedAddress.id;
        this.userLat = selectedAddress.lat;
        this.userLng = selectedAddress.lng;
        console.log('Usuario:', this.userLat, this.userLng);
      } else {
        console.error('No se encontró ninguna dirección almacenada.');
      }
      if (data) {
        this.restaurantLat = data.lat;
        this.restaurantLng = data.lng;
        console.log('Restaurante:', this.restaurantLat, this.restaurantLng);
          if (this.userLat !== null && this.userLng !== null && this.restaurantLat !== null && this.restaurantLng !== null) {
          this.totalDistance = this.calculateDistance(this.userLat, this.userLng, this.restaurantLat, this.restaurantLng);
          console.log('totalDistance', this.totalDistance);
    
          // Asignar y guardar el cargo de entrega
          if (this.totalDistance <= 5) {
            this.deliveryCharge = 20; 
            console.log('delivery20uwu', this.deliveryCharge);
            localStorage.removeItem('deliveryCharge');
            localStorage.setItem('deliveryCharge', this.deliveryCharge.toString());
          } else if (this.totalDistance <= 10) {
            this.deliveryCharge = 30; 
            console.log('delivery30uwu', this.deliveryCharge);
            localStorage.removeItem('deliveryCharge');
            localStorage.setItem('deliveryCharge', this.deliveryCharge.toString());
          } else {
            this.deliveryCharge = 50;
            console.log('delivery50uwu', this.deliveryCharge);
            localStorage.removeItem('deliveryCharge');
            localStorage.setItem('deliveryCharge', this.deliveryCharge.toString());
          }
    
          // Leer el valor desde localStorage después de guardarlo
          const storedCharge = localStorage.getItem('deliveryCharge');
          console.log('storedCharge', storedCharge);
          if (storedCharge) {
            this.deliveryCharge = parseFloat(storedCharge);
          }
          console.log('final deliveryCharge', this.deliveryCharge);
    
        } else {
          console.error('No se tienen todas las coordenadas necesarias para calcular la distancia.');
        }
      }
      this.grandTotal = parseFloat(this.totalPrice)+ parseFloat(this.deliveryCharge) + parseFloat(this.serviceTax); // + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
      localStorage.setItem('grandTotalT', this.grandTotal.toString());
      localStorage.setItem('serviceTaxT', this.serviceTax.toString());
      console.log('taxlocalstorage', localStorage.getItem('serviceTaxT'));
      

    this.grandTotal = this.grandTotal.toFixed(2);
    if (this.coupon && this.coupon.code && this.totalPrice >= this.coupon.min) {
      if (this.coupon.type === '%') {
        console.log('per');
        function percentage(num, per) {
          return (num / 100) * per;
        }
        const totalPrice = percentage(parseFloat(this.totalPrice).toFixed(2), this.coupon.discout);
        console.log('============>>>>>>>>>>>>>>>', totalPrice);
        this.dicount = totalPrice.toFixed(2);
        this.totalPrice = parseFloat(this.totalPrice) - totalPrice;
        // this.totalPrice = totalPrice;
        console.log('totalprice------------>>>>', this.totalPrice);
        this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
        const tax = (parseFloat(this.totalPrice) * 15) / 100;
        this.serviceTax = tax.toFixed(2);
        console.log('tax->', this.serviceTax);
        // this.deliveryCharge = 25;
        const storedCharge = localStorage.getItem('deliveryCharge');
        if (storedCharge) {
        this.deliveryCharge = parseFloat(storedCharge);
        console.log('deliii', this.deliveryCharge);
        }
        console.log('deliverytotal', this.deliveryCharge);
        this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.deliveryCharge) + parseFloat(this.serviceTax); // + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
        this.grandTotal = this.grandTotal.toFixed(2);
      } else {
        console.log('curreny');
        const totalPrice = parseFloat(this.totalPrice) - this.coupon.discout;
        console.log('============>>>>>>>>>>>>>>>', totalPrice);
        this.dicount = this.coupon.discout;
        this.totalPrice = totalPrice;
        console.log('a------------>>>>', this.totalPrice);
        this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
        const tax = (parseFloat(this.totalPrice) * 15) / 100;
        this.serviceTax = tax.toFixed(2);
        console.log('tax->', this.serviceTax);
        // this.deliveryCharge = 25;
        const storedCharge = localStorage.getItem('deliveryCharge');
        if (storedCharge) {
        this.deliveryCharge = parseFloat(storedCharge);
        console.log('deliii', this.deliveryCharge);
        }
        console.log('deliverytotal', this.deliveryCharge);
        this.grandTotal = parseFloat(this.totalPrice) + parseFloat(this.deliveryCharge) + parseFloat(this.serviceTax); // + parseFloat(this.serviceTax) + parseFloat(this.deliveryCharge);
        console.log('aaaaaaaa', this.grandTotal);
        this.grandTotal = this.grandTotal.toFixed(2);

      }
    } else {
      console.log('not satisfied');
      this.coupon = null;
      localStorage.removeItem('coupon');
    }
    console.log('grand totla', this.grandTotal);
    if (this.totalItem === 0) {
      const lng = localStorage.getItem('language');
      const selectedCity = localStorage.getItem('selectedCity');
      localStorage.clear();
      localStorage.setItem('language', lng);
      localStorage.setItem('selectedCity', selectedCity);
      this.totalItem = 0;
      this.totalPrice = 0;
      this.haveItems = false;
    }

    }).catch(error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
    


    // const sip = localStorage.getItem('deliveryCharge');
    // if (sip) {
    // this.deliveryCharge = parseFloat(sip);
    // console.log('deliii', this.deliveryCharge);
    // }
    // console.log('deliverytotal', this.deliveryCharge);















    
  }

  
  getCurrency() {
    return this.util.getCurrecySymbol();
  }

  changeAddress() {
    const navData: NavigationExtras = {
      queryParams: {
        from: 'cart'
      }
    };
    this.router.navigate(['choose-address'], navData);
  }
  goToAddress() {
    console.log('check', this.grandTotal < 0)
    if (this.grandTotal < 0) {
      this.util.errorToast(this.util.translate('Something went wrong'));
      return false;
    }
    const navData: NavigationExtras = {
      queryParams: {
        from: 'cart'
      }
    };
    this.router.navigate(['choose-address'], navData);
    // this.router.navigate(['payments']);
  }

  checkout() {
    console.log('check', this.grandTotal < 0)
    if (this.grandTotal < 0) {
      this.util.errorToast(this.util.translate('Something went wrong'));
      return false;
    }
    const navData: NavigationExtras = {
      queryParams: {
        from: 'cart'
      }
    };
    // this.router.navigate(['choose-address'], navData);
    this.router.navigate(['payments']);
  }
  openCoupon() {
    const navData: NavigationExtras = {
      queryParams: {
        restId: this.vid,
        name: this.name,
        totalPrice: this.totalPrice
      }
    };
    this.router.navigate(['coupons'], navData);
  }


  deg2rad(deg: number): number{
    return deg * (Math.PI / 180);
  }

  calculateDistance(lat1: number, lon1: number,lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}