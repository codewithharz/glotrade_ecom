// Business document configuration for vendor application form
// This file provides country-aware business document labels and validation rules

import { enhancedCountryConfig, getCountryByCode } from './enhancedCountryConfig';

export interface BusinessDocumentConfig {
  label: string;
  placeholder: string;
  description: string;
  required: boolean;
  validationRules?: string[];
  examples?: string[];
  options?: string[]; // For select fields like RC/BN
}

export interface CountryBusinessDocuments {
  [key: string]: BusinessDocumentConfig;
}

// Business document types and their configurations
export const BUSINESS_DOCUMENT_TYPES = {
  // Nigeria-specific documents
  CAC_NUMBER: 'cac_number',
  CAC_TYPE: 'cac_type', // RC or BN
  BUSINESS_LICENSE: 'business_license',
  TAX_ID: 'tax_id',
  BUSINESS_ADDRESS: 'business_address',
  BUSINESS_REGISTRATION_DATE: 'business_registration_date'
} as const;

// Get business document configuration for a specific country
export const getBusinessDocumentConfig = (countryCode: string): CountryBusinessDocuments => {
  const country = getCountryByCode(countryCode);
  
  if (!country) {
    // Default configuration for unknown countries
    return {
      [BUSINESS_DOCUMENT_TYPES.BUSINESS_LICENSE]: {
        label: 'Business License Number',
        placeholder: 'Enter business license number',
        description: 'Your business registration or license number',
        required: true
      },
      [BUSINESS_DOCUMENT_TYPES.TAX_ID]: {
        label: 'Tax ID/Registration Number',
        placeholder: 'Enter tax identification number',
        description: 'Your tax identification or registration number',
        required: true
      }
    };
  }

  // Nigeria-specific configuration
  if (countryCode === 'NG') {
    return {
      [BUSINESS_DOCUMENT_TYPES.CAC_TYPE]: {
        label: 'Registration Type',
        placeholder: 'Select registration type',
        description: 'Choose your CAC registration type',
        required: true,
        validationRules: ['Must select RC or BN'],
        options: ['RC', 'BN']
      },
      [BUSINESS_DOCUMENT_TYPES.CAC_NUMBER]: {
        label: 'CAC Number',
        placeholder: 'Enter CAC registration number',
        description: 'Corporate Affairs Commission registration number (e.g., RC123456 or BN123456)',
        required: true,
        validationRules: ['Must be valid CAC format', 'Required for company registration'],
        examples: ['RC123456', 'RC789012', 'BN123456', 'BN789012', 'RC1234567', 'BN12345678']
      },
      [BUSINESS_DOCUMENT_TYPES.BUSINESS_LICENSE]: {
        label: 'Business License Number',
        placeholder: 'Enter business license number',
        description: 'Additional business license if required by your industry',
        required: false,
        examples: ['BL001234', 'LIC789012']
      },
      [BUSINESS_DOCUMENT_TYPES.TAX_ID]: {
        label: 'Tax ID/Registration Number',
        placeholder: 'Enter tax identification number',
        description: 'FIRS tax identification number (e.g., 12345678-0001)',
        required: true,
        validationRules: ['Must be valid FIRS format', 'Required for tax compliance'],
        examples: ['12345678-0001', '87654321-0001']
      },
      [BUSINESS_DOCUMENT_TYPES.BUSINESS_REGISTRATION_DATE]: {
        label: 'Business Registration Date',
        placeholder: 'Select registration date',
        description: 'Date when your business was officially registered',
        required: true,
        validationRules: ['Must be a valid date', 'Cannot be in the future']
      }
    };
  }

  // XOF countries configuration
  if (country.currency === 'XOF') {
    return {
      [BUSINESS_DOCUMENT_TYPES.BUSINESS_LICENSE]: {
        label: 'Business License Number',
        placeholder: 'Enter business license number',
        description: `Business registration number from ${country.name} authorities`,
        required: true,
        validationRules: ['Must be valid business license format', 'Required for company registration'],
        examples: ['BL001234', 'LIC789012', 'REG345678']
      },
      [BUSINESS_DOCUMENT_TYPES.TAX_ID]: {
        label: 'Tax ID/Registration Number',
        placeholder: 'Enter tax identification number',
        description: `Tax identification number from ${country.name} tax authority`,
        required: true,
        validationRules: ['Must be valid tax ID format', 'Required for tax compliance'],
        examples: ['T123456', 'TAX789012', 'ID345678']
      },
      [BUSINESS_DOCUMENT_TYPES.BUSINESS_REGISTRATION_DATE]: {
        label: 'Business Registration Date',
        placeholder: 'Select registration date',
        description: 'Date when your business was officially registered',
        required: true,
        validationRules: ['Must be a valid date', 'Cannot be in the future']
      }
    };
  }

  // Default configuration for other countries
  return {
    [BUSINESS_DOCUMENT_TYPES.BUSINESS_LICENSE]: {
      label: 'Business License Number',
      placeholder: 'Enter business license number',
      description: 'Your business registration or license number',
      required: true
    },
    [BUSINESS_DOCUMENT_TYPES.TAX_ID]: {
      label: 'Tax ID/Registration Number',
      placeholder: 'Enter tax identification number',
      description: 'Your tax identification or registration number',
      required: true
    }
  };
};

// Get specific document configuration
export const getDocumentConfig = (countryCode: string, documentType: string): BusinessDocumentConfig | undefined => {
  const countryDocs = getBusinessDocumentConfig(countryCode);
  return countryDocs[documentType];
};

// Get all required documents for a country
export const getRequiredDocumentsForCountry = (countryCode: string): string[] => {
  const country = getCountryByCode(countryCode);
  
  if (!country) return [];
  
  if (countryCode === 'NG') {
    return [BUSINESS_DOCUMENT_TYPES.CAC_TYPE, BUSINESS_DOCUMENT_TYPES.CAC_NUMBER, BUSINESS_DOCUMENT_TYPES.TAX_ID, BUSINESS_DOCUMENT_TYPES.BUSINESS_REGISTRATION_DATE];
  }
  
  if (country.currency === 'XOF') {
    return [BUSINESS_DOCUMENT_TYPES.BUSINESS_LICENSE, BUSINESS_DOCUMENT_TYPES.TAX_ID, BUSINESS_DOCUMENT_TYPES.BUSINESS_REGISTRATION_DATE];
  }
  
  return [BUSINESS_DOCUMENT_TYPES.BUSINESS_LICENSE, BUSINESS_DOCUMENT_TYPES.TAX_ID];
};

// Get business type options for a country
export const getBusinessTypesForCountry = (countryCode: string): Array<{ value: string; label: string; description: string }> => {
  const country = getCountryByCode(countryCode);
  
  if (!country) return [];
  
  if (countryCode === 'NG') {
    return [
      { value: 'individual', label: 'Individual', description: 'Sole proprietor or individual business' },
      { value: 'company', label: 'Company', description: 'Registered company with CAC' },
      { value: 'partnership', label: 'Partnership', description: 'Business partnership agreement' }
    ];
  }
  
  // XOF countries and others
  return [
    { value: 'individual', label: 'Individual', description: 'Sole proprietor or individual business' },
    { value: 'company', label: 'Company', description: 'Registered company with business license' }
  ];
};

// Get help text for business documents
export const getBusinessDocumentHelpText = (countryCode: string): string => {
  const country = getCountryByCode(countryCode);
  
  if (!country) return 'Please provide your business registration documents.';
  
  if (countryCode === 'NG') {
    return 'For Nigerian businesses, you need CAC registration, tax ID, and business registration date. Company registration requires CAC number.';
  }
  
  if (country.currency === 'XOF') {
    return `For ${country.name} businesses, you need a business license, tax ID, and business registration date. All documents must be from local authorities.`;
  }
  
  return 'Please provide your business registration documents including business license and tax ID.';
};

// Validate business document format
export const validateBusinessDocument = (countryCode: string, documentType: string, value: string): { isValid: boolean; error?: string } => {
  if (!value.trim()) {
    return { isValid: false, error: 'This field is required' };
  }

  const country = getCountryByCode(countryCode);
  
  if (!country) {
    return { isValid: true }; // No specific validation for unknown countries
  }

  // Nigeria-specific validation
  if (countryCode === 'NG') {
    if (documentType === BUSINESS_DOCUMENT_TYPES.CAC_NUMBER) {
      // CAC format: RC or BN + 6 digits or more
      const cacPattern = /^(RC|BN)\d{6,}$/;
      if (!cacPattern.test(value)) {
        return { isValid: false, error: 'CAC number must be in format RC123456 or BN123456 (6+ digits)' };
      }
    }
    
    if (documentType === BUSINESS_DOCUMENT_TYPES.TAX_ID) {
      // Tax ID format: 8 digits + dash + 4 digits
      const taxPattern = /^\d{8}-\d{4}$/;
      if (!taxPattern.test(value)) {
        return { isValid: false, error: 'Tax ID must be in format 12345678-0001' };
      }
    }
  }

  // XOF countries validation
  if (country.currency === 'XOF') {
    if (documentType === BUSINESS_DOCUMENT_TYPES.BUSINESS_LICENSE) {
      // Business license should be at least 6 characters
      if (value.length < 6) {
        return { isValid: false, error: 'Business license number must be at least 6 characters' };
      }
    }
    
    if (documentType === BUSINESS_DOCUMENT_TYPES.TAX_ID) {
      // Tax ID should be at least 6 characters
      if (value.length < 6) {
        return { isValid: false, error: 'Tax ID must be at least 6 characters' };
      }
    }
  }

  return { isValid: true };
};

// Get country-specific business information
export const getCountryBusinessInfo = (countryCode: string): { 
  title: string; 
  description: string; 
  requirements: string[]; 
  examples: string[] 
} => {
  const country = getCountryByCode(countryCode);
  
  if (!country) {
    return {
      title: 'Business Information',
      description: 'Please provide your business details',
      requirements: ['Business license', 'Tax ID'],
      examples: ['BL001234', 'T123456']
    };
  }

  if (countryCode === 'NG') {
    return {
      title: 'Nigerian Business Information',
      description: 'Complete business registration details for Nigeria',
      requirements: [
        'Registration Type (RC or BN)',
        'CAC Number (Corporate Affairs Commission)',
        'Tax ID (FIRS)',
        'Business Registration Date'
      ],
      examples: ['RC/BN', 'RC123456 or BN123456 (6+ digits)', '12345678-0001', '2023-01-15']
    };
  }

  if (country.currency === 'XOF') {
    return {
      title: `${country.name} Business Information`,
      description: `Business registration requirements for ${country.name}`,
      requirements: [
        'Business License Number',
        'Tax ID',
        'Business Registration Date'
      ],
      examples: ['BL001234', 'T123456', '2023-01-15']
    };
  }

  return {
    title: 'Business Information',
    description: 'Please provide your business details',
    requirements: ['Business license', 'Tax ID'],
    examples: ['BL001234', 'T123456']
  };
}; 