
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2,
  CheckCircle2, 
  XCircle, 
  CreditCard,
  Wallet,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from '../types';
import { formatCurrency, formatDate, getShortDate, getMonthYear } from '../utils/formatters';

const Transactions: React.FC = () => {
  const { transactions, accounts, cards, addTransaction, updateTransaction, deleteTransaction, toggleTransactionStatus } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: getShortDate(),
    type: TransactionType.EXPENSE,
    status: TransactionStatus.OPEN,
    accountId: accounts[0]?.id || '',
    cardId: '',
    category: 'Geral',
    installments: '1',
    paymentMethod: PaymentMethod.ACCOUNT
  });

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const filteredTransactions = transactions
    .filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
    })
    .filter(t => filterType === 'ALL' || t.type === filterType)
    .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenModal = (t?: Transaction) => {
    if (t) {
      setEditingTransaction(t);
      setFormData({
        description: t.description,
        amount: t.amount.toString(),
        date: t.date.split('T')[0],
        type: t.type,
        status: t.status,
        accountId: t.accountId || accounts[0]?.id || '',
        cardId: t.cardId || '',
        category: t.category,
        installments: '1',
        paymentMethod: t.cardId ? PaymentMethod.CARD : PaymentMethod.ACCOUNT
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        description: '',
        amount: '',
        date: getShortDate(),
        type: TransactionType.EXPENSE,
        status: TransactionStatus.OPEN,
        accountId: accounts[0]?.id || '',
        cardId: '',
        category: 'Geral',
        installments: '1',
        paymentMethod: PaymentMethod.ACCOUNT
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    const amount = parseFloat(formData.amount);
    
    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        description: formData.description,
        amount,
        date: formData.date,
        dueDate: formData.date,
        type: formData.type,
        status: formData.status as TransactionStatus,
        accountId: formData.paymentMethod === PaymentMethod.ACCOUNT ? formData.accountId : undefined,
        cardId: formData.paymentMethod === PaymentMethod.CARD ? formData.cardId : undefined,
        category: formData.category
      });
    } else {
      const installments = parseInt(formData.installments);
      const finalAmount = installments > 1 ? amount / installments : amount;

      addTransaction({
        description: formData.description,
        amount: finalAmount,
        date: formData.date,
        dueDate: formData.date,
        type: formData.type,
        status: formData.status as TransactionStatus,
        accountId: formData.paymentMethod === PaymentMethod.ACCOUNT ? formData.accountId : undefined,
        cardId: formData.paymentMethod === PaymentMethod.CARD ? formData.cardId : undefined,
        category: formData.category,
        isInstallment: installments > 1
      }, installments);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Lançamentos</h2>
        
        {/* Month Navigator */}
        <div className="flex items-center space-x-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg dark:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-sm font-bold capitalize text-slate-800 dark:text-white w-32 text-center">{getMonthYear(currentMonth)}</h2>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg dark:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => { setFormData({...formData, type: TransactionType.INCOME}); setIsModalOpen(true); }}
            className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} />
            <span>Receita</span>
          </button>
          <button 
            onClick={() => { setFormData({...formData, type: TransactionType.EXPENSE}); setIsModalOpen(true); }}
            className="flex-1 md:flex-none px-6 py-3 bg-rose-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-rose-700 transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} />
            <span>Despesa</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="O que você está procurando?" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white outline-none"
          />
        </div>
        <div className="flex space-x-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-2xl">
          <button 
            onClick={() => setFilterType('ALL')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filterType === 'ALL' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400'}`}
          >
            TODOS
          </button>
          <button 
            onClick={() => setFilterType(TransactionType.INCOME)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filterType === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400'}`}
          >
            RECEITAS
          </button>
          <button 
            onClick={() => setFilterType(TransactionType.EXPENSE)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filterType === TransactionType.EXPENSE ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400'}`}
          >
            DESPESAS
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 text-left text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
              <th className="px-8 py-5">Data</th>
              <th className="px-8 py-5">Descrição</th>
              <th className="px-8 py-5">Categoria</th>
              <th className="px-8 py-5">Origem</th>
              <th className="px-8 py-5">Valor</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredTransactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-slate-700 dark:text-slate-300">
                <td className="px-8 py-5 whitespace-nowrap text-xs font-medium">{formatDate(t.date)}</td>
                <td className="px-8 py-5">
                  <div className="font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                    <span>{t.description}</span>
                    {t.isInstallment && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 px-2 py-0.5 rounded-full font-black">
                        {t.installmentNumber}/{t.totalInstallments}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-5 text-xs">{t.category}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center space-x-2 text-xs font-bold">
                    {t.accountId ? (
                      <div className="flex items-center space-x-1 text-blue-500">
                        <Wallet size={14} />
                        <span className="truncate max-w-[100px]">{accounts.find(a => a.id === t.accountId)?.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-purple-500">
                        <CreditCard size={14} />
                        <span className="truncate max-w-[100px]">{cards.find(c => c.id === t.cardId)?.name}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className={`px-8 py-5 font-black text-sm ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
                </td>
                <td className="px-8 py-5">
                  <button 
                    onClick={() => toggleTransactionStatus(t.id)}
                    className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      t.status === TransactionStatus.PAID 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : t.status === TransactionStatus.OVERDUE
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {t.status === TransactionStatus.PAID ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    <span>{t.status === TransactionStatus.PAID ? 'Pago' : t.status === TransactionStatus.OVERDUE ? 'Atrasado' : 'Aberto'}</span>
                  </button>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center justify-center space-x-1">
                      <button 
                        onClick={() => handleOpenModal(t)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteTransaction(t.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div className="p-20 text-center text-slate-400 space-y-2">
            <p className="text-lg font-bold">Nenhum lançamento encontrado</p>
            <p className="text-xs">Tente mudar o mês ou os filtros de busca.</p>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-8 dark:text-white">
              {editingTransaction ? 'Editar' : 'Novo'} {formData.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">DESCRIÇÃO</label>
                <input 
                  required
                  type="text" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                  placeholder="Ex: Aluguel, Supermercado"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">VALOR</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">DATA</label>
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>
              </div>

              {formData.type === TransactionType.EXPENSE && (
                <>
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: PaymentMethod.ACCOUNT})}
                      className={`flex-1 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all font-bold text-xs ${formData.paymentMethod === PaymentMethod.ACCOUNT ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400'}`}
                    >
                      <Wallet size={16} />
                      <span>CONTA</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: PaymentMethod.CARD})}
                      className={`flex-1 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all font-bold text-xs ${formData.paymentMethod === PaymentMethod.CARD ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400'}`}
                    >
                      <CreditCard size={16} />
                      <span>CARTÃO</span>
                    </button>
                  </div>

                  {formData.paymentMethod === PaymentMethod.ACCOUNT ? (
                    <div>
                      <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">CONTA DE ORIGEM</label>
                      <select 
                        value={formData.accountId}
                        onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                      >
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">CARTÃO DE CRÉDITO</label>
                      <select 
                        value={formData.cardId}
                        onChange={(e) => setFormData({...formData, cardId: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                      >
                        <option value="">Selecione um cartão</option>
                        {cards.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}
                      </select>
                    </div>
                  )}

                  {!editingTransaction && (
                    <div>
                      <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">PARCELAMENTO</label>
                      <select 
                        value={formData.installments}
                        onChange={(e) => setFormData({...formData, installments: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                      >
                        <option value="1">Pagamento à vista</option>
                        {[2,3,4,5,6,10,12,18,24,36].map(n => <option key={n} value={n}>{n}x</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}

              {formData.type === TransactionType.INCOME && (
                <div>
                  <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">CONTA DE DESTINO</label>
                  <select 
                    value={formData.accountId}
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                  >
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>
              )}

              <div className="pt-6">
                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
                >
                  {editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
