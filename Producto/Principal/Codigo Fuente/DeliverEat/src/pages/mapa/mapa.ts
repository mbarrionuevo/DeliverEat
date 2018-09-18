import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';
import { GoogleMapOptions, GoogleMap, LatLng, GoogleMaps, GoogleMapsEvent, Marker } from '@ionic-native/google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Producto } from '../../interfaces/producto.interface';

/**
 * Generated class for the MapaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-mapa',
  templateUrl: 'mapa.html',
})
export class MapaPage {
  private map: GoogleMap;
  private location: LatLng = new LatLng(0, 0);
  currentMarker: Marker;
  producto: Producto;
  constructor(public navCtrl: NavController, public navParams: NavParams, public plt: Platform, public geoLocation: Geolocation, public viewCtrl: ViewController) {
    this.producto = navParams.get('producto');
    if(this.producto.direccionComercio instanceof LatLng){
      this.location = this.producto.direccionComercio
    }
  }

  ionViewDidLoad() {
    this.mostrarMapa();
  }

  agregarMarca(position){
    this.map.addMarker({
      title: 'Comercio',
      icon: 'red',
      animation: 'DROP',
      draggable:true,
      position: {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    })
      .then(marker => {
        this.currentMarker = marker;
      });
  }

  mostrarMapa() {
    this.plt.ready().then(() => {

      this.geoLocation.getCurrentPosition().then((position) => {

        let mapOptions: GoogleMapOptions = {
          camera: {
            target: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            zoom: 18,
            tilt: 3
          }

        };
        let element = document.getElementById("mapa");
        this.map = GoogleMaps.create(element, mapOptions);

        this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
          this.agregarMarca(position);
        
        });
        this.map.on(GoogleMapsEvent.MAP_LONG_CLICK).subscribe((e)=>{
          this.currentMarker.remove();
          let geo: Geoposition = {coords: {heading:undefined, speed:undefined, latitude: undefined, longitude: undefined, accuracy: undefined, altitudeAccuracy:undefined, altitude:undefined}, timestamp:undefined};
          geo.coords.latitude = e[0].lat;
          geo.coords.longitude = e[0].lng;
          this.agregarMarca(geo);
        })
      })
    });
  }
  guardarCoordenadas(){
    this.producto.direccionComercio = this.location;
    this.navCtrl.pop();
  }

}
