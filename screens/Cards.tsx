
import React, { useState } from 'react';
import { Plus, CreditCard as CardIcon, Trash2, Edit2, Calendar, Target, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CreditCard } from '../types';
import { formatCurrency, generateColors } from '../utils/formatters';
import ProRestrictionModal from '../components/ProRestrictionModal';

const Cards: React.FC = () => {
  const { cards, addCard, updateCard, deleteCard, isPro } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestrictionModalOpen, setIsRestrictionModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    limit: '',
    closingDay: '1',
    dueDay: '10'
  });

  const handleOpenModal = (card?: CreditCard) => {
    if (!card && !isPro && cards.length >= 3) {
      setIsRestrictionModalOpen(true);
      return;
    }
    if (card) {
      setEditingCard(card);
      setFormData({
        name: card.name,
        limit: card.limit.toString(),
        closingDay: card.closingDay.toString(),
        dueDay: card.dueDay.toString()
      });
    } else {
      setEditingCard(null);
      setFormData({ name: '', limit: '', closingDay: '1', dueDay: '10' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.limit) return;

    if (editingCard) {
      updateCard({
        ...editingCard,
        name: formData.name,
        limit: parseFloat(formData.limit),
        closingDay: parseInt(formData.closingDay),
        dueDay: parseInt(formData.dueDay)
      });
      setIsModalOpen(false);
    } else {
      const success = await addCard({
        name: formData.name,
        limit: parseFloat(formData.limit),
        closingDay: parseInt(formData.closingDay),
        dueDay: parseInt(formData.dueDay),
        color: generateColors(cards.length + 5)
      });
      if (success) setIsModalOpen(false);
      else setIsRestrictionModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ProRestrictionModal 
        isOpen={isRestrictionModalOpen} 
        onClose={() => setIsRestrictionModalOpen(false)} 
        reason="cards" 
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gerenciar Cartões</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} />
          <span>Novo Cartão</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map(card => (
          <div key={card.id} className="relative group">
            <div className="absolute -top-3 -right-3 z-10 opacity-0 group-hover:opacity-100 transition-all flex flex-col space-y-2">
                <button onClick={() => handleOpenModal(card)} className="p-3 bg-white dark:bg-slate-800 text-indigo-600 rounded-2xl shadow-xl border border-slate-100">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => deleteCard(card.id)} className="p-3 bg-white dark:bg-slate-800 text-rose-500 rounded-2xl shadow-xl border border-slate-100">
                  <Trash2 size={18} />
                </button>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white h-64 flex flex-col justify-between overflow-hidden relative border border-white/5 transition-transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <CardIcon size={24} />
                  <span className="font-black text-xl tracking-tight">{card.name}</span>
                </div>
                <div className="w-12 h-8 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg"></div>
              </div>
              <div>
                 <p className="text-[10px] opacity-50 uppercase tracking-widest mb-1 font-bold">Limite</p>
                 <p className="text-3xl font-black mb-6 tracking-tight">{formatCurrency(card.limit)}</p>
                 <p className="text-lg tracking-[0.3em] font-mono opacity-80">•••• •••• •••• 1234</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-8 dark:text-white">{editingCard ? 'Editar' : 'Novo'} Cartão</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input 
                required type="text" value={formData.name} placeholder="Nome"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-2xl outline-none text-lg"
              />
              <input 
                required type="number" step="0.01" value={formData.limit} placeholder="Limite"
                onChange={(e) => setFormData({...formData, limit: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-2xl outline-none text-lg font-bold"
              />
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg">
                Salvar Cartão
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;
