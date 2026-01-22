import { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.mafs.app',
  appName: 'MAFS',
  webDir: 'public', // Placeholder, we are using server url
  server: {
    url: 'https://mafs-indol.vercel.app', // YOUR PRODUCTION URL
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true, // Allows content to flow under status bar
    }
  }
};
export default config;