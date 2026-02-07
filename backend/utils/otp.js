// Simple OTP generator (for development)
// In production, use SMS gateway like Twilio, MSG91, etc.

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendOTP = async (mobile, otp) => {
  // In production, integrate with SMS gateway
  // For now, just log it (you'll see it in console)
  console.log(`OTP for ${mobile}: ${otp}`);
  console.log('In production, send this via SMS gateway');
  
  // Simulate SMS delay
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

// Store OTP temporarily (in production, use Redis)
const otpStore = new Map();

exports.storeOTP = (mobile, otp) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(mobile, { otp, expiresAt });
};

exports.verifyOTP = (mobile, otp) => {
  const stored = otpStore.get(mobile);
  if (!stored) {
    return { valid: false, error: 'OTP not found or expired' };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(mobile);
    return { valid: false, error: 'OTP expired' };
  }

  if (stored.otp !== otp) {
    return { valid: false, error: 'Invalid OTP' };
  }

  otpStore.delete(mobile);
  return { valid: true };
};



