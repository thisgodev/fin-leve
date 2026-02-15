
import React, { useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { handleGoogleResponse, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    /* global google */
    // Fix: Accessing 'google' via a casted window object to resolve Property 'google' does not exist on type 'Window'
    const google = (window as any).google;
    if (google && googleBtnRef.current) {
      google.accounts.id.initialize({
        client_id: "SUA_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // O usuário deve substituir pelo seu Client ID real
        callback: async (response: any) => {
          await handleGoogleResponse(response);
          navigate('/');
        },
      });

      google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: "320",
        text: "signin_with",
        shape: "pill"
      });
    }
  }, [handleGoogleResponse, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[3rem] p-12 shadow-2xl border border-slate-100 dark:border-slate-700 text-center space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-xl shadow-indigo-200 dark:shadow-none">
            <ShieldCheck size={56} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">
              FINAN<span className="text-indigo-600">LEVE</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium">Controle total, onde quer que você esteja.</p>
          </div>
        </div>

        <div className="space-y-6 flex flex-col items-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Entre para continuar</p>
          
          <div ref={googleBtnRef} className="min-h-[50px] flex justify-center w-full transition-transform active:scale-95"></div>
          
          <div className="flex items-center space-x-2 text-[10px] text-slate-300 dark:text-slate-600 font-bold uppercase tracking-widest">
            <div className="h-[1px] w-8 bg-slate-200 dark:bg-slate-700"></div>
            <span>Seguro e Criptografado</span>
            <div className="h-[1px] w-8 bg-slate-200 dark:bg-slate-700"></div>
          </div>
        </div>

        <div className="pt-6 text-sm text-slate-400 dark:text-slate-500 font-medium">
          Sua conta Neon será sincronizada <br /> 
          automaticamente com o Google.
        </div>
      </div>
      
      <div className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-50">
        © 2025 Financeiro Leve SaaS - v2.4.0
      </div>
    </div>
  );
};

export default Login;
