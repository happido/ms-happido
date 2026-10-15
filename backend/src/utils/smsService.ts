interface SendSmsOptions {
  phone: string;
  otp: string;
}

export const sendSmsOtp = async ({ phone, otp }: SendSmsOptions): Promise<{ success: boolean; message: string }> => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  // Clean phone number (strip +91 or non-digits)
  const cleanPhone = phone.replace(/^(\+91|91)/, '').replace(/\D/g, '');

  if (!apiKey) {
    console.log(`\n======================================================`);
    console.log(`⚡ [INSTANT SMS OTP SIMULATION]`);
    console.log(`📱 Phone: +91 ${cleanPhone}`);
    console.log(`🔑 OTP Code: ${otp}`);
    console.log(`💡 To send live SMS directly to phones in India, add:`);
    console.log(`   FAST2SMS_API_KEY=your_free_key in backend/.env`);
    console.log(`======================================================\n`);
    return { success: true, message: 'OTP generated (Simulated - check server console or dev preview)' };
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        variables_values: otp,
        route: 'otp',
        numbers: cleanPhone
      })
    });

    const data = await response.json() as any;

    if (data.return === true || data.status_code === 200) {
      console.log(`[Fast2SMS] OTP sent successfully to +91 ${cleanPhone}`);
      return { success: true, message: 'OTP sent successfully to your mobile number' };
    } else {
      console.error('[Fast2SMS Error]', data);
      return { success: false, message: data.message?.[0] || 'Failed to send SMS via gateway' };
    }
  } catch (error: any) {
    console.error('[SMS Service Error]', error);
    return { success: false, message: error.message || 'SMS service error' };
  }
};
