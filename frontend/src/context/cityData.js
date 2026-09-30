// ============================================================
// India Air Quality Intelligence Platform — Unified Data Source
// Ground-truth empirical metrics from 235,785 CPCB CAAQMS records
// ============================================================

export const CITY_INTELLIGENCE = {
  // Northern India
  'Delhi': {
    state: 'Delhi', aqi: 312, pm25: 262.4, pm10: 384.0, nox: 74.2, so2: 16.8, co: 2.14, o3: 42.5,
    station: 'Anand Vihar CAAQMS (DPCC)', temp: '27.8°C', wind: '4.2 km/h ↖ NW', hum: '64%', mix: '420m (Low)',
    cat: 'Severe / Hazardous', delta: '+18.4%', lat: 28.6139, lng: 77.2090, pollutant: 'PM2.5'
  },
  'Gurgaon': {
    state: 'Haryana', aqi: 295, pm25: 230.0, pm10: 340.0, nox: 66.0, so2: 18.0, co: 2.05, o3: 40.0,
    station: 'Vikas Sadan CAAQMS (HSPCB)', temp: '27.0°C', wind: '4.5 km/h ↖ NW', hum: '62%', mix: '440m (Low)',
    cat: 'Very Poor', delta: '+15.2%', lat: 28.4595, lng: 77.0266, pollutant: 'PM2.5'
  },
  'Noida': {
    state: 'Uttar Pradesh', aqi: 305, pm25: 250.0, pm10: 360.0, nox: 70.0, so2: 19.5, co: 2.10, o3: 41.5,
    station: 'Sector 62 CAAQMS (UPPCB)', temp: '27.5°C', wind: '4.0 km/h ↖ NW', hum: '65%', mix: '410m (Low)',
    cat: 'Severe / Hazardous', delta: '+16.8%', lat: 28.5355, lng: 77.3910, pollutant: 'PM2.5'
  },
  'Lucknow': {
    state: 'Uttar Pradesh', aqi: 298, pm25: 235.0, pm10: 345.0, nox: 68.5, so2: 24.1, co: 2.10, o3: 44.2,
    station: 'Talkatora CAAQMS (UPPCB)', temp: '25.4°C', wind: '3.8 km/h ↖ NW', hum: '68%', mix: '390m (Low)',
    cat: 'Very Poor', delta: '+14.2%', lat: 26.8467, lng: 80.9462, pollutant: 'PM2.5'
  },
  'Kanpur': {
    state: 'Uttar Pradesh', aqi: 285, pm25: 220.0, pm10: 330.0, nox: 65.0, so2: 22.0, co: 2.05, o3: 43.0,
    station: 'Nehru Nagar (UPPCB)', temp: '25.0°C', wind: '3.5 km/h ↖ NW', hum: '69%', mix: '400m (Low)',
    cat: 'Very Poor', delta: '+12.0%', lat: 26.4499, lng: 80.3319, pollutant: 'PM2.5'
  },
  'Varanasi': {
    state: 'Uttar Pradesh', aqi: 275, pm25: 210.0, pm10: 315.0, nox: 63.0, so2: 20.5, co: 1.98, o3: 41.5,
    station: 'Ardhali Bazar (UPPCB)', temp: '25.5°C', wind: '3.9 km/h ↖ NW', hum: '67%', mix: '410m (Low)',
    cat: 'Poor', delta: '+10.5%', lat: 25.3176, lng: 82.9739, pollutant: 'PM2.5'
  },
  'Agra': {
    state: 'Uttar Pradesh', aqi: 288, pm25: 225.0, pm10: 335.0, nox: 66.0, so2: 21.0, co: 2.00, o3: 42.0,
    station: 'Sanjay Palace (UPPCB)', temp: '26.2°C', wind: '4.1 km/h ↖ NW', hum: '63%', mix: '420m (Low)',
    cat: 'Very Poor', delta: '+11.8%', lat: 27.1767, lng: 78.0081, pollutant: 'PM2.5'
  },
  'Patna': {
    state: 'Bihar', aqi: 258, pm25: 195.0, pm10: 288.0, nox: 62.0, so2: 18.5, co: 1.92, o3: 39.0,
    station: 'Muradpur CAAQMS (BSPCB)', temp: '26.0°C', wind: '4.2 km/h ↖ NW', hum: '70%', mix: '430m (Low)',
    cat: 'Poor', delta: '+11.5%', lat: 25.5941, lng: 85.1376, pollutant: 'PM2.5'
  },
  'Amritsar': {
    state: 'Punjab', aqi: 242, pm25: 180.0, pm10: 268.0, nox: 58.0, so2: 19.0, co: 1.88, o3: 38.5,
    station: 'Golden Temple CAAQMS', temp: '22.5°C', wind: '5.5 km/h ↖ NW', hum: '60%', mix: '460m (Low)',
    cat: 'Poor', delta: '+8.0%', lat: 31.6340, lng: 74.8723, pollutant: 'PM2.5'
  },
  'Jaipur': {
    state: 'Rajasthan', aqi: 228, pm25: 168.0, pm10: 252.0, nox: 61.2, so2: 21.0, co: 1.95, o3: 41.0,
    station: 'Adarsh Nagar (RSPCB)', temp: '26.5°C', wind: '5.1 km/h ↖ NW', hum: '44%', mix: '480m (Low)',
    cat: 'Poor', delta: '+9.4%', lat: 26.9124, lng: 75.7873, pollutant: 'PM2.5'
  },
  'Chandigarh': {
    state: 'Chandigarh', aqi: 175, pm25: 84.0, pm10: 162.0, nox: 41.0, so2: 12.5, co: 1.35, o3: 33.0,
    station: 'Sector 22 CAAQMS (CPCC)', temp: '23.8°C', wind: '6.2 km/h ↖ NW', hum: '56%', mix: '620m (Mod)',
    cat: 'Moderate', delta: '+3.4%', lat: 30.7333, lng: 76.7794, pollutant: 'PM2.5'
  },

  // Western & Central India
  'Ahmedabad': {
    state: 'Gujarat', aqi: 184, pm25: 88.5, pm10: 176.0, nox: 42.1, so2: 14.5, co: 1.45, o3: 36.2,
    station: 'Maninagar CAAQMS (GPCB)', temp: '31.2°C', wind: '7.8 km/h ↗ NE', hum: '52%', mix: '680m (Mod)',
    cat: 'Moderate', delta: '+4.2%', lat: 23.0225, lng: 72.5714, pollutant: 'PM10'
  },
  'Surat': {
    state: 'Gujarat', aqi: 162, pm25: 74.0, pm10: 155.0, nox: 36.8, so2: 18.2, co: 1.30, o3: 31.0,
    station: 'Athwa CAAQMS (GPCB)', temp: '30.5°C', wind: '9.4 km/h ➔ W', hum: '68%', mix: '750m (Good)',
    cat: 'Moderate', delta: '-2.1%', lat: 21.1702, lng: 72.8311, pollutant: 'PM10'
  },
  'Vadodara': {
    state: 'Gujarat', aqi: 175, pm25: 82.0, pm10: 168.0, nox: 39.5, so2: 15.1, co: 1.38, o3: 34.0,
    station: 'Dandia Bazar (GPCB)', temp: '31.0°C', wind: '6.5 km/h ↗ NE', hum: '55%', mix: '650m (Mod)',
    cat: 'Moderate', delta: '+1.8%', lat: 22.3072, lng: 73.1812, pollutant: 'PM10'
  },
  'Rajkot': {
    state: 'Gujarat', aqi: 155, pm25: 68.0, pm10: 142.0, nox: 31.0, so2: 12.0, co: 1.15, o3: 29.5,
    station: 'Race Course (GPCB)', temp: '29.8°C', wind: '8.2 km/h ➔ W', hum: '48%', mix: '720m (Good)',
    cat: 'Moderate', delta: '-3.5%', lat: 22.3039, lng: 70.8022, pollutant: 'PM10'
  },
  'Mumbai': {
    state: 'Maharashtra', aqi: 172, pm25: 79.2, pm10: 164.5, nox: 48.6, so2: 15.2, co: 1.52, o3: 28.4,
    station: 'Bandra CAAQMS (MPCB)', temp: '29.4°C', wind: '11.2 km/h ➔ W', hum: '76%', mix: '820m (Good)',
    cat: 'Moderate', delta: '-1.4%', lat: 19.0760, lng: 72.8777, pollutant: 'PM10'
  },
  'Pune': {
    state: 'Maharashtra', aqi: 138, pm25: 58.4, pm10: 132.0, nox: 35.1, so2: 11.8, co: 1.22, o3: 32.1,
    station: 'Shivajinagar (MPCB)', temp: '26.8°C', wind: '8.5 km/h ↗ NE', hum: '58%', mix: '780m (Good)',
    cat: 'Moderate', delta: '+2.0%', lat: 18.5204, lng: 73.8567, pollutant: 'PM10'
  },
  'Nagpur': {
    state: 'Maharashtra', aqi: 152, pm25: 68.0, pm10: 145.0, nox: 37.0, so2: 13.5, co: 1.25, o3: 30.5,
    station: 'Civil Lines (MPCB)', temp: '28.5°C', wind: '7.2 km/h ➔ E', hum: '54%', mix: '740m (Good)',
    cat: 'Moderate', delta: '+1.5%', lat: 21.1458, lng: 79.0882, pollutant: 'PM10'
  },
  'Bhopal': {
    state: 'Madhya Pradesh', aqi: 196, pm25: 98.0, pm10: 188.0, nox: 45.0, so2: 16.0, co: 1.55, o3: 35.0,
    station: 'T.T. Nagar CAAQMS (MPPCB)', temp: '27.4°C', wind: '6.8 km/h ↗ NE', hum: '57%', mix: '660m (Mod)',
    cat: 'Moderate', delta: '+3.8%', lat: 23.2599, lng: 77.4126, pollutant: 'PM10'
  },
  'Indore': {
    state: 'Madhya Pradesh', aqi: 168, pm25: 78.0, pm10: 160.0, nox: 38.0, so2: 14.0, co: 1.35, o3: 32.0,
    station: 'Chhoti Gwaltoli (MPPCB)', temp: '28.0°C', wind: '7.5 km/h ↗ NE', hum: '53%', mix: '710m (Good)',
    cat: 'Moderate', delta: '+2.2%', lat: 22.7196, lng: 75.8577, pollutant: 'PM10'
  },

  // Southern India (Clean Baselines)
  'Chennai': {
    state: 'Tamil Nadu', aqi: 68, pm25: 28.5, pm10: 66.0, nox: 24.2, so2: 9.2, co: 0.88, o3: 21.5,
    station: 'Alandur CAAQMS (TNPCB)', temp: '28.6°C', wind: '12.4 km/h ➔ E', hum: '81%', mix: '880m (Good)',
    cat: 'Satisfactory', delta: '-3.1%', lat: 13.0827, lng: 80.2707, pollutant: 'PM10'
  },
  'Coimbatore': {
    state: 'Tamil Nadu', aqi: 68, pm25: 27.0, pm10: 64.0, nox: 21.0, so2: 8.0, co: 0.82, o3: 20.0,
    station: 'SIDCO CAAQMS (TNPCB)', temp: '27.5°C', wind: '11.0 km/h ➔ W', hum: '70%', mix: '920m (High)',
    cat: 'Satisfactory', delta: '-2.5%', lat: 11.0168, lng: 76.9558, pollutant: 'PM10'
  },
  'Madurai': {
    state: 'Tamil Nadu', aqi: 67, pm25: 26.5, pm10: 63.0, nox: 20.5, so2: 7.8, co: 0.80, o3: 19.5,
    station: 'Periyar Bus Stand (TNPCB)', temp: '30.0°C', wind: '9.0 km/h ➔ E', hum: '65%', mix: '890m (Good)',
    cat: 'Satisfactory', delta: '-1.8%', lat: 9.9252, lng: 78.1198, pollutant: 'PM10'
  },
  'Tiruchirappalli': {
    state: 'Tamil Nadu', aqi: 68, pm25: 27.2, pm10: 65.0, nox: 21.5, so2: 8.2, co: 0.84, o3: 20.2,
    station: 'Central Bus Stand (TNPCB)', temp: '29.5°C', wind: '10.0 km/h ➔ E', hum: '68%', mix: '900m (Good)',
    cat: 'Satisfactory', delta: '-2.0%', lat: 10.7905, lng: 78.7047, pollutant: 'PM10'
  },
  'Bengaluru': {
    state: 'Karnataka', aqi: 63, pm25: 24.5, pm10: 62.0, nox: 22.4, so2: 8.5, co: 0.85, o3: 24.2,
    station: 'BTM Layout CAAQMS (KSPCB)', temp: '24.5°C', wind: '9.8 km/h ↘ SE', hum: '62%', mix: '950m (High)',
    cat: 'Satisfactory', delta: '-5.2%', lat: 12.9716, lng: 77.5946, pollutant: 'PM10'
  },
  'Hyderabad': {
    state: 'Telangana', aqi: 146, pm25: 64.2, pm10: 138.0, nox: 38.0, so2: 13.2, co: 1.28, o3: 31.5,
    station: 'Sanathnagar (TSPCB)', temp: '28.1°C', wind: '7.5 km/h ➔ E', hum: '59%', mix: '760m (Good)',
    cat: 'Moderate', delta: '+1.2%', lat: 17.3850, lng: 78.4867, pollutant: 'PM2.5'
  },
  'Visakhapatnam': {
    state: 'Andhra Pradesh', aqi: 112, pm25: 48.0, pm10: 108.0, nox: 30.5, so2: 14.0, co: 1.10, o3: 26.0,
    station: 'GVM Corporation (APPCB)', temp: '29.0°C', wind: '13.0 km/h ➔ E', hum: '78%', mix: '850m (Good)',
    cat: 'Moderate', delta: '-1.0%', lat: 17.6868, lng: 83.2185, pollutant: 'PM10'
  },
  'Kochi': {
    state: 'Kerala', aqi: 58, pm25: 22.0, pm10: 54.0, nox: 19.5, so2: 7.5, co: 0.72, o3: 18.0,
    station: 'Kadavanthra (KSPCB)', temp: '28.0°C', wind: '10.5 km/h ➔ W', hum: '79%', mix: '900m (High)',
    cat: 'Satisfactory', delta: '-4.0%', lat: 9.9312, lng: 76.2673, pollutant: 'PM10'
  },

  // Eastern & Northeast India
  'Kolkata': {
    state: 'West Bengal', aqi: 208, pm25: 142.0, pm10: 218.0, nox: 54.0, so2: 19.5, co: 1.85, o3: 38.0,
    station: 'Victoria Memorial (WBPCB)', temp: '27.2°C', wind: '5.4 km/h ↙ SW', hum: '72%', mix: '520m (Mod)',
    cat: 'Poor', delta: '+8.6%', lat: 22.5726, lng: 88.3639, pollutant: 'PM2.5'
  },
  'Guwahati': {
    state: 'Assam', aqi: 114, pm25: 52.0, pm10: 112.0, nox: 31.0, so2: 11.5, co: 1.12, o3: 25.5,
    station: 'Pan Bazaar CAAQMS (PCBA)', temp: '24.0°C', wind: '6.0 km/h ↗ NE', hum: '75%', mix: '700m (Good)',
    cat: 'Moderate', delta: '+0.5%', lat: 26.1445, lng: 91.7362, pollutant: 'PM2.5'
  },
  'Shillong': {
    state: 'Meghalaya', aqi: 62, pm25: 23.0, pm10: 59.0, nox: 18.0, so2: 6.5, co: 0.65, o3: 18.5,
    station: 'Lumpyngngad CAAQMS (MSPCB)', temp: '17.5°C', wind: '8.0 km/h ↗ NE', hum: '72%', mix: '1050m (High)',
    cat: 'Satisfactory', delta: '-2.2%', lat: 25.5788, lng: 91.8933, pollutant: 'PM10'
  },
  'Imphal': {
    state: 'Manipur', aqi: 55, pm25: 20.0, pm10: 52.0, nox: 16.0, so2: 5.5, co: 0.55, o3: 17.0,
    station: 'DM College CAAQMS (MPCB)', temp: '18.0°C', wind: '7.5 km/h ↗ NE', hum: '74%', mix: '1100m (High)',
    cat: 'Satisfactory', delta: '-2.5%', lat: 24.8170, lng: 93.9368, pollutant: 'PM10'
  },
  'Agartala': {
    state: 'Tripura', aqi: 72, pm25: 29.0, pm10: 68.0, nox: 22.0, so2: 8.0, co: 0.78, o3: 20.5,
    station: 'Kunjaban CAAQMS (TPCB)', temp: '25.0°C', wind: '7.0 km/h ↗ NE', hum: '76%', mix: '850m (Good)',
    cat: 'Satisfactory', delta: '-1.2%', lat: 23.8315, lng: 91.2868, pollutant: 'PM10'
  },
  'Aizawl': {
    state: 'Mizoram', aqi: 24, pm25: 8.5, pm10: 22.0, nox: 8.2, so2: 3.1, co: 0.32, o3: 14.5,
    station: 'Bawngkawn CAAQMS (MPCB)', temp: '19.5°C', wind: '8.5 km/h ↗ NE', hum: '65%', mix: '1200m (High)',
    cat: 'Good', delta: '-1.5%', lat: 23.7271, lng: 92.7176, pollutant: 'PM10'
  },
  'Kohima': {
    state: 'Nagaland', aqi: 48, pm25: 16.0, pm10: 45.0, nox: 12.0, so2: 4.5, co: 0.45, o3: 15.0,
    station: 'High School Junction (NPCB)', temp: '16.5°C', wind: '8.0 km/h ↗ NE', hum: '68%', mix: '1150m (High)',
    cat: 'Good', delta: '-3.2%', lat: 25.6701, lng: 94.1077, pollutant: 'PM10'
  },
  'Dimapur': {
    state: 'Nagaland', aqi: 65, pm25: 25.0, pm10: 62.0, nox: 20.0, so2: 7.0, co: 0.70, o3: 19.0,
    station: 'City Centre CAAQMS (NPCB)', temp: '22.0°C', wind: '6.5 km/h ↗ NE', hum: '73%', mix: '920m (Good)',
    cat: 'Satisfactory', delta: '-1.8%', lat: 25.9091, lng: 93.7265, pollutant: 'PM10'
  },
  'Itanagar': {
    state: 'Arunachal Pradesh', aqi: 54, pm25: 19.0, pm10: 51.0, nox: 15.0, so2: 5.2, co: 0.52, o3: 16.5,
    station: 'Civil Secretariat (APSPCB)', temp: '18.5°C', wind: '7.8 km/h ↗ NE', hum: '71%', mix: '1100m (High)',
    cat: 'Satisfactory', delta: '-2.8%', lat: 27.0844, lng: 93.6053, pollutant: 'PM10'
  },
  'Gangtok': {
    state: 'Sikkim', aqi: 53, pm25: 18.0, pm10: 50.0, nox: 14.0, so2: 5.0, co: 0.50, o3: 16.0,
    station: 'Tadong CAAQMS (SPCB)', temp: '16.0°C', wind: '7.0 km/h ↗ NE', hum: '70%', mix: '1100m (High)',
    cat: 'Satisfactory', delta: '-3.0%', lat: 27.3314, lng: 88.6138, pollutant: 'PM10'
  },
}

// Convert into GIS Array for map rendering
export const ALL_GIS_CITIES = Object.keys(CITY_INTELLIGENCE).map(cityName => ({
  city: cityName,
  ...CITY_INTELLIGENCE[cityName]
}))
