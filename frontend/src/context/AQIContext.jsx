import { createContext, useContext, useState, useEffect } from 'react'

const AQIContext = createContext(null)

// ── State → Cities mapping (drives the city dropdown filter) ──────────────
export const STATE_CITIES = {
  'All India':           [],   // empty = show all
  'Andhra Pradesh':      ['Visakhapatnam', 'Vijayawada', 'Tirupati'],
  'Arunachal Pradesh':   ['Itanagar', 'Naharlagun'],
  'Assam':               ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur'],
  'Bihar':               ['Patna', 'Gaya', 'Muzaffarpur'],
  'Chandigarh':          ['Chandigarh'],
  'Chhattisgarh':        ['Raipur', 'Bhilai', 'Bilaspur'],
  'Delhi':               ['Delhi'],
  'Goa':                 ['Panaji'],
  'Gujarat':             ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Haryana':             ['Gurgaon', 'Faridabad', 'Rohtak', 'Panipat'],
  'Himachal Pradesh':    ['Shimla', 'Dharamshala', 'Manali'],
  'Jammu and Kashmir':   ['Srinagar', 'Jammu'],
  'Jharkhand':           ['Ranchi', 'Dhanbad', 'Jamshedpur'],
  'Karnataka':           ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli'],
  'Kerala':              ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'],
  'Madhya Pradesh':      ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior'],
  'Maharashtra':         ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Manipur':             ['Imphal'],
  'Meghalaya':           ['Shillong', 'Tura'],
  'Mizoram':             ['Aizawl', 'Lunglei'],
  'Nagaland':            ['Kohima', 'Dimapur'],
  'Odisha':              ['Bhubaneswar', 'Cuttack', 'Rourkela'],
  'Puducherry':          ['Puducherry'],
  'Punjab':              ['Amritsar', 'Ludhiana', 'Chandigarh', 'Jalandhar'],
  'Rajasthan':           ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Sikkim':              ['Gangtok'],
  'Tamil Nadu':          ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Telangana':           ['Hyderabad', 'Warangal', 'Karimnagar'],
  'Tripura':             ['Agartala', 'Dharmanagar'],
  'Uttar Pradesh':       ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Noida', 'Prayagraj', 'Meerut'],
  'Uttarakhand':         ['Dehradun', 'Haridwar', 'Rishikesh'],
  'West Bengal':         ['Kolkata', 'Howrah', 'Siliguri', 'Asansol'],
}

// All unique cities across states (sorted)
export const ALL_CITIES = [...new Set(
  Object.values(STATE_CITIES).flat()
)].sort()

export const ALL_STATES = Object.keys(STATE_CITIES)

// Returns cities for a given state (or all cities for "All India")
export function getCitiesForState(state) {
  if (!state || state === 'All India') return ALL_CITIES
  return STATE_CITIES[state] ?? ALL_CITIES
}

// ── GIS city coordinates (includes Northeast India) ───────────────────────
export const CITY_COORDS = [
  // Major metros
  { city: 'Delhi',           lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  { city: 'Mumbai',          lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  { city: 'Chennai',         lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  { city: 'Kolkata',         lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  { city: 'Bengaluru',       lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  { city: 'Hyderabad',       lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  { city: 'Ahmedabad',       lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  { city: 'Pune',            lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  { city: 'Jaipur',          lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  { city: 'Lucknow',         lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  // Northern India
  { city: 'Kanpur',          lat: 26.4499, lng: 80.3319, state: 'Uttar Pradesh' },
  { city: 'Nagpur',          lat: 21.1458, lng: 79.0882, state: 'Maharashtra' },
  { city: 'Indore',          lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
  { city: 'Bhopal',          lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh' },
  { city: 'Patna',           lat: 25.5941, lng: 85.1376, state: 'Bihar' },
  { city: 'Varanasi',        lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh' },
  { city: 'Agra',            lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh' },
  { city: 'Gurgaon',         lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  { city: 'Noida',           lat: 28.5355, lng: 77.3910, state: 'Uttar Pradesh' },
  { city: 'Surat',           lat: 21.1702, lng: 72.8311, state: 'Gujarat' },
  // Southern India
  { city: 'Visakhapatnam',   lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh' },
  { city: 'Coimbatore',      lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu' },
  { city: 'Kochi',           lat:  9.9312, lng: 76.2673, state: 'Kerala' },
  // Northwestern
  { city: 'Chandigarh',      lat: 30.7333, lng: 76.7794, state: 'Chandigarh' },
  { city: 'Amritsar',        lat: 31.6340, lng: 74.8723, state: 'Punjab' },
  // ── Northeast India (newly added) ────────────────────────────────────────
  { city: 'Guwahati',        lat: 26.1445, lng: 91.7362, state: 'Assam' },
  { city: 'Shillong',        lat: 25.5788, lng: 91.8933, state: 'Meghalaya' },
  { city: 'Imphal',          lat: 24.8170, lng: 93.9368, state: 'Manipur' },
  { city: 'Agartala',        lat: 23.8315, lng: 91.2868, state: 'Tripura' },
  { city: 'Aizawl',          lat: 23.7271, lng: 92.7176, state: 'Mizoram' },
  { city: 'Kohima',          lat: 25.6701, lng: 94.1077, state: 'Nagaland' },
  { city: 'Dimapur',         lat: 25.9091, lng: 93.7265, state: 'Nagaland' },
  { city: 'Itanagar',        lat: 27.0844, lng: 93.6053, state: 'Arunachal Pradesh' },
  { city: 'Gangtok',         lat: 27.3314, lng: 88.6138, state: 'Sikkim' },
]

// ── AQI colour helpers ────────────────────────────────────────────────────
export const AQI_COLORS = {
  Good:           '#2ecc71',
  Satisfactory:   '#a8e063',
  Moderate:       '#f39c12',
  Poor:           '#e67e22',
  'Very Poor':    '#e74c3c',
  Severe:         '#ff6b6b',
  Unknown:        '#6e7681',
}

export function getAQIColor(status) {
  return AQI_COLORS[status] ?? AQI_COLORS.Unknown
}

export function getAQIBadgeClass(status) {
  const map = {
    Good:           'badge-good',
    Satisfactory:   'badge-satisfactory',
    Moderate:       'badge-moderate',
    Poor:           'badge-poor',
    'Very Poor':    'badge-very-poor',
    Severe:         'badge-severe',
  }
  return map[status] ?? 'badge-moderate'
}

// ── Provider ──────────────────────────────────────────────────────────────
export function AQIProvider({ children }) {
  const [selectedState, setSelectedState] = useState('All India')
  const [selectedCity,  setSelectedCity]  = useState('Delhi')

  // When state changes → reset city to first city of that state
  useEffect(() => {
    const cities = getCitiesForState(selectedState)
    if (cities.length > 0 && !cities.includes(selectedCity)) {
      setSelectedCity(cities[0])
    }
  }, [selectedState]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AQIContext.Provider value={{
      selectedState, setSelectedState,
      selectedCity,  setSelectedCity,
    }}>
      {children}
    </AQIContext.Provider>
  )
}

export function useAQI() {
  const ctx = useContext(AQIContext)
  if (!ctx) throw new Error('useAQI must be used within AQIProvider')
  return ctx
}
