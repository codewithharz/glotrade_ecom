// Enhanced country data with phone codes, states, cities, and business features
export interface CountryData {
  name: string;
  phoneCode: string;
  states: StateData[];
  // Enhanced business features
  currency: string;
  paymentProviders: string[];
  businessTypes: string[];
  requiredDocs: string[];
  isTargetMarket: boolean;
}

export interface StateData {
  name: string;
  cities: string[];
}

// Enhanced country configuration for our target markets
export const countryData: Record<string, CountryData> = {
  // Primary Target Market - Nigeria
  "Nigeria": {
    name: "Nigeria",
    phoneCode: "+234",
    currency: "NGN",
    paymentProviders: ["paystack", "flutterwave"],
    businessTypes: ["individual", "company", "partnership"],
    requiredDocs: ["cac", "tax_id", "business_address"],
    isTargetMarket: true,
    states: [
      {
        name: "Lagos",
        cities: ["Ikeja", "Victoria Island", "Lekki", "Surulere", "Yaba", "Oshodi", "Alimosho", "Ikorodu"]
      },
      {
        name: "Abuja",
        cities: ["Wuse", "Garki", "Maitama", "Asokoro", "Jabi", "Kubwa", "Gwarinpa", "Lugbe"]
      },
      {
        name: "Kano",
        cities: ["Municipal", "Fagge", "Dala", "Gwale", "Tarauni", "Ungogo", "Nassarawa", "Unguwar Uku"]
      },
      {
        name: "Rivers",
        cities: ["Port Harcourt", "Obio-Akpor", "Okrika", "Eleme", "Ikwerre", "Emohua", "Omuma", "Abua-Odual"]
      },
      {
        name: "Kaduna",
        cities: ["Kaduna North", "Kaduna South", "Igabi", "Chikun", "Kajuru", "Kachia", "Kubau", "Soba"]
      },
      {
        name: "Ondo",
        cities: ["Akure", "Ondo", "Owo", "Ikare", "Oka", "Igbara-Oke", "Irele", "Okitipupa"]
      }
    ]
  },

  // XOF Countries - West African CFA Franc
  "Benin": {
    name: "Benin",
    phoneCode: "+229",
    currency: "XOF",
    paymentProviders: ["flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Littoral",
        cities: ["Cotonou", "Porto-Novo", "Abomey-Calavi", "Ouidah", "Grand-Popo"]
      },
      {
        name: "Ouémé",
        cities: ["Porto-Novo", "Adjohoun", "Akpro-Missérété", "Avrankou", "Bonou"]
      },
      {
        name: "Zou",
        cities: ["Abomey", "Bohicon", "Covè", "Dassa-Zoumè", "Ouinhi"]
      }
    ]
  },

  "Burkina Faso": {
    name: "Burkina Faso",
    phoneCode: "+226",
    currency: "XOF",
    paymentProviders: ["flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Centre",
        cities: ["Ouagadougou", "Komsilga", "Saaba", "Koubri", "Tanghin-Dassouri"]
      },
      {
        name: "Hauts-Bassins",
        cities: ["Bobo-Dioulasso", "Dandé", "Fara", "Houndé", "Toussiana"]
      },
      {
        name: "Centre-Ouest",
        cities: ["Koudougou", "Kokologho", "Laye", "Nandiala", "Sapouy"]
      }
    ]
  },

  "Côte d'Ivoire": {
    name: "Côte d'Ivoire",
    phoneCode: "+225",
    currency: "XOF",
    paymentProviders: ["orange_money", "flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Abidjan",
        cities: ["Abidjan", "Cocody", "Marcory", "Riviera", "Yopougon"]
      },
      {
        name: "Bouaké",
        cities: ["Bouaké", "Sakassou", "Béoumi", "Botro", "Dabakala"]
      },
      {
        name: "San-Pédro",
        cities: ["San-Pédro", "Sassandra", "Tabou", "Grand-Béréby", "Fresco"]
      }
    ]
  },

  "Guinea-Bissau": {
    name: "Guinea-Bissau",
    phoneCode: "+245",
    currency: "XOF",
    paymentProviders: ["flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Bissau",
        cities: ["Bissau", "Bafatá", "Gabú", "Bissorã", "Bolama"]
      },
      {
        name: "Cacheu",
        cities: ["Cacheu", "Canchungo", "Bula", "São Domingos", "Bigene"]
      },
      {
        name: "Oio",
        cities: ["Farim", "Bissorã", "Mansôa", "Bambadinca", "Nhacra"]
      }
    ]
  },

  "Mali": {
    name: "Mali",
    phoneCode: "+223",
    currency: "XOF",
    paymentProviders: ["flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Bamako",
        cities: ["Bamako", "Kati", "Koulikoro", "Kangaba", "Kolokani"]
      },
      {
        name: "Sikasso",
        cities: ["Sikasso", "Bougouni", "Koutiala", "Yorosso", "Kadiolo"]
      },
      {
        name: "Mopti",
        cities: ["Mopti", "Djenné", "Bandiagara", "Douentza", "Ténenkou"]
      }
    ]
  },

  "Niger": {
    name: "Niger",
    phoneCode: "+227",
    currency: "XOF",
    paymentProviders: ["flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Niamey",
        cities: ["Niamey", "Say", "Kollo", "Téra", "Tillabéri"]
      },
      {
        name: "Zinder",
        cities: ["Zinder", "Mirriah", "Magaria", "Matameye", "Tanout"]
      },
      {
        name: "Maradi",
        cities: ["Maradi", "Tessaoua", "Dakoro", "Aguié", "Guidan Roumdji"]
      }
    ]
  },

  "Senegal": {
    name: "Senegal",
    phoneCode: "+221",
    currency: "XOF",
    paymentProviders: ["orange_money", "flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Dakar",
        cities: ["Dakar", "Guédiawaye", "Pikine", "Rufisque", "Bargny"]
      },
      {
        name: "Thiès",
        cities: ["Thiès", "Mbour", "Joal-Fadiouth", "Ngaparou", "Popenguine"]
      },
      {
        name: "Kaolack",
        cities: ["Kaolack", "Guinguinéo", "Nioro du Rip", "Kaffrine", "Malem Hoddar"]
      }
    ]
  },

  "Togo": {
    name: "Togo",
    phoneCode: "+228",
    currency: "XOF",
    paymentProviders: ["flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Lomé",
        cities: ["Lomé", "Agoè-Nyivé", "Golfe", "Zio", "Yoto"]
      },
      {
        name: "Kara",
        cities: ["Kara", "Bassar", "Kozah", "Doufelgou", "Kéran"]
      },
      {
        name: "Sokodé",
        cities: ["Sokodé", "Tchamba", "Sotouboua", "Blitta", "Tchaoudjo"]
      }
    ]
  },

  // Other African countries (non-target markets)
  "Ghana": {
    name: "Ghana",
    phoneCode: "+233",
    currency: "GHS",
    paymentProviders: ["flutterwave"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: false,
    states: [
      {
        name: "Greater Accra",
        cities: ["Accra", "Tema", "Ashaiman", "Madina", "Adenta", "Dodowa", "Prampram", "Dawhenya"]
      },
      {
        name: "Ashanti",
        cities: ["Kumasi", "Obuasi", "Ejisu", "Konongo", "Mampong", "Bekwai", "Offinso", "Manso Nkwanta"]
      },
      {
        name: "Western",
        cities: ["Sekondi-Takoradi", "Tarkwa", "Axim", "Prestea", "Bogoso", "Dunkwa", "Asankragwa", "Wassa Akropong"]
      },
      {
        name: "Central",
        cities: ["Cape Coast", "Saltpond", "Winneba", "Swedru", "Dunkwa", "Mankessim", "Elmina", "Apam"]
      }
    ]
  },

  "Kenya": {
    name: "Kenya",
    phoneCode: "+254",
    currency: "KES",
    paymentProviders: ["flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: false,
    states: [
      {
        name: "Nairobi",
        cities: ["Nairobi West", "Nairobi East", "Nairobi North", "Nairobi South", "Westlands", "Dagoretti", "Langata", "Kasarani"]
      },
      {
        name: "Mombasa",
        cities: ["Mombasa Island", "Likoni", "Changamwe", "Kisauni", "Nyali", "Bamburi", "Shanzu", "Nyali Beach"]
      },
      {
        name: "Kisumu",
        cities: ["Kisumu Central", "Kisumu East", "Kisumu West", "Seme", "Nyando", "Muhoroni", "Nyakach", "Kajulu"]
      },
      {
        name: "Nakuru",
        cities: ["Nakuru Town East", "Nakuru Town West", "Naivasha", "Gilgil", "Njoro", "Molo", "Rongai", "Bahati"]
      }
    ]
  },

  "South Africa": {
    name: "South Africa",
    phoneCode: "+27",
    currency: "ZAR",
    paymentProviders: ["flutterwave", "bank_transfer"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: false,
    states: [
      {
        name: "Gauteng",
        cities: ["Johannesburg", "Pretoria", "Centurion", "Midrand", "Sandton", "Randburg", "Roodepoort", "Krugersdorp"]
      },
      {
        name: "Western Cape",
        cities: ["Cape Town", "Bellville", "Stellenbosch", "Paarl", "Worcester", "George", "Mossel Bay", "Knysna"]
      },
      {
        name: "KwaZulu-Natal",
        cities: ["Durban", "Pietermaritzburg", "Ballito", "Umhlanga", "Amanzimtoti", "Port Shepstone", "Richards Bay", "Stanger"]
      }
    ]
  },

  "Egypt": {
    name: "Egypt",
    phoneCode: "+20",
    currency: "EGP",
    paymentProviders: ["flutterwave", "bank_transfer"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: false,
    states: [
      {
        name: "Cairo",
        cities: ["Cairo", "Giza", "Helwan", "6th of October", "New Cairo", "Shoubra", "Maadi", "Zamalek"]
      },
      {
        name: "Alexandria",
        cities: ["Alexandria", "Borg El Arab", "Abu Qir", "Agami", "Miami", "Stanley", "Sidi Gaber", "Montazah"]
      },
      {
        name: "Giza",
        cities: ["Giza", "6th of October", "Sheikh Zayed", "Smart Village", "Hadayek October", "Saff", "Kerdasa", "Abu Rawash"]
      }
    ]
  },

  // Orange Money supported countries
  "Cameroon": {
    name: "Cameroon",
    phoneCode: "+237",
    currency: "XAF",
    paymentProviders: ["orange_money", "flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Centre",
        cities: ["Yaoundé", "Mbalmayo", "Mfou", "Obala", "Monatélé"]
      },
      {
        name: "Littoral",
        cities: ["Douala", "Nkongsamba", "Edéa", "Loum", "Manjo"]
      },
      {
        name: "Ouest",
        cities: ["Bafoussam", "Bangangté", "Dschang", "Foumban", "Mbouda"]
      }
    ]
  },

  "Madagascar": {
    name: "Madagascar",
    phoneCode: "+261",
    currency: "MGA",
    paymentProviders: ["orange_money", "flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Antananarivo",
        cities: ["Antananarivo", "Ambohidratrimo", "Andramasina", "Anjozorobe", "Ankazobe"]
      },
      {
        name: "Toamasina",
        cities: ["Toamasina", "Ambatondrazaka", "Brickaville", "Mahanoro", "Vatomandry"]
      },
      {
        name: "Fianarantsoa",
        cities: ["Fianarantsoa", "Ambalavao", "Ambohimahasoa", "Ikalamavony", "Isandra"]
      }
    ]
  },

  "Botswana": {
    name: "Botswana",
    phoneCode: "+267",
    currency: "BWP",
    paymentProviders: ["orange_money", "flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Gaborone",
        cities: ["Gaborone", "Mogoditshane", "Thamaga", "Kanye", "Ramotswa"]
      },
      {
        name: "Francistown",
        cities: ["Francistown", "Tati", "Tonota", "Sowa", "Selebi-Phikwe"]
      },
      {
        name: "Maun",
        cities: ["Maun", "Shakawe", "Gumare", "Nata", "Kasane"]
      }
    ]
  },

  "Guinea Conakry": {
    name: "Guinea Conakry",
    phoneCode: "+224",
    currency: "GNF",
    paymentProviders: ["orange_money", "flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Conakry",
        cities: ["Conakry", "Kaloum", "Dixinn", "Matam", "Ratoma"]
      },
      {
        name: "Kindia",
        cities: ["Kindia", "Télimélé", "Coyah", "Forécariah", "Dubréka"]
      },
      {
        name: "Kankan",
        cities: ["Kankan", "Kérouané", "Kissidougou", "Mandiana", "Siguiri"]
      }
    ]
  },

  "Sierra Leone": {
    name: "Sierra Leone",
    phoneCode: "+232",
    currency: "SLL",
    paymentProviders: ["orange_money", "flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Western Area",
        cities: ["Freetown", "Waterloo", "Hastings", "Lumley", "Wilberforce"]
      },
      {
        name: "Northern Province",
        cities: ["Makeni", "Port Loko", "Kambia", "Bombali", "Tonkolili"]
      },
      {
        name: "Eastern Province",
        cities: ["Kenema", "Kailahun", "Kono", "Kailahun", "Kono"]
      }
    ]
  },

  "RD Congo": {
    name: "RD Congo",
    phoneCode: "+243",
    currency: "CDF",
    paymentProviders: ["orange_money", "flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Kinshasa",
        cities: ["Kinshasa", "Lemba", "Matete", "Ngaliema", "Lingwala"]
      },
      {
        name: "Katanga",
        cities: ["Lubumbashi", "Kolwezi", "Likasi", "Kipushi", "Kamina"]
      },
      {
        name: "Kivu",
        cities: ["Goma", "Bukavu", "Uvira", "Butembo", "Beni"]
      }
    ]
  },

  "Central African Republic": {
    name: "Central African Republic",
    phoneCode: "+236",
    currency: "XAF",
    paymentProviders: ["orange_money", "flutterwave", "mobile_money"],
    businessTypes: ["individual", "company"],
    requiredDocs: ["business_license", "tax_id"],
    isTargetMarket: true,
    states: [
      {
        name: "Bangui",
        cities: ["Bangui", "Bimbo", "Bégoua", "Bossembélé", "Boali"]
      },
      {
        name: "Ouham",
        cities: ["Bossangoa", "Bouar", "Bozoum", "Paoua", "Kaga-Bandoro"]
      },
      {
        name: "Mambéré-Kadéï",
        cities: ["Berbérati", "Carnot", "Gamboula", "Bouar", "Baboua"]
      }
    ]
  }
};

// Helper functions
export const getCountryPhoneCode = (country: string): string => {
  return countryData[country]?.phoneCode || "+234";
};

export const getStatesForCountry = (country: string): StateData[] => {
  return countryData[country]?.states || [];
};

export const getCitiesForState = (country: string, state: string): string[] => {
  const states = getStatesForCountry(country);
  const stateData = states.find(s => s.name === state);
  return stateData?.cities || [];
};

export const getCountryNames = (): string[] => {
  return Object.keys(countryData);
};

// Enhanced helper functions for business features
export const getCountryCurrency = (country: string): string => {
  return countryData[country]?.currency || "NGN";
};

export const getCountryPaymentProviders = (country: string): string[] => {
  return countryData[country]?.paymentProviders || ["paystack"];
};

export const getCountryBusinessTypes = (country: string): string[] => {
  return countryData[country]?.businessTypes || ["individual"];
};

export const getCountryRequiredDocs = (country: string): string[] => {
  return countryData[country]?.requiredDocs || ["business_license"];
};

export const isTargetMarket = (country: string): boolean => {
  return countryData[country]?.isTargetMarket || false;
};

export const getTargetMarketCountries = (): string[] => {
  return Object.keys(countryData).filter(country => countryData[country].isTargetMarket);
};

export const getXOFCountries = (): string[] => {
  return Object.keys(countryData).filter(country => countryData[country].currency === "XOF");
};

export const getNGNCountries = (): string[] => {
  return Object.keys(countryData).filter(country => countryData[country].currency === "NGN");
}; 