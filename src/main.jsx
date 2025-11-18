// src/main.jsx
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import SplashScreen from './pages/SplashScreen';
import HomePage from './pages/HomePage';
import MakananPage from './pages/MakananPage';
import MinumanPage from './pages/MinumanPage';
import ProfilePage from './pages/ProfilePage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import RecipeDetail from './components/recipe/RecipeDetail';
import DesktopNavbar from './components/navbar/DesktopNavbar';
import MobileNavbar from './components/navbar/MobileNavbar';
import './index.css'
import PWABadge from './PWABadge';

function AppRoot() {
  // Logic untuk membaca URL Parameter (Share Link)
  const getInitialStateFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const recipeIdFromUrl = params.get('recipe');

    if (recipeIdFromUrl) {
      return {
        showSplash: false, // Skip splash screen
        mode: 'detail',
        selectedRecipeId: recipeIdFromUrl,
        currentPage: 'home',
      };
    }
    
    return {
      showSplash: true,
      mode: 'list',
      selectedRecipeId: null,
      currentPage: 'home',
    };
  };

  const [initialState] = useState(getInitialStateFromUrl());
  const [showSplash, setShowSplash] = useState(initialState.showSplash);
  const [currentPage, setCurrentPage] = useState(initialState.currentPage);
  const [mode, setMode] = useState(initialState.mode);
  const [selectedRecipeId, setSelectedRecipeId] = useState(initialState.selectedRecipeId);
  
  const [selectedCategory, setSelectedCategory] = useState('makanan');
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setMode('list');
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
  };

  const handleCreateRecipe = () => {
    setMode('create');
  };

  const handleRecipeClick = (recipeId, category) => {
    setSelectedRecipeId(recipeId);
    setSelectedCategory(category || currentPage);
    setMode('detail');
  };

  const handleEditRecipe = (recipeId) => {
    setEditingRecipeId(recipeId);
    setMode('edit');
  };

  const handleBack = () => {
    // Jika user masuk via link share, back akan membawa ke home
    if (window.location.search.includes('recipe=')) {
      window.history.replaceState(null, '', window.location.pathname);
      handleNavigation('home');
    } else {
      setMode('list');
      setSelectedRecipeId(null);
      setEditingRecipeId(null);
    }
  };

  const handleCreateSuccess = (newRecipe) => {
    alert('Resep berhasil dibuat!');
    setMode('list');
    if (newRecipe && newRecipe.category) {
      setCurrentPage(newRecipe.category);
    }
  };

  const handleEditSuccess = () => {
    alert('Resep berhasil diperbarui!');
    setMode('list');
  };

  const renderCurrentPage = () => {
    if (mode === 'create') {
      return <CreateRecipePage onBack={handleBack} onSuccess={handleCreateSuccess} />;
    }

    if (mode === 'edit') {
      return <EditRecipePage recipeId={editingRecipeId} onBack={handleBack} onSuccess={handleEditSuccess} />;
    }

    if (mode === 'detail') {
      return (
        <RecipeDetail
          recipeId={selectedRecipeId}
          category={selectedCategory}
          onBack={handleBack}
          onEdit={handleEditRecipe}
        />
      );
    }

    switch (currentPage) {
      case 'home': return <HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />;
      case 'makanan': return <MakananPage onRecipeClick={handleRecipeClick} />;
      case 'minuman': return <MinumanPage onRecipeClick={handleRecipeClick} />;
      case 'profile': return <ProfilePage onRecipeClick={handleRecipeClick} />;
      default: return <HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />;
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {mode === 'list' && (
        <>
          <DesktopNavbar 
            currentPage={currentPage} 
            onNavigate={handleNavigation}
            onCreateRecipe={handleCreateRecipe}
          />
          <MobileNavbar 
            currentPage={currentPage} 
            onNavigate={handleNavigation}
            onCreateRecipe={handleCreateRecipe}
          />
        </>
      )}
      
      <main className="min-h-screen">
        {renderCurrentPage()}
      </main>

      <PWABadge />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)