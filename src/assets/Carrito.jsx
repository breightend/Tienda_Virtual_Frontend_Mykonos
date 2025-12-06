import { useLocation } from "wouter";

export default function Carrito() {
    const [location, setLocation] = useLocation();
    
    const keepShopping = () => {
        setLocation("/store");
    }

    const finishShopping = () => {
        setLocation("/payment");
    }


    return (
        <div>
            <h1>Carrito</h1>
            <button className="btn btn-primary">Seguir comprando</button>
            <p>Aca la lista de todo lo que ha comprado</p>
            <button className="btn btn-primary">Ir a pagar</button>
        </div>
    );
}