import { FormasDePago } from "../app/app.const";
import { DateTime } from "ionic-angular";
import { Producto } from "./producto.interface";

export interface PedidoLoQueSea{
    productos: Producto[],
    formaDePago: FormasDePago,
    fechaEntrega: Date | string,
    pagaCon?: number,
    domicilio: string,
    nroTarjeta?: number,
    titular?: string,
    vencimiento?: string,
    codigoSeguridad?: number
}
    
