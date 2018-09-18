import { Coordenadas } from "./coordenadas.interface";
import { LatLng } from "@ionic-native/google-maps";

export interface Producto{
    direccionComercio: string | LatLng,
    foto?: string,
    descripcion: string

}