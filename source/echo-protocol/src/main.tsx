import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '@fontsource/ibm-plex-sans/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import '@fontsource/ibm-plex-mono/latin-700.css';
import '@fontsource/courier-prime/latin-400.css';
import '@fontsource/courier-prime/latin-700.css';
import '@fontsource/vt323/latin-400.css';
import '@fontsource/stardos-stencil/latin-400.css';
import '@fontsource/stardos-stencil/latin-700.css';
import '@fontsource/permanent-marker/latin-400.css';
import './styles/base.css';
import './styles/os.css';
import './styles/apps.css';
import './styles/screens.css';
import { installTextures } from './art/textures';
import { App } from './App';
import { Gallery } from './art/Gallery';

const GALLERY = new URLSearchParams(window.location.search).has('gallery');

installTextures();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {GALLERY ? <Gallery /> : <App />}
  </StrictMode>,
);
