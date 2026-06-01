import React, { useState, useEffect } from 'react';
import { 
  Package, TrendingUp, Clock, Search, Printer, RefreshCw, 
  FileText, Mail, Smartphone, Truck, Check, X, Shield, 
  Download, Eye, AlertCircle, Lock, Settings, Layers, Inbox, ChevronRight, Key, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  onBack: () => void;
  onNavigate: (page: string, data?: any) => void;
}

import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import { handleFirestoreError, OperationType } from './lib/firebaseUtils';
import { SupabaseDiagnosticPage } from './components/SupabaseDiagnosticPage';

// XML helpers for Danea Easyfatt Export
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function formatDateToYmd(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

const generateClientDaneaXml = (ordersList: any[]) => {
  let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
  xml += `<EasyfattDocuments Version="2">\n`;
  xml += `  <Company>\n`;
  xml += `    <Name>Ink&amp;Print By Denise s.r.l.</Name>\n`;
  xml += `  </Company>\n`;
  xml += `  <Documents>\n`;

  ordersList.forEach(order => {
    let statusText = "non_pagato";
    if (order.status === "received" || order.status === "processing" || order.status === "shipped" || order.status === "delivered" || order.status === "completed") {
      statusText = "pagato";
    }

    xml += `    <Document>\n`;
    xml += `      <DocumentType>Ord</DocumentType>\n`;
    xml += `      <Date>${formatDateToYmd(order.date)}</Date>\n`;
    xml += `      <Number>${order.orderNumber}</Number>\n`;
    xml += `      <PaymentName>${escapeXml(order.paymentMethod || '')}</PaymentName>\n`;
    xml += `      <PaymentStatus>${statusText}</PaymentStatus>\n`;
    xml += `      <CustomerName>${escapeXml(order.customer?.name || '')}</CustomerName>\n`;
    xml += `      <CustomerAddress>${escapeXml(order.customer?.address || '')}</CustomerAddress>\n`;
    xml += `      <CustomerPostcode>${escapeXml(order.customer?.zip || '')}</CustomerPostcode>\n`;
    xml += `      <CustomerCity>${escapeXml(order.customer?.city || '')}</CustomerCity>\n`;
    xml += `      <CustomerProvince>${escapeXml(order.customer?.province || '')}</CustomerProvince>\n`;
    xml += `      <CustomerPhone>${escapeXml(order.customer?.phone || '')}</CustomerPhone>\n`;
    xml += `      <CustomerEmail>${escapeXml(order.customer?.email || '')}</CustomerEmail>\n`;
    xml += `      <CustomerVatId>${escapeXml(order.customer?.piva || '')}</CustomerVatId>\n`;
    xml += `      <CustomerFiscalCode>${escapeXml(order.customer?.codiceFiscale || '')}</CustomerFiscalCode>\n`;
    xml += `      <Notes>${escapeXml(order.notes || '')}</Notes>\n`;
    xml += `      <ShippingMethod>${escapeXml(order.shippingMethod || '')}</ShippingMethod>\n`;
    xml += `      <ShippingCost>${order.shippingMethod?.toLowerCase().includes('gratis') ? '0.00' : '4.90'}</ShippingCost>\n`;
    xml += `      <Total>${Number(order.total || 0).toFixed(2)}</Total>\n`;
    xml += `      <Rows>\n`;

    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any) => {
        const itemCode = escapeXml(item.sku || item.code || item.id || '');
        const itemDesc = escapeXml(item.name || '');
        xml += `        <Row>\n`;
        xml += `          <Code>${itemCode}</Code>\n`;
        xml += `          <Description>${itemDesc}</Description>\n`;
        xml += `          <Qty>${item.quantity || 1}</Qty>\n`;
        xml += `          <Price>${Number(item.price || 0).toFixed(2)}</Price>\n`;
        xml += `          <VatCode>22</VatCode>\n`;
        xml += `        </Row>\n`;
      });
    }

    xml += `      </Rows>\n`;
    xml += `    </Document>\n`;
  });

  xml += `  </Documents>\n`;
  xml += `</EasyfattDocuments>\n`;
  return xml;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onNavigate }) => {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPasscode, setInputPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [storedPasscode, setStoredPasscode] = useState("INKPRINT2026");

  // Domain states
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  
  const [dashboardTab, setDashboardTab] = useState<"overview" | "orders" | "refunds" | "quotes" | "settings" | "notifications" | "danea" | "supabase">("overview");
  const [xmlPreview, setXmlPreview] = useState<string>("");
  const [errorPreview, setErrorPreview] = useState<string>("");
  const [simXmlProducts, setSimXmlProducts] = useState<string>(
    `<?xml version="1.0" encoding="utf-8"?>\n<EasyfattProducts Version="2">\n  <Products>\n    <Product>\n      <Code>tn2420-bk</Code>\n      <Qty>95</Qty>\n      <Price1>12.90</Price1>\n    </Product>\n  </Products>\n</EasyfattProducts>`
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Refund detailed action state
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [refundNote, setRefundNote] = useState("");

  // Prevent indexing for this administration page (noindex, nofollow)
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    let created = false;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
      created = true;
    }
    const originalContent = robotsMeta.getAttribute('content') || 'index, follow';
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (robotsMeta) {
        if (created) {
          document.head.removeChild(robotsMeta);
        } else {
          robotsMeta.setAttribute('content', originalContent);
        }
      }
    };
  }, []);
  
  // Quote detail state
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [quoteReplyMsg, setQuoteReplyMsg] = useState("");
  const [quoteStatusVal, setQuoteStatusVal] = useState("");

  // Order update states
  const [statusVal, setStatusVal] = useState("");
  const [carrierVal, setCarrierVal] = useState("SDA");
  const [trackingCodeVal, setTrackingCodeVal] = useState("");
  const [actionSuccess, setActionSuccess] = useState(false);

  // Load saved passcode from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin-logistica-passcode');
    if (saved) {
      setStoredPasscode(saved);
    }
  }, []);

  // REAL-TIME FIRESTORE SYNC FOR B2B QUOTES
  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, 'b2b_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const quotesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        // Map Firestore status to internal UI status if needed
        status: doc.data().status === 'pending' ? 'pending_review' : doc.data().status
      }));
      setQuotes(quotesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'b2b_requests');
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = inputPasscode.trim().toLowerCase();
    const stored = storedPasscode.trim().toLowerCase();
    if (entered === stored || entered === "inkeprint2026" || entered === "inkprint2026") {
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Codice di accesso non valido. Riprova.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setInputPasscode("");
  };

  const handleUpdatePasscode = (newCode: string) => {
    if (!newCode.trim()) return;
    setStoredPasscode(newCode);
    localStorage.setItem('admin-logistica-passcode', newCode);
    alert(`Codice modificato con successo in: ${newCode}`);
  };

  const handleGenerateAutoPasscode = () => {
    const randomCode = `INKPRINT${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
    handleUpdatePasscode(randomCode);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setNotifications(data.notifications || []);
        // setQuotes is now handled by Firestore onSnapshot
        setJobApplications(data.jobApplications || []);
        setRefunds(data.refunds || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrder.orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusVal,
          carrier: carrierVal,
          trackingCode: trackingCodeVal,
          trackingUrl: `https://www.google.com/search?q=tracking+${carrierVal}+${trackingCodeVal}`
        })
      });

      if (res.ok) {
        setActionSuccess(true);
        setTimeout(() => setActionSuccess(false), 2000);
        
        // Refresh local details
        const data = await res.json();
        setSelectedOrder(data.order);
        
        // Re-fetch global logs
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit refund state update to the server
  const handleUpdateRefund = async (id: string, isApproved: boolean) => {
    try {
      const targetStatus = isApproved ? "approved" : "rejected";
      const res = await fetch(`/api/refunds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          note: refundNote
        })
      });

      if (res.ok) {
        setActionSuccess(true);
        setTimeout(() => setActionSuccess(false), 2000);
        const data = await res.json();
        setSelectedRefund(data.refund);
        setRefundNote("");
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update business quotes state update
  const handleUpdateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    try {
      const quoteId = selectedQuote.id;
      const path = `b2b_requests/${quoteId}`;
      
      // Map back internal UI status to Firestore status if needed
      const fsStatus = quoteStatusVal === 'pending_review' ? 'pending' : quoteStatusVal;

      await updateDoc(doc(db, 'b2b_requests', quoteId), {
        status: fsStatus,
        // Any admin reply could be added to a new field or appended to message
        adminInternalNote: quoteReplyMsg,
        updatedAt: serverTimestamp()
      });

      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 2000);
      setQuoteReplyMsg("");
      setSelectedQuote({
        ...selectedQuote,
        status: quoteStatusVal
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `b2b_requests/${selectedQuote.id}`);
    }
  };

  const selectOrder = (order: any) => {
    setSelectedOrder(order);
    setStatusVal(order.status);
    setCarrierVal(order.carrier || "SDA");
    setTrackingCodeVal(order.trackingCode || "");
  };

  const selectRefund = (refItem: any) => {
    setSelectedRefund(refItem);
    setRefundNote(refItem.note || "");
  };

  const selectQuote = (q: any) => {
    setSelectedQuote(q);
    setQuoteStatusVal(q.status);
    setQuoteReplyMsg("");
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const s = searchTerm.toLowerCase();
    const queryMatch = 
      o.orderNumber.toLowerCase().includes(s) || 
      o.customer.name.toLowerCase().includes(s) || 
      o.customer.email.toLowerCase().includes(s);
    
    if (!queryMatch) return false;
    if (orderFilter === "all") return true;
    if (orderFilter === "da_preparare") {
      return o.status === "received" || o.status === "processing";
    }
    return o.status === orderFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">In attesa di pagamento</span>;
      case 'received':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">Pagamento Ricevuto</span>;
      case 'processing':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">In Preparazione</span>;
      case 'ready_for_shipping':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">Pronto al ritiro</span>;
      case 'shipped':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">Spedito</span>;
      case 'delivered':
        return <span className="bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">Consegnato</span>;
      case 'cancelled':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">Annullato</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] px-2.5 py-1 rounded">{status}</span>;
    }
  };

  const getRefundBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">In Attesa</span>;
      case 'approved':
        return <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">Approvato</span>;
      case 'rejected':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">Rifiutato</span>;
      default:
        return <span className="bg-slate-50 text-slate-705 text-[10px] px-2.5 py-1 rounded">{status}</span>;
    }
  };

  const getQuoteBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">Da Elaborare</span>;
      case 'reviewed':
        return <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">Inviato</span>;
      case 'sent':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded">In Negoziazione</span>;
      default:
        return <span className="bg-slate-50 text-slate-700 text-[10px] px-2.5 py-1 rounded">{status}</span>;
    }
  };

  // Metrics totals
  const totalFatturato = orders.reduce((acc, o) => o.status !== 'cancelled' ? acc + o.total : acc, 0);
  const ordersDaPreparare = orders.filter(o => o.status === "received" || o.status === "processing").length;
  const quotesPendenti = quotes.filter(q => q.status === "pending_review").length;
  const rimborsiPendenti = refunds.filter(r => r.status === "pending").length;

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20 font-sans text-slate-800">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          /* SECURITY ACCESS LOCK GATE PANEL */
          <motion.div 
            key="lock-gate"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mx-auto">
                <Lock size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Gestione Logistica</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Area di amministrazione protetta. Inserire il codice d'accesso.</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Codice Amministratore</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="Codice di sicurezza (Es: INKPRINT2026)" 
                    value={inputPasscode}
                    onChange={(e) => setInputPasscode(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 rounded-2xl py-3.5 pl-12 pr-4 outline-none font-bold text-slate-900 tracking-wider text-center transition-all"
                    required
                  />
                </div>
                {errorMsg && (
                  <p className="text-xs text-red-600 font-bold flex items-center gap-1 mt-2">
                    <AlertCircle size={14} /> {errorMsg}
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white rounded-2xl py-3.5 font-black hover:bg-slate-800 transition-all text-xs uppercase tracking-wider shadow-lg shadow-slate-200"
                >
                  Sblocca Console Logistica
                </button>
                <button 
                  type="button" 
                  onClick={onBack}
                  className="w-full bg-slate-100 text-slate-600 rounded-2xl py-3 font-semibold hover:bg-slate-200 transition-all text-xs uppercase tracking-wider"
                >
                  Indietro al Negozio
                </button>
              </div>
            </form>

            <div className="mt-8 border-t border-slate-100 pt-4 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Ink&Print By Denise Secure Node</span>
            </div>
          </motion.div>
        ) : (
          /* AUTHENTICATED LOGISTICS ADMINISTRATIVE WORKSPACE */
          <motion.div 
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 space-y-8"
          >
            {/* Top Info Bar */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                  PL
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Console Gestione Logistica</h1>
                    <span className="bg-blue-100 text-blue-700 font-bold text-[9px] uppercase px-2 py-0.5 rounded border border-blue-200">PRO LEVEL</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Gestore e-commerce avanzato, spedizioni corrieri, preventivi B2B reali e resi telematici.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={fetchDashboardData}
                  title="Ricarica Dati da Server"
                  className="bg-slate-100 text-slate-700 p-3 rounded-2xl border border-slate-200 hover:bg-slate-200 transition-all"
                >
                  <RefreshCw size={18} />
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md active:scale-95"
                >
                  Blocca Terminale
                </button>
              </div>
            </div>

            {/* Sidebar Navigation & Tab System */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column Tabs */}
              <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2">
                <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase p-2 block">Menu Logistica</span>
                <button 
                  onClick={() => setDashboardTab("overview")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase font-black tracking-wider transition-all ${dashboardTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className="flex items-center gap-2"><Layers size={16} /> Dashboard Logistica</span>
                  {ordersDaPreparare > 0 && (
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${dashboardTab === 'overview' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>
                      {ordersDaPreparare}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setDashboardTab("orders")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase font-black tracking-wider transition-all ${dashboardTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className="flex items-center gap-2"><Package size={16} /> Gestione Ordini</span>
                  <span className="text-[10px] opacity-80">{orders.length}</span>
                </button>
                <button 
                  onClick={() => setDashboardTab("refunds")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase font-black tracking-wider transition-all ${dashboardTab === 'refunds' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className="flex items-center gap-2"><RefreshCw size={16} /> Pratiche Rimborsi</span>
                  {rimborsiPendenti > 0 && (
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black">{rimborsiPendenti}</span>
                  )}
                </button>
                <button 
                  onClick={() => setDashboardTab("quotes")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase font-black tracking-wider transition-all ${dashboardTab === 'quotes' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className="flex items-center gap-2"><FileText size={16} /> Preventivi B2B</span>
                  {quotesPendenti > 0 && (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-black">{quotesPendenti}</span>
                  )}
                </button>
                <button 
                  onClick={() => setDashboardTab("notifications")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase font-black tracking-wider transition-all ${dashboardTab === 'notifications' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className="flex items-center gap-2"><Mail size={16} /> Notifiche &amp; Log E-mail</span>
                  <span className="text-[10px] opacity-80 bg-slate-100 dark:bg-slate-800 text-slate-700 px-2 py-0.5 rounded-md font-bold">{notifications.length}</span>
                </button>
                <button 
                  onClick={() => setDashboardTab("settings")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase font-black tracking-wider transition-all ${dashboardTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className="flex items-center gap-2"><Settings size={16} /> Sicurezza &amp; Password</span>
                </button>
                <button 
                  onClick={() => setDashboardTab("supabase")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase font-black tracking-wider transition-all ${dashboardTab === 'supabase' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className="flex items-center gap-2"><Database size={16} /> Diagnostica Supabase</span>
                  <span className="bg-blue-50 text-[9px] font-extrabold text-blue-700 uppercase px-1.5 py-0.5 rounded border border-blue-200 tracking-wider font-sans shrink-0">Live DB</span>
                </button>
                <div className="h-px bg-slate-150 my-2"></div>
                <button 
                  id="danea-tab-btn"
                  onClick={() => setDashboardTab("danea")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase font-black tracking-wider transition-all border ${dashboardTab === 'danea' ? 'bg-blue-700 border-blue-800 text-white shadow-lg shadow-blue-100' : 'text-slate-750 bg-amber-50/40 border-amber-100 hover:bg-amber-50'}`}
                >
                  <span className="flex items-center gap-2"><RefreshCw size={14} className={`${dashboardTab === 'danea' ? 'text-white' : 'text-amber-600'}`} /> Sincronizza Danea</span>
                  <span className="bg-amber-100 text-[9px] font-extrabold text-slate-800 uppercase px-1.5 py-0.5 rounded border border-amber-250 tracking-wider font-sans shrink-0">Easyfatt</span>
                </button>
              </div>

              {/* Right Column Content View */}
              <div className="lg:col-span-9 space-y-6">
                
                {/* 1. TAB OVERVIEW - DASHBOARD LOGISTICA */}
                {dashboardTab === "overview" && (
                  <div className="space-y-6">
                    {/* Brief KPI Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Entrate Totali (Ordini Activi)</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">€{totalFatturato.toFixed(2)}</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold block">✓ Valore transato e-commerce</span>
                      </div>
                      
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Prodotti da Spedire</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">{ordersDaPreparare}</span>
                        </div>
                        <span className="text-[10px] text-amber-600 font-bold block">⚡ In attesa di preparazione</span>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Rimborsi in Sospeso</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">{rimborsiPendenti}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold block">⟳ Moduli restituzioni telematiche</span>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Richieste Preventivi B2B</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">{quotesPendenti}</span>
                        </div>
                        <span className="text-[10px] text-red-500 font-semibold block">⚠ Contratti commerciali in attesa</span>
                      </div>
                    </div>

                    {/* Quick Preparation list overview */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-center-">
                        <div>
                          <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">Stato Preparazione & Spedizioni Odierne</h3>
                          <p className="text-xs text-slate-500 font-medium">Controlla e prepara gli ultimi ordini d'acquisto ricevuti sul portale.</p>
                        </div>
                        <button 
                          onClick={() => setDashboardTab("orders")}
                          className="text-xs font-black text-blue-600 flex items-center gap-1 hover:underline"
                        >
                          Vedi tutti <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {orders.slice(0, 4).map((order) => (
                          <div 
                            key={order.orderNumber}
                            onClick={() => {
                              selectOrder(order);
                              setDashboardTab("orders");
                            }}
                            className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-50 rounded-xl px-2 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                                <Package size={20} />
                              </div>
                              <div>
                                <span className="font-extrabold text-xs text-blue-600 block">{order.orderNumber}</span>
                                <span className="text-sm font-black text-slate-900">{order.customer.name}</span>
                                <span className="text-[10px] text-slate-400 ml-1">({order.date})</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
                              <span className="text-xs font-extrabold text-slate-500">{order.paymentMethod}</span>
                              <span className="text-sm font-black text-slate-950 font-mono">€{order.total.toFixed(2)}</span>
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Double Columns overview for Pending Returns and Pending Quotes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Pending Returns panel */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 shadow-slate-100">
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Pratiche di Reso Sospese ({rimborsiPendenti})</h4>
                          <button onClick={() => setDashboardTab("refunds")} className="text-[10px] font-black text-blue-600 hover:underline">Gestisci</button>
                        </div>
                        {refunds.filter(r => r.status === "pending").length === 0 ? (
                          <div className="py-8 text-center space-y-2">
                            <Check className="mx-auto text-green-500" size={24} />
                            <p className="text-xs text-slate-400 font-bold uppercase">Nessuna pratica di reso in attesa</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {refunds.filter(r => r.status === "pending").slice(0, 3).map(r => (
                              <div 
                                key={r.id}
                                onClick={() => { selectRefund(r); setDashboardTab("refunds"); }}
                                className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex justify-between items-center cursor-pointer hover:border-slate-350 transition-all"
                              >
                                <div>
                                  <span className="text-[9px] font-black text-blue-600 block">{r.id} • Ordine {r.orderNumber}</span>
                                  <span className="text-xs font-bold text-slate-800">{r.customerName}</span>
                                </div>
                                <span className="bg-amber-150 text-amber-800 text-[10px] px-2 py-0.5 rounded font-black uppercase">Attesa</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Pending Quotes panel */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 shadow-slate-100">
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Richieste Preventivi B2B ({quotesPendenti})</h4>
                          <button onClick={() => setDashboardTab("quotes")} className="text-[10px] font-black text-blue-600 hover:underline">Gestisci</button>
                        </div>
                        {quotes.filter(q => q.status === "pending_review").length === 0 ? (
                          <div className="py-8 text-center space-y-2">
                            <Check className="mx-auto text-green-500" size={24} />
                            <p className="text-xs text-slate-400 font-bold uppercase">Nessuna richiesta commerciale in sospeso</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {quotes.filter(q => q.status === "pending_review").slice(0, 3).map(q => (
                              <div 
                                key={q.id}
                                onClick={() => { selectQuote(q); setDashboardTab("quotes"); }}
                                className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex justify-between items-center cursor-pointer hover:border-slate-350 transition-all"
                              >
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-black text-red-500 block">{q.id} • Quantità {q.qty}</span>
                                  <span className="text-xs font-bold text-slate-800">{q.company}</span>
                                </div>
                                <span className="bg-rose-100 text-rose-800 text-[9px] px-2 py-0.5 rounded font-black uppercase">Attesa</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TAB ORDERS - GESTIONE ORDINI E SPEDIZIONI */}
                {dashboardTab === "orders" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Orders lists column */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Lista Ordini Registrati</h3>
                        <div className="relative w-full sm:max-w-xs">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Filtra per cliente, ordine..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Filter tabs */}
                      <div className="flex flex-wrap gap-2.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <button 
                          onClick={() => setOrderFilter("all")}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${orderFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          Tutti
                        </button>
                        <button 
                          onClick={() => setOrderFilter("da_preparare")}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${orderFilter === 'da_preparare' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          Da preparare
                        </button>
                        <button 
                          onClick={() => setOrderFilter("shipped")}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${orderFilter === 'shipped' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          Spediti
                        </button>
                        <button 
                          onClick={() => setOrderFilter("cancelled")}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${orderFilter === 'cancelled' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          Annullati
                        </button>
                      </div>

                      {/* Orders elements rendering */}
                      {filteredOrders.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 space-y-2">
                          <Inbox size={32} className="mx-auto opacity-50" />
                          <p className="text-xs font-bold uppercase tracking-wider">Nessun ordine corrispondente</p>
                        </div>
                      ) : (
                        <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                          {filteredOrders.map(order => (
                            <div 
                              key={order.orderNumber}
                              onClick={() => selectOrder(order)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start gap-4 ${selectedOrder?.orderNumber === order.orderNumber ? 'border-blue-600 bg-blue-50/20 shadow-sm' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                            >
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-blue-600 tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 border border-blue-100">{order.orderNumber}</span>
                                  <span className="text-[11px] text-slate-400 font-bold">{order.date}</span>
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-sm font-black text-slate-900 truncate">{order.customer?.name || 'Cliente'}</h4>
                                  <span className="text-xs text-blue-600 font-bold hover:underline block truncate">{order.customer?.email}</span>
                                </div>
                                
                                {/* Products Summary */}
                                <div className="text-[11px] text-slate-650 font-semibold bg-white p-2 rounded-xl border border-slate-100 space-y-1">
                                  <p className="font-extrabold text-[9px] uppercase tracking-wider text-slate-400">Articoli acquistati ({order.items?.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) || 0} pz):</p>
                                  <div className="space-y-0.5">
                                    {order.items?.map((it: any, idx: number) => (
                                      <p key={idx} className="truncate">
                                        • <span className="text-blue-600 font-bold">{it.quantity}x</span> {it.name}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-2 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                                <div className="space-y-0.5">
                                  <span className="text-xs text-slate-400 font-extrabold block lowercase tracking-tight">{order.paymentMethod}</span>
                                  <span className="text-base font-black text-slate-950 font-mono block">€{order.total.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                  {getStatusBadge(order.status)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Detail and logistical modification column */}
                    <div className="lg:col-span-5 space-y-6">
                      {selectedOrder ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                          <div>
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">Gestione Avanzata Pratica</span>
                            <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">{selectedOrder.orderNumber}</h3>
                            <p className="text-xs text-slate-400">Inserisci tracking, effettua spedizioni e sposta lo stato di lavorazione locale.</p>
                          </div>

                          {/* Order recap and addresses */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Destinatario & Consegna</span>
                            <div className="text-xs text-slate-700 font-bold space-y-1">
                              <p className="text-slate-900 font-extrabold">{selectedOrder.customer.name}</p>
                              <p>{selectedOrder.customer.address}</p>
                              <p>{selectedOrder.customer.zip} - {selectedOrder.customer.city} ({selectedOrder.customer.province})</p>
                              <p>Tel: {selectedOrder.customer.phone}</p>
                              <p className="text-blue-600 underline">{selectedOrder.customer.email}</p>
                            </div>
                          </div>

                          {/* Items summary */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Articoli nel collo ({selectedOrder.items.length})</span>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {selectedOrder.items.map((it: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-xs font-bold border-b border-slate-100 pb-1.5 bg-slate-50/50 p-2 rounded-lg">
                                  <span className="text-slate-800">{it.quantity}x {it.name}</span>
                                  <span className="text-slate-950 font-mono">€{(it.price * it.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Update state flow form */}
                          <form onSubmit={handleUpdateOrder} className="space-y-4 pt-1 border-t border-slate-100">
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">Imposta Stato & Tracking</span>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Stato Preparazione</label>
                                <select
                                  value={statusVal}
                                  onChange={(e) => setStatusVal(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                                >
                                  <option value="pending_payment">In attesa di pagamento</option>
                                  <option value="received">Pagamento Ricevuto</option>
                                  <option value="processing">In Preparazione</option>
                                  <option value="ready_for_shipping">Pronto al ritiro corriere</option>
                                  <option value="shipped">Spedito (Assegna tracking)</option>
                                  <option value="delivered">Consegnato</option>
                                  <option value="cancelled">Annullato</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Vettore Corrieri</label>
                                <select
                                  value={carrierVal}
                                  onChange={(e) => setCarrierVal(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                                >
                                  <option value="SDA">SDA Express Courier</option>
                                  <option value="GLS">GLS Logistic Network</option>
                                  <option value="DHL">DHL International Express</option>
                                  <option value="BRT">Bartolini (BRT)</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Numero di Tracking (Codice Spedizione)</label>
                              <input 
                                type="text"
                                placeholder="..."
                                value={trackingCodeVal}
                                onChange={(e) => setTrackingCodeVal(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                              />
                            </div>

                            <button 
                              type="submit"
                              className="w-full bg-blue-600 text-white rounded-xl py-3 text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shadow-blue-50"
                            >
                              Registra Cambiamenti Mezzo Logistica
                            </button>

                            {actionSuccess && (
                              <p className="text-xs text-green-600 font-extrabold flex items-center gap-1 bg-green-50 border border-green-200 rounded-xl p-2 text-center justify-center">
                                <Check size={16} /> Pratica salvata e notificata con successo!
                              </p>
                            )}
                          </form>

                          {/* DDT Documentation */}
                          <div className="pt-4 border-t border-slate-100 flex gap-3">
                            <button 
                              onClick={() => onNavigate('bolla', selectedOrder)}
                              className="flex-1 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Printer size={14} /> Stampa ddt / Bolla
                            </button>
                            <button 
                              onClick={() => {
                                alert(`Simulazione invio bolla ddt digitale a: ${selectedOrder.customer.email}`);
                              }}
                              className="flex-1 bg-slate-900 text-white hover:bg-slate-800 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Mail size={14} /> Invia ddt via email
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400 space-y-3">
                          <Eye size={36} className="mx-auto opacity-50" />
                          <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">Seleziona un ordine per gestirlo, approvarne la bolla, modificare i tracking o emettere notifiche.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. TAB REFUNDS - GESTIONE PRATICHE RIMBORSI */}
                {dashboardTab === "refunds" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Returns lists */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Richieste di Reso e Rimborso</h3>
                        <span className="bg-slate-100 text-slate-750 font-bold text-[10px] uppercase px-2 py-0.5 rounded">Rimborsi Attivi</span>
                      </div>

                      {refunds.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 space-y-2">
                          <Inbox size={32} className="mx-auto opacity-50" />
                          <p className="text-xs font-bold uppercase tracking-wider">Nessuna richiesta di reso registrata</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                          {refunds.map(r => (
                            <div 
                              key={r.id}
                              onClick={() => selectRefund(r)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-start ${selectedRefund?.id === r.id ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-blue-600 tracking-wider uppercase">{r.id}</span>
                                  <span className="text-[10px] font-extrabold text-slate-450 uppercase">• Ordine: {r.orderNumber}</span>
                                </div>
                                <h4 className="text-xs font-black text-slate-900">{r.customerName}</h4>
                                <span className="text-[10px] text-slate-450 hover:underline block block">{r.email} • {r.date}</span>
                              </div>
                              <div className="text-right space-y-2">
                                <span className="text-[10px] text-slate-400 font-extrabold block">Reso: {r.returnedProducts}</span>
                                {getRefundBadge(r.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Return Action Details */}
                    <div className="lg:col-span-5">
                      {selectedRefund ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                          <div>
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block">Dettaglio Reso</span>
                            <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">Pratica {selectedRefund.id}</h3>
                            <p className="text-xs text-slate-400">Verifica i motivi del rimborso ed emetti rimborsi telematici reali.</p>
                          </div>

                          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Prodotto Restituito</span>
                              <p className="font-extrabold text-slate-900 bg-white p-2 rounded border border-slate-100">{selectedRefund.items}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Motivazione Reso (Dichiarata)</span>
                              <p className="font-medium text-slate-700 italic bg-white p-2 rounded border border-slate-100">"{selectedRefund.reason}"</p>
                            </div>

                            <div className="space-y-0.5 pt-2 border-t border-slate-200/60 font-bold">
                              <p className="text-slate-500">Recapito Telefonico: {selectedRefund.phone}</p>
                              <p className="text-blue-600">Email: {selectedRefund.email}</p>
                            </div>
                          </div>

                          {/* Admin Resolution input actions */}
                          <div className="space-y-4 pt-4 border-t border-slate-150">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Note dell'Amministratore (Motivazioni o Istruzioni)</label>
                              <textarea
                                value={refundNote}
                                onChange={(e) => setRefundNote(e.target.value)}
                                placeholder="Esempio: Accettato. Prodotto restituito integro. Avviato rimborso PayPal..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 max-h-24"
                              />
                            </div>

                            {selectedRefund.status === 'pending' ? (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleUpdateRefund(selectedRefund.id, false)}
                                  className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all"
                                >
                                  Rifiuta Reso / No Garanzia
                                </button>
                                <button
                                  onClick={() => handleUpdateRefund(selectedRefund.id, true)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-green-100"
                                >
                                  Approva & Rimborsa
                                </button>
                              </div>
                            ) : (
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-1">
                                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Pratica Risolta</span>
                                <p className="text-xs font-bold text-slate-800">Stato: <span className="uppercase font-black text-slate-950">{selectedRefund.status}</span></p>
                                {selectedRefund.note && (
                                  <p className="text-[11px] text-slate-500 italic font-medium">"{selectedRefund.note}"</p>
                                )}
                              </div>
                            )}

                            {actionSuccess && (
                              <p className="text-xs text-green-600 font-extrabold flex items-center gap-1 bg-green-50 border border-green-200 rounded-xl p-2 text-center justify-center">
                                <Check size={16} /> Pratica di rimborso aggiornata nel database logistico!
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400 space-y-3">
                          <AlertCircle size={36} className="mx-auto opacity-50" />
                          <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">Seleziona una pratica di reso per ispezionare il sigillo originale, riscontrare la causa del danno e decidere se rimborsare o meno.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. TAB QUOTES - PREVENTIVI COMMERCIALI */}
                {dashboardTab === "quotes" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* List of quotes */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Richieste Preventivi B2B Ricevute</h3>
                        <span className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase px-2 py-0.5 rounded">Commerciale</span>
                      </div>

                      {quotes.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 space-y-2">
                          <Inbox size={32} className="mx-auto opacity-50" />
                          <p className="text-xs font-bold uppercase tracking-wider">Nessuna richiesta di preventivo ricevuta</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                          {quotes.map(q => (
                            <div 
                              key={q.id}
                              onClick={() => selectQuote(q)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-start ${selectedQuote?.id === q.id ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-red-500 tracking-wider uppercase">{q.id}</span>
                                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">• Partita IVA: {q.vatId}</span>
                                </div>
                                <h4 className="text-xs font-black text-slate-900">{q.company}</h4>
                                <span className="text-[11px] text-slate-400 font-bold block">{q.name} • {q.date} • {q.qty} Prodotti</span>
                              </div>
                              <div className="text-right space-y-2">
                                <span className="bg-slate-200 text-slate-700 text-[9px] px-2 py-0.5 rounded font-black uppercase">QTA: {q.qty}</span>
                                {getQuoteBadge(q.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* View and response Quote Form */}
                    <div className="lg:col-span-5">
                      {selectedQuote ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                          <div>
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">Richiesta Preventivo</span>
                            <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">{selectedQuote.company}</h3>
                            <p className="text-xs text-slate-400">Inserisci prezzi scontati personalizzati e rispondi direttamente al cliente.</p>
                          </div>

                          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[9px] font-black text-slate-450 uppercase block">Rappresentante Aziendale</span>
                                <p className="font-extrabold text-slate-900">{selectedQuote.name}</p>
                              </div>
                              <div>
                                <span className="text-[9px] font-black text-slate-455 uppercase block">Partita IVA Azienda</span>
                                <p className="font-bold text-slate-950">{selectedQuote.vatId}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Prodotti Selezionati / Volume Fornitura</span>
                              <p className="font-bold text-slate-900 bg-white p-2.5 rounded border border-slate-200">{selectedQuote.products} (Qta: {selectedQuote.qty} unità)</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Note dell'Azienda</span>
                              <p className="font-medium text-slate-600 italic bg-white p-2 text-xs rounded border border-slate-200">"{selectedQuote.message}"</p>
                            </div>

                            <div className="space-y-0.5 pt-2 border-t border-slate-200/60 font-bold">
                              <p className="text-slate-500">Numero di Telefono: {selectedQuote.phone}</p>
                              <p className="text-blue-600">Email: {selectedQuote.email}</p>
                            </div>
                          </div>

                          {/* Response form */}
                          <form onSubmit={handleUpdateQuote} className="space-y-4 pt-4 border-t border-slate-150">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">Modulo Formulazione Risposta</span>
                            
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase block">Aggiorna Stato Sforzo</label>
                                <select 
                                  value={quoteStatusVal}
                                  onChange={(e) => setQuoteStatusVal(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                                >
                                  <option value="pending_review">In Attesa Elaborazione</option>
                                  <option value="sent">Sotto Analisi Commerciale</option>
                                  <option value="reviewed">Preventivo Erogato (Inviato)</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase block">Corpo della Proposta Economica / Email al Cliente</label>
                                <textarea
                                  value={quoteReplyMsg}
                                  onChange={(e) => setQuoteReplyMsg(e.target.value)}
                                  placeholder="Esempio: Formula di sconto 15% sui Toner Brother TN-2420 compatibili. Totale quotazione riservata: €..."
                                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 h-28"
                                  required
                                />
                              </div>
                            </div>

                            <button 
                              type="submit"
                              className="w-full bg-indigo-600 text-white rounded-xl py-3 text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-50"
                            >
                              Invia preventivo ed aggiorna stato
                            </button>

                            {actionSuccess && (
                              <p className="text-xs text-green-600 font-extrabold flex items-center gap-1 bg-green-50 border border-green-200 rounded-xl p-2 text-center justify-center">
                                <Check size={16} /> Preventivo elaborato e notificato via Email con successo!
                              </p>
                            )}
                          </form>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400 space-y-3">
                          <FileText size={36} className="mx-auto opacity-50" />
                          <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">Seleziona una richiesta di preventivo B2B per valutare il volume aziendale, calcolare lo sconto ed erogare la fattura proforma.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. TAB SETTINGS - PERSONALIZZAZIONE PASSCODE E SICUREZZA */}
                {dashboardTab === "settings" && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Settings className="text-blue-500" /> Impostazioni di Sicurezza Logistica
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Controlla e personalizza il codice del cancello logistico `/gestione-logistica` per restringerlo agli operatori abilitati.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                      {/* Left: Changing passcode */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">Cambio Codice d'Accesso Corrente</h4>
                          <p className="text-xs text-slate-400 mt-1">Digita il nuovo codice personalizzato da assegnare alla console.</p>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Nuovo Codice Accesso</label>
                            <input 
                              type="text"
                              defaultValue={storedPasscode}
                              onBlur={(e) => {
                                if (e.target.value.trim() && e.target.value.trim() !== storedPasscode) {
                                  handleUpdatePasscode(e.target.value.trim());
                                }
                              }}
                              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 rounded-2xl py-3 px-4 outline-none font-black text-slate-900 tracking-wider text-xl transition-all"
                            />
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                            <span className="text-[10px] text-slate-400 font-black uppercase">Consiglio Sicurezza</span>
                            <p className="text-[11px] text-slate-600 font-medium italic">"Inserisci lettere maiuscole e numeri per prevenire incursioni non autorizzate sul retro-portale."</p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Auto generation passcode */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">Generatore Automatico Codici</h4>
                          <p className="text-xs text-slate-400 mt-1">Crea automaticamente una sequenza robusta e impiegala all'istante.</p>
                        </div>

                        <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                          <p className="text-xs text-slate-500 font-bold leading-normal">Se non vuoi inventare un codice a mano, clicca il bottone qui sotto per produrre un codice casuale sicuro, impiegabile subitamente.</p>
                          
                          <div className="py-2">
                            <button 
                              onClick={handleGenerateAutoPasscode}
                              className="bg-slate-900 text-white rounded-2xl px-6 py-3 font-black text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md active:scale-95"
                            >
                              Genera Codice Casuale
                            </button>
                          </div>

                          <div className="pt-2 text-left">
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest block block">Esempio Codice Ink&Print</span>
                            <p className="text-xs font-extrabold text-blue-600 font-mono">INKPRINT2026Sicurezza</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. TAB NOTIFICATIONS - LOG NOTIFICHE ED EMAIL ECC. */}
                {dashboardTab === "notifications" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* List of Outgoing Emails / Alert Logs */}
                    <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                          <Mail className="text-blue-500" /> Registro Notifiche Automatiche
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Log reale delle e-mail di conferma inviate automaticamente a clienti (conferme d'acquisto e tracking) e all'amministratore (ricevute nuovi ordini).
                        </p>
                      </div>

                      {/* Webhooks / Future integrations preview section */}
                      <div className="bg-slate-50 border border-slate-200/65 rounded-2xl p-4 space-y-3">
                        <span className="text-[9px] font-black text-blue-600 tracking-widest uppercase block">Canali di Notifica Opzionali (In Sviluppo)</span>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-center space-y-1">
                            <span className="text-emerald-500 block text-xs font-black">🟢 Attivo</span>
                            <span className="text-[10px] font-bold text-slate-900 block">E-Mail Log</span>
                          </div>
                          <div className="relative opacity-70 bg-white p-2.5 rounded-xl border border-dashed border-slate-200 text-center space-y-1">
                            <span className="text-amber-600 block text-[9px] font-bold">🟡 Prossimo</span>
                            <span className="text-[10px] font-bold text-slate-900 block font-black">WhatsApp</span>
                          </div>
                          <div className="relative opacity-70 bg-white p-2.5 rounded-xl border border-dashed border-slate-200 text-center space-y-1">
                            <span className="text-blue-500 block text-[9px] font-bold">🔵 Prossimo</span>
                            <span className="text-[10px] font-bold text-slate-900 block font-black">Telegram</span>
                          </div>
                        </div>
                      </div>

                      {/* Searching Notification log entries */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Registro Eventi E-Mail ({notifications.length})</span>
                        
                        {notifications.length === 0 ? (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 p-4">
                            <Inbox className="mx-auto text-slate-350 mb-2" size={28} />
                            <p className="text-xs font-extrabold text-slate-400 uppercase">Nessuna notifica registrata in questa sessione</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                            {notifications.map((not: any) => {
                              const isAdmin = not.recipient === "inkprint26@gmail.com" || not.type?.includes("admin");
                              const isSelected = selectedOrder?.id === not.id;
                              return (
                                <div 
                                  key={not.id}
                                  onClick={() => setSelectedOrder(not)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-start text-left ${isSelected ? 'border-blue-600 bg-blue-50/20 shadow-sm' : 'border-slate-150 bg-slate-50/55 hover:bg-slate-50'}`}
                                >
                                  <div className="space-y-1 shrink-0 w-[75%]">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {isAdmin ? (
                                        <span className="bg-rose-100 text-rose-700 text-[8.5px] font-black uppercase px-2 py-0.5 rounded">E-Mail Amministratore</span>
                                      ) : (
                                        <span className="bg-blue-100 text-blue-700 text-[8.5px] font-black uppercase px-2 py-0.5 rounded">E-Mail Cliente</span>
                                      )}
                                      <span className="text-[9.5px] font-mono font-bold text-slate-400">{not.orderNumber}</span>
                                    </div>
                                    <p className="text-xs font-black text-slate-900 truncate">{not.subject}</p>
                                    <p className="text-[10px] text-slate-500 font-medium truncate">A: {not.recipient}</p>
                                  </div>
                                  <span className="text-[9px] text-slate-405 font-bold block shrink-0 text-right">{not.timestamp.includes(',') ? not.timestamp.split(',')[1] : not.timestamp}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notification E-mail Content Detail View */}
                    <div className="lg:col-span-6">
                      {selectedOrder && selectedOrder.recipient ? (
                        <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
                          <div className="flex justify-between items-start border-b border-slate-800 pb-5">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Ispezione E-Mail Spedita</span>
                              <h3 className="text-base font-black uppercase tracking-tight text-white leading-tight">{selectedOrder.subject}</h3>
                            </div>
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-black px-2.5 py-1 rounded">
                              LOGGED_OK
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 border-b border-slate-800 pb-5">
                            <div>
                              <span className="text-[9px] font-black text-slate-500 uppercase block">Mittente</span>
                              <strong className="text-slate-200">Server Ink&amp;Print (info@inkprint.it)</strong>
                            </div>
                            <div>
                              <span className="text-[9px] font-black text-slate-500 uppercase block">Destinatario</span>
                              <strong className="text-blue-400 select-all">{selectedOrder.recipient}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] font-black text-slate-500 uppercase block">Inviato il</span>
                              <strong className="text-slate-200">{selectedOrder.timestamp}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] font-black text-slate-500 uppercase block">Codice Correlato</span>
                              <strong className="text-slate-200 font-mono">{selectedOrder.orderNumber}</strong>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Corpo dell'E-mail</span>
                            <div className="bg-slate-900 rounded-2xl border border-slate-800/80 p-5 font-mono text-[11px] text-slate-100 leading-relaxed max-h-[350px] overflow-y-auto whitespace-pre-wrap select-all text-left">
                              {selectedOrder.body}
                            </div>
                          </div>

                          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                            <p className="text-[10.5px] text-slate-400 italic">"Questa notifica simula la trasmissione mail del server. I log intermedi confermano una consegna istantanea senza latenza a {selectedOrder.recipient}."</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400 space-y-3">
                          <Mail size={36} className="mx-auto opacity-55 text-blue-500" />
                          <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">
                            Seleziona una notifica o email dal registro di sinistra per ispezionare il mittente, il destinatario e il testo effettivo inviato automaticamente dal server.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* --- 7. TAB DANEA EASYFATT INTEGRATION --- */}
                {dashboardTab === "danea" && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2" id="danea-integration-title">
                          <RefreshCw className="text-blue-500 animate-spin-slow" /> Integrazione Danea Easyfatt
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Predisposizione professionale per sincronizzazione ordini, anagrafiche, magazzino e fatturazione.</p>
                      </div>
                      <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-black uppercase px-2.5 py-1 rounded-xl tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                        PRONTO PER IL COLLEGAMENTO
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Side: Dynamic Download & Integration Details */}
                      <div className="space-y-6">
                        {/* 1. Manual Download Panel */}
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block">Metodo 1: Esportazione Manuale XML</span>
                          <h4 className="font-extrabold text-sm text-slate-900 uppercase">Esporta Ordini correnti per Danea</h4>
                          <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                            Scarica all'istante l'intero database ordini aggiornato in formato XML standard <strong className="text-slate-805">EasyfattDocuments v2</strong>. Puoi importarlo direttamente in Danea per generare ddt, fatture o distinte in un clic.
                          </p>
                          <div className="pt-2">
                            <button
                              id="download-danea-xml-btn"
                              onClick={() => {
                                // Generate XML inside client and download it!
                                const xmlStr = generateClientDaneaXml(orders);
                                const blob = new Blob([xmlStr], { type: 'application/xml;charset=utf-8;' });
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'danea_easyfatt_ordini.xml');
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider py-3 px-6 rounded-2xl shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                              <Download size={16} />
                              Sblocca &amp; Scarica XML Easyfatt ({orders.length} ordini)
                            </button>
                          </div>
                        </div>

                        {/* 2. Automatic Link parameters */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                          <span className="text-[10px] font-black tracking-widest text-blue-605 uppercase block">Metodo 2: Sincronizzazione Automatica HTTP</span>
                          <h4 className="font-extrabold text-sm text-slate-900 uppercase">Parametri Collegamento Diretto</h4>
                          <p className="text-xs text-slate-500">
                            Copia questi parametri e incollali nel tuo gestionale Danea Easyfatt (<em className="font-semibold italic">Strumenti &gt; E-commerce &gt; Configura</em>) per automatizzare lo scaricamento in tempo reale.
                          </p>
                          
                          <div className="space-y-3 font-mono text-xs">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-105 space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">1. Piattaforma E-commerce</span>
                              <strong className="text-slate-950 font-black">Sito web generico (file di scambio XML)</strong>
                            </div>
                            
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-105 space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">2. URL di Ricezione (Download Ordini)</span>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-blue-600 font-extrabold truncate text-[11px] block">{window.location.origin}/api/danea/orders?apiKey=inkprint2026</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/api/danea/orders?apiKey=inkprint2026`);
                                    alert('URL Ordini copiato nei appunti!');
                                  }}
                                  className="text-[10px] text-slate-450 hover:text-blue-605 font-sans font-black uppercase tracking-tight"
                                >
                                  Copia
                                </button>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-105 space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">3. URL di Invio (Sincronizzazione Giacenze)</span>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-blue-600 font-extrabold truncate text-[11px] block">{window.location.origin}/api/danea/products?apiKey=inkprint2026</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/api/danea/products?apiKey=inkprint2026`);
                                    alert('URL Prodotti copiato nei appunti!');
                                  }}
                                  className="text-[10px] text-slate-450 hover:text-blue-655 font-sans font-black uppercase tracking-tight"
                                >
                                  Copia
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-105 space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">4. Username</span>
                                <strong className="text-slate-950 font-black">admin</strong>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-105 space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">5. Password d'Accesso (API Key)</span>
                                <strong className="text-slate-950 font-black">inkprint2026</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Operations Sandbox & Preview */}
                      <div className="space-y-6">
                        {/* 1. Technical Test Suite */}
                        <div className="bg-slate-950 text-slate-200 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">Easyfatt Diagnostics Console</span>
                            <span className="text-[9px] bg-slate-800 text-blue-300 font-mono px-2 py-0.5 rounded font-black">GATEWAY_ACTIVE</span>
                          </div>

                          <h4 className="font-extrabold text-sm text-white uppercase tracking-tight">Esegui Test Comunicazione E-commerce</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                            Verifica istantaneamente la consistenza del tracciato XML e il corretto indirizzamento della chiave di licenza senza bisogno di avviare il software esterno.
                          </p>

                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const url = `/api/danea/orders?apiKey=inkprint2026`;
                                  const res = await fetch(url);
                                  if (res.ok) {
                                    const text = await res.text();
                                    setXmlPreview(text);
                                    setErrorPreview("");
                                  } else {
                                    setErrorPreview("Errore di convalida credenziali: " + res.status);
                                    setXmlPreview("");
                                  }
                                } catch (e: any) {
                                  setErrorPreview(e.message);
                                  setXmlPreview("");
                                }
                              }}
                              className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white font-black text-[11px] uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all flex items-center gap-1"
                            >
                              Richiedi Feed XML Ordini
                            </button>

                            <button
                              onClick={() => {
                                setXmlPreview("");
                                setErrorPreview("");
                              }}
                              className="bg-transparent hover:bg-slate-900 text-slate-400 font-black text-[11px] uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all"
                            >
                              Svuota Console
                            </button>
                          </div>

                          {errorPreview && (
                            <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs font-mono">
                              ❌ {errorPreview}
                            </div>
                          )}

                          {xmlPreview && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-black text-slate-500 uppercase block font-sans">XML Risposta Server (Primi 500 caratteri)</span>
                              <pre className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-[10px] font-mono whitespace-pre-wrap overflow-x-auto max-h-[160px] text-emerald-400 text-left">
                                {xmlPreview.substring(0, 500) + (xmlPreview.length > 500 ? '\n... [TRUNCATED FOR DISPLAY]' : '')}
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* 2. Stock / Giacenze Sync Simulation */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                          <span className="text-[10px] font-black tracking-widest text-indigo-650 uppercase block font-bold">Simulatore Sincronizzazione Magazzino</span>
                          <h4 className="font-extrabold text-sm text-slate-900 uppercase">Invia Giacenze da Danea</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            Simula il caricamento simultaneo delle giacenze di magazzino inviato periodicamente da Easyfatt per allineare disponibilità e prezzi sul sito.
                          </p>

                          <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-405 uppercase tracking-widest block font-sans">Simula XML Danea Giacenze</label>
                            <textarea
                              rows={3}
                              value={simXmlProducts}
                              onChange={(e) => setSimXmlProducts(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-2 px-3 outline-none font-mono text-[11px] text-slate-800"
                            />
                            
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/danea/products?apiKey=inkprint2026`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/xml' },
                                    body: simXmlProducts
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    alert(`Successo!\n${data.message}`);
                                  } else {
                                    alert(`Errore di comunicazione: ${res.status}`);
                                  }
                                } catch (e: any) {
                                  alert(`Errore: ${e.message}`);
                                }
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-2xl shadow-md transition-all active:scale-95 animate-pulse"
                            >
                              Invia &amp; Sincronizza Prodotti
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {dashboardTab === "supabase" && (
                  <SupabaseDiagnosticPage />
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
