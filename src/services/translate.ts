import type { TranslationService } from '../types';

// Cache de traduction pour éviter les appels API répétés
const translationCache = new Map<string, string>();

const TRANSLATION_PROVIDER = {
  name: 'MyMemory',
  url: (text: string) => 
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr`,
  extract: (data: any) => data.responseData.translatedText,
  validateResponse: (data: any) => 
    data?.responseData?.translatedText && 
    data.responseStatus === 200
};

async function tryTranslate(text: string): Promise<string> {
  try {
    const url = TRANSLATION_PROVIDER.url(text);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!TRANSLATION_PROVIDER.validateResponse(data)) {
      throw new Error('Invalid response format');
    }
    
    const translation = TRANSLATION_PROVIDER.extract(data);
    return translation.trim();
  } catch (error) {
    throw new Error(`${TRANSLATION_PROVIDER.name} translation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function shouldTranslate(text: string): boolean {
  // Ne pas traduire si le texte est vide ou trop court
  if (!text?.trim() || text.length < 3) return false;

  // Ne pas traduire si le texte contient principalement des nombres/symboles
  if (/^[^a-zA-Z]*$/.test(text)) return false;

  // Ne pas traduire si le texte contient des caractères français
  if (/[éèêëàâäôöûüçîïÉÈÊËÀÂÄÔÖÛÜÇÎÏ]/.test(text)) return false;

  // Ne pas traduire les URLs
  if (/^https?:\/\//.test(text)) return false;

  return true;
}

export const translateText: TranslationService = async (text: string): Promise<string> => {
  // Vérifier si la traduction est nécessaire
  if (!shouldTranslate(text)) {
    return text;
  }

  // Vérifier le cache
  const cachedTranslation = translationCache.get(text);
  if (cachedTranslation) {
    return cachedTranslation;
  }

  try {
    const translation = await tryTranslate(text);
    
    // Vérifier que la traduction n'est pas identique au texte source
    if (translation && translation.toLowerCase() !== text.toLowerCase()) {
      // Mettre en cache la traduction réussie
      translationCache.set(text, translation);
      return translation;
    }
  } catch (error) {
    console.error('Translation failed:', error);
  }

  // En cas d'échec, retourner le texte original
  return text;
};