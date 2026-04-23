import { useState, useCallback } from 'react';

function getCombo() {
  return document.querySelector('.goog-te-combo');
}

export function useTranslate() {
  const [lang, setLang] = useState('fr');

  const switchTo = useCallback((targetLang) => {
    const combo = getCombo();
    if (!combo) return;
    combo.value = targetLang;
    combo.dispatchEvent(new Event('change'));
    setLang(targetLang);
  }, []);

  const toggle = useCallback(() => {
    switchTo(lang === 'fr' ? 'en' : 'fr');
  }, [lang, switchTo]);

  return { lang, toggle };
}
