// src/utils/validators.ts
export const isEmail = (email: string): boolean => {
  // RFC 5322 Email validation regex
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};



export const isValidUsername = (username: string): boolean => {
  // Alphanumeric with underscores and hyphens, 3-30 characters
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Additional validation helpers
export const validators = {
  isNumericPositive: (value: number): boolean => {
    return typeof value === "number" && value >= 0;
  },

  isValidCountry: (country: string): boolean => {
    // Add list of valid country codes or names
    const validCountries = ["Nigeria", "Ghana", "Kenya", "South Africa"]; // Expand this list
    return validCountries.includes(country);
  },

  isValidDate: (date: Date): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  },

  isValidImageUrl: (url: string): boolean => {
    const imageRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
    return imageRegex.test(url);
  },
};
