"use client";
import { useEffect, useMemo, useState } from "react";
import { X, Lock } from "lucide-react";
import { API_BASE_URL, apiPost, apiPut } from "@/utils/api";
import { getCountryPhoneCode, getStatesForCountry, getCitiesForState, getCountryNames } from "@/utils/countryData";
import { getStoredLocale, translate, Locale } from "@/utils/i18n";

type Address = {
  id?: string;
  country: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  street?: string;
  state?: string;
  city?: string;
  isDefault?: boolean;
};

export default function AddressModal({ open, onClose, onSaved, initialData, onAddressUpdate }: {
  open: boolean;
  onClose: () => void;
  onSaved: (addr: Address) => void;
  initialData?: Address;
  onAddressUpdate?: (updatedUserData: any) => void;
}) {
  const [form, setForm] = useState<Address>({ country: "Nigeria", firstName: "", lastName: "", phone: "", address: "", state: "", city: "", isDefault: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getStoredLocale());
    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale: Locale };
      setLocale(detail.locale);
    };
    window.addEventListener("i18n:locale", onLocale as EventListener);
    return () => window.removeEventListener("i18n:locale", onLocale as EventListener);
  }, []);

  // Get available states and cities based on selected country
  const availableStates = getStatesForCountry(form.country);
  const availableCities = form.state ? getCitiesForState(form.country, form.state) : [];

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      // Editing existing address
      setForm({
        ...initialData,
        // Ensure firstName and lastName are always defined to prevent controlled/uncontrolled input errors
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        address: initialData.address || initialData.street || '', // Handle both field names
        street: initialData.street || initialData.address || ''
      });
    } else {
      // Creating new address - load from localStorage if available
      try {
        const raw = localStorage.getItem("shippingAddress");
        if (raw) {
          const savedAddress = JSON.parse(raw);
          setForm({
            ...savedAddress,
            // Ensure firstName and lastName are always defined
            firstName: savedAddress.firstName || '',
            lastName: savedAddress.lastName || ''
          });
        }
      } catch { }
    }
  }, [open, initialData]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = translate(locale, "address.errors.required");
    if (!form.lastName.trim()) e.lastName = translate(locale, "address.errors.required");
    if (!/^\d{10,11}$/.test((form.phone || "").replace(/\D/g, ""))) e.phone = translate(locale, "address.errors.phone");
    if (!form.address.trim()) e.address = translate(locale, "address.errors.required");
    if (!form.state) e.state = translate(locale, "address.errors.required");
    if (!form.city) e.city = translate(locale, "address.errors.required");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      // First save to database if user is logged in
      let savedAddress = form;

      try {
        const raw = localStorage.getItem('afritrade:user');
        if (raw) {
          const user = JSON.parse(raw);
          if (user?.id || user?._id) {
            const isEditing = !!form.id;
            const endpoint = isEditing
              ? `/api/v1/users/me/addresses/${form.id}`
              : `/api/v1/users/me/addresses`;

            // Prepare the request body
            const requestBody = {
              street: form.address,
              city: form.city,
              state: form.state,
              country: form.country,
              phone: form.phone,
              firstName: form.firstName,
              lastName: form.lastName,
              isDefault: form.isDefault
            };

            console.log(`Sending ${isEditing ? 'update' : 'create'} request:`, {
              method: isEditing ? 'PUT' : 'POST',
              endpoint,
              body: requestBody
            });

            // Save to database (POST for create, PUT for update)
            // Use apiPost/apiPut to ensure correct Authorization header (Bearer token) is used
            let result;
            if (isEditing) {
              result = await apiPut<{ status: string; data: any; user?: any }>(endpoint, requestBody);
            } else {
              result = await apiPost<{ status: string; data: any; user?: any }>(endpoint, requestBody);
            }

            console.log(`Address ${isEditing ? 'updated' : 'saved'} to database:`, result);
            console.log('AddressModal: Full API response:', JSON.stringify(result, null, 2));

            if (isEditing) {
              // Update mode - find the updated address by ID from the returned array
              // Handle Mongoose document structure where data might be nested in _doc
              const updatedAddress = result.data.find((addr: any) => {
                const addrId = addr.id || addr._doc?.id;
                return addrId === form.id;
              });

              // Extract the actual address data, handling both direct and nested structures
              let finalAddress;
              if (updatedAddress) {
                // If it's a Mongoose document with nested _doc, use that
                if (updatedAddress._doc) {
                  finalAddress = updatedAddress._doc;
                } else {
                  // If it's a plain object, use it directly
                  finalAddress = updatedAddress;
                }
              } else {
                // Fallback to form if not found
                finalAddress = form;
              }

              savedAddress = finalAddress;
              console.log('Found updated address:', finalAddress);

              // Call onAddressUpdate with the user data from the response
              if (onAddressUpdate && result.user) {
                console.log('AddressModal: Calling onAddressUpdate with user data:', result.user);
                onAddressUpdate(result.user);
                console.log('AddressModal: Successfully called onAddressUpdate');
              } else {
                console.log('AddressModal: onAddressUpdate not called because:', {
                  hasOnAddressUpdate: !!onAddressUpdate,
                  hasResultUser: !!result.user,
                  resultUser: result.user
                });
              }
            } else {
              // Create mode - use the newly created address
              savedAddress = result.data[result.data.length - 1];
            }
          }
        }
      } catch (error) {
        console.error('Error saving to database:', error);
      }

      // Ensure the saved address has the 'address' field that validation logic expects
      const finalAddressForCallback = {
        ...savedAddress,
        address: savedAddress.street || savedAddress.address // Map street to address field
      };

      // Also save to localStorage for immediate use
      try {
        localStorage.setItem("shippingAddress", JSON.stringify(finalAddressForCallback));
      } catch { }

      onSaved(finalAddressForCallback);
    } finally {
      setSaving(false)
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-xl max-h-[90vh] sm:max-h-[88vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-950 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur">
          <h2 className="text-base sm:text-lg font-semibold">{initialData ? translate(locale, "address.edit") : translate(locale, "address.add")}</h2>
          <button aria-label="Close" onClick={onClose} className="p-1.5 sm:p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900"><X size={18} /></button>
        </div>

        <div className="px-4 sm:px-5">
          <div className="mt-3 mb-2 inline-flex items-center gap-2 text-emerald-600 text-xs sm:text-sm">
            <Lock size={14} className="sm:w-4 sm:h-4" /> {translate(locale, "address.encrypted")}
          </div>

          <div className="space-y-3 sm:space-y-4 py-2">
            <div>
              <label className="text-xs sm:text-sm font-medium">{translate(locale, "address.country")}<span className="text-rose-500"> *</span></label>
              <select
                value={form.country}
                onChange={(e) => {
                  const newCountry = e.currentTarget.value;
                  setForm({
                    ...form,
                    country: newCountry,
                    state: "", // Reset state when country changes
                    city: ""   // Reset city when state changes
                  });
                }}
                className="mt-1 w-full rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2.5 sm:py-3 text-sm sm:text-base"
              >
                {getCountryNames().map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium">{translate(locale, "address.firstName")}<span className="text-rose-500"> *</span></label>
              <input
                value={form.firstName || ''}
                onChange={(e) => setForm({ ...form, firstName: e.currentTarget.value })}
                placeholder={translate(locale, "address.firstName")}
                className={`mt-1 w-full rounded-lg border px-3 py-2.5 sm:py-3 text-sm sm:text-base ${errors.firstName ? "border-rose-500" : "border-neutral-300 dark:border-neutral-800"} bg-white dark:bg-neutral-900`}
              />
              {errors.firstName ? <div className="text-xs text-rose-600 mt-1">{errors.firstName}</div> : null}
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium">{translate(locale, "address.lastName")}<span className="text-rose-500"> *</span></label>
              <input
                value={form.lastName || ''}
                onChange={(e) => setForm({ ...form, lastName: e.currentTarget.value })}
                placeholder={translate(locale, "address.lastName")}
                className={`mt-1 w-full rounded-lg border px-3 py-2.5 sm:py-3 text-sm sm:text-base ${errors.lastName ? "border-rose-500" : "border-neutral-300 dark:border-neutral-800"} bg-white dark:bg-neutral-900`}
              />
              {errors.lastName ? <div className="text-xs text-rose-600 mt-1">{errors.lastName}</div> : null}
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium">{translate(locale, "address.phone")}<span className="text-rose-500"> *</span></label>
              <div className={`mt-1 flex items-center rounded-lg border ${errors.phone ? "border-rose-500" : "border-neutral-300 dark:border-neutral-800"} bg-white dark:bg-neutral-900`}>
                <span className="px-2 sm:px-3 text-xs sm:text-sm text-neutral-500 whitespace-nowrap">
                  {getCountryPhoneCode(form.country)}
                </span>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.currentTarget.value })} placeholder={translate(locale, "address.errors.phone")} className="flex-1 px-2 py-2.5 sm:py-3 bg-transparent outline-none text-sm sm:text-base" />
              </div>
              {errors.phone ? <div className="text-xs text-rose-600 mt-1">{errors.phone}</div> : null}
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium">{translate(locale, "address.deliveryAddress")}<span className="text-rose-500"> *</span></label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.currentTarget.value })} placeholder={translate(locale, "address.deliveryAddress")} className={`mt-1 w-full rounded-lg border px-3 py-2.5 sm:py-3 text-sm sm:text-base ${errors.address ? "border-rose-500" : "border-neutral-300 dark:border-neutral-800"} bg-white dark:bg-neutral-900`} />
              {errors.address ? <div className="text-xs text-rose-600 mt-1">{errors.address}</div> : null}
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium">{translate(locale, "address.state")}<span className="text-rose-500"> *</span></label>
              <select
                value={form.state}
                onChange={(e) => {
                  const newState = e.currentTarget.value;
                  setForm({
                    ...form,
                    state: newState,
                    city: "" // Reset city when state changes
                  });
                }}
                className={`mt-1 w-full rounded-lg border px-3 py-2.5 sm:py-3 text-sm sm:text-base ${errors.state ? "border-rose-500" : "border-neutral-300 dark:border-neutral-800"} bg-white dark:bg-neutral-900`}
              >
                <option value="">{translate(locale, "address.selectState")}</option>
                {availableStates.map(state => (
                  <option key={state.name} value={state.name}>{state.name}</option>
                ))}
              </select>
              {errors.state ? <div className="text-xs text-rose-600 mt-1">{errors.state}</div> : null}
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium">{translate(locale, "address.city")}<span className="text-rose-500"> *</span></label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.currentTarget.value })}
                disabled={!form.state} // Disable if no state selected
                className={`mt-1 w-full rounded-lg border px-3 py-2.5 sm:py-3 text-sm sm:text-base ${errors.city ? "border-rose-500" : "border-neutral-300 dark:border-neutral-800"} bg-white dark:bg-neutral-900 ${!form.state ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <option value="">{form.state ? translate(locale, "address.selectCity") : translate(locale, "address.selectStateFirst")}</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city ? <div className="text-xs text-rose-600 mt-1">{errors.city}</div> : null}
            </div>
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm">
              <input type="checkbox" checked={!!form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.currentTarget.checked })} />
              {translate(locale, "address.setAsDefault")}
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 px-4 sm:px-5 py-3 sm:py-4 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={save}
            disabled={saving}
            className={`w-full rounded-full bg-orange-500 text-white font-semibold py-3 sm:py-4 text-sm sm:text-base transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 active:bg-orange-700'}`}
          >
            {saving ? translate(locale, "address.saving") : translate(locale, "address.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

