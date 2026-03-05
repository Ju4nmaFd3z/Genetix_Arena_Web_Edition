import React, { useEffect, useState } from 'react';

interface RetroLCDProps {
    message: string;
    type?: 'normal' | 'warning' | 'critical' | 'success';
    subMessage?: string;
}

const RetroLCD: React.FC<RetroLCDProps> = ({ message, type = 'normal', subMessage }) => {
    const [displayText, setDisplayText] = useState('');

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

    const getColors = () => {
        switch (type) {
            case 'critical': return {
                text: 'text-red-500',
                bg: 'bg-red-950/40',
                border: 'border-red-900/50',
                glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]',
                led: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
            };
            case 'warning': return {
                text: 'text-amber-500',
                bg: 'bg-amber-950/40',
                border: 'border-amber-900/50',
                glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
                led: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
            };
            case 'success': return {
                text: 'text-emerald-400',
                bg: 'bg-emerald-950/40',
                border: 'border-emerald-900/50',
                glow: 'shadow-[0_0_15px_rgba(52,211,153,0.4)]',
                led: 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
            };
            default: return {
                text: 'text-[#33ff00]',
                bg: 'bg-[#001a00]',
                border: 'border-[#003300]',
                glow: 'shadow-[0_0_15px_rgba(51,255,0,0.3)]',
                led: 'bg-[#33ff00] shadow-[0_0_8px_rgba(51,255,0,0.8)]'
            };
        }
    };

    const colors = getColors();

    return (
        <div className="relative p-1 bg-[#1a1a1a] rounded-sm border-b-4 border-r-4 border-black/40 shadow-2xl">
            {/* Outer Bezel / Frame */}
            <div className="relative p-3 bg-[#2a2a2a] rounded-sm border border-[#3a3a3a] shadow-inner">

                {/* Corner Screws */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-[#111] border border-[#444] shadow-inner flex items-center justify-center">
                    <div className="w-full h-[1px] bg-[#333] rotate-45"></div>
                </div>
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#111] border border-[#444] shadow-inner flex items-center justify-center">
                    <div className="w-full h-[1px] bg-[#333] -rotate-45"></div>
                </div>
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-[#111] border border-[#444] shadow-inner flex items-center justify-center">
                    <div className="w-full h-[1px] bg-[#333] -rotate-45"></div>
                </div>
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#111] border border-[#444] shadow-inner flex items-center justify-center">
                    <div className="w-full h-[1px] bg-[#333] rotate-45"></div>
                </div>

                {/* Status LED */}
                <div className="absolute top-2 right-6 flex items-center gap-2">
                    <span className="text-[7px] text-gray-500 font-bold tracking-tighter">PWR</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.led} transition-all duration-300`}></div>
                </div>

                {/* Screen Housing */}
                <div className={`relative w-full h-full p-3 rounded-sm border-2 overflow-hidden ${colors.bg} ${colors.border} ${colors.glow}`}>

                    {/* CRT Glass Effect / Bulge */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none z-20"></div>

                    {/* Scanlines & Pixel Grid */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-20 z-10"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))',
                            backgroundSize: '100% 3px, 3px 100%',
                        }}
                    />

                    {/* Content */}
                    <div className={`relative z-10 flex flex-col gap-1 font-mono ${colors.text}`}>
                        <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-1 opacity-50 text-[8px] tracking-tighter">
                            <span className="flex items-center gap-1">
                                <div className={`w-1 h-1 rounded-full ${colors.led} animate-pulse`}></div>
                                TELEMETRY_FEED
                            </span>
                            <span className="animate-pulse">[{type.toUpperCase()}]</span>
                        </div>

                        <div className="font-bold text-[11px] md:text-xs tracking-wider min-h-[1.5rem] whitespace-nowrap overflow-hidden text-ellipsis leading-snug drop-shadow-[0_0_5px_currentColor]">
                            {displayText}<span className="animate-pulse inline-block w-2 h-3 bg-current ml-1 align-middle"></span>
                        </div>

                        {subMessage && (
                            <div className="text-[9px] opacity-70 mt-1 break-words leading-tight italic">
                                {'>'} {subMessage}
                            </div>
                        )}
                    </div>

                    {/* Backlight Bleed */}
                    <div className={`absolute -inset-4 pointer-events-none opacity-10 blur-2xl ${type === 'critical' ? 'bg-red-500' : type === 'warning' ? 'bg-amber-500' : 'bg-green-500'}`} />
                </div>
            </div>
        </div>
    );
};

export default RetroLCD;
