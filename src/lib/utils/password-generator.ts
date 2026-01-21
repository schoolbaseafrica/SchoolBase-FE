/**
 * Generates a secure password that meets the password reset form requirements:
 * - Minimum 6 characters, maximum 20 characters
 * - At least one letter (uppercase or lowercase)
 * - At least one number
 * - At least one special character (# ? ! @ $ % ^ & * -)
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const specialChars = "#?!@$%^&*-"
  
  // Ensure length is within valid range
  const validLength = Math.max(6, Math.min(20, length))
  
  // Start with required character types to ensure all requirements are met
  let password = ""
  
  // Add at least one uppercase letter
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  
  // Add at least one lowercase letter
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  
  // Add at least one number
  password += numbers[Math.floor(Math.random() * numbers.length)]
  
  // Add at least one special character
  password += specialChars[Math.floor(Math.random() * specialChars.length)]
  
  // Combine all character sets for the remaining characters
  const allChars = uppercase + lowercase + numbers + specialChars
  
  // Fill the rest randomly
  for (let i = password.length; i < validLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password to randomize the position of required characters
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}
