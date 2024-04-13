//defino precios y descuentos
const DESCUENTOS = [{codigo: "20off", porcentaje: 20},
                    {codigo: "30off", porcentaje: 30},
                    {codigo: "40off", porcentaje: 40},
                    {codigo: "50off", porcentaje: 50},
                    {codigo: "menos50", cantidad: 50},
                    {codigo: "menos100", cantidad: 100}];


class Toppings {
    constructor(nombre, precio) {
        this.nombre = nombre;
        this.precio = precio;
    }
}

const TOMATE = new Toppings("Tomate", 300);
const CEBOLLA = new Toppings("Cebolla", 300);
const RUCULA = new Toppings("Rucula", 200);
const ANANA = new Toppings("Anana", 500);
const JAMON = new Toppings("Jamon", 300);
const MORRON = new Toppings("Morron", 200);
const PALMITOS = new Toppings("Palmitos", 400);
const CHAMPINON = new Toppings("Champinon", 600);
const ALBAHACA = new Toppings("Albahaca", 200);
const ACEITUNAS = new Toppings("Aceitunas", 15);

const TOPPINGS = [TOMATE, RUCULA, CEBOLLA, ANANA, JAMON, MORRON, PALMITOS, CHAMPINON, ALBAHACA, ACEITUNAS];


let precios = {
    pizzaALaPiedra: 11300,
    pizzaAlHorno: 10500,
}


class PizzaYaArmada {
    constructor(nombre, tipoCoccion, toppings, aceitunas, cantPorciones) {
        this.nombre = nombre;
        this.tipoCoccion = tipoCoccion;
        this.toppings = toppings;
        this.aceitunas = aceitunas;
        this.cantPorciones = cantPorciones;
    }
}

const PIZZA_MARGARITA = new PizzaYaArmada("Margarita", "al horno", ["Tomate", "Albahaca"], 0, 8);
const PIZZA_FUGAZZETTA = new PizzaYaArmada("Fugazzetta", "al horno", ["Cebolla"], 6, 6);
const PIZZA_HAWAIANA = new PizzaYaArmada("Hawaiana", "al horno", ["Anana", "Jamon"], 0, 8);
const PIZZA_MORRON = new PizzaYaArmada("Morron", "al horno", ["Morron"], 4, 4);
const PIZZA_JAMON = new PizzaYaArmada("Jamon", "a la piedra", ["Jamon"], 8, 8);
const PIZZA_CHAMPINON = new PizzaYaArmada("Champinon", "a la piedra", ["Champinon"], 4, 8);
const PIZZA_RUCULA = new PizzaYaArmada("Rucula", "a la piedra", ["Rucula"], 8, 8);
const PIZZA_PALMITOS = new PizzaYaArmada("Palmitos", "al horno", ["Palmitos"], 4, 8);

const PIZZAS_YA_ARMADAS = [PIZZA_MARGARITA, PIZZA_FUGAZZETTA, PIZZA_HAWAIANA, PIZZA_MORRON, PIZZA_JAMON, PIZZA_CHAMPINON, PIZZA_RUCULA, PIZZA_PALMITOS];


let pizza = {
    tipoCoccion: "",
    toppings: [],
    aceitunas: 0,
    cantPorciones: 6,
}

let pedido = {
    pago: "ARS",
    envio: "",
    barrio: "",
    calle: "",
}

let codigoDescuento = "";


//acá armo las funciones para poder calcular el descuento según el código ingresado
function calculadoraDescuentos(precio, codigoDescuento) { //toma precio y descuento. devuelve [precio final, descuento total]
    let descuento = descuentoSegunCodigo(codigoDescuento);
    if (descuento[0] == "porcentaje") {
        return [precio*((100-descuento[1])/100), precio*(descuento[1]/100)];
    } else if (descuento[0] == "cantidad") {
        return [precio-descuento[1], descuento[1]];
    } else {
        return [precio, 0];
    }
}

function descuentoSegunCodigo(codigo) { //devuelve ej ["porcentaje", 20] para repesentar 20% de descuento O ["cantidad", 50] para $50 de descuento
    for (let i=0; i<DESCUENTOS.length; i++) {
        if (DESCUENTOS[i].codigo == codigo) {
            if ("porcentaje" in DESCUENTOS[i]) {
                return ["porcentaje", DESCUENTOS[i].porcentaje];
            } else {
                return ["cantidad", DESCUENTOS[i].cantidad];
            }
        }
    }
    return [0, 0];
}

function codigoDescuentoValido(codigo) {
    return DESCUENTOS.some(descuento => descuento.codigo == codigo);
}





let subtotal;
function actualizarSubtotal() {
    subtotal = 0;
    const PARRAFO_SUBTOTAL = document.getElementById("parrafoSubtotal");
    pizza.tipoCoccion == "a la piedra" && (subtotal += precios.pizzaALaPiedra);
    pizza.tipoCoccion == "al horno" && (subtotal += precios.pizzaAlHorno);
    pizza["toppings"].forEach((topping) => {
        TOPPINGS.forEach(({nombre, precio}) => {
            nombre == topping && (subtotal += precio);
        })
    })
    subtotal += pizza.aceitunas * ACEITUNAS.precio;
    PARRAFO_SUBTOTAL.innerText = `Subtotal: $${subtotal}`;
    actualizarTotal();
}

let total;
function actualizarTotal() {
    let PARRAFO_DESCUENTOS = document.getElementById("parrafoDescuentos");
    let PARRAFO_TOTAL = document.getElementById("parrafoTotal");
    if (codigoDescuentoValido(codigoDescuento)) {
        let descuentosYTotal = calculadoraDescuentos(subtotal, codigoDescuento);
        total = descuentosYTotal[0];
        PARRAFO_DESCUENTOS.innerText = `Descuentos: $${descuentosYTotal[1].toFixed(2)} (${codigoDescuento})`;
        PARRAFO_TOTAL.innerText = `Total: $${total.toFixed(2)}`;
    } else {
        total = subtotal;
        PARRAFO_DESCUENTOS.innerText = "";
        PARRAFO_TOTAL.innerText = `Total: $${total}`;
    }
    actualizarPagoMonedaExtranjera();
}


let tasaDeConversion;
async function tasaConversion() {
    if (pedido.pago != "ARS") {
        if (pedido.pago != "USD") {
            try {
                const RESPUESTA = await fetch(`https://dolarapi.com/v1/cotizaciones/${pedido["pago"].toLowerCase()}`);
                const DATA = await RESPUESTA.json();
                tasaDeConversion = DATA.venta;
            }
            catch(error) {
                tasaDeConversion = false;
            }
        } else {
            try {
                const RESPUESTA = await fetch(`https://dolarapi.com/v1/dolares/oficial`);
                const DATA = await RESPUESTA.json();
                tasaDeConversion = DATA.venta;
            }
            catch(error) {
                tasaDeConversion = false;
            }
        }
    } 
} tasaConversion();



async function actualizarPagoMonedaExtranjera() {
    await tasaConversion();
    if (tasaDeConversion === false) {
        Swal.fire({
            title: "El pago en moneda extranjera no se encuentra disponible",
            icon: "error",
            confirmButtonText: "Aceptar",
        })
        pedido.pago = "ARS";
    }
    if (pedido.pago != "ARS") {
        document.getElementById("parrafoMonedaExtranjera").innerText = `Total en ${pedido.pago}: ${pedido.pago} $${(total/tasaDeConversion).toFixed(2)}`;
    } else {
        document.getElementById("parrafoMonedaExtranjera").innerText = "";
    }
}




function actualizarTodo() {
    actualizarCoccion();
    actualizarAceitunas();
    TOPPINGS.forEach((topping) => {
        actualizarTopping(topping);
    })
    actualizarPorciones();
}



//Pizzas ya armadas
const DIV_PIZZAS_YA_ARMADAS = document.getElementById("pizzasYaArmadas");
PIZZAS_YA_ARMADAS.forEach((pizzaYaArmada) => {
    let boton = document.createElement("button");
    boton.id = `boton${pizzaYaArmada.nombre}`;
    boton.innerText = pizzaYaArmada.nombre;
    DIV_PIZZAS_YA_ARMADAS.appendChild(boton);
    document.getElementById(`boton${pizzaYaArmada.nombre}`).addEventListener("click", ()=>{
        let copiaPizza = JSON.parse(JSON.stringify(pizzaYaArmada));
        /* Este rulo aca de JSON está pq quería que cuando se apriete de nuevo el bóton de Margarita se
        reseteen todos los cambios que se le hacía a la pizza. El problema era que pizza.toppings y PIZZA_MARGARITA.toppings
        hacían referencia al mismo objeto en memoria y se modificaban los dos. */
        pizza = {...copiaPizza};
        actualizarTodo();
    })
})


//Repetir último Pedido
const BOTON_REPETIR_PEDIDO = document.getElementById("botonRepetirPedido");
BOTON_REPETIR_PEDIDO.addEventListener("click", ()=>{
    if (localStorage.getItem("ULTIMO_PEDIDO") != null) {
        const ULTIMO_PEDIDO = JSON.parse(localStorage.getItem("ULTIMO_PEDIDO"));
        pizza = {...ULTIMO_PEDIDO};
        actualizarTodo();
    } else {
        Swal.fire({
            title: "Nunca realizaste un pedido",
            icon: "error",
            text: "Realizá tu primera orden para poder guardar tu último pedido.",
            confirmButtonText: "Aceptar"
        })
    }
})


//Tipo Coccion
const BOTON_PIEDRA = document.getElementById("botonPiedra");
const BOTON_HORNO = document.getElementById("botonHorno");
const PARRAFO_COCCION = document.getElementById("parrafoCoccion");

function actualizarCoccion() {
    if (pizza["tipoCoccion"] == "a la piedra") {
        precioPizza = precios["pizzaALaPiedra"];
        BOTON_PIEDRA.disabled = true;
        BOTON_HORNO.disabled = false;
    }
    if (pizza["tipoCoccion"] == "al horno") {
        precioPizza = precios["pizzaAlHorno"];
        BOTON_HORNO.disabled = true;
        BOTON_PIEDRA.disabled = false;
    }
    PARRAFO_COCCION.innerText = `Pizza ${pizza["tipoCoccion"]}: $${precioPizza}`;
    document.getElementById("parrafoErrorCoccion").classList.add("invisible");
    actualizarSubtotal();
}

BOTON_PIEDRA.addEventListener("click", ()=>{
    pizza["tipoCoccion"] = "a la piedra";
    actualizarCoccion();
})

BOTON_HORNO.addEventListener("click", ()=>{
    pizza["tipoCoccion"] = "al horno";
    actualizarCoccion();
})



//Toppings
const RESUMEN_PEDIDO = document.getElementById("resumenPedido");
const DIV_DE_CADA_TOPPING = document.getElementById("divDeCadaTopping");

TOPPINGS.forEach((topping) => {
    let div = document.createElement("div");
    div.innerHTML = `<p>${topping.nombre}</p>
                     <button id="botonAgregar${topping.nombre}">Agregar</button>
                     <button id="botonQuitar${topping.nombre}">Quitar</button>`;
    DIV_DE_CADA_TOPPING.appendChild(div);
    document.getElementById(`botonQuitar${topping.nombre}`).disabled = true;

    if (topping.nombre != "Aceitunas") {
        document.getElementById(`botonAgregar${topping.nombre}`).addEventListener("click", () => {
            pizza["toppings"].push(topping.nombre);
            actualizarTopping(topping);
        })
    
        document.getElementById(`botonQuitar${topping.nombre}`).addEventListener("click", () => {
            pizza["toppings"] = pizza["toppings"].filter(quitarTopping => quitarTopping != topping.nombre);
            actualizarTopping(topping);
        })
    } else {
        document.getElementById(`botonAgregar${topping.nombre}`).addEventListener("click", () => {
            pizza.aceitunas++;
            actualizarAceitunas();
        })
        document.getElementById(`botonQuitar${topping.nombre}`).addEventListener("click", () => {
            pizza.aceitunas--;
            actualizarAceitunas();
        })
    }
})

function actualizarTopping(topping) {
    if (pizza["toppings"].includes(topping.nombre) && !document.getElementById(`parrafo${topping.nombre}`)) {
        let p = document.createElement("p");
        p.innerText = `${topping.nombre}: $${topping.precio}`;
        p.id = `parrafo${topping.nombre}`;
        RESUMEN_PEDIDO.appendChild(p);
        document.getElementById(`botonAgregar${topping.nombre}`).disabled = true;
        document.getElementById(`botonQuitar${topping.nombre}`).disabled = false;
    } else if (!(pizza["toppings"].includes(topping.nombre)) && document.getElementById(`parrafo${topping.nombre}`) && `parrafo${topping.nombre}` != "parrafoAceitunas") {
        document.getElementById(`parrafo${topping.nombre}`).remove();
        document.getElementById(`botonAgregar${topping.nombre}`).disabled = false;
        document.getElementById(`botonQuitar${topping.nombre}`).disabled = true;

    }
    actualizarSubtotal();
}

function actualizarAceitunas() {
    const BOTON_QUITAR_ACEITUNAS = document.getElementById("botonQuitarAceitunas");
    const PARRAFO_ACEITUNAS = document.getElementById("parrafoAceitunas");
    if (pizza.aceitunas == 0) {
        PARRAFO_ACEITUNAS.innerText = "";
        BOTON_QUITAR_ACEITUNAS.disabled = true;
    } else {
        PARRAFO_ACEITUNAS.innerText = `Aceitunas (x${pizza.aceitunas}): $${ACEITUNAS.precio * pizza.aceitunas}`;
        BOTON_QUITAR_ACEITUNAS.disabled = false;
    }
    actualizarSubtotal();
}





//Porciones
const BOTON_AGREGAR_PORCIONES = document.getElementById("botonAgregarPorciones");
const BOTON_QUITAR_PORCIONES = document.getElementById("botonQuitarPorciones");

function actualizarPorciones() {
    document.getElementById("parrafoPorciones").innerText = pizza["cantPorciones"].toString();
    BOTON_AGREGAR_PORCIONES.disabled = (pizza.cantPorciones == 8);
    BOTON_QUITAR_PORCIONES.disabled = (pizza.cantPorciones == 1);
}

BOTON_AGREGAR_PORCIONES.addEventListener("click", ()=>{
    pizza.cantPorciones++;
    actualizarPorciones();
})

BOTON_QUITAR_PORCIONES.addEventListener("click", ()=>{
    pizza.cantPorciones--;
    actualizarPorciones();
})



//Envío a domicilio
const BOTON_ENVIO_DOMICILIO = document.getElementById("botonEnvioDomicilio");
const BOTON_RETIRO_LOCAL = document.getElementById("botonRetiroLocal");
const INPUT_DIRECCION_BARRIO = document.getElementById("inputDireccionBarrio");
const INPUT_DIRECCION_CALLE = document.getElementById("inputDireccionCalle");
const BOTON_ACEPTAR_DIRECCION = document.getElementById("botonAceptarDireccion");

BOTON_ENVIO_DOMICILIO.addEventListener("click", ()=>{
    document.getElementById("divEnvioORetiro").innerHTML = `<p>La demora es de aproximadamente 60 minutos.</p>`;
    document.getElementById("divDireccion").classList.remove("invisible");
    INPUT_DIRECCION_BARRIO.value = "";
    INPUT_DIRECCION_CALLE.value = "";
    BOTON_ENVIO_DOMICILIO.disabled = true;
    BOTON_RETIRO_LOCAL.disabled = false;
})

BOTON_ACEPTAR_DIRECCION.addEventListener("click", ()=>{
    if (!INPUT_DIRECCION_BARRIO.value == "" && !INPUT_DIRECCION_CALLE.value == "") {
        pedido.envio = true;
        pedido.barrio =  INPUT_DIRECCION_BARRIO.value;
        pedido.calle = INPUT_DIRECCION_CALLE.value;
        document.getElementById("parrafoErrorEnvio").classList.add("invisible");
        Toastify({
            text: `El pedido será enviado a ${pedido.calle}`,
            duration: 4000,
            position: "right",
            gravity: "top",
        }).showToast();
    } else {
        Swal.fire({
            title: "Faltan completar datos",
            icon: "error",
            confirmButtonText: "Aceptar",
        })
    }
})

BOTON_RETIRO_LOCAL.addEventListener("click", ()=>{
    document.getElementById("divEnvioORetiro").innerHTML = `<p>La demora es de aproximadamente 30 minutos.</p>`;
    document.getElementById("divDireccion").classList.add("invisible");
    pedido.envio = false;
    pedido.barrio = "";
    pedido.calle = "";
    document.getElementById("parrafoErrorEnvio").classList.add("invisible");
    Toastify({
        text: "Retirarás el pedido en el local",
        duration: 4000,
        position: "right",
        gravity: "top",
    }).showToast();
    BOTON_ENVIO_DOMICILIO.disabled = false;
    BOTON_RETIRO_LOCAL.disabled = true;
})



//Moneda
const MONEDAS = ["ARS", "USD", "EUR", "BRL", "UYU"];
const DIV_MONEDAS = document.getElementById("divMonedas");
MONEDAS.forEach((moneda) => {
    let boton = document.createElement("button");
    boton.innerText = moneda;
    boton.id = `botonPago${moneda}`;
    DIV_MONEDAS.appendChild(boton);
    document.getElementById(`botonPago${moneda}`).addEventListener("click", ()=>{
        pedido.pago = moneda;
        Toastify({
            text: `Pagarás en ${pedido.pago}`,
            duration: 4000,
            position: "right",
            gravity: "top",
        }).showToast();
        actualizarSubtotal();
    })
})


//descuento
const INPUT_CODIGO_DESCUENTO = document.getElementById("inputCodigoDescuento");
const BOTON_CODIGO_DESCUENTO = document.getElementById("botonCodigoDescuento");

BOTON_CODIGO_DESCUENTO.addEventListener("click", ()=>{
    codigoDescuento = INPUT_CODIGO_DESCUENTO.value;
    if (codigoDescuentoValido(codigoDescuento)) {
        Swal.fire({
            title: "Descuento aplicado",
            icon: "success",
            confirmButtonText: "Aceptar",
        })
    } else {
        Swal.fire({
            title: "Código no válido",
            icon: "error",
            confirmButtonText: "Aceptar",
        })
    }
    actualizarSubtotal();
})




//Boton Finalizar
function sumar30Min() {
    let horaActual = new Date();
    horaActual.setMinutes(horaActual.getMinutes() + 30);
    let minutos = horaActual.getMinutes();
    if (minutos < 10) {
        minutos = "0" + minutos.toString();
    }
    return `${horaActual.getHours()}:${minutos}`;
}

function sumar60Min() {
    let horaActual = new Date();
    horaActual.setHours(horaActual.getHours() + 1);
    let minutos = horaActual.getMinutes();
    if (minutos < 10) {
        minutos = "0" + minutos.toString();
    }
    return `${horaActual.getHours()}:${minutos}`;
}

const BOTON_FINALIZAR = document.getElementById("botonFinalizar");
BOTON_FINALIZAR.addEventListener("click", ()=>{
    document.getElementById("divErrores").classList.remove("invisible");
    let envioORetiro;
    if (pedido.envio == true) { //Quiero que si lo retira en el local la preparen en 30' y si pide envío llege en una hora
        envioORetiro = `Llegará a ${pedido.calle}, ${pedido.barrio} a las ${sumar60Min()}.`;
    } else if (pedido.envio == false){
        envioORetiro = `Lo podrá retirar en nuestro local a las ${sumar30Min()}.`;
    }
    if (pizza.tipoCoccion != "" && pedido.envio !== "" && pedido.pago != "") {
        localStorage.setItem("ULTIMO_PEDIDO", JSON.stringify(pizza));
        Swal.fire({
            title: "Pedido enviado",
            icon: "success",
            text: envioORetiro + " Recargá la pagina para realizar otro pedido o repetir el mismo.",
            confirmButtonText: "Aceptar",
        })
        INPUT_CODIGO_DESCUENTO.value = "";
    }
})