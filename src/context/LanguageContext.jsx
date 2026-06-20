import React, { createContext, useContext } from 'react';
import { usePersonalization } from './PersonalizationContext';
import { legalTranslations } from '../Tools/AI_Legal/translations/legal.translations';
import { translations as _baseTranslations } from './translations.data';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const { personalizations, updatePersonalization } = usePersonalization();

    // Single Source of Truth from PersonalizationContext
    // Language selection will apply A to Z across the UI
    const rawLanguage = personalizations?.general?.language || 'English';
    const language = rawLanguage;
    const region = personalizations?.general?.region || 'India';

    const [toolkitLanguage, setToolkitLanguageState] = React.useState(() => {
        return localStorage.getItem('ai_legal_lang') || 'English';
    });

    const setToolkitLanguage = (lang) => {
        localStorage.setItem('ai_legal_lang', lang);
        setToolkitLanguageState(lang);
    };

    const setLanguage = (lang) => updatePersonalization('general', { language: lang });
    const setRegion = (reg) => updatePersonalization('general', { region: reg });

    const regions = {
        'India': ["English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Kannada", "Malayalam", "Urdu"],
        'United States': ["English", "Spanish", "French", "Mandarin Chinese"],
        'Japan': ["Japanese", "English"],
        'China': ["Mandarin Chinese", "English"],
        'Germany': ["German", "English"],
        'France': ["French", "English"],
        'Brazil': ["Portuguese", "English"],
        'United Kingdom': ["English"],
        'United Arab Emirates': ["Arabic", "English"],
        'Canada': ["English", "French"],
        'Spain': ["Spanish", "English"],
        'South Korea': ["Korean", "English"],
        'Italy': ["Italian", "English"],
        'Russia': ["Russian", "English"],
        'Australia': ["English"],
        'Singapore': ["English", "Mandarin Chinese", "Malayalam", "Tamil"],
        'Netherlands': ["Dutch", "English"],
        'Mexico': ["Spanish", "English"],
        'Turkey': ["Turkish", "English"],
        'Switzerland': ["German", "French", "Italian", "English"],
        'Sweden': ["Swedish", "English"],
        'Norway': ["Norwegian", "English"],
        'Denmark': ["Danish", "English"],
        'Finland': ["Finnish", "English"],
        'Belgium': ["Dutch", "French", "German", "English"],
        'Argentina': ["Spanish", "English"],
        'Portugal': ["Portuguese", "English"],
        'New Zealand': ["English"],
        'South Africa': ["English", "Afrikaans", "Zulu", "Xhosa"]
    };

    const regionFlags = {
        'India': 'IN',
        'United States': 'US',
        'Japan': 'JP',
        'China': 'CN',
        'Germany': 'DE',
        'France': 'FR',
        'Brazil': 'BR',
        'United Kingdom': 'GB',
        'United Arab Emirates': 'AE',
        'Canada': 'CA',
        'Spain': 'ES',
        'South Korea': 'KR',
        'Italy': 'IT',
        'Russia': 'RU',
        'Australia': 'AU',
        'Singapore': 'SG',
        'Netherlands': 'NL',
        'Mexico': 'MX',
        'Turkey': 'TR',
        'Switzerland': 'CH',
        'Sweden': 'SE',
        'Norway': 'NO',
        'Denmark': 'DK',
        'Finland': 'FI',
        'Belgium': 'BE',
        'Argentina': 'AR',
        'Portugal': 'PT',
        'New Zealand': 'NZ',
        'South Africa': 'ZA'
    };

    const regionTimezones = {
        'India': 'India (GMT+5:30)',
        'United States': 'Eastern Time (GMT-5:00)',
        'Japan': 'Japan Standard Time (GMT+9:00)',
        'China': 'China Standard Time (GMT+8:00)',
        'Germany': 'Central European Time (GMT+1:00)',
        'France': 'Central European Time (GMT+1:00)',
        'Brazil': 'Brasília Time (GMT-3:00)',
        'United Kingdom': 'Greenwich Mean Time (GMT+0:00)',
        'United Arab Emirates': 'Gulf Standard Time (GMT+4:00)',
        'Canada': 'Eastern Time (GMT-5:00)',
        'Spain': 'Central European Time (GMT+1:00)',
        'South Korea': 'Korea Standard Time (GMT+9:00)',
        'Italy': 'Central European Time (GMT+1:00)',
        'Russia': 'Moscow Time (GMT+3:00)',
        'Australia': 'Australian Eastern Time (GMT+10:00)',
        'Singapore': 'Singapore Time (GMT+8:00)',
        'Netherlands': 'Central European Time (GMT+1:00)',
        'Mexico': 'Central Standard Time (GMT-6:00)',
        'Turkey': 'Turkey Time (GMT+3:00)',
        'Switzerland': 'Central European Time (GMT+1:00)',
        'Sweden': 'Central European Time (GMT+1:00)',
        'Norway': 'Central European Time (GMT+1:00)',
        'Denmark': 'Central European Time (GMT+1:00)',
        'Finland': 'Eastern European Time (GMT+2:00)',
        'Belgium': 'Central European Time (GMT+1:00)',
        'Argentina': 'Argentina Time (GMT-3:00)',
        'Portugal': 'Western European Time (GMT+0:00)',
        'New Zealand': 'New Zealand Time (GMT+12:00)',
        'South Africa': 'South Africa Time (GMT+2:00)'
    };

    const allTimezones = [
        "International Date Line West (GMT-12:00)",
        "Samoa Standard Time (GMT-11:00)",
        "Hawaii-Aleutian Standard Time (GMT-10:00)",
        "Alaska Standard Time (GMT-9:00)",
        "Pacific Standard Time (GMT-8:00)",
        "Mountain Standard Time (GMT-7:00)",
        "Central Standard Time (GMT-6:00)",
        "Eastern Standard Time (GMT-5:00)",
        "Atlantic Standard Time (GMT-4:00)",
        "Brasília Time (GMT-3:00)",
        "South Georgia Time (GMT-2:00)",
        "Azores Time (GMT-1:00)",
        "Greenwich Mean Time (GMT+0:00)",
        "Central European Time (GMT+1:00)",
        "Eastern European Time (GMT+2:00)",
        "Moscow Time (GMT+3:00)",
        "Gulf Standard Time (GMT+4:00)",
        "India Standard Time (GMT+5:30)",
        "Bangladesh Standard Time (GMT+6:00)",
        "Indochina Time (GMT+7:00)",
        "China Standard Time (GMT+8:00)",
        "Japan Standard Time (GMT+9:00)",
        "Australian Eastern Time (GMT+10:00)",
        "Solomon Islands Time (GMT+11:00)",
        "New Zealand Time (GMT+12:00)"
    ];

    const languages = [].concat(...Object.values(regions));
    const uniqueLanguages = [...new Set(languages)];

    // Use translations from external data file (extracted to reduce component file size)
    const translations = _baseTranslations;

    // Merge AI Legal specific translations (mutates only once per import thanks to module caching)
    Object.keys(legalTranslations).forEach(lang => {
        if (translations[lang]) {
            Object.assign(translations[lang], legalTranslations[lang]);
        }
    });

    const t = (key) => {
        const langData = translations[language] || translations['English'];
        return langData[key] || translations['English'][key] || key;
    };

    const tLegal = (key) => {
        const langData = translations[toolkitLanguage] || translations['English'];
        return langData[key] || translations['English'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{
            language, setLanguage, t,
            toolkitLanguage, setToolkitLanguage, tLegal,
            languages: uniqueLanguages, region, setRegion, regions, regionFlags, allTimezones, regionTimezones
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
