// src/components/recipe/RecipeDetail.jsx
import { useState } from 'react';
import { useRecipe } from '../../hooks/useRecipes';
import { useReviews, useCreateReview } from '../../hooks/useReviews';
import { useIsFavorited } from '../../hooks/useFavorites';
import { getUserIdentifier } from '../../hooks/useFavorites';
import { formatDate, getDifficultyColor } from '../../utils/helpers';
import { ArrowLeft, Clock, Users, ChefHat, Star, Send, Edit, Trash2, Share2 } from 'lucide-react';
import recipeService from '../../services/recipeService';
import ConfirmModal from '../modals/ConfirmModal';
import FavoriteButton from '../common/FavoriteButton';
import userService from '../../services/userService';

export default function RecipeDetail({ recipeId, onBack, onEdit, category = 'makanan' }) {
  const { recipe, loading: recipeLoading, error: recipeError } = useRecipe(recipeId);
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(recipeId);
  const { createReview, loading: createLoading } = useCreateReview();
  const { isFavorited, loading: favLoading, toggleFavorite } = useIsFavorited(recipeId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const categoryColors = {
    makanan: {
      primary: 'blue',
      gradient: 'from-blue-50 via-white to-indigo-50',
      text: 'text-blue-700',
      bg: 'bg-blue-100',
    },
    minuman: {
      primary: 'green',
      gradient: 'from-green-50 via-white to-cyan-50',
      text: 'text-green-700',
      bg: 'bg-green-100',
    },
  };

  const colors = categoryColors[category] || categoryColors.makanan;

  // Fitur Share Link
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?recipe=${recipeId}`;
    const shareData = {
      title: recipe.name,
      text: `Cek resep ${recipe.name} di Resep Nusantara!`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link resep berhasil disalin ke clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const userProfile = userService.getUserProfile();
    const reviewData = {
      user_identifier: userProfile.username || getUserIdentifier(),
      rating,
      comment: comment.trim(),
    };

    const success = await createReview(recipeId, reviewData);
    if (success) {
      setComment('');
      setRating(5);
      setShowReviewForm(false);
      refetchReviews();
    }
  };

  const handleDeleteRecipe = async () => {
    try {
      setDeleting(true);
      const result = await recipeService.deleteRecipe(recipeId);
      if (result.success) {
        alert('Resep berhasil dihapus!');
        setShowDeleteModal(false);
        if (onBack) onBack();
      } else {
        throw new Error(result.message || 'Gagal menghapus resep');
      }
    } catch (err) {
      alert(err.message || 'Terjadi kesalahan saat menghapus resep');
    } finally {
      setDeleting(false);
    }
  };

  if (recipeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${colors.primary}-600 mx-auto`}></div>
          <p className="mt-4 text-slate-600">Memuat resep...</p>
        </div>
      </div>
    );
  }

  if (recipeError || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{recipeError || 'Resep tidak ditemukan'}</p>
          <button onClick={onBack} className={`px-4 py-2 bg-${colors.primary}-600 text-white rounded-lg`}>Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.gradient} pb-20 md:pb-8`}>
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRecipe}
        title="Hapus Resep"
        message={`Yakin ingin menghapus "${recipe?.name}"?`}
        confirmText="Ya, Hapus"
        variant="danger"
        isLoading={deleting}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-700 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
          </button>

          <div className="flex gap-2">
            {/* Tombol Share */}
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">Share</span>
            </button>

            {onEdit && (
              <>
                <button onClick={() => onEdit(recipeId)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Edit className="w-4 h-4" />
                  <span className="hidden md:inline">Edit</span>
                </button>
                <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden md:inline">Hapus</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Recipe Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-white/40 mb-8">
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 z-10">
              <FavoriteButton recipeId={recipeId} size="lg" />
            </div>
            <div className="absolute bottom-4 left-4">
              <span className={`${colors.text} ${colors.bg} px-4 py-2 rounded-full text-sm font-semibold`}>
                {category === 'makanan' ? 'Makanan' : 'Minuman'}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{recipe.name}</h1>
            <p className="text-slate-600 text-lg mb-6">{recipe.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/70 p-4 rounded-xl border border-white/60 text-center">
                <Clock className={`w-6 h-6 mx-auto mb-2 text-${colors.primary}-600`} />
                <p className="text-xs text-slate-500">Persiapan</p>
                <p className="font-semibold">{recipe.prep_time} mnt</p>
              </div>
              <div className="bg-white/70 p-4 rounded-xl border border-white/60 text-center">
                <ChefHat className={`w-6 h-6 mx-auto mb-2 text-${colors.primary}-600`} />
                <p className="text-xs text-slate-500">Memasak</p>
                <p className="font-semibold">{recipe.cook_time} mnt</p>
              </div>
              <div className="bg-white/70 p-4 rounded-xl border border-white/60 text-center">
                <Users className={`w-6 h-6 mx-auto mb-2 text-${colors.primary}-600`} />
                <p className="text-xs text-slate-500">Porsi</p>
                <p className="font-semibold">{recipe.servings} org</p>
              </div>
              <div className="bg-white/70 p-4 rounded-xl border border-white/60 text-center">
                <Star className={`w-6 h-6 mx-auto mb-2 text-${colors.primary}-600`} />
                <p className="text-xs text-slate-500">Rating</p>
                <p className="font-semibold">{recipe.average_rating?.toFixed(1) || 0} / 5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients & Steps */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-white/40">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Bahan-bahan</h2>
            <ul className="space-y-3">
              {recipe.ingredients?.map((ingredient, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-white/50 p-3 rounded-xl">
                  <span className={`text-${colors.primary}-600 font-bold`}>•</span>
                  <div>
                    <p className="font-medium">{ingredient.name}</p>
                    <p className="text-sm text-slate-500">{ingredient.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-white/40">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Langkah-langkah</h2>
            <ol className="space-y-4">
              {recipe.steps?.map((step, idx) => (
                <li key={idx} className="flex gap-4 bg-white/50 p-4 rounded-xl">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-${colors.primary}-600 text-white flex items-center justify-center font-bold`}>
                    {step.step_number || idx + 1}
                  </div>
                  <p className="text-slate-700 pt-1">{step.instruction || step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-white/40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Ulasan ({reviews?.length || 0})</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className={`px-4 py-2 bg-${colors.primary}-600 text-white rounded-xl hover:bg-${colors.primary}-700 transition-colors`}
            >
              {showReviewForm ? 'Batal' : 'Tulis Ulasan'}
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 bg-white/70 rounded-2xl p-6 border border-white/60">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)}>
                      <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-500 fill-current' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Komentar</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl resize-none"
                  rows={4}
                  placeholder="Bagikan pengalamanmu..."
                />
              </div>
              <button type="submit" disabled={createLoading || !comment.trim()} className={`px-6 py-3 bg-${colors.primary}-600 text-white rounded-xl flex items-center gap-2`}>
                <Send className="w-4 h-4" /> Kirim Ulasan
              </button>
            </form>
          )}

          <div className="space-y-4">
            {reviewsLoading ? (
              <p className="text-center py-4">Memuat ulasan...</p>
            ) : reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-white/70 rounded-2xl p-6 border border-white/60">
                  <div className="flex justify-between mb-2">
                    <p className="font-semibold text-slate-800">{review.user_identifier}</p>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? 'fill-current' : 'text-slate-300'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{formatDate(review.created_at)}</p>
                  <p className="text-slate-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">Belum ada ulasan.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}