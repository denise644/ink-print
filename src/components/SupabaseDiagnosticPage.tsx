import React, { useState, useEffect } from 'react';
import { 
  Database, CheckCircle, AlertTriangle, RefreshCw, ExternalLink, Lock, Server, Globe, ShieldCheck, HelpCircle, Terminal 
} from 'lucide-react';
import { isSupabaseConfigured, getSupabaseConfigInfo, supabase } from '../lib/supabase';

export const SupabaseDiagnosticPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [backendData, setBackendData] = useState<any>(null);
  const [clientTestLoading, setClientTestLoading] = useState<boolean>(false);
  const [clientTestSuccess, setClientTestSuccess] = useState<boolean | null>(null);
  const [clientTestMsg, setClientTestMsg] = useState<string>("");
  const [clientRecordCount, setClientRecordCount] = useState<number | null>(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/supabase-diagnostic');
      if (res.ok) {
        const data = await res.json();
        setBackendData(data);
      } else {
        setBackendData({
          success: false,
          error: `Errore nella risposta del server: ${res.status} ${res.statusText}`,
          configured: false
        });
      }
    } catch (err: any) {
      setBackendData({
        success: false,
        error: err?.message || String(err),
        configured: false
      });
    } finally {
      setLoading(false);
    }
  };

  const testClientSideConnection = async () => {
    setClientTestLoading(true);
    setClientTestSuccess(null);
    setClientTestMsg("");
    setClientRecordCount(null);

    const configured = isSupabaseConfigured();
    if (!configured) {
      setClientTestSuccess(false);
      setClientTestMsg("Supabase non è configurato sul lato Client (variabili VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nel browser).");
      setClientTestLoading(false);
      return;
    }

    try {
      if (!supabase) {
        throw new Error("Client Supabase non inizializzato.");
      }
      
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (error) {
        // Fallback checks
        const fallbackResult = await supabase
          .from('prodotti')
          .select('*', { count: 'exact' });
        
        if (fallbackResult.error) {
          throw new Error(`Errore tabella 'products': ${error.message}. Fallback 'prodotti' fallito: ${fallbackResult.error.message}`);
        }
        
        setClientTestSuccess(true);
        setClientRecordCount(fallbackResult.data?.length || 0);
        setClientTestMsg(`Connessione client-side riuscita con successo tramite tabella di fallback 'prodotti'.`);
        return;
      }

      setClientTestSuccess(true);
      setClientRecordCount(data?.length || 0);
      setClientTestMsg(`Connessione client-side stabilita con successo alla tabella 'products'!`);
    } catch (err: any) {
      setClientTestSuccess(false);
      setClientTestMsg(err?.message || String(err));
    } finally {
      setClientTestLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    testClientSideConnection();
  }, []);

  const clientConfig = getSupabaseConfigInfo();

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-lg font-black text-slate-905 uppercase tracking-tight flex items-center gap-2">
            <Database className="text-blue-600" /> Diagnostica e Stato Supabase Cloud
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Verifica la connessione in tempo reale e il conteggio dei prodotti nel database centralizzato Postgres.
          </p>
        </div>
        <button 
          onClick={() => {
            fetchDiagnostics();
            testClientSideConnection();
          }}
          disabled={loading || clientTestLoading}
          className="flex items-center gap-2 bg-slate-900 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-2xl tracking-wider hover:bg-slate-800 transition-all shadow active:scale-95 disabled:opacity-40"
        >
          <RefreshCw size={14} className={(loading || clientTestLoading) ? "animate-spin" : ""} />
          Ricarica Diagnostica
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LATO SINISTRO: STATO DEL BACKEND (SERVER NODE) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
            <Server className="text-blue-600" size={18} />
            <span className="text-xs font-black uppercase text-blue-805 tracking-wider">Verifica Lato Server NodeJS</span>
          </div>

          {loading ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <RefreshCw className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
              <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Verifica dei dati server in corso...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stat Card Server */}
              <div className={`p-6 rounded-3xl border-2 transition-all shadow-sm ${backendData?.success ? 'bg-green-50/30 border-green-200' : 'bg-red-50/30 border-red-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block">Stato Connessione Sotto-Sistema Backend</span>
                    <h4 className="text-xl font-extrabold uppercase text-slate-900 tracking-tight">
                      {backendData?.success ? "CONNESSO E PRONTO" : "ERRORE DI CONNESSIONE"}
                    </h4>
                  </div>
                  {backendData?.success ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 text-xs font-black uppercase rounded-full border border-green-200 flex items-center gap-1 shrink-0 animate-pulse">
                      ● ONLINE
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 text-xs font-black uppercase rounded-full border border-red-200 flex items-center gap-1 shrink-0">
                      ● DISCONNESSO
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-150 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Tabella Rilevata</span>
                    <span className="text-xs font-extrabold text-slate-800 font-mono">
                      {backendData?.table ? `"${backendData.table}"` : "Nessuna / Errore"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Totale Record Reali</span>
                    <span className="text-sm font-black text-blue-600">
                      {backendData?.success ? `${backendData.count} record` : "0 (Fallback automatico a mock JSON)"}
                    </span>
                  </div>
                </div>

                {!backendData?.success && backendData?.error && (
                  <div className="mt-4 p-4 bg-red-100/60 border border-red-250 rounded-2xl text-red-800 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold uppercase text-xs">
                      <AlertTriangle size={15} /> Dettaglio Tecnico Errore:
                    </div>
                    <pre className="text-[10px] font-mono leading-relaxed bg-white/70 p-3 rounded-xl border border-red-200 overflow-x-auto whitespace-pre-wrap">
                      {backendData.error}
                    </pre>
                  </div>
                )}
              </div>

              {/* Server configuration details */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-4">
                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block font-bold">Variabili Configurate sul Server</span>
                
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">SUPABASE_URL</span>
                    <span className="text-xs font-mono py-1 px-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 inline-block overflow-x-auto max-w-full">
                      {backendData?.url || "Non rilevata"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">SUPABASE_ANON_KEY (Public Publishable)</span>
                    <span className="text-xs font-mono py-1 px-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-705 inline-block">
                      {backendData?.maskedKey || "Non rilevata"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LATO DESTRO: VERIFICA CLIENT-SIDE (PROPRIO BROWSER DI PREVIEW) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
            <Globe className="text-purple-600" size={18} />
            <span className="text-xs font-black uppercase text-purple-805 tracking-wider">Verifica Lato Client (Browser Iframe)</span>
          </div>

          <div className="space-y-4">
            {/* Stat Card Client */}
            <div className={`p-6 rounded-3xl border-2 transition-all shadow-sm ${clientTestSuccess === true ? 'bg-purple-50/30 border-purple-200' : clientTestSuccess === false ? 'bg-yellow-50/30 border-yellow-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block">Stato Connessione Diretta Client-Side</span>
                  <h4 className="text-xl font-extrabold uppercase text-slate-1000 tracking-tight">
                    {clientTestLoading ? "TEST IN CORSO..." : clientTestSuccess === true ? "CONNESSA" : clientTestSuccess === false ? "ERRORE CLIENT-SIDE" : "RUSHING TEST..."}
                  </h4>
                </div>
                {clientTestSuccess === true ? (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 text-xs font-black uppercase rounded-full border border-purple-200 flex items-center gap-1 shrink-0 animate-pulse">
                    ● DISPONIBILE
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 text-xs font-black uppercase rounded-full border border-amber-250 flex items-center gap-1 shrink-0">
                    ● NON DISPONIBILE
                  </span>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-150 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-405 uppercase tracking-widest block">Metodo Richiamato</span>
                  <span className="text-xs font-semibold text-slate-800">
                    JS Client Direct HTTPS
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-405 uppercase tracking-widest block">Elementi Letti in tempo reale</span>
                  <span className="text-sm font-black text-purple-600">
                    {clientTestSuccess === true ? `${clientRecordCount} record` : "Non disponibile"}
                  </span>
                </div>
              </div>

              {clientTestSuccess === false && clientTestMsg && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-800 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-xs">
                    <AlertTriangle size={15} /> Dettagli diagnostici Client:
                  </div>
                  <p className="text-xs leading-relaxed font-semibold">
                    {clientTestMsg}
                  </p>
                </div>
              )}
            </div>

            {/* Client defined environment */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-4">
              <span className="text-[10px] font-black tracking-widest text-slate-505 uppercase block font-bold">Variabili Configurate sul Cloned Client</span>
              
              <div className="space-y-3.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">VITE_SUPABASE_URL</span>
                  <span className="text-xs font-mono py-1 px-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 inline-block overflow-x-auto max-w-full">
                    {clientConfig.url || "Non rilevata"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">VITE_SUPABASE_ANON_KEY (Public Publishable)</span>
                  <span className="text-xs font-mono py-1 px-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-705 inline-block">
                    {clientConfig.maskedKey || "Non rilevata"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GUIDA TECNICA E RISOLUZIONE INTEGRALE */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <ShieldCheck className="text-emerald-400" size={20} />
          <h4 className="text-sm font-black uppercase tracking-wider">Guida alla Verifica dei Parametri / Configurazione</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="space-y-3 leading-relaxed">
            <h5 className="font-extrabold text-white uppercase flex items-center gap-1">
              <span className="bg-blue-600 rounded-full w-5 h-5 inline-flex items-center justify-center font-mono font-black text-[10px]">1</span> 
              Configurare URL e Chiave di API Pubblica
            </h5>
            <p>
              Nel tuo pannello di controllo della piattaforma Supabase, naviga su <strong>Project Settings (Impostazioni Progetto) &gt; API</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li>
                Sotto la sezione <strong>URL di Progetto (Project URL)</strong>, troverai l'indirizzo HTTPS es. <code className="bg-slate-800 text-blue-400 px-1 py-0.5 rounded font-mono font-bold leading-normal">https://xxxxxxxxxxxxxx.supabase.co</code>. Copialo ed impostalo come <code className="text-white">NEXT_PUBLIC_SUPABASE_URL</code>.
              </li>
              <li>
                Sotto <strong>Project API keys</strong>, troverai la chiave con etichetta <code className="text-emerald-400 font-bold font-mono">anon public (Publishable)</code>. Copiala ed impostala come <code className="text-white">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
              </li>
            </ul>
          </div>

          <div className="space-y-3 leading-relaxed">
            <h5 className="font-extrabold text-white uppercase flex items-center gap-1">
              <span className="bg-purple-600 rounded-full w-5 h-5 inline-flex items-center justify-center font-mono font-black text-[10px]">2</span> 
              Configurare le variabili in AI Studio / Hosting
            </h5>
            <p>
              Questo progetto supporta la sincronizzazione automatica. Per configurare o correggere i dati:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 font-medium">
              <li>
                Vai sul menu <strong>Settings (Impostazioni)</strong> o nel pannello dei segreti in AI Studio.
              </li>
              <li>
                Valorizza le chiavi <code className="text-blue-250 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> e <code className="text-blue-250 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> coi valori copiati da Supabase.
              </li>
              <li>
                L'applicazione salverà le chiavi e caricherà in automatico i dati reali, superando i fallback mock locali!
              </li>
            </ol>
          </div>
        </div>

        {/* QUERY PER SQL EDITOR */}
        <div className="bg-slate-950 rounded-2xl p-4 md:p-5 border border-slate-800 space-y-3 font-sans">
          <div className="flex items-center gap-1.5">
            <Terminal size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block font-bold">Query SQL per Creazione Tabella products (Nel SQL Editor di Supabase)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
            Se ricevi un errore di tipo "relation does not exist", significa che la tabella non è stata ancora creata su Supabase. Esegui questa query:
          </p>
          <pre className="text-[9px] font-mono text-slate-300 leading-relaxed bg-slate-1000 p-3 rounded-xl border border-slate-900 overflow-x-auto whitespace-pre">
{`create table if not exists products (
  id text primary key,
  sku text,
  name text not null,
  category text,
  brand text,
  price numeric,
  availability boolean default true,
  compatibility jsonb,
  description text,
  image text
);`}
          </pre>
        </div>
      </div>
    </div>
  );
};
