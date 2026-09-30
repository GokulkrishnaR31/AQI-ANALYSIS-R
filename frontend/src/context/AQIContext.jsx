import { createContext, useContext, useState, useEffect } from 'react'

const AQIContext = createContext(null)

// ── MASTER CENTRALIZED CITY DATABASE (Single Source of Truth) ───────────────
export const MASTER_CITY_DATA = {
  'Delhi':          { state: 'Delhi',          lat: 28.6139, lng: 77.2090, aqi: 312, pm25: 262.4, pm10: 384.0, nox: 74.2, so2: 16.8, co: 2.14, o3: 42.5, station: 'Anand Vihar CAAQMS (DPCC)', temp: '27.8°C', wind: '4.2 km/h ↖ NW', hum: '64%', mix: '420m (Low)', cat: 'Hazardous', delta: '+18.4%' },
  'Chennai':        { state: 'Tamil Nadu',     lat: 13.0827, lng: 80.2707, aqi: 78,  pm25: 32.1,  pm10: 74.5,  nox: 26.2, so2: 9.8,  co: 0.94, o3: 22.0, station: 'Alandur CAAQMS (TNPCB)',     temp: '28.6°C', wind: '12.4 km/h ➔ E', hum: '81%', mix: '880m (Good)', cat: 'Satisfactory', delta: '-3.1%' },
  'Bengaluru':      { state: 'Karnataka',      lat: 12.9716, lng: 77.5946, aqi: 63,  pm25: 24.5,  pm10: 62.0,  nox: 22.4, so2: 8.5,  co: 0.85, o3: 24.2, station: 'BTM Layout CAAQMS (KSPCB)',  temp: '24.5°C', wind: '9.8 km/h ↘ SE', hum: '62%', mix: '950m (High)', cat: 'Satisfactory', delta: '-5.2%' },
  'Mumbai':         { state: 'Maharashtra',    lat: 19.0760, lng: 72.8777, aqi: 172, pm25: 79.2,  pm10: 164.5, nox: 48.6, so2: 15.2, co: 1.52, o3: 28.4, station: 'Bandra CAAQMS (MPCB)',       temp: '29.4°C', wind: '11.2 km/h ➔ W', hum: '76%', mix: '820m (Good)', cat: 'Moderate', delta: '-1.4%' },
  'Kolkata':        { state: 'West Bengal',    lat: 22.5726, lng: 88.3639, aqi: 208, pm25: 142.0, pm10: 218.0, nox: 54.0, so2: 19.5, co: 1.85, o3: 38.0, station: 'Victoria Memorial (WBPCB)',   temp: '27.2°C', wind: '5.4 km/h ↙ SW', hum: '72%', mix: '520m (Mod)', cat: 'Poor', delta: '+8.6%' },
  'Hyderabad':      { state: 'Telangana',      lat: 17.3850, lng: 78.4867, aqi: 146, pm25: 64.2,  pm10: 138.0, nox: 38.0, so2: 13.2, co: 1.28, o3: 31.5, station: 'Sanathnagar (TSPCB)',        temp: '28.1°C', wind: '7.5 km/h ➔ E',  hum: '59%', mix: '760m (Good)', cat: 'Moderate', delta: '+1.2%' },
  'Ahmedabad':      { state: 'Gujarat',        lat: 23.0225, lng: 72.5714, aqi: 184, pm25: 88.5,  pm10: 176.0, nox: 42.1, so2: 14.5, co: 1.45, o3: 36.2, station: 'Maninagar CAAQMS (GPCB)',    temp: '31.2°C', wind: '7.8 km/h ↗ NE', hum: '52%', mix: '680m (Mod)', cat: 'Moderate', delta: '+4.2%' },
  'Pune':           { state: 'Maharashtra',    lat: 18.5204, lng: 73.8567, aqi: 138, pm25: 58.4,  pm10: 132.0, nox: 35.1, so2: 11.8, co: 1.22, o3: 32.1, station: 'Shivajinagar (MPCB)',       temp: '26.8°C', wind: '8.5 km/h ↗ NE', hum: '58%', mix: '780m (Good)', cat: 'Moderate', delta: '+2.0%' },
  'Jaipur':         { state: 'Rajasthan',      lat: 26.9124, lng: 75.7873, aqi: 228, pm25: 168.0, pm10: 252.0, nox: 61.2, so2: 21.0, co: 1.95, o3: 41.0, station: 'Adarsh Nagar (RSPCB)',       temp: '26.5°C', wind: '5.1 km/h ↖ NW', hum: '44%', mix: '480m (Low)', cat: 'Poor', delta: '+9.4%' },
  'Lucknow':        { state: 'Uttar Pradesh',  lat: 26.8467, lng: 80.9462, aqi: 298, pm25: 235.0, pm10: 345.0, nox: 68.5, so2: 24.1, co: 2.10, o3: 44.2, station: 'Talkatora CAAQMS (UPPCB)',   temp: '25.4°C', wind: '3.8 km/h ↖ NW', hum: '68%', mix: '390m (Low)', cat: 'Very Poor', delta: '+14.2%' },
  'Kanpur':         { state: 'Uttar Pradesh',  lat: 26.4499, lng: 80.3319, aqi: 285, pm25: 218.0, pm10: 320.0, nox: 64.0, so2: 22.0, co: 1.98, o3: 41.5, station: 'Nehru Nagar (UPPCB)',         temp: '25.6°C', wind: '4.0 km/h ↖ NW', hum: '66%', mix: '410m (Low)', cat: 'Very Poor', delta: '+12.5%' },
  'Patna':          { state: 'Bihar',          lat: 25.5941, lng: 85.1376, aqi: 258, pm25: 195.0, pm10: 288.0, nox: 62.0, so2: 18.5, co: 1.92, o3: 39.0, station: 'Muradpur CAAQMS (BSPCB)',    temp: '26.0°C', wind: '4.2 km/h ↖ NW', hum: '70%', mix: '430m (Low)', cat: 'Poor', delta: '+11.5%' },
  'Surat':          { state: 'Gujarat',        lat: 21.1702, lng: 72.8311, aqi: 162, pm25: 74.0,  pm10: 155.0, nox: 36.8, so2: 18.2, co: 1.30, o3: 31.0, station: 'Athwa CAAQMS (GPCB)',        temp: '30.5°C', wind: '9.4 km/h ➔ W',  hum: '68%', mix: '750m (Good)', cat: 'Moderate', delta: '-2.1%' },
  'Visakhapatnam':  { state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, aqi: 112, pm25: 48.0,  pm10: 108.0, nox: 31.2, so2: 14.0, co: 1.05, o3: 26.5, station: 'GVMCAir CAAQMS (APPCB)',    temp: '28.8°C', wind: '10.5 km/h ➔ E', hum: '78%', mix: '850m (Good)', cat: 'Moderate', delta: '+0.8%' },
  'Coimbatore':     { state: 'Tamil Nadu',     lat: 11.0168, lng: 76.9558, aqi: 68,  pm25: 28.0,  pm10: 66.0,  nox: 24.0, so2: 8.0,  co: 0.88, o3: 21.0, station: 'SIDCO CAAQMS (TNPCB)',       temp: '26.2°C', wind: '8.8 km/h ↘ SE', hum: '65%', mix: '920m (High)', cat: 'Satisfactory', delta: '-4.2%' },
  'Kochi':          { state: 'Kerala',         lat:  9.9312, lng: 76.2673, aqi: 58,  pm25: 22.0,  pm10: 56.0,  nox: 18.5, so2: 6.8,  co: 0.76, o3: 19.5, station: 'Vyttila CAAQMS (KSPCB)',      temp: '27.5°C', wind: '11.0 km/h ➔ W', hum: '84%', mix: '910m (High)', cat: 'Satisfactory', delta: '-2.8%' },
  'Chandigarh':     { state: 'Chandigarh',     lat: 30.7333, lng: 76.7794, aqi: 175, pm25: 84.0,  pm10: 162.0, nox: 41.0, so2: 12.5, co: 1.35, o3: 33.0, station: 'Sector 22 CAAQMS (CPCC)',    temp: '23.8°C', wind: '6.2 km/h ↖ NW', hum: '56%', mix: '620m (Mod)', cat: 'Moderate', delta: '+3.4%' },
  'Amritsar':       { state: 'Punjab',          lat: 31.6340, lng: 74.8723, aqi: 242, pm25: 178.0, pm10: 268.0, nox: 58.0, so2: 17.0, co: 1.88, o3: 38.5, station: 'Golden Temple Area (PPCB)',  temp: '24.2°C', wind: '4.8 km/h ↖ NW', hum: '60%', mix: '450m (Low)', cat: 'Poor', delta: '+8.2%' },
  'Guwahati':       { state: 'Assam',           lat: 26.1445, lng: 91.7362, aqi: 114, pm25: 52.0,  pm10: 112.0, nox: 29.5, so2: 11.0, co: 1.08, o3: 25.0, station: 'Panbazar CAAQMS (PCBA)',     temp: '24.8°C', wind: '5.6 km/h ↗ NE', hum: '74%', mix: '720m (Good)', cat: 'Moderate', delta: '+1.5%' },
  'Shillong':       { state: 'Meghalaya',       lat: 25.5788, lng: 91.8933, aqi: 62,  pm25: 23.0,  pm10: 59.0,  nox: 16.0, so2: 5.5,  co: 0.65, o3: 18.0, station: 'Laban CAAQMS (MSPCB)',        temp: '18.2°C', wind: '6.5 km/h ↗ NE', hum: '72%', mix: '1100m (High)', cat: 'Satisfactory', delta: '-3.8%' },
  'Aizawl':         { state: 'Mizoram',         lat: 23.7271, lng: 92.7176, aqi: 24,  pm25: 8.5,   pm10: 22.0,  nox: 8.2,  so2: 3.1,  co: 0.32, o3: 14.5, station: 'Bawngkawn CAAQMS (MPCB)',    temp: '19.5°C', wind: '8.5 km/h ↗ NE', hum: '65%', mix: '1200m (High)', cat: 'Good', delta: '-1.5%' },
  'Gangtok':        { state: 'Sikkim',          lat: 27.3314, lng: 88.6138, aqi: 53,  pm25: 19.0,  pm10: 51.0,  nox: 14.2, so2: 4.8,  co: 0.55, o3: 16.5, station: 'Deorali CAAQMS (SPCB)',       temp: '16.8°C', wind: '7.2 km/h ↗ NE', hum: '68%', mix: '1150m (High)', cat: 'Satisfactory', delta: '-2.0%' },
}

export const STATE_CITIES = {
  'All India':           Object.keys(MASTER_CITY_DATA),
  'Delhi':               ['Delhi'],
  'Tamil Nadu':          ['Chennai', 'Coimbatore'],
  'Karnataka':           ['Bengaluru'],
  'Maharashtra':         ['Mumbai', 'Pune'],
  'West Bengal':         ['Kolkata'],
  'Telangana':           ['Hyderabad'],
  'Gujarat':             ['Ahmedabad', 'Surat'],
  'Rajasthan':           ['Jaipur'],
  'Uttar Pradesh':       ['Lucknow', 'Kanpur'],
  'Bihar':               ['Patna'],
  'Andhra Pradesh':      ['Visakhapatnam'],
  'Kerala':              ['Kochi'],
  'Chandigarh':          ['Chandigarh'],
  'Punjab':              ['Amritsar'],
  'Assam':               ['Guwahati'],
  'Meghalaya':           ['Shillong'],
  'Mizoram':             ['Aizawl'],
  'Sikkim':              ['Gangtok'],
}

export const ALL_STATES = Object.keys(STATE_CITIES)
export const ALL_CITIES = Object.keys(MASTER_CITY_DATA)

export function getCitiesForState(state) {
  if (!state || state === 'All India') return ALL_CITIES
  return STATE_CITIES[state] ?? [ALL_CITIES[0]]
}

export function getCityDetails(cityName) {
  return MASTER_CITY_DATA[cityName] ?? MASTER_CITY_DATA['Delhi']
}

export function AQIProvider({ children }) {
  const [selectedState, setSelectedState] = useState('All India')
  const [selectedCity,  setSelectedCity]  = useState('Delhi')

  useEffect(() => {
    const cities = getCitiesForState(selectedState)
    if (cities.length > 0 && !cities.includes(selectedCity)) {
      setSelectedCity(cities[0])
    }
  }, [selectedState])

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
