import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal } from 'lucide-react';

interface ConsoleLogProps {
    logs: LogEntry[];
}

const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="bg-space-panel border border-space-border h-32 md:h-64 flex flex-col font-mono text-xs md:text-sm">
            <div className="bg-space-dark px-3 py-2 border-b border-space-border flex items-center gap-2">
                <Terminal size={14} className="text-space-accent" />
                <span className="uppercase tracking-widest text-gray-400 text-[10px]">REGISTRO DE MISIÓN</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {logs.length === 0 && <span className="text-gray-600 italic">Sistema listo. Esperando entrada...</span>}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-2">
                        <span className="text-gray-600">[{log.timestamp}]</span>
                        <span className={`${log.type === 'combat' ? 'text-gray-400' :
                            log.type === 'system' ? 'text-white' : 'text-gray-300'
                            }`}>
                            {log.message}
                        </span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default ConsoleLog;