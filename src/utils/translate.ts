import { getTranslation } from '@/utils/translations';

const translateText = (text: string, countryCode: string): string => {
    return getTranslation(text, countryCode);
};

export default translateText;
