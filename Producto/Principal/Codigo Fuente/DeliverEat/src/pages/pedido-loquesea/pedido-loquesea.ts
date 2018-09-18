import { Component, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Platform } from 'ionic-angular';
import { ViewChild } from '@angular/core';
import { Slides } from 'ionic-angular';
import { Producto } from '../../interfaces/producto.interface';
import { PedidoLoQueSea } from '../../interfaces/pedido-loquesea.interface';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  LatLng
} from '@ionic-native/google-maps';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';
import { FormasDePago } from '../../app/app.const';
import { Coordenadas } from '../../interfaces/coordenadas.interface';
import { Geolocation  } from '@ionic-native/geolocation'

/**
 * Generated class for the PedidoLoqueseaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()

@Component({
  selector: 'page-pedido-loquesea',
  templateUrl: 'pedido-loquesea.html',
})


export class PedidoLoqueseaPage {
  

  FormasDePago = FormasDePago;
  @ViewChild(Slides) slides: Slides;
  private map:GoogleMap;
  private location:LatLng = new LatLng(0,0);
  //Formularios
  pasoUno: FormGroup;
  pasoDos: FormGroup;
  pasoTres: FormGroup;

  fechaActivada:boolean=false;


  //Variables
  producto: Producto = { direccionComercio: undefined, descripcion: undefined, foto: "assets/img/sin_imagen.jpg" };
  pedido: PedidoLoQueSea;
  direccionPorTexto: boolean = true;
  

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public camera: Camera,
    public toastCtrl: ToastController,
    public geolocation: Geolocation,
    public plt: Platform,
    private googleMaps: GoogleMaps,public imagePicker: ImagePicker) {
    //Inicializando variables
    this.inicializarPedido();
    this.inicializarProducto();
    //Formularios
    this.pasoUno = this.formBuilder.group({
      descripcion: ['', Validators.required],
      foto: [''],
      direccionComercio: [''],
      coordenadas: ['']
    });
    this.pasoDos = this.formBuilder.group({
      domicilio: ['', Validators.required],
      fechaEntrega: ['', Validators.required]
    });
    this.construirFormularioPaso3("FormasDePago.Contado");
  }

  switchFecha(){
    this.fechaActivada = !this.fechaActivada;
    if(!this.fechaActivada){
      this.pedido.fechaEntrega = new Date().toISOString();
    }
    else{
      this.pedido.fechaEntrega = undefined;
    }
  }

  construirFormularioPaso3(formaDePago: string) {
    console.log(formaDePago);
    console.log(this.pedido);
    
    let esContado = formaDePago === "FormasDePago.Contado";
    this.pasoTres = this.formBuilder.group({
      formaDePago: ['', Validators.required],
      pagaCon: ['', esContado ? Validators.required : undefined],
      nroTarjeta: ['', Validators.compose( esContado? [] :[Validators.required, Validators.maxLength(16), Validators.minLength(16)])],
      titular: ['', esContado? [] :Validators.required],
      vencimiento: ['', Validators.compose(esContado? [] : [Validators.required, Validators.pattern("[0-9][0-9]-[0-9][0-9]")])],
      codigoSeguridad: ['', Validators.compose(esContado? [] :[Validators.required, Validators.maxLength(3), Validators.minLength(3)])]
    })


  }

  inicializarProducto() {
    this.producto = { direccionComercio: undefined, descripcion: undefined, foto: undefined };
  }

  inicializarPedido() {
    this.pedido = { productos: [], domicilio: undefined, formaDePago: FormasDePago.Contado, fechaEntrega: new Date().toISOString() };
  }

  bloquearSlides() {
    this.slides.lockSwipes(true)
  }

  desbloquearSlides() {
    this.slides.lockSwipes(false)
  }

  ionViewDidLoad() {

    this.bloquearSlides();
    this.slides.centeredSlides = false;
     
  }
  validarPaso(paso: number): boolean {
    let res: boolean = true;
    switch (paso) {
      case 0:
        if (!this.pedido.productos.length) {
          let alert = this.toastCtrl.create({
            message: "¡Agregá al menos un producto!",
            duration: 1500
          });
          alert.present();
          res = false;
        }
        break;
      case 1:
        if (!this.pasoDos.valid) {
          res = false;
          this.mostrarAlertaCamposRequeridos();
        }
        break;
      case 2:
        if (!this.pasoTres.valid) {
          res = false;
          this.mostrarAlertaCamposRequeridos();
        }
        break;
    }
    return res;
  }

  mostrarAlertaCamposRequeridos(){
    const alert = this.toastCtrl.create({
      message: "¡Completa todos los campos requeridos (*) antes de continuar!",
      duration: 1500
    });
    return alert.present();

  }

  mostrarExito(){
    const alert = this.toastCtrl.create({
      message: "¡Se ha registrado el pedido!",
      closeButtonText: '¡Genial!',
      showCloseButton: true
    });
    return alert.present();
  }


  //Navega entre los pasos del slide, si el parametro "avanzar" es true (por defecto lo es), avanza hacia la derecha, si no, hacia la izquierda. 
  navegar(avanzar: boolean = true) {
    if (this.validarPaso(this.slides.getActiveIndex()) || !avanzar) {
      this.desbloquearSlides();
      avanzar ? this.slides.slideNext(200) : this.slides.slidePrev(200);
      this.bloquearSlides();
    }
  }

  listo() {
    if(this.validarPaso(2)){
      this.mostrarExito().then(()=>{
        this.navCtrl.popToRoot();
      })
    }
  }

  esUltimoPaso(): boolean {
    return this.slides.isEnd();
  }

  esPrimerPaso(): boolean {
    return this.slides.isBeginning();
  }

  tomarFoto() {
    const options: CameraOptions = {
      quality: 60,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {

      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.producto.foto = base64Image;

    }, (err) => {
      alert(err);
    });
  }

  mostrarMapa() {
    this.direccionPorTexto = false;
    this.navCtrl.push('MapaPage', {producto: this.producto}); 
   
  }

  seleccionarFoto(){
    let optiones: ImagePickerOptions = {
      quality: 50,
      maximumImagesCount: 1,
      outputType: 1,
    }
    this.imagePicker.getPictures(optiones).then((foto)=>{
      this.producto.foto = foto[0];
    })
  }

  eliminarCoordenadas() {
    this.direccionPorTexto = true;
    this.producto.direccionComercio = undefined;
  }

  agregarProducto() {
  if(!this.producto.direccionComercio){
    this.mostrarAlertaCamposRequeridos();
  }
  else{
    this.pedido.productos.push(this.producto);
    this.inicializarProducto();
    this.pasoUno.reset();
    const agregadoACarrito = this.toastCtrl.create({
      showCloseButton: true,
      closeButtonText: "OK",
      message: "¡Se ha agregado al carrito!",
      dismissOnPageChange: true
    })
    agregadoACarrito.present();
    console.log(this.pedido);

  }
    
  }

}
