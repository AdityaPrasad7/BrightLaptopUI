/**
 * Pincode Lookup Utility
 * Fetches address details from pincode API
 */

/**
 * Fetch address details from pincode
 * @param {string} pincode - 6-digit pincode
 * @returns {Promise<Object>} Address details (city, state, country, suggestions)
 */
export const lookupPincode = async (pincode) => {
  if (!pincode || pincode.length !== 6) {
    return null;
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const firstOffice = data[0].PostOffice[0];
      
      // Get unique values from all post offices
      const allOffices = data[0].PostOffice;
      const uniqueStates = [...new Set(allOffices.map(office => office.State))];
      const uniqueDistricts = [...new Set(allOffices.map(office => office.District))];
      const uniqueCities = [...new Set(allOffices.map(office => office.Name))];
      
      // Use District as city, or Name if District is not available
      const city = firstOffice.District || uniqueDistricts[0] || firstOffice.Name;
      
      return {
        city: city,
        state: firstOffice.State,
        country: firstOffice.Country || 'India',
        district: firstOffice.District,
        // Suggestions for addressLine2 (locality/post office names)
        localitySuggestions: uniqueCities
          .filter(name => name && name !== city && name !== firstOffice.District)
          .slice(0, 5), // Limit to 5 suggestions
        // All unique values for reference
        allDistricts: uniqueDistricts,
        allStates: uniqueStates,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching pincode details:', error);
    return null;
  }
};
