import React, { useEffect, useState } from 'react';

interface RetroLCDProps {
    message: string;
    type?: 'normal' | 'warning' | 'critical' | 'success';
    subMessage?: string;
}

const RetroLCD: React.FC<RetroLCDProps> = ({ message, type = 'normal', subMessage }) => {
    const [displayText, setDisplayText] = useState('');

    // Typing effect
    // FIX: se usa message.slice(0, i + 1) en lugar de prev + message.charAt(i) para evitar
    // el stale closure donde `i` ya vale 1 en el primer disparo, saltándose la primera letra.
    useEffect(() => {
        setDisplayText('');
        let i = 0;
        const timer = setInterval(() => {
            if (i < message.length) {
                setDisplayText(message.slice(0, i + 1));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 30);
        return () => clearInterval(timer);
    }, [message]);

    // Color mapping
    const getColors = () => {
        switch (type) {
            case 'critical': return 'text-red-500 bg-red-950/30 border-red-900/50';
            case 'warning': return 'text-yellow-500 bg-yellow-950/30 border-yellow-900/50';
            case 'success': return 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50';
            default: return 'text-[#33ff00] bg-[#002200] border-[#004400]';
        }
    };

    const baseClasses = getColors();

    return (
        <div className={`relative w-full h-full p-3 rounded-sm border-2 font-mono text-xs uppercase tracking-widest overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] ${baseClasses}`}>
            {/* Scanlines Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))',
                    backgroundSize: '100% 2px, 3px 100%',
                }}
            />

            {/* Glow Effect */}
            <div className={`absolute inset-0 pointer-events-none opacity-20 blur-md ${type === 'critical' ? 'bg-red-500' : 'bg-green-500'}`} />

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-1">
                <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-1 opacity-70 text-[10px]">
                    <span>SYS.STATUS</span>
                    <span className="animate-pulse">{type === 'critical' ? '!!!' : 'OK'}</span>
                </div>

                {/* FIX: eliminado whitespace-nowrap + overflow/text-ellipsis.
                    Se usa break-words para que el wrap solo ocurra en espacios (no en mitad de
                    una palabra como "INPUT"), y min-h de 2 líneas para que el componente no
                    salte de altura cuando el texto hace wrap. */}
                <div className="font-bold text-sm min-h-[2.5rem] break-words leading-snug">
                    {displayText}<span className="animate-pulse">_</span>
                </div>

                {subMessage && (
                    <div className="text-[10px] opacity-80 mt-1 break-words">
                        {subMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RetroLCD;
