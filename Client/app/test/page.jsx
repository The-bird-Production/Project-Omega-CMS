// src/app/page.jsx (ou un autre composant client)
'use client'; // Assurez-vous que le composant qui utilise le thème est un client component

import { useTheme } from '../components/theme/themeProvider'; // Ajustez le chemin
import MainLayout from '../components/layout/MainLayout'; // Ajustez le chemin

export default function HomePage() {
  const { theme, isLoading, error, setThemeById } = useTheme();

  if (isLoading) {
    return <p>Préparation du site...</p>;
  }

  if (error) {
    return (
      <p>
        Oups ! Une erreur est survenue lors du chargement du thème :{' '}
        {error.message}
      </p>
    );
  }

  // Accédez directement aux composants via l'objet 'theme'
  // Supposons que votre thème actuel expose des composants nommés 'Button' et 'Header'.
  const { Button, Header, Footer } = theme;

  return (
    <MainLayout currentPage="Test Page">
      <div>
        {/* Vous pouvez utiliser directement Button et Header comme des composants React */}
        {Header && (
          <Header title={`Bienvenue sur mon CMS - Thème: ${theme.id}`} />
        )}
        <main style={{ padding: '20px' }}>
          <h1>Ma Page d'Accueil</h1>
          <p>Ceci est un exemple d'utilisation des composants de thème.</p>

          {Button && (
            <Button
              onClick={() => alert('Le bouton du thème a été cliqué !')}
              label="Cliquez-moi zizi"
              color="primary"
            ></Button>
          )}

          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setThemeById('mon-premier-theme')}>
              Activer Thème 1
            </button>
            <button
              onClick={() => setThemeById('mon-deuxieme-theme')}
              style={{ marginLeft: '10px' }}
            >
              Activer Thème 2
            </button>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
