// components/RootLayout.js
import Head from 'next/head';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const RootLayout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Pokè Trainers</title>
        <meta name="description" content="Web app for real PokèTrainers" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
        
        {/* Includi le icone PWA dal tuo manifest */}
        <link rel="icon" type="image/png" sizes="512x512" href="/android/android-launchericon-512-512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android/android-launchericon-192-192.png" />
        <link rel="icon" type="image/png" sizes="144x144" href="/android/android-launchericon-144-144.png" />
        {/* Includi altre icone necessarie dal tuo manifest */}

        {/* Includi le icone iOS */}
        <link rel="apple-touch-icon" sizes="180x180" href="/ios/180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/ios/152.png" />
        {/* Includi altre icone iOS necessarie */}
      </Head>
      <html lang="it">
        <body className={poppins.className}>
          {children}
        </body>
      </html>
    </>
  );
};

export default RootLayout;
