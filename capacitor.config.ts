import { CapacitorConfig } from '@capacitor/cli'; 
 
const config: CapacitorConfig = { 
  appId: 'io.ionic.starter', // Respeta el ID original de tu app 
  appName: 'practica_uno', 
  webDir: 'www', 
  server: { 
    androidScheme: 'https', 
    cleartext: true 
  }, 
  plugins: { 
    CapacitorHttp: { 
      enabled: true, 
    } 
  } 
}; 
 
export default config; 