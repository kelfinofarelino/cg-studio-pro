import React from 'react';
import { Play } from 'lucide-react';

export default function LandingPage({ onStart }) {
  const members = [
    { 
      name: "Muhammad Farelino Kelfin Ramadhani", 
      nim: "123240205", 
      image: "/farel.png"
    }, 
    { 
      name: "Dzaki Ghatfaan Abhipraya", 
      nim: "123240160 ", 
      image: "/xaki.png"
    },         
    { 
      name: "Naufal Alwi Rizqillah", 
      nim: "123240215", 
      image: "/nopal.png"
    }            
  ];

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: '#1a1c26',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#ffffff',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Judul Aplikasi */}
      <h1 style={{
        fontSize: '56px',
        fontWeight: '800',
        margin: '0 0 10px 0',
        letterSpacing: '-1px',
        background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        ThetaDraw
      </h1>

      {/* Subjudul Proyek */}
      <h2 style={{
        fontSize: '18px',
        fontWeight: '400',
        color: '#9aa0a6',
        margin: '0 0 50px 0',
        letterSpacing: '0.5px'
      }}>
        Proyek Grafika Komputer Kelompok 10
      </h2>

      {/* Grid 3 Kolom Barisan Anggota */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '24px',
        justifyContent: 'center',
        alignItems: 'stretch',
        width: '100%',
        maxWidth: '900px',
        marginBottom: '60px'
      }}>
        {members.map((member, idx) => (
          <div 
            key={idx} 
            style={{
              flex: 1,
              backgroundColor: '#222431',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '30px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              boxSizing: 'border-box'
            }}
          >
            {/* TAG IMAG BARU: Menggantikan struktur lingkaran ikon person sebelumnya */}
            <img 
              src={member.image} 
              alt={member.name}
              // Fallback jika foto gagal dimuat (menampilkan inisial/background abu)
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150/3b82f6/ffffff?text=User";
              }}
              style={{
                width: '85px',       // Ukuran sedikit diperbesar agar detail wajah kelihatan
                height: '85px',
                borderRadius: '50%', // Membuat foto bulat lingkaran sempurna
                objectFit: 'cover',  // Kunci utama agar foto auto-crop & tidak gepeng/tarik
                marginBottom: '20px',
                border: '2px solid #3b82f6', // Border biru aksen ThetaDraw
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                backgroundColor: '#1a1c26'
              }} 
            />

            {/* Nama Tebal */}
            <h3 style={{
              fontSize: '15px',
              fontWeight: '700',
              margin: '0 0 8px 0',
              lineHeight: '22px',
              color: '#ffffff'
            }}>
              {member.name}
            </h3>

            {/* NIM Tipis */}
            <span style={{
              fontSize: '13px',
              fontWeight: '300',
              color: '#9aa0a6',
              letterSpacing: '0.5px'
            }}>
              NIM: {member.nim}
            </span>
          </div>
        ))}
      </div>

      {/* Tombol Trigger Mulai */}
      <button 
        onClick={onStart}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '14px 40px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
      >
        <Play size={16} fill="#ffffff" />
        Mulai Aplikasi
      </button>
    </div>
  );
}