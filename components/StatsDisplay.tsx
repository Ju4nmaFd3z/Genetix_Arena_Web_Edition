import React, { useRef } from 'react';
import { DetailedStats } from '../types';
import {
    Clock, Swords, ShieldAlert, Heart, Percent, Skull,
    Camera, Trophy, AlertTriangle, Zap
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface StatsDisplayProps {
    stats: DetailedStats;
    missionId?: string;
    gameResult?: string | null;
}

interface ResultTheme {
    text: string;
    label: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    barColor: string;
    icon: React.ReactNode;
}

function getResultTheme(gameResult: string | null | undefined): ResultTheme {
    if (gameResult === 'ALLIES_WIN') return {
        text: 'MISIÓN COMPLETADA',
        label: 'NIVEL_ALFA',
        badgeBg: '#0a1f15',
        badgeBorder: '#1a5c35',
        badgeText: '#10b981',
        barColor: '#10b981',
        icon: <Trophy size={18} style={{ color: '#10b981', flexShrink: 0 }} />,
    };
    if (gameResult === 'DRAW') return {
        text: 'ESTANCAMIENTO',
        label: 'ZONA_GRIS',
        badgeBg: '#1a1500',
        badgeBorder: '#5c4a00',
        badgeText: '#eab308',
        barColor: '#eab308',
        icon: <AlertTriangle size={18} style={{ color: '#eab308', flexShrink: 0 }} />,
    };
    return {
        text: 'MISIÓN FALLIDA',
        label: 'FALLO_SISTEMA',
        badgeBg: '#1a0808',
        badgeBorder: '#5c1a1a',
        badgeText: '#ef4444',
        barColor: '#ef4444',
        icon: <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />,
    };
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, missionId = '00000', gameResult }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownloadImage = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#060708',
                scale: 2,
                logging: false,
                useCORS: true,
                scrollY: -window.scrollY,
                onclone: (_clonedDoc, clonedEl) => {
                    const el = clonedEl as HTMLElement;
                    el.style.width = '560px';
                    el.style.maxWidth = 'none';
                    el.style.boxSizing = 'border-box';
                }
            });

            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `GENETIX_REPORT_${missionId}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/png');
        } catch (err) {
            console.error('Error generating report image:', err);
        }
    };

    const theme = getResultTheme(gameResult);

    return (
        <div
            ref={cardRef}
            data-capture-target
            className="w-full font-mono overflow-hidden"
            style={{
                backgroundColor: '#060708',
                border: '1px solid #1e2124',
                borderTop: `2px solid ${theme.barColor}`,
            }}
        >
            {/* ── CABECERA ──────────────────────────────── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid #1a1d20',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', color: '#10b981', textTransform: 'uppercase' }}>
                        GENETIX_CORP · ANÁLISIS POST-COMBATE
                    </span>
                    <span style={{ fontSize: '9px', color: '#3a3f45', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        OP_ID: {missionId} · V.3.5.0_STABLE
                    </span>
                </div>

                <button
                    onClick={handleDownloadImage}
                    data-html2canvas-ignore
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border transition-colors"
                    style={{ backgroundColor: '#0d0f11', borderColor: '#2a2d32', color: '#10b981' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#10b981'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2a2d32'; }}
                    title="Descargar reporte"
                >
                    <Camera size={12} />
                    <span className="hidden sm:inline">Capturar</span>
                </button>
            </div>

            {/* ── BANNER DE RESULTADO ───────────────────── */}
            {gameResult && (
                <div style={{
                    margin: '20px 20px 0',
                    padding: '14px 20px',
                    backgroundColor: theme.badgeBg,
                    border: `1px solid ${theme.badgeBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {theme.icon}
                        <span style={{
                            fontSize: '15px',
                            fontWeight: 900,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: theme.badgeText,
                            lineHeight: 1,
                        }}>
                            {theme.text}
                        </span>
                    </div>
                    <span className="hidden sm:block" style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        color: theme.badgeText,
                        opacity: 0.5,
                        textTransform: 'uppercase',
                    }}>
                        {theme.label}
                    </span>
                </div>
            )}

            {/* ── TASA DE SUPERVIVENCIA ─────────────────── */}
            <div style={{
                margin: '12px 20px 0',
                padding: '14px 20px',
                backgroundColor: '#0d0f11',
                border: '1px solid #1e2124',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                    <Percent size={14} />
                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        TASA_SUPERVIVENCIA
                    </span>
                </div>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', lineHeight: 1, fontFamily: 'inherit' }}>
                    {stats.survivalRate}
                </span>
            </div>

            {/* ── GRID 2×2 ─────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '10px 20px 0' }}>
                {[
                    { icon: <Clock size={11} />, label: 'Vida media ALI', value: stats.averageAllyLifespan, unit: 'ticks', color: '#10b981' },
                    { icon: <Skull size={11} />, label: 'Vida media ENE', value: stats.averageEnemyLifespan, unit: 'ticks', color: '#ef4444' },
                    { icon: <Swords size={11} />, label: 'Daño infligido', value: stats.totalDamageDealtByAllies.toLocaleString(), unit: undefined, color: '#e5e5e5' },
                    { icon: <ShieldAlert size={11} />, label: 'Daño recibido', value: stats.totalDamageDealtByEnemies.toLocaleString(), unit: undefined, color: '#e5e5e5' },
                ].map(({ icon, label, value, unit, color }) => (
                    <div key={label} style={{
                        backgroundColor: '#0d0f11',
                        border: '1px solid #1e2124',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555' }}>
                            {icon}
                            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                {label}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                            <span style={{ fontSize: '22px', fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
                            {unit && <span style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase' }}>{unit}</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── CURACIÓN TOTAL ────────────────────────── */}
            <div style={{
                margin: '10px 20px 0',
                padding: '14px 20px',
                backgroundColor: '#0d0f11',
                border: '1px solid #1e2124',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                    <Heart size={14} />
                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        Curación total
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                        {stats.totalHealingDone.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase' }}>HP</span>
                </div>
            </div>

            {/* ── PIE ───────────────────────────────────── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                marginTop: '16px',
                borderTop: '1px solid #1a1d20',
            }}>
                <span style={{ fontSize: '8px', color: '#282d32', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    SECURE_DATA_LINK_ENCRYPTED
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#282d32' }}>
                    <Zap size={9} />
                    <span style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>GENETIX_ARENA</span>
                </div>
            </div>
        </div>
    );
};

export default StatsDisplay;
