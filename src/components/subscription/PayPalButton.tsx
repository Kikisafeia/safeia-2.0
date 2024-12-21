import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createSubscription } from '../../services/paypal';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalButtonProps {
  planId: string;
  price: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function PayPalButton({ planId, price, onSuccess, onError }: PayPalButtonProps) {
  const { currentUser } = useAuth();
  const buttonRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.paypal || !buttonRef.current) return;

    // Limpiar el contenedor antes de renderizar
    buttonRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'subscribe'
      },
      createSubscription: async (data: any, actions: any) => {
        return actions.subscription.create({
          'plan_id': planId, // PayPal Plan ID
          'application_context': {
            'shipping_preference': 'NO_SHIPPING'
          }
        });
      },
      onApprove: async (data: any, actions: any) => {
        try {
          if (!currentUser) throw new Error('No user found');

          await createSubscription({
            subscriptionID: data.subscriptionID,
            planId: planId,
            userID: currentUser.uid
          });

          onSuccess?.();
        } catch (error) {
          console.error('Error processing subscription:', error);
          onError?.(error);
        }
      },
      onError: (err: any) => {
        console.error('PayPal Error:', err);
        onError?.(err);
      }
    }).render(buttonRef.current);

  }, [planId, price, currentUser, onSuccess, onError]);

  return (
    <div>
      <div ref={buttonRef} />
      <p className="mt-2 text-sm text-gray-500 text-center">
        Al suscribirte, aceptas nuestros términos y condiciones
      </p>
    </div>
  );
}
