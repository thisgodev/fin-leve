
import React, { useState } from 'react';
// Added X to imports from lucide-react
import { Download, Upload, Lock, Unlock, ShieldCheck, FileJson, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { encryptData, decryptData } from '../utils/crypto';
import { storageService } from '../services/storageService';
import { useNavigate } from 'react-router-dom';

const Backup: React.FC = () => {
  const { accounts, cards, transactions } = useFinance();
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(storageService.getConfig().isPro);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const navigate = useNavigate();

  // A senha "mestre" para teste (geralmente viria do .env ou validada via API)
  const MASTER_PASSWORD = "PRO-LEVE-2025";

  const handleUnlock = () => {
    if (password === MASTER_PASSWORD) {
      const config = storageService.getConfig();
      storageService.saveConfig({ ...config, isPro: true, licenseKey: password });
      setIsUnlocked(true);
      setStatus({ type: 'success', msg: 'Recursos PRO desbloqueados com sucesso!' });
    } else {
      setStatus({ type: 'error', msg: 'Senha de licença inválida. Verifique seu e-mail.' });
    }
  };

  const handleExport = async () => {
    try {
      const data = JSON.stringify({ accounts, cards, transactions });
      const encrypted = await encryptData(data);
      const blob = new Blob([encrypted], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_financeiro_leve_${new Date().toISOString().split('T')[0]}.fl`;
      link.click();
      setStatus({ type: 'success', msg: 'Backup exportado e criptografado com sucesso!' });
    } catch (e) {
      setStatus({ type: 'error', msg: 'Erro ao exportar dados.' });
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const encrypted = event.target?.result as string;
        const decrypted = await decryptData(encrypted);
        const data = JSON.parse(decrypted);
        
        if (data.accounts && data.transactions) {
          storageService.saveAccounts(data.accounts);
          storageService.saveCards(data.cards || []);
          storageService.saveTransactions(data.transactions);
          setStatus({ type: 'success', msg: 'Dados restaurados! Recarregando...' });
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (err) {
        setStatus({ type: 'error', msg: 'Arquivo inválido ou corrompido.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Backup & Segurança</h2>
        <p className="text-slate-500 dark:text-slate-400">Proteja seus dados com criptografia de nível bancário.</p>
      </div>

      {!isUnlocked ? (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-700 text-center space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-6 rounded-full text-amber-600 dark:text-amber-400">
              <Lock size={64} />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold dark:text-white">Recurso Bloqueado</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              A exportação e restauração de dados é um recurso exclusivo para membros **PRO**. 
              Insira sua senha de licença enviada por e-mail após a compra.
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-4">
            <input 
              type="password" 
              placeholder="Sua senha de licença"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-center font-mono"
            />
            <button 
              onClick={handleUnlock}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
            >
              Desbloquear agora
            </button>
            <button 
              onClick={() => navigate('/purchase')}
              className="w-full py-3 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline"
            >
              Não tem uma senha? Comprar Pro
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 space-y-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Download size={32} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold dark:text-white">Exportar Histórico</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Baixe um arquivo criptografado (.fl) com todos os seus lançamentos e contas.</p>
            </div>
            <button 
              onClick={handleExport}
              className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center space-x-2"
            >
              <FileJson size={20} />
              <span>Baixar Backup</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 space-y-6">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Upload size={32} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold dark:text-white">Restaurar Dados</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Selecione um arquivo de backup (.fl) para restaurar suas informações.</p>
            </div>
            <label className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group">
              <input type="file" accept=".fl" className="hidden" onChange={handleImport} />
              <FileJson size={20} className="text-slate-400 group-hover:text-emerald-500" />
              <span className="font-bold text-slate-500 group-hover:text-emerald-600">Selecionar Arquivo</span>
            </label>
          </div>
        </div>
      )}

      {status && (
        <div className={`fixed bottom-10 right-10 left-10 md:left-auto md:w-96 p-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-bottom-5 ${status.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <span className="font-bold text-sm">{status.msg}</span>
          <button onClick={() => setStatus(null)} className="ml-auto opacity-70 hover:opacity-100">
            {/* Added X component which is now correctly imported */}
            <X size={20} />
          </button>
        </div>
      )}

      <div className="bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
           <ShieldCheck size={48} className="opacity-80" />
           <div>
              <p className="font-black text-lg uppercase tracking-tighter leading-none">Proteção Ativa</p>
              <p className="text-xs opacity-80 mt-1">Seus dados são criptografados localmente antes de sair do navegador.</p>
           </div>
        </div>
        <div className="text-[10px] bg-white/10 px-4 py-2 rounded-full font-bold tracking-widest uppercase">
          Versão PRO: Ativada
        </div>
      </div>
    </div>
  );
};

export default Backup;
