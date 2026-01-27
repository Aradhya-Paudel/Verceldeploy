import React, { useState, useEffect } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [reverseGeocodeResult, setReverseGeocodeResult] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [matchForm, setMatchForm] = useState({
    latitude: '',
    longitude: '',
    address: '',
    injuryType: '',
    bloodType: ''
  });

  const [geocodeForm, setGeocodeForm] = useState({
    address: ''
  });

  const [reverseGeocodeForm, setReverseGeocodeForm] = useState({
    latitude: '',
    longitude: ''
  });

  const [hospitalId, setHospitalId] = useState('');

  const API_BASE_URL = 'http://localhost:3000/api';

  // Fetch all hospitals
  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/map`);
      const data = await response.json();
      setHospitals(data.hospitals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check health
  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get hospital status
  const getHospitalStatus = async () => {
    if (!hospitalId) {
      setError('Please enter a hospital ID');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/hospital/${hospitalId}/status`);
      const data = await response.json();
      setSelectedHospital(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Match hospital
  const matchHospital = async () => {
    setLoading(true);
    try {
      const requestBody = {};
      
      if (matchForm.latitude && matchForm.longitude) {
        requestBody.latitude = parseFloat(matchForm.latitude);
        requestBody.longitude = parseFloat(matchForm.longitude);
      } else if (matchForm.address) {
        requestBody.address = matchForm.address;
      } else {
        setError('Please enter either coordinates or an address');
        setLoading(false);
        return;
      }
      
      if (matchForm.injuryType) requestBody.injuryType = matchForm.injuryType;
      if (matchForm.bloodType) requestBody.bloodType = matchForm.bloodType;

      const response = await fetch(`${API_BASE_URL}/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      setMatchResults(data.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Geocode address
  const geocodeAddress = async () => {
    if (!geocodeForm.address) {
      setError('Please enter an address');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address: geocodeForm.address })
      });
      
      const data = await response.json();
      setGeocodeResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reverse geocode
  const reverseGeocode = async () => {
    if (!reverseGeocodeForm.latitude || !reverseGeocodeForm.longitude) {
      setError('Please enter both latitude and longitude');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reverse-geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          latitude: parseFloat(reverseGeocodeForm.latitude),
          longitude: parseFloat(reverseGeocodeForm.longitude)
        })
      });
      
      const data = await response.json();
      setReverseGeocodeResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load hospitals on initial render
    fetchHospitals();
  }, []);

  const handleMatchFormChange = (e) => {
    setMatchForm({
      ...matchForm,
      [e.target.name]: e.target.value
    });
  };

  const handleGeocodeFormChange = (e) => {
    setGeocodeForm({
      ...geocodeForm,
      [e.target.name]: e.target.value
    });
  };

  const handleReverseGeocodeFormChange = (e) => {
    setReverseGeocodeForm({
      ...reverseGeocodeForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Hospital Resource System Dashboard</h1>
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'hospitals' ? 'active' : ''}
          onClick={() => setActiveTab('hospitals')}
        >
          Hospitals
        </button>
        <button 
          className={activeTab === 'match' ? 'active' : ''}
          onClick={() => setActiveTab('match')}
        >
          Match Hospital
        </button>
        <button 
          className={activeTab === 'geocode' ? 'active' : ''}
          onClick={() => setActiveTab('geocode')}
        >
          Geocoding
        </button>
        <button 
          className={activeTab === 'health' ? 'active' : ''}
          onClick={() => setActiveTab('health')}
        >
          Health Check
        </button>
      </nav>

      <main className="main-content">
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h2>System Dashboard</h2>
            <div className="dashboard-grid">
              <div className="card">
                <h3>Total Hospitals</h3>
                <p>{hospitals.length}</p>
              </div>
              <div className="card">
                <h3>System Status</h3>
                <p>{healthStatus ? healthStatus.status : 'Unknown'}</p>
              </div>
            </div>
            
            <div className="map-section">
              <h3>Hospital Locations</h3>
              {hospitals.length > 0 ? (
                <MapContainer 
                  center={[28.2096, 83.9856]} 
                  zoom={12} 
                  style={{ height: '400px', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {hospitals.map((hospital) => (
                    <Marker 
                      key={hospital.id} 
                      position={[hospital.latitude, hospital.longitude]}
                    >
                      <Popup>
                        <strong>{hospital.name}</strong><br/>
                        Beds: {hospital.bedsAvailable}<br/>
                        Phone: {hospital.phone}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <p>Loading map...</p>
              )}
            </div>
          </div>
        )}

        {/* Hospitals Tab */}
        {activeTab === 'hospitals' && (
          <div className="tab-content">
            <h2>Hospital Management</h2>
            
            <div className="form-section">
              <h3>Get Hospital Status</h3>
              <div className="form-group">
                <label htmlFor="hospitalId">Hospital ID:</label>
                <input
                  type="number"
                  id="hospitalId"
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  placeholder="Enter hospital ID (1-5)"
                />
                <button onClick={getHospitalStatus}>Get Status</button>
              </div>
              
              {selectedHospital && (
                <div className="result-section">
                  <h4>Hospital Details</h4>
                  <pre>{JSON.stringify(selectedHospital, null, 2)}</pre>
                </div>
              )}
            </div>

            <div className="hospitals-list">
              <h3>All Hospitals</h3>
              <div className="hospitals-grid">
                {hospitals.map(hospital => (
                  <div key={hospital.id} className="hospital-card">
                    <h4>{hospital.name}</h4>
                    <p><strong>ID:</strong> {hospital.id}</p>
                    <p><strong>Address:</strong> {hospital.address}</p>
                    <p><strong>Phone:</strong> {hospital.phone}</p>
                    <p><strong>Beds Available:</strong> {hospital.bedsAvailable}</p>
                    <p><strong>Coordinates:</strong> {hospital.latitude}, {hospital.longitude}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Match Tab */}
        {activeTab === 'match' && (
          <div className="tab-content">
            <h2>Hospital Matching</h2>
            
            <div className="form-section">
              <h3>Find Best Hospital</h3>
              <div className="form-group">
                <label>Location (Choose one option)</label>
                <div className="input-row">
                  <input
                    type="number"
                    name="latitude"
                    value={matchForm.latitude}
                    onChange={handleMatchFormChange}
                    placeholder="Latitude (e.g., 28.2096)"
                    step="any"
                  />
                  <input
                    type="number"
                    name="longitude"
                    value={matchForm.longitude}
                    onChange={handleMatchFormChange}
                    placeholder="Longitude (e.g., 83.9856)"
                    step="any"
                  />
                </div>
                <p>OR</p>
                <input
                  type="text"
                  name="address"
                  value={matchForm.address}
                  onChange={handleMatchFormChange}
                  placeholder="Address (e.g., Pokhara, Nepal)"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="injuryType">Injury Type (Optional):</label>
                <input
                  type="text"
                  id="injuryType"
                  name="injuryType"
                  value={matchForm.injuryType}
                  onChange={handleMatchFormChange}
                  placeholder="e.g., Trauma Surgery"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="bloodType">Blood Type (Optional):</label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={matchForm.bloodType}
                  onChange={handleMatchFormChange}
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              
              <button onClick={matchHospital}>Find Best Hospital</button>
            </div>
            
            {matchResults.length > 0 && (
              <div className="result-section">
                <h3>Best Matches</h3>
                <div className="matches-grid">
                  {matchResults.map((match, index) => (
                    <div key={index} className="match-card">
                      <h4>{match.name}</h4>
                      <p><strong>Distance:</strong> {match.distance_km} km</p>
                      <p><strong>Available Beds:</strong> {match.available_beds}</p>
                      <p><strong>Specialists:</strong> {match.specialists.join(', ')}</p>
                      <p><strong>Coordinates:</strong> {match.latitude}, {match.longitude}</p>
                      <p><strong>Phone:</strong> {match.phone}</p>
                    </div>
                  ))}
                </div>
                
                {matchResults.length > 0 && (
                  <div className="map-section">
                    <h4>Matched Hospitals Map</h4>
                    <MapContainer 
                      center={[matchResults[0].latitude, matchResults[0].longitude]} 
                      zoom={12} 
                      style={{ height: '400px', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {matchResults.map((match, index) => (
                        <Marker 
                          key={index} 
                          position={[match.latitude, match.longitude]}
                        >
                          <Popup>
                            <strong>{match.name}</strong><br/>
                            Distance: {match.distance_km} km<br/>
                            Beds: {match.available_beds}
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Geocode Tab */}
        {activeTab === 'geocode' && (
          <div className="tab-content">
            <h2>Geocoding Tools</h2>
            
            <div className="form-section">
              <h3>Geocode Address</h3>
              <div className="form-group">
                <label htmlFor="geocodeAddress">Address:</label>
                <input
                  type="text"
                  id="geocodeAddress"
                  name="address"
                  value={geocodeForm.address}
                  onChange={handleGeocodeFormChange}
                  placeholder="Enter address to geocode"
                />
                <button onClick={geocodeAddress}>Geocode Address</button>
              </div>
              
              {geocodeResult && (
                <div className="result-section">
                  <h4>Geocoding Result</h4>
                  <pre>{JSON.stringify(geocodeResult, null, 2)}</pre>
                </div>
              )}
            </div>
            
            <div className="form-section">
              <h3>Reverse Geocode</h3>
              <div className="form-group">
                <label>Coordinates:</label>
                <div className="input-row">
                  <input
                    type="number"
                    name="latitude"
                    value={reverseGeocodeForm.latitude}
                    onChange={handleReverseGeocodeFormChange}
                    placeholder="Latitude"
                    step="any"
                  />
                  <input
                    type="number"
                    name="longitude"
                    value={reverseGeocodeForm.longitude}
                    onChange={handleReverseGeocodeFormChange}
                    placeholder="Longitude"
                    step="any"
                  />
                </div>
                <button onClick={reverseGeocode}>Reverse Geocode</button>
              </div>
              
              {reverseGeocodeResult && (
                <div className="result-section">
                  <h4>Reverse Geocoding Result</h4>
                  <pre>{JSON.stringify(reverseGeocodeResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="tab-content">
            <h2>System Health</h2>
            
            <div className="form-section">
              <button onClick={checkHealth}>Check Health</button>
            </div>
            
            {healthStatus && (
              <div className="result-section">
                <h3>Health Status</h3>
                <pre>{JSON.stringify(healthStatus, null, 2)}</pre>
              </div>
            )}
            
            <div className="system-info">
              <h3>System Information</h3>
              <p><strong>Backend URL:</strong> http://localhost:3000</p>
              <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
              <p><strong>Total Hospitals Loaded:</strong> {hospitals.length}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;