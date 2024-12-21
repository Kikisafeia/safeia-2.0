import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { PaymentPlan } from '../services/payment';
import { verifyPayment } from '../services/paypalServer';
import { createSubscription, updateSubscriptionPayment } from '../services/subscriptionService';
import { useAuth } from '../contexts/AuthContext';

interface PayPalPaymentProps {
  plan: PaymentPlan;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({ plan, onSuccess, onError }) => {
  const { currentUser } = useAuth();

  return (
    <PayPalScriptProvider options={{
      "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
      currency: "USD"
    }}>
      <PayPalButtons
        style={{
          layout: "vertical",
          shape: "rect",
          label: "pay"
        }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: `SAFEIA - ${plan.name}`,
                amount: {
                  value: plan.price?.toString() || "0",
                  currency_code: "USD"
                }
              }
            ],
            application_context: {
              shipping_preference: 'NO_SHIPPING'
            }
          });
        }}
        onApprove={async (data, actions) => {
          try {
            if (actions.order && currentUser) {
              const details = await actions.order.capture();
              // Verificar el pago con nuestro servidor
              const verificationResult = await verifyPayment(data.orderID);
              
              if (verificationResult.status === 'COMPLETED') {
                console.log('Pago verificado y completado:', verificationResult);
                
                // Crear la suscripción en la base de datos
                await createSubscription(currentUser.uid, plan);
                
                // Actualizar con los detalles del pago
                await updateSubscriptionPayment(currentUser.uid, {
                  id: data.orderID,
                  subscriptionID: data.subscriptionID
                });

                onSuccess({
                  ...details,
                  verificationResult
                });
              } else {
                throw new Error('El pago no se completó correctamente');
              }
              
              return details;
            }
          } catch (error) {
            console.error('Error al procesar el pago:', error);
            onError(error);
          }
        }}
        onError={(err) => {
          console.error("PayPal error:", err);
          onError(err);
        }}
        onCancel={() => {
          console.log("Pago cancelado por el usuario");
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalPayment;
