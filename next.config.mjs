// next.config.mjs
import { withPWA } from 'next-pwa';

export default withPWA({
  pwa: {
    dest: 'public', // la cartella dove verranno generate le risorse PWA
    disable: process.env.NODE_ENV === 'development', // Disabilita PWA in ambiente di sviluppo
  },
  // Altre configurazioni Next.js normali se necessario
});
