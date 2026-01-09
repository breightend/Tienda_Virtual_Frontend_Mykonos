import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useLocation } from "wouter";
import {
  MapPin,
  Store,
  CreditCard,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import * as purchaseService from "../services/purchaseService";

export default function CheckOut() {
  const [location, setLocation] = useLocation();
  const { cart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [currentStep, setCurrentStep] = useState(0);

  const [deliveryType, setDeliveryType] = useState("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    number: "",
    city: "",
    province: "",
    postalCode: "",
    additionalInfo: "",
  });
  const [selectedBranch, setSelectedBranch] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [invoiceType, setInvoiceType] = useState("");
  const [fiscalData, setFiscalData] = useState({
    cuit: "",
    businessName: "",
  });

  // Step 3: Additional notes
  const [orderNotes, setOrderNotes] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [processing, setProcessing] = useState(false);

  const branches = [
    {
      id: "parana",
      name: "MYKONOS PARANÁ",
      address: "Peatonal San Martin 695, Paraná, Entre Ríos",
      phone: "+54 9 343 509 1341",
    },
    {
      id: "concordia",
      name: "MYKONOS CONCORDIA",
      address: "A. del Valle 26, Concordia, Entre Ríos",
      phone: "+54 9 345 5201 623",
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <h2 className="card-title justify-center text-2xl">
              Inicia Sesión
            </h2>
            <p className="text-base-content/60">
              Debes iniciar sesión para realizar el checkout
            </p>
            <button
              onClick={() => setLocation("/login")}
              className="btn btn-primary mt-4"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <h2 className="card-title justify-center text-2xl">
              Carrito Vacío
            </h2>
            <p className="text-base-content/60">
              No tienes productos en tu carrito
            </p>
            <button
              onClick={() => setLocation("/store")}
              className="btn btn-primary mt-4"
            >
              Ir a la Tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  const validateStep1 = () => {
    if (deliveryType === "delivery") {
      if (
        !deliveryAddress.street ||
        !deliveryAddress.number ||
        !deliveryAddress.city ||
        !deliveryAddress.province
      ) {
        toast.error("Por favor completa todos los campos de la dirección");
        return false;
      }
    } else if (deliveryType === "pickup") {
      if (!selectedBranch) {
        toast.error("Por favor selecciona una sucursal");
        return false;
      }
    }
    return true;
  };

  const validateStep2 = () => {
    if (!paymentMethod) {
      toast.error("Por favor selecciona un método de pago");
      return false;
    }
    if (!invoiceType) {
      toast.error("Por favor selecciona un tipo de comprobante");
      return false;
    }
    if (
      invoiceType === "factura_a" &&
      (!fiscalData.cuit || !fiscalData.businessName)
    ) {
      toast.error("Por favor completa los datos fiscales para Factura A");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0 && !validateStep1()) return;
    if (currentStep === 1 && !validateStep2()) return;
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmitOrder = async () => {
    if (!acceptTerms) {
      toast.error("Debes aceptar los términos y condiciones");
      return;
    }

    setProcessing(true);

    try {
      // Construir la dirección de envío como un string único
      let shippingAddress = "";

      if (deliveryType === "delivery") {
        // Para envío a domicilio, crear dirección completa
        shippingAddress = `${deliveryAddress.street} ${deliveryAddress.number}, ${deliveryAddress.city}, ${deliveryAddress.province}`;
        if (deliveryAddress.postalCode) {
          shippingAddress += `, CP: ${deliveryAddress.postalCode}`;
        }
        if (deliveryAddress.additionalInfo) {
          shippingAddress += ` - ${deliveryAddress.additionalInfo}`;
        }
      } else {
        // Para retiro en sucursal, usar la dirección de la sucursal
        const branch = branches.find((b) => b.id === selectedBranch);
        shippingAddress = branch
          ? `Retiro en ${branch.name} - ${branch.address}`
          : "Retiro en sucursal";
      }

      // Calcular costo de envío
      const shippingCost = deliveryType === "pickup" ? 0 : 0; // Se puede agregar lógica de cálculo aquí

      // Preparar datos según el formato del backend
      const orderData = {
        shipping_address: shippingAddress,
        delivery_type: deliveryType === "delivery" ? "envio" : "retiro",
        shipping_cost: shippingCost,
        notes: orderNotes || undefined,
        payment_method: paymentMethod || undefined,
      };

      console.log("Creating order with data:", orderData);

      // Llamar al servicio de creación de pedido
      const result = await purchaseService.createOrderFromCart(orderData);

      console.log("Order created successfully:", result);

      // Mostrar mensaje de éxito
      toast.success("¡Pedido creado exitosamente! Ahora completa el pago.");

      // Refresh notifications to show the new order alert from backend
      refreshNotifications();

      // Refrescar el carrito (debería estar vacío ahora si el backend lo vacía)
      await refreshCart();

      // Redirigir a la página de confirmación de pago
      setTimeout(() => {
        setLocation(`/payment/${result.order_id}`);
      }, 1000);
    } catch (error) {
      console.error("Error creating order:", error);

      // Mostrar error específico del backend
      const errorMessage =
        error.detail ||
        error.message ||
        "Error al crear el pedido. Por favor intenta nuevamente.";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const steps = [
    { title: "Envío", icon: <MapPin size={20} /> },
    { title: "Pago", icon: <CreditCard size={20} /> },
    { title: "Confirmar", icon: <CheckCircle size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-widest mb-2">
            FINALIZAR COMPRA
          </h1>
          <div className="w-16 h-px bg-primary"></div>
        </div>

        {/* Steps Progress */}
        <ul className="steps w-full mb-8">
          {steps.map((step, index) => (
            <li
              key={index}
              className={`step ${index <= currentStep ? "step-primary" : ""}`}
            >
              <div className="flex items-center gap-2">
                {step.icon}
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {/* Step 1: Delivery/Pickup */}
                {currentStep === 0 && (
                  <div>
                    <h2 className="text-2xl font-light mb-6">
                      Método de Entrega
                    </h2>

                    {/* Delivery Type Selection */}
                    <div className="flex justify-between">
                      <div className="form-control mb-6">
                        <label className="label cursor-pointer justify-start gap-4 p-4 border rounded-lg hover:bg-base-200 transition-colors">
                          <input
                            type="radio"
                            name="deliveryType"
                            className="radio radio-primary"
                            checked={deliveryType === "delivery"}
                            onChange={() => setDeliveryType("delivery")}
                          />
                          <div className="flex items-center gap-3">
                            <MapPin className="text-primary" />
                            <div>
                              <span className="label-text font-semibold">
                                Envío a Domicilio
                              </span>
                              <p className="text-xs text-base-content/60">
                                Entrega en tu dirección
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="form-control mb-6">
                        <label className="label cursor-pointer justify-start gap-4 p-4 border rounded-lg hover:bg-base-200 transition-colors">
                          <input
                            type="radio"
                            name="deliveryType"
                            className="radio radio-primary"
                            checked={deliveryType === "pickup"}
                            onChange={() => setDeliveryType("pickup")}
                          />
                          <div className="flex items-center gap-3">
                            <Store className="text-primary" />
                            <div>
                              <span className="label-text font-semibold">
                                Retiro en Sucursal
                              </span>
                              <p className="text-xs text-base-content/60">
                                Retira en nuestras tiendas
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Delivery Address Form */}
                    {deliveryType === "delivery" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">
                          Dirección de Envío
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Calle *</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: San Martín"
                              className="input input-bordered"
                              value={deliveryAddress.street}
                              onChange={(e) =>
                                setDeliveryAddress({
                                  ...deliveryAddress,
                                  street: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Número *</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: 1234"
                              className="input input-bordered"
                              value={deliveryAddress.number}
                              onChange={(e) =>
                                setDeliveryAddress({
                                  ...deliveryAddress,
                                  number: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Ciudad *</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: Paraná"
                              className="input input-bordered"
                              value={deliveryAddress.city}
                              onChange={(e) =>
                                setDeliveryAddress({
                                  ...deliveryAddress,
                                  city: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Provincia *</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: Entre Ríos"
                              className="input input-bordered"
                              value={deliveryAddress.province}
                              onChange={(e) =>
                                setDeliveryAddress({
                                  ...deliveryAddress,
                                  province: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Código Postal</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: 3100"
                              className="input input-bordered"
                              value={deliveryAddress.postalCode}
                              onChange={(e) =>
                                setDeliveryAddress({
                                  ...deliveryAddress,
                                  postalCode: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div>
                            <label className="label">
                              <span className="label-text">
                                Información de contacto
                              </span>
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: 3123456789"
                              className="input input-bordered"
                              value={deliveryAddress.phoneNumber}
                              onChange={(e) =>
                                setDeliveryAddress({
                                  ...deliveryAddress,
                                  phoneNumber: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text ">
                              Información Adicional
                            </span>
                          </label>
                          <textarea
                            className="textarea textarea-bordered w-full"
                            placeholder="Información adicional sobre la dirección, como piso, departamento, referencias, etc."
                            value={deliveryAddress.additionalInfo}
                            onChange={(e) =>
                              setDeliveryAddress({
                                ...deliveryAddress,
                                additionalInfo: e.target.value,
                              })
                            }
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {/* Branch Selection */}
                    {deliveryType === "pickup" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">
                          Selecciona una Sucursal
                        </h3>

                        {branches.map((branch) => (
                          <label
                            key={branch.id}
                            className={`label cursor-pointer justify-start gap-4 p-4 border rounded-lg hover:bg-base-200 transition-colors ${
                              selectedBranch === branch.id
                                ? "border-primary bg-primary/5"
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="branch"
                              className="radio radio-primary"
                              checked={selectedBranch === branch.id}
                              onChange={() => setSelectedBranch(branch.id)}
                            />
                            <div className="flex-1">
                              <div className="font-semibold">{branch.name}</div>
                              <div className="text-sm text-base-content/60">
                                {branch.address}
                              </div>
                              <div className="text-sm text-base-content/60">
                                {branch.phone}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Payment & Invoice */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-light mb-6">
                      Pago y Facturación
                    </h2>

                    {/* Payment Method */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Método de Pago
                      </h3>

                      <div className="space-x-3 space-y-3">
                        <label className="label cursor-pointer justify-start gap-4 p-4 border rounded-lg hover:bg-base-200 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            className="radio radio-primary"
                            checked={paymentMethod === "transferencia"}
                            onChange={() => setPaymentMethod("transferencia")}
                          />
                          <div>
                            <span className="label-text font-semibold">
                              Transferencia Bancaria
                            </span>
                            <p className="text-xs text-base-content/60">
                              Te enviaremos los datos bancarios
                            </p>
                          </div>
                        </label>

                        <label className="label cursor-pointer justify-start gap-4 p-4 border rounded-lg hover:bg-base-200 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            className="radio radio-primary"
                            checked={paymentMethod === "efectivo"}
                            onChange={() => setPaymentMethod("efectivo")}
                          />
                          <div>
                            <span className="label-text font-semibold">
                              Efectivo
                            </span>
                            <p className="text-xs text-base-content/60">
                              Pago al retirar por sucursal
                            </p>
                          </div>
                        </label>

                        <label className="label cursor-pointer justify-start gap-4 p-4 border rounded-lg hover:bg-base-200 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            className="radio radio-primary"
                            checked={paymentMethod === "mercadopago"}
                            onChange={() => setPaymentMethod("mercadopago")}
                          />
                          <div>
                            <span className="label-text font-semibold">
                              MercadoPago
                            </span>
                            <p className="text-xs text-base-content/60">
                              Paga con tarjeta o dinero en cuenta
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Invoice Type */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Tipo de Comprobante
                      </h3>

                      <div className="space-x-3">
                        <label className="label cursor-pointer justify-start gap-4 p-4 border rounded-lg hover:bg-base-200 transition-colors">
                          <input
                            type="radio"
                            name="invoiceType"
                            className="radio radio-primary"
                            checked={invoiceType === "factura_b"}
                            onChange={() => setInvoiceType("factura_b")}
                          />
                          <div>
                            <span className="label-text font-semibold">
                              Factura B
                            </span>
                            <p className="text-xs text-base-content/60">
                              Consumidor final
                            </p>
                          </div>
                        </label>

                        <label className="label cursor-pointer justify-start gap-4 p-4 border rounded-lg hover:bg-base-200 transition-colors">
                          <input
                            type="radio"
                            name="invoiceType"
                            className="radio radio-primary"
                            checked={invoiceType === "factura_a"}
                            onChange={() => setInvoiceType("factura_a")}
                          />
                          <div>
                            <span className="label-text font-semibold">
                              Factura A
                            </span>
                            <p className="text-xs text-base-content/60">
                              Responsable inscripto
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Fiscal Data for Factura A */}
                    {invoiceType === "factura_a" && (
                      <div className="space-y-4 bg-base-200 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">
                          Datos Fiscales
                        </h3>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">CUIT *</span>
                          </label>
                          <input
                            type="text"
                            placeholder="XX-XXXXXXXX-X"
                            className="input input-bordered"
                            value={fiscalData.cuit}
                            onChange={(e) =>
                              setFiscalData({
                                ...fiscalData,
                                cuit: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Razón Social *</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Nombre de la empresa"
                            className="input input-bordered"
                            value={fiscalData.businessName}
                            onChange={(e) =>
                              setFiscalData({
                                ...fiscalData,
                                businessName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-light mb-6">
                      Confirmar Pedido
                    </h2>

                    {/* Order Summary */}
                    <div className="space-y-6">
                      {/* Delivery Info */}
                      <div className="bg-base-200 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin size={18} className="text-primary" />
                          Información de Entrega
                        </h3>
                        {deliveryType === "delivery" ? (
                          <div className="text-sm space-y-1">
                            <p className="font-semibold">Envío a domicilio</p>
                            <p>
                              {deliveryAddress.street} {deliveryAddress.number}
                            </p>
                            <p>
                              {deliveryAddress.city}, {deliveryAddress.province}
                            </p>
                            {deliveryAddress.postalCode && (
                              <p>CP: {deliveryAddress.postalCode}</p>
                            )}
                            {deliveryAddress.additionalInfo && (
                              <p className="text-base-content/60 italic">
                                {deliveryAddress.additionalInfo}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm">
                            <p className="font-semibold">Retiro en sucursal</p>
                            <p>
                              {
                                branches.find((b) => b.id === selectedBranch)
                                  ?.name
                              }
                            </p>
                            <p>
                              {
                                branches.find((b) => b.id === selectedBranch)
                                  ?.address
                              }
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Payment Info */}
                      <div className="bg-base-200 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <CreditCard size={18} className="text-primary" />
                          Información de Pago
                        </h3>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="font-semibold">
                              Método de pago:
                            </span>{" "}
                            {paymentMethod === "transferencia" &&
                              "Transferencia Bancaria"}
                            {paymentMethod === "efectivo" && "Efectivo"}
                            {paymentMethod === "mercadopago" && "MercadoPago"}
                          </p>
                          <p>
                            <span className="font-semibold">Comprobante:</span>{" "}
                            {invoiceType === "ticket" && "Ticket"}
                            {invoiceType === "factura_b" && "Factura B"}
                            {invoiceType === "factura_a" && "Factura A"}
                          </p>
                          {invoiceType === "factura_a" && (
                            <>
                              <p className="text-base-content/60">
                                CUIT: {fiscalData.cuit}
                              </p>
                              <p className="text-base-content/60">
                                Razón Social: {fiscalData.businessName}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Products Summary */}
                      <div className="bg-base-200 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText size={18} className="text-primary" />
                          Productos ({cart.total_items})
                        </h3>
                        <div className="space-y-2">
                          {cart.items.map((item) => (
                            <div
                              key={item.cart_item_id}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.product_name} x{item.quantity}
                              </span>
                              <span className="font-semibold">
                                ${item.subtotal?.toLocaleString("es-AR")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Additional Notes */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">
                            Notas adicionales (opcional)
                          </span>
                        </label>
                        <textarea
                          className="textarea w-full textarea-bordered"
                          placeholder="Información adicional sobre tu pedido"
                          rows="3"
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                        ></textarea>
                      </div>

                      {/* Terms and Conditions */}
                      <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-3">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                          />
                          <span className="label-text">
                            Acepto los{" "}
                            <a href="#" className="link link-primary">
                              términos y condiciones
                            </a>{" "}
                            y la{" "}
                            <a href="#" className="link link-primary">
                              política de privacidad
                            </a>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  {currentStep > 0 && (
                    <button
                      onClick={handleBack}
                      className="btn btn-ghost gap-2"
                    >
                      <ArrowLeft size={18} />
                      Anterior
                    </button>
                  )}
                  {currentStep < 2 ? (
                    <button
                      onClick={handleNext}
                      className="btn btn-primary gap-2 ml-auto"
                    >
                      Siguiente
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitOrder}
                      className="btn btn-primary gap-2 ml-auto"
                      disabled={processing || !acceptTerms}
                    >
                      {processing ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Confirmar Pedido
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl sticky top-20">
              <div className="card-body">
                <h2 className="card-title text-xl font-light">Resumen</h2>
                <div className="divider my-2"></div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/60">
                      Productos ({cart.total_items})
                    </span>
                    <span>${cart.subtotal?.toLocaleString("es-AR")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/60">Envío</span>
                    <span className="text-success">
                      {deliveryType === "pickup"
                        ? "Gratis"
                        : "$0 (A coordinar)"}
                    </span>
                  </div>
                </div>

                <div className="divider my-2"></div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    ${cart.subtotal?.toLocaleString("es-AR")}
                  </span>
                </div>

                <div className="alert alert-info mt-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-xs">
                    El costo de envío se coordinará después de confirmar tu
                    pedido.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
