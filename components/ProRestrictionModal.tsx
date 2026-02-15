
import React, { useState, useEffect } from 'react';
import { Crown, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';

interface ProRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'history' | 'cards';
}

const ProRestrictionModal: React.FC<ProRestrictionModalProps> = ({ isOpen, onClose, reason }) => {
  const navigate = useNavigate();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleDontShow = () => {
    const config = storageService.getConfig();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // Ocultar por 7 dias
    storageService.saveConfig({ ...config, hideFreeModalUntil: expiry.toISOString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-5 rounded-full text-amber-600">
            {reason === 'history' ? <ShieldAlert size={48} /> : <Crown size={48} />}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
              Recurso Exclusivo PRO
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {reason === 'history' 
                ? 'Para visualizar o histórico de meses anteriores após o 5º dia do mês, você precisa de uma assinatura ativa.'
                : 'Usuários do plano gratuito podem gerenciar até 3 cartões. Assine o PRO para ter limite ilimitado!'}
            </p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <button 
              onClick={() => { onClose(); navigate('/purchase'); }}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Assinar por R$ 9,90/mês</span>
              <ArrowRight size={18} />
            </button>
            
            <div className="flex items-center justify-center space-x-4 pt-2">
               <button 
                onClick={handleDontShow}
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
              >
                Não mostrar novamente por 7 dias
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProRestrictionModal;
