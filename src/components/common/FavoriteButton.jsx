// src/components/common/FavoriteButton.jsx
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import favoriteService from '../../services/favoriteService';
import { getUserIdentifier } from '../../services/userService';

export default function FavoriteButton({ recipeId, onToggle, size = 'md' }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Cek status awal (bisa dari local storage atau API)
  useEffect(() => {
    const checkStatus = () => {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorited(favorites.includes(recipeId));
    };
    checkStatus();

    // Listen event jika ada perubahan dari tempat lain
    window.addEventListener('favorites-updated', checkStatus);
    return () => window.removeEventListener('favorites-updated', checkStatus);
  }, [recipeId]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (loading) return;

    setAnimate(true);
    setTimeout(() => setAnimate(false), 300);

    try {
      setLoading(true);
      const userIdentifier = getUserIdentifier();
      
      // 1. Panggil API (jika backend tersedia)
      try {
        await favoriteService.toggleFavorite({
          recipe_id: recipeId,
          user_identifier: userIdentifier
        });
      } catch (err) {
        // Fallback jika API gagal/belum ada, tetap jalan di localStorage
        console.log("API toggle skipped/failed, using local only");
      }

      // 2. Update Local Storage
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      let newStatus;
      
      if (favorites.includes(recipeId)) {
        const index = favorites.indexOf(recipeId);
        favorites.splice(index, 1);
        newStatus = false;
      } else {
        favorites.push(recipeId);
        newStatus = true;
      }

      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorited(newStatus);
      
      // 3. DISPATCH EVENT (Ini kuncinya agar Profile Page reload otomatis)
      window.dispatchEvent(new Event('favorites-updated'));

      if (onToggle) onToggle(newStatus);

    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  // Size configurations
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        rounded-full transition-all duration-300 shadow-sm flex items-center justify-center
        ${sizeClasses[size]}
        ${isFavorited ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:bg-white hover:text-red-400'}
        ${animate ? 'scale-125' : 'scale-100'}
      `}
    >
      <Heart 
        className={`w-full h-full transition-colors ${isFavorited ? 'fill-current' : ''}`} 
        strokeWidth={2.5}
      />
    </button>
  );
}