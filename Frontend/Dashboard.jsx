import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet';
import mqtt from 'mqtt'; 

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41], 
  popupAnchor: [1, -34] 
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function Dashboard() {
  const navigate = useNavigate();
  const [position, setPosition] = useState([-6.25745, 106.61832]);
  
  // STATE BATERAI DIHAPUS
  const [lastSync, setLastSync] = useState('Menunggu data...');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isGpsValid, setIsGpsValid] = useState(true); 
  
  const [address, setAddress] = useState("Sedang mencari alamat...");

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      setAddress(data.display_name || "Alamat tidak ditemukan");
    } catch (error) {
      setAddress("Gagal memuat alamat");
    }
  };

  const openNavigation = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`;
    window.open(googleMapsUrl, '_blank');
  };

  useEffect(() => {
    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    client.on('connect', () => {
      console.log('Berhasil terhubung ke HiveMQ Broker!');
      client.subscribe('pradita/safepath/ad067/status'); 
      client.subscribe('pradita/safepath/ad067/lokasi'); 
    });

    client.on('message', (topic, message) => {
      const sinyalMasuk = message.toString();

      // 1. Tangkap Sinyal SOS
      if (topic === 'pradita/safepath/ad067/status') {
        if (sinyalMasuk === 'DARURAT') setIsEmergency(true);
        else if (sinyalMasuk === 'AMAN') setIsEmergency(false); 
      }

      // 2. Tangkap JSON dari Sensor
      if (topic === 'pradita/safepath/ad067/lokasi') {
        try {
          const dataAlat = JSON.parse(sinyalMasuk);
          
          
          
          // Update GPS hanya jika alat mengirim lat/lng (Di Luar Ruangan)
          if (dataAlat.lat && dataAlat.lng) {
            setPosition([dataAlat.lat, dataAlat.lng]);
            fetchAddress(dataAlat.lat, dataAlat.lng); 
            setIsGpsValid(true); // Sinyal satelit didapat
          } else {
            setIsGpsValid(false); // Sinyal satelit hilang (Indoor Mode)
          }
          
          setLastSync(new Date().toLocaleTimeString('id-ID'));
        } catch (error) {
          console.error("Bukan JSON:", sinyalMasuk);
        }
      }
    });

    return () => client.end();
  }, []);

  useEffect(() => {
    fetchAddress(position[0], position[1]);
  }, []); 

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFAFA', position: 'relative' }}>
      
      {/* Garis Merah Atas saat Darurat */}
      {isEmergency && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', backgroundColor: '#FF3B30', zIndex: 9999 }}></div>
      )}

      {/* SIDEBAR */}
      <div style={{ 
        width: '340px', backgroundColor: '#FAFAFA', color: 'black', 
        display: 'flex', flexDirection: 'column', boxShadow: '2px 0 15px rgba(0,0,0,0.05)', zIndex: 1000 
      }}>
        
        <div style={{ padding: '40px 30px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '38px', fontWeight: 400, fontFamily: "'Neue Montreal', 'Inter', sans-serif", letterSpacing: '-1px' }}>
              Safepath
            </h1>
            <p style={{ margin: '5px 0 0', fontSize: '15px', fontFamily: "'IBM Plex Sans', sans-serif", color: '#333' }}>
              Welcome back, David
            </p>
          </div>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', border: '1px solid #ccc',
            backgroundImage: 'url("https://api.dicebear.com/7.x/notionists/svg?seed=David")', 
            backgroundSize: 'cover', backgroundColor: '#E8F5E9'
          }}></div>
        </div>

        <div style={{ padding: '0 30px' }}><hr style={{ border: 'none', borderTop: '3px solid black', margin: '0' }} /></div>
        
        {/* Area Konten */}
        <div style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
          
          {/* KARTU STATUS */}
          <div style={{ 
            backgroundColor: isEmergency ? '#FFF0F0' : 'white', borderRadius: '16px', padding: '24px', 
            border: isEmergency ? '2px solid #FF3B30' : '1.5px solid black',
            marginBottom: '30px', boxShadow: isEmergency ? '0 4px 0px #FF3B30' : '0 4px 0px black', transition: 'all 0.3s ease'
          }}>
            <h4 style={{ margin: '0 0 15px', fontSize: '18px', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, color: isEmergency ? '#FF3B30' : 'black' }}>
              Status Perangkat
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{ 
                width: '45px', height: '45px', borderRadius: '50%', backgroundColor: isEmergency ? '#FF3B30' : '#00C853', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold', flexShrink: 0
              }}>
                {isEmergency ? '✖' : '✓'}
              </div>
              <h2 style={{ color: isEmergency ? '#FF3B30' : 'black', margin: 0, fontSize: '30px', fontWeight: 700, fontFamily: "'Open Sauce', 'Montserrat', sans-serif", letterSpacing: '-1px' }}>
                {isEmergency ? 'DARURAT' : 'AMAN'}
              </h2>
            </div>
            
            {/* TOMBOL RESET ALARM MANUAL */}
            {isEmergency && (
              <button onClick={() => setIsEmergency(false)} style={{ 
                width: '100%', padding: '10px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '8px', 
                fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
              }}>
                Tandai Selesai & Matikan Alarm
              </button>
            )}
          </div>

          {/* Info Sinkronisasi Saja (Full Width) */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: 'white' }}>
              <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#666', fontFamily: "'IBM Plex Sans', sans-serif" }}>Waktu Sync Terakhir</p>
              <h4 style={{ margin: 0, fontSize: '18px', fontFamily: "'IBM Plex Sans', sans-serif", color: '#00C853' }}>{lastSync}</h4>
            </div>
          </div>

          {/* Alamat & Status Satelit GPS */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700 }}>Lokasi Terakhir</h4>
              
              {/* BADGE SATELIT */}
              <span style={{ 
                fontSize: '11px', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold',
                backgroundColor: isGpsValid ? '#E8F5E9' : '#FFF0F0', color: isGpsValid ? '#00C853' : '#FF3B30' 
              }}>
                {isGpsValid ? 'Satelit Terkunci' : 'Tidak Ada Sinyal GPS'}
              </span>
            </div>

            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: 'white', lineHeight: '1.5' }}>
              <p style={{ margin: 0, fontSize: '14px', fontFamily: "'IBM Plex Sans', sans-serif", color: '#333' }}>
                📍 {address}
              </p>
              {!isGpsValid && (
                <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#FF3B30', fontStyle: 'italic' }}>
                  *Alat berada di dalam ruangan. Menampilkan lokasi valid terakhir.
                </p>
              )}
            </div>
          </div>

          <button onClick={openNavigation} style={{ 
              width: '100%', padding: '14px', backgroundColor: '#000', color: '#FFF', border: 'none', borderRadius: '10px', 
              fontSize: '15px', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, cursor: 'pointer', marginBottom: '20px' 
            }}
          >
            🚀 Arahkan Saya ke Sana
          </button>
        </div>

        <div style={{ padding: '20px 30px', borderTop: '1px solid #eee' }}>
          <button onClick={() => navigate('/')} style={{ width: '100%', padding: '12px', backgroundColor: 'white', border: '1.5px solid black', borderRadius: '8px', color: 'black', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, cursor: 'pointer' }}>
            Keluar
          </button>
        </div>
      </div>

      {/* AREA PETA KANAN */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ChangeView center={position} zoom={16} />
          <Marker position={position}>
            <Popup><b>SafePath AD-067</b> <br /> Lokasi Bpk. David saat ini.</Popup>
          </Marker>
        </MapContainer>
      
        <button onClick={() => setPosition([-6.25745, 106.61832])} style={{ 
          position: 'absolute', bottom: '30px', right: '30px', zIndex: 1000, padding: '12px 20px', 
          backgroundColor: 'white', border: '2px solid black', borderRadius: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', fontWeight: 700 
        }}>
          📍 Pusatkan Map
        </button>
      </div>
    </div>
  );
}

export default Dashboard;