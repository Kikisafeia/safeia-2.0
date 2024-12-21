import { updateSubscriptionStatus } from './paypal';

interface PayPalWebhookEvent {
  event_type: string;
  resource: {
    id: string;
    status: string;
    billing_info: {
      next_billing_time: string;
      cycle_executions: Array<{
        tenure_type: string;
        sequence: number;
        cycles_completed: number;
        cycles_remaining: number;
      }>;
    };
  };
}

export const handlePayPalWebhook = async (event: PayPalWebhookEvent) => {
  const { event_type, resource } = event;

  switch (event_type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      await updateSubscriptionStatus(resource.id, 'active', resource.billing_info.next_billing_time);
      break;

    case 'BILLING.SUBSCRIPTION.CANCELLED':
      await updateSubscriptionStatus(resource.id, 'cancelled');
      break;

    case 'BILLING.SUBSCRIPTION.EXPIRED':
      await updateSubscriptionStatus(resource.id, 'expired');
      break;

    case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
      // Aquí podrías implementar lógica adicional para manejar pagos fallidos
      // Por ejemplo, enviar un email al usuario
      console.log('Payment failed for subscription:', resource.id);
      break;

    case 'BILLING.SUBSCRIPTION.SUSPENDED':
      await updateSubscriptionStatus(resource.id, 'cancelled');
      break;

    default:
      console.log('Unhandled PayPal webhook event:', event_type);
  }
};

// Esta función verifica la autenticidad del webhook de PayPal
export const verifyPayPalWebhook = async (
  webhookId: string,
  eventBody: string,
  headers: Record<string, string>
): Promise<boolean> => {
  // Aquí deberías implementar la verificación de la firma del webhook
  // usando la API de PayPal
  // https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature

  // Por ahora, retornamos true para desarrollo
  return true;
};
