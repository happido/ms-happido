import React from 'react';

export const StripeProvider = ({ children }: any) => {
  return <>{children}</>;
};

export const useStripe = () => {
  return {
    initPaymentSheet: async () => ({ error: { message: 'Stripe is not supported on Web.' } }),
    presentPaymentSheet: async () => ({ error: { message: 'Stripe is not supported on Web.' } }),
  };
};
