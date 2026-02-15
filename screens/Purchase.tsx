
import React, { useState } from 'react';
import { ShieldCheck, QrCode, Mail, CheckCircle2, ArrowRight, CreditCard, Wallet } from 'lucide-react';
import { generatePixPayload, getPixQrCodeUrl } from '../utils/pix';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

const Purchase: React.FC = () => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const { user } = useAuth();
  const price = 9.90;
  const pixPayload = generatePixPayload(price, "Assinatura Financeiro Leve Pro");
  const qrCodeUrl = getPixQrCodeUrl(pixPayload);
  const adminEmail = process.env.NOTIFY_EMAIL || "financeiroleve@admin.com";

  const handleNotify = async () => {
    // Simula ativação PRO no banco de dados Neon
    if (user) {
      await apiService.updateProStatus(user.id, true);
    }
    
    const subject = encodeURIComponent(`Pagamento Mensalidade: ${user?.name}`);
    const body = encodeURIComponent(`Usuário ${user?.name} (${user?.email}) iniciou assinatura de R$ ${price.toFixed(2)}.`);
    window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
    setStep(2);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white dark:bg-slate-800 rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="bg-indigo-600 p-12 text-white text-center space-y-4">
           <h2 className="text-4xl font-black uppercase tracking-tighter">Plano PRO</h2>
           <p className="opacity-80 text-lg">Gerenciamento ilimitado e histórico completo por apenas <b>R$ 9,90/mês</b>.</p>
        </div>

        <div className="p-10 space-y-8">
          {step === 1 ? (
            <div className="space-y-8">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                 <button 
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${paymentMethod === 'pix' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                 >
                    <Wallet size={18} />
                    <span>PIX</span>
                 </button>
                 <button 
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${paymentMethod === 'card' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                 >
                    <CreditCard size={18} />
                    <span>CARTÃO</span>
                 </button>
              </div>

              {paymentMethod === 'pix' ? (
                <div className="flex flex-col items-center space-y-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-slate-100 shadow-inner">
                    <img src={qrCodeUrl} alt="PIX" className="w-56 h-56" />
                  </div>
                  <button onClick={handleNotify} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl flex items-center justify-center space-x-3">
                    <Mail size={20} />
                    <span>INFORMAR PAGAMENTO PIX</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-center space-y-4">
                      <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Integração com Stripe em breve</div>
                      <p className="text-slate-500 text-sm">O pagamento via cartão de crédito será liberado na próxima atualização.</p>
                      <button onClick={() => setPaymentMethod('pix')} className="text-indigo-600 font-bold hover:underline">Use PIX para ativação imediata</button>
                   </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-8 p-10">
               <div className="bg-emerald-100 p-8 rounded-full text-emerald-600 inline-block"><CheckCircle2 size={64} /></div>
               <h3 className="text-2xl font-bold">Solicitação de Ativação Enviada!</h3>
               <p className="text-slate-500">Seu status PRO será ativado assim que o sistema confirmar o recebimento.</p>
               <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl">Voltar ao Início</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Purchase;
