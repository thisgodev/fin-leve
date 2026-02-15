
import React, { useState } from 'react';
import { Plus, Wallet, Trash2, Edit2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Account, AccountType } from '../types';
import { formatCurrency, generateColors } from '../utils/formatters';

const Accounts: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: AccountType.BANK,
    initialBalance: ''
  });

  const handleOpenModal = (acc?: Account) => {
    if (acc) {
      setEditingAccount(acc);
      setFormData({
        name: acc.name,
        type: acc.type,
        initialBalance: acc.initialBalance.toString()
      });
    } else {
      setEditingAccount(null);
      setFormData({ name: '', type: AccountType.BANK, initialBalance: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.initialBalance) return;

    if (editingAccount) {
      updateAccount({
        ...editingAccount,
        name: formData.name,
        type: formData.type as AccountType,
        initialBalance: parseFloat(formData.initialBalance),
      });
    } else {
      addAccount({
        name: formData.name,
        type: formData.type as AccountType,
        initialBalance: parseFloat(formData.initialBalance),
        color: generateColors(accounts.length)
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Minhas Contas</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} />
          <span>Nova Conta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative group overflow-hidden transition-all hover:shadow-md">
            <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => handleOpenModal(acc)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                  <Edit2 size={16} />
               </button>
               <button onClick={() => deleteAccount(acc.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <Trash2 size={16} />
               </button>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: acc.color }}>
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{acc.name}</h3>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{acc.type}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">Saldo Disponível</p>
              <p className={`text-2xl font-black ${acc.currentBalance >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-600'}`}>
                {formatCurrency(acc.currentBalance)}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700 flex justify-between text-[10px] text-slate-400 uppercase tracking-wider font-bold">
               <span>Saldo Inicial: {formatCurrency(acc.initialBalance)}</span>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="col-span-full py-24 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300">
              <Wallet size={48} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Nenhuma conta cadastrada.</p>
            <button 
              onClick={() => handleOpenModal()}
              className="text-indigo-600 font-bold hover:underline"
            >
              Clique aqui para criar sua primeira conta
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-bold mb-8 dark:text-white">{editingAccount ? 'Editar Conta' : 'Nova Conta'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">NOME DA CONTA</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-lg transition-all"
                  placeholder="Ex: Nubank, Bradesco"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">TIPO</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as AccountType})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-lg transition-all"
                >
                  <option value={AccountType.BANK}>Banco / Digital</option>
                  <option value={AccountType.WALLET}>Investimentos</option>
                  <option value={AccountType.CASH}>Dinheiro Vivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">SALDO INICIAL</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.initialBalance}
                    onChange={(e) => setFormData({...formData, initialBalance: e.target.value})}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-lg font-bold"
                    placeholder="0,00"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
                >
                  {editingAccount ? 'Atualizar Conta' : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
