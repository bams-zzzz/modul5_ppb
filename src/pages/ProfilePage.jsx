// src/pages/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import userService from '../services/userService';
import { Edit2, Camera, Clock, ChefHat, Heart } from 'lucide-react';

// --- Komponen Kartu Resep (Desain Horizontal/Card) ---
function ProfileRecipeCard({ recipe, onRecipeClick }) {
  return (
    <div 
      onClick={() => onRecipeClick(recipe.id, recipe.category)}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col group"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.image_url} 
          alt={recipe.name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3">
           {/* Ikon Love Statis (karena ini halaman favorit) */}
          <div className="bg-red-500 p-1.5 rounded-full shadow-md">
            <Heart className="w-4 h-4 text-white fill-current" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            recipe.category === 'makanan' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {recipe.category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1">
          {recipe.name}
        </h3>
        <div className="mt-auto flex items-center gap-4 text-slate-500 text-xs font-medium pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{recipe.prep_time} mnt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChefHat size={14} />
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage({ onRecipeClick }) {
  // --- State Management ---
  const [profile, setProfile] = useState(userService.getUserProfile());
  const [activeTab, setActiveTab] = useState('semua'); // 'semua', 'makanan', 'minuman'
  
  // Hook favorites dengan refetch capability
  const { favorites, loading, refetch } = useFavorites();

  // State untuk Edit Profile
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.username);
  const fileInputRef = useRef(null);

  // --- Event Listener untuk Auto-Refresh Favorit ---
  useEffect(() => {
    // Fungsi untuk memuat ulang data
    const handleRefresh = () => {
      refetch(); 
    };

    // Pasang listener
    window.addEventListener('favorites-updated', handleRefresh);
    
    // Cleanup saat component unmount
    return () => {
      window.removeEventListener('favorites-updated', handleRefresh);
    };
  }, [refetch]);

  // --- Logic Update Profile ---
  const handleSaveName = () => {
    if (editName.trim()) {
      const res = userService.updateUsername(editName);
      if (res.success) {
        setProfile(res.data);
        setIsEditing(false);
      }
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        const res = userService.updateAvatar(base64);
        if (res.success) setProfile(res.data);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Filter Logic ---
  const filteredFavorites = favorites.filter(recipe => {
    if (activeTab === 'semua') return true;
    return recipe.category?.toLowerCase() === activeTab;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
        
        {/* --- 1. Profile Card Section (Sesuai Gambar) --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm p-6 md:p-10 mb-8 border border-slate-100 relative overflow-hidden">
          {/* Dekorasi background tipis */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 relative z-10">
            
            {/* Avatar Area */}
            <div className="relative group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1 border-2 border-blue-100">
                <img 
                  src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=0D8ABC&color=fff`} 
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover shadow-sm"
                />
              </div>
              {/* Tombol Kamera Biru */}
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 border-2 border-white"
              >
                <Camera size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            {/* User Info Area */}
            <div className="text-center md:text-left flex-1 pt-2">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-2xl text-slate-800 w-full max-w-[200px]"
                      autoFocus
                    />
                    <button onClick={handleSaveName} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg">Save</button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-slate-800">{profile.username}</h1>
                    <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-blue-600 transition-colors">
                      <Edit2 size={18} />
                    </button>
                  </>
                )}
              </div>
              
              <p className="text-slate-500 mb-4 font-medium">Sarjana Icip-Icip</p>
              
              {/* Stat Counter (Red Number) */}
              <div className="inline-flex flex-col items-center md:items-start">
                <span className="text-red-500 font-bold text-xl">{favorites.length}</span>
                <span className="text-slate-400 text-sm font-medium">Resep Favorit</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. Tabs Filter Section --- */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {['Semua', 'Makanan', 'Minuman'].map((tab) => {
            const isActive = activeTab === tab.toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`
                  px-6 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap
                  ${isActive 
                    ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' 
                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}
                `}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* --- 3. Grid Content Section --- */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((recipe) => (
              <ProfileRecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onRecipeClick={onRecipeClick} 
              />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Heart size={32} />
            </div>
            <h3 className="text-slate-800 font-bold text-lg mb-2">Belum ada favorit</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              {activeTab === 'semua' 
                ? "Tandai resep yang kamu suka agar muncul di halaman ini."
                : `Belum ada resep ${activeTab} yang difavoritkan.`}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}