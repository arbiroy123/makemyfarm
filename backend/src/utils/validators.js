export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  // Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

export function validatePhoneNumber(phone) {
  // Basic phone validation - adjust as needed
  const phoneRegex = /^\d{10,}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function sanitizeInput(input) {
  return input.trim().slice(0, 255);
}

export function calculateHarvestDate(plantingDate, daysToHarvest) {
  const date = new Date(plantingDate);
  date.setDate(date.getDate() + daysToHarvest);
  return date.toISOString().split('T')[0];
}
