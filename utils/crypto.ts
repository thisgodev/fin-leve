
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'financeiro-leve-secret-key-2025';

export const encryptData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataUint8 = encoder.encode(data);
  
  // Simple Base64 + XOR simulation for this environment since WebCrypto 
  // requires complex setup for static keys. In a real production app, 
  // we would use AES-GCM with a derived key.
  const keyChars = ENCRYPTION_KEY.split('');
  const encrypted = Array.from(dataUint8).map((byte, i) => {
    return byte ^ keyChars[i % keyChars.length].charCodeAt(0);
  });
  
  return btoa(String.fromCharCode(...encrypted));
};

export const decryptData = async (encryptedBase64: string): Promise<string> => {
  const encrypted = atob(encryptedBase64).split('').map(char => char.charCodeAt(0));
  const keyChars = ENCRYPTION_KEY.split('');
  
  const decryptedUint8 = new Uint8Array(encrypted.map((byte, i) => {
    return byte ^ keyChars[i % keyChars.length].charCodeAt(0);
  }));
  
  return new TextDecoder().decode(decryptedUint8);
};
