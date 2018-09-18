import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

/**
 * Generated class for the PedidoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pedido',
  templateUrl: 'pedido.html',
})
export class PedidoPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
  }

  iniciarPedidoLoQueSea(){
    this.navCtrl.push('PedidoLoqueseaPage')
  }

  iniciarPedidoComercioAdherido(){
    const toast = this.toastCtrl.create({
      message: "Pronto...",
      showCloseButton: true,
      closeButtonText: "Cerrar"
    });
    toast.present();
  }

}
