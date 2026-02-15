
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Wallet,
  CreditCard as CardIcon,
  ArrowLeftRight,
  Lock,
  Calendar
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getMonthYear } from '../utils/formatters';
import { TransactionType, TransactionStatus } from '../types';
import ProRestrictionModal from '../components/ProRestrictionModal';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const Dashboard: React.FC = () => {
  const { transactions, accounts, cards, isPro, canAccessHistory } = useFinance();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasAccess = canAccessHistory(currentMonth);

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    
    if (!isPro && !canAccessHistory(newMonth)) {
      setIsModalOpen(true);
      // Não mudamos o mês se não tiver acesso, ou deixamos mudar mas embassamos
    }
    setCurrentMonth(newMonth);
  };

  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
  });

  // Dados para o Gráfico Pro (Último Ano)
  const yearlyData = useMemo(() => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' });
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
      });
      const income = monthTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
      const expense = monthTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
      data.push({ name: monthLabel, income, expense });
    }
    return data;
  }, [transactions]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  
  const monthIncome = currentMonthTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpenses = currentMonthTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const StatCard = ({ title, value, icon: Icon, color, onClick }: any) => (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-all active:scale-95`}
    >
      <div className={`${color} p-3 rounded-xl text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
        <p className="text-2xl font-bold dark:text-white">{formatCurrency(value)}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      <ProRestrictionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        reason="history" 
      />

      {/* Month Navigator */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg dark:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center space-x-2">
           <h2 className="text-lg font-bold capitalize text-slate-800 dark:text-white">{getMonthYear(currentMonth)}</h2>
           {!hasAccess && <Lock size={14} className="text-amber-500" />}
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg dark:text-white transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className={`${!hasAccess && currentMonthTransactions.length > 0 ? 'blur-xl pointer-events-none select-none' : ''} transition-all duration-500 space-y-8`}>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Saldo Geral" value={totalBalance} icon={DollarSign} color="bg-indigo-600" onClick={() => navigate('/accounts')} />
          <StatCard title="Receitas Mês" value={monthIncome} icon={TrendingUp} color="bg-emerald-500" onClick={() => navigate('/transactions')} />
          <StatCard title="Despesas Mês" value={monthExpenses} icon={TrendingDown} color="bg-rose-500" onClick={() => navigate('/transactions')} />
          <StatCard title="Saldo Mensal" value={monthIncome - monthExpenses} icon={ArrowLeftRight} color="bg-blue-500" onClick={() => navigate('/reports')} />
        </div>

        {/* Pro Chart Section */}
        {isPro && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center space-x-2">
                   <Calendar className="text-indigo-600" size={24} />
                   <span>Análise Anual PRO</span>
                </h3>
             </div>
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData}>
                    <XAxis dataKey="name" hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Lançamentos do Mês</h3>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden min-h-[300px]">
              {currentMonthTransactions.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">Nenhum lançamento.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {currentMonthTransactions.slice(0, 10).map(t => (
                    <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {t.type === TransactionType.INCOME ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">{t.description}</p>
                          <p className="text-xs text-slate-500">{t.category}</p>
                        </div>
                      </div>
                      <p className={`font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(t.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Contas</h3>
              <div className="space-y-3">
                {accounts.map(acc => (
                  <div key={acc.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: acc.color }}>
                        <Wallet size={16} />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white text-sm">{acc.name}</span>
                    </div>
                    <span className="font-bold text-sm">{formatCurrency(acc.currentBalance)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!hasAccess && currentMonthTransactions.length > 0 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-50 text-center p-8">
           <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-sm space-y-6">
              <div className="bg-amber-100 dark:bg-amber-900/40 p-5 rounded-full text-amber-600 inline-block">
                <Lock size={48} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black uppercase tracking-tighter">Acesso Restrito</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Assine o plano PRO para visualizar dados históricos de meses anteriores.</p>
              </div>
              <button 
                onClick={() => navigate('/purchase')}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"
              >
                Assinar por R$ 9,90/mês
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
