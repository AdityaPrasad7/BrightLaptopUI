import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { lookupPincode } from '../utils/pincodeLookup';
import { getStoredUser } from '../api/authApi';
import { Loader2 } from 'lucide-react';

const AddressForm = ({ address, onChange, onSubmit, onCancel, submitLabel = "Save Address" }) => {
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [localitySuggestions, setLocalitySuggestions] = useState([]);

  // Pre-fill name and phone from localStorage on mount
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      const updates = {};
      if (!address.fullName && user.name) {
        updates.fullName = user.name;
      }
      if (!address.phone && user.phone) {
        updates.phone = user.phone;
      }
      if (Object.keys(updates).length > 0) {
        onChange({ ...address, ...updates });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handle pincode lookup with debouncing
  useEffect(() => {
    const pincode = address.pincode;
    
    if (pincode && pincode.length === 6) {
      const timeoutId = setTimeout(async () => {
        setPincodeLoading(true);
        setPincodeError('');
        
        const pincodeData = await lookupPincode(pincode);
        
        if (pincodeData) {
          // Auto-fill city, state, country
          const updatedAddress = {
            ...address,
            city: pincodeData.city || address.city,
            state: pincodeData.state || address.state,
            country: pincodeData.country || address.country || 'India',
          };
          onChange(updatedAddress);
          
          // Set locality suggestions for addressLine2
          if (pincodeData.localitySuggestions && pincodeData.localitySuggestions.length > 0) {
            setLocalitySuggestions(pincodeData.localitySuggestions);
          } else {
            setLocalitySuggestions([]);
          }
        } else {
          setPincodeError('Invalid pincode. Please check and try again.');
          setLocalitySuggestions([]);
        }
        
        setPincodeLoading(false);
      }, 500); // 500ms debounce
      
      return () => clearTimeout(timeoutId);
    } else {
      setLocalitySuggestions([]);
      setPincodeError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.pincode]); // Only trigger when pincode changes

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    const pincode = value.slice(0, 6); // Max 6 digits
    onChange({ ...address, pincode });
  };

  const handleLocalitySuggestion = (suggestion) => {
    onChange({ ...address, addressLine2: suggestion });
    setLocalitySuggestions([]);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={address.fullName || ''}
            onChange={(e) => onChange({ ...address, fullName: e.target.value })}
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={address.phone || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // Only digits
              onChange({ ...address, phone: value.slice(0, 10) }); // Max 10 digits
            }}
            placeholder="10-digit mobile number"
            maxLength={10}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pincode">Pincode *</Label>
        <div className="relative">
          <Input
            id="pincode"
            type="text"
            value={address.pincode || ''}
            onChange={handlePincodeChange}
            placeholder="6-digit pincode"
            maxLength={6}
            required
            className={pincodeError ? 'border-red-500' : ''}
          />
          {pincodeLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        {pincodeError && (
          <p className="text-sm text-red-500">{pincodeError}</p>
        )}
        {pincodeLoading && (
          <p className="text-sm text-gray-500">Looking up pincode...</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address (House No, Building, Street) *</Label>
        <Input
          id="addressLine1"
          value={address.addressLine1 || ''}
          onChange={(e) => onChange({ ...address, addressLine1: e.target.value })}
          placeholder="Enter complete address"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">Locality / Town *</Label>
        <div className="relative">
          <Input
            id="addressLine2"
            value={address.addressLine2 || ''}
            onChange={(e) => onChange({ ...address, addressLine2: e.target.value })}
            placeholder="Enter locality"
            required
          />
          {localitySuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {localitySuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleLocalitySuggestion(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        {localitySuggestions.length > 0 && (
          <p className="text-xs text-gray-500">Click on a suggestion above to select</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={address.city || ''}
            onChange={(e) => onChange({ ...address, city: e.target.value })}
            placeholder="Enter city"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={address.state || ''}
            onChange={(e) => onChange({ ...address, state: e.target.value })}
            placeholder="Enter state"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country *</Label>
        <Input
          id="country"
          value={address.country || 'India'}
          onChange={(e) => onChange({ ...address, country: e.target.value })}
          placeholder="Enter country"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressType">Address Type *</Label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="addressType"
              value="Home"
              checked={address.addressType === 'Home'}
              onChange={(e) => onChange({ ...address, addressType: e.target.value })}
              className="w-4 h-4 text-black focus:ring-black"
            />
            <span>Home</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="addressType"
              value="Work"
              checked={address.addressType === 'Work'}
              onChange={(e) => onChange({ ...address, addressType: e.target.value })}
              className="w-4 h-4 text-black focus:ring-black"
            />
            <span>Work</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="addressType"
              value="Other"
              checked={address.addressType === 'Other'}
              onChange={(e) => onChange({ ...address, addressType: e.target.value })}
              className="w-4 h-4 text-black focus:ring-black"
            />
            <span>Other</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
