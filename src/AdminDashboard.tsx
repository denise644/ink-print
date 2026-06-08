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
  
  const [dashboardTab, setDashboardTab] = useState<"overview" | "orders" | "refunds" | "quotes" | "settings" | "notifications" | "danea">("overview");
  const [xmlPreview, setXmlPreview] = useState<string>("");
  const [errorPreview, setErrorPreview] = useState<string>("");
  const [simXmlProducts, setSimXmlProducts] = useState<string>(
    `<?xml version="1.0" encoding="utf-8"?>\n<EasyfattProducts Version="2">\n  <Products>\n    <Product>\n      <Code>tn2420-bk</Code>\n      <Qty>95</Qty>\n      <Price1>12.90</Price1>\n    </Product>\n  </Products>\n</EasyfattProducts>`
  );
  const [loading, setLoading] = useState(true);
  
  // PrestaShop states
  const [psActive, setPsActive] = useState(true);
  const [psUrl, setPsUrl] = useState("https://esempio-prestashop.it/api");
  const [psApiKey, setPsApiKey] = useState("PS_89ab32cdef101234567890abcdef1231");
  const [psLastProducts, setPsLastProducts] = useState("Nessuna sincronizzazione");
  const [psLastOrders, setPsLastOrders] = useState("Nessuna sincronizzazione");
  const [isPsSyncing, setIsPsSyncing] = useState(false);
  const [psLogs, setPsLogs] = useState<string[]>([
    "[04/06/2026 09:10] Nodo PrestaShop inizializzato",
    "[04/06/2026 09:30] Allineati 12 toner compatibili con codice SKU"
  ]);

  // CSV Catalog import states
  const [csvFeedback, setCsvFeedback] = useState("");
  const [isCsvUploading, setIsCsvUploading] = useState(false);
  const [successCsvCount, setSuccessCsvCount] = useState<number | null>(null);
  const [syncSubTab, setSyncSubTab] = useState<"danea" | "prestashop" | "csv">("danea");

  // Image Mapping CSV states
  const [imageCsvFeedback, setImageCsvFeedback] = useState("");
  const [isImageCsvUploading, setIsImageCsvUploading] = useState(false);
  const [successImageCount, setSuccessImageCount] = useState<number | null>(null);

  // Pre-deploy physical audit checklist states
  const [checkedHosting, setCheckedHosting] = useState(false);
  const [checkedPrestashop, setCheckedPrestashop] = useState(false);
  const [checkedEasyfatt, setCheckedEasyfatt] = useState(false);
  const [checkedEasyPrestaModule, setCheckedEasyPrestaModule] = useState(false);


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
  
  // Interactive quote editor state variables
  const [quoteItems, setQuoteItems] = useState<{ id: string; name: string; quantity: number; price: number }[]>([]);
  const [quoteNumber, setQuoteNumber] = useState("22026-001");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDocType, setShowDocType] = useState<"preventivo" | "ddt" | "conferma_ordine" | null>(null);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSendResult, setEmailSendResult] = useState("");

  // Editable customer states for active B2B quote
  const [qName, setQName] = useState("");
  const [qCompany, setQCompany] = useState("");
  const [qEmail, setQEmail] = useState("");
  const [qPhone, setQPhone] = useState("");
  const [qVatId, setQVatId] = useState("");

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

      // Fetch PrestaShop configuration
      const psRes = await fetch("/api/prestashop/config");
      if (psRes.ok) {
        const psData = await psRes.json();
        setPsActive(psData.active);
        setPsUrl(psData.webserviceUrl);
        setPsApiKey(psData.apiKey);
        setPsLastProducts(psData.lastSyncProducts);
        setPsLastOrders(psData.lastSyncOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrestaShopConfig = async () => {
    try {
      const res = await fetch("/api/prestashop/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          active: psActive,
          webserviceUrl: psUrl,
          apiKey: psApiKey
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPsLogs(prev => [
          `[${new Date().toLocaleString('it-IT')}] Configurazione PrestaShop aggiornata e convalidata con successo!`,
          ...prev
        ]);
        alert(data.message || "Configurazione salvata con successo!");
      } else {
        alert("Errore nel salvataggio della configurazione.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Errore: " + e.message);
    }
  };

  const handleSyncPrestaShopProducts = async () => {
    setIsPsSyncing(true);
    try {
      const res = await fetch("/api/prestashop/sync-products", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPsLastProducts(data.timestamp);
        setPsLogs(prev => [
          `[${data.timestamp}] Sincronizzazione Catalogo: ${data.message}`,
          ...prev
        ]);
        alert(data.message);
      } else {
        alert("Errore sincronizzazione catalogo.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Errore: " + e.message);
    } finally {
      setIsPsSyncing(false);
    }
  };

  const handleSyncPrestaShopOrders = async () => {
    setIsPsSyncing(true);
    try {
      const res = await fetch("/api/prestashop/sync-orders", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPsLastOrders(data.timestamp);
        setPsLogs(prev => [
          `[${data.timestamp}] Sincronizzazione Ordini: ${data.message}`,
          ...prev
        ]);
        alert(data.message);
      } else {
        alert("Errore sincronizzazione ordini.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Errore: " + e.message);
    } finally {
      setIsPsSyncing(false);
    }
  };

  const handleCsvFileChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsCsvUploading(true);
    setCsvFeedback("");
    setSuccessCsvCount(null);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setCsvFeedback("× Impossibile leggere il file CSV.");
        setIsCsvUploading(false);
        return;
      }
      
      try {
        const res = await fetch("/api/products/import-csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvText: text })
        });
        
        if (res.ok) {
          const d = await res.json();
          if (d.success) {
            setSuccessCsvCount(d.updatedCount);
            setCsvFeedback(`✓ Sincronizzazione Catalogo completata! Aggiornati correttamente ${d.updatedCount} prodotti.`);
            setPsLogs(prev => [
              `[${new Date().toLocaleString('it-IT')}] Importazione CSV: Caricati ed aggiornati ${d.updatedCount} prodotti.`,
              ...prev
            ]);
          } else {
            setCsvFeedback(`× Errore nell'elaborazione: ${d.error || "Formato non idoneo"}`);
          }
        } else {
          const errorData = await res.json();
          setCsvFeedback(`× Errore server: ${errorData.error || "Impossibile allineare i dati"}`);
        }
      } catch (error: any) {
        setCsvFeedback(`× Errore connessione: ${error.message}`);
      } finally {
        setIsCsvUploading(false);
      }
    };
    
    reader.readAsText(file);
  };

  const handleImageCsvFileChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImageCsvUploading(true);
    setImageCsvFeedback("");
    setSuccessImageCount(null);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setImageCsvFeedback("× Impossibile leggere il file CSV.");
        setIsImageCsvUploading(false);
        return;
      }
      
      try {
        const res = await fetch("/api/products/import-images-csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvText: text })
        });
        
        if (res.ok) {
          const d = await res.json();
          if (d.success) {
            setSuccessImageCount(d.mappedCount);
            setImageCsvFeedback(`✓ Mappatura Immagini completata! Collegati ${d.mappedCount} prodotti.`);
            setPsLogs(prev => [
              `[${new Date().toLocaleString('it-IT')}] Importazione Immagini CSV: Allineate ${d.mappedCount} immagini.`,
              ...prev
            ]);
          } else {
            setImageCsvFeedback(`× Errore nell'elaborazione: ${d.error || "Formato non idoneo"}`);
          }
        } else {
          const errorData = await res.json();
          setImageCsvFeedback(`× Errore server: ${errorData.error || "Impossibile allineare i dati"}`);
        }
      } catch (error: any) {
        setImageCsvFeedback(`× Errore connessione: ${error.message}`);
      } finally {
        setIsImageCsvUploading(false);
      }
    };
    
    reader.readAsText(file);
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

  // Full update for customer details, custom items, and status of active B2B quote
  const handleUpdateQuote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedQuote) return;
    
    try {
      const quoteId = selectedQuote.id;
      const path = `b2b_requests/${quoteId}`;
      const fsStatus = quoteStatusVal === 'pending_review' ? 'pending' : quoteStatusVal;

      await updateDoc(doc(db, 'b2b_requests', quoteId), {
        name: qName,
        company: qCompany,
        email: qEmail,
        phone: qPhone,
        vatId: qVatId,
        quoteNumber,
        items: quoteItems,
        status: fsStatus,
        adminInternalNote: quoteReplyMsg,
        updatedAt: serverTimestamp()
      });

      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 3000);
      
      setSelectedQuote({
        ...selectedQuote,
        name: qName,
        company: qCompany,
        email: qEmail,
        phone: qPhone,
        vatId: qVatId,
        quoteNumber,
        items: quoteItems,
        status: quoteStatusVal,
        adminInternalNote: quoteReplyMsg
      });
      alert("✅ Modifiche al preventivo salvate correttamente nel database Firestore!");
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `b2b_requests/${selectedQuote.id}`);
    }
  };

  // Convert Quote to Active Order inside backend API and Firestore
  const handleConvertToOrder = async () => {
    if (!selectedQuote) return;
    
    // Calculate total
    const subtotal = quoteItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const iva = subtotal * 0.22;
    const finalTotal = subtotal + iva;
    
    // Format new consecutive order number
    const newOrderNumber = `IK-${10000 + orders.length + 1}`;
    
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      date: new Date().toLocaleDateString('it-IT'),
      customer: {
        name: qName,
        email: qEmail,
        phone: qPhone,
        address: "Sede Legale B2B " + (qCompany || "Privato"),
        city: "Milano",
        zip: "20100",
        province: "MI",
        piva: qVatId
      },
      items: quoteItems.map((item, idx) => ({
        id: `ord-item-${idx}`,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: "https://www.framatek.com/2270-thickbox_default/cartuccia-compatibile-epson-t-603-xl-bk.jpg"
      })),
      total: Number(finalTotal.toFixed(2)),
      paymentMethod: `Fattura Differita B2B - Riferimento Preventivo ${quoteNumber}`,
      shippingMethod: "Corriere Espresso Bartolini / GLS (B2B)",
      notes: `Convertito da Preventivo B2B numero: ${quoteNumber}. Ordine di fornitura approvato dall'amministrazione.`,
      status: 'processing' // In lavorazione
    };
    
    try {
      // 1. Submit order to backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      
      if (!response.ok) {
        throw new Error("Errore nel carosello ordini del server.");
      }
      
      // 2. Set quote status to "accepted" (Accettato) in Firestore
      const quoteId = selectedQuote.id;
      await updateDoc(doc(db, 'b2b_requests', quoteId), {
        name: qName,
        company: qCompany,
        email: qEmail,
        phone: qPhone,
        vatId: qVatId,
        quoteNumber,
        items: quoteItems,
        status: 'accepted', // Accettato
        updatedAt: serverTimestamp()
      });
      
      // Update UI
      setSelectedQuote((prev: any) => ({
        ...prev,
        status: 'accepted',
        name: qName,
        company: qCompany,
        email: qEmail,
        phone: qPhone,
        vatId: qVatId,
        quoteNumber,
        items: quoteItems
      }));
      setQuoteStatusVal('accepted');
      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 4000);
      
      // 3. Re-fetch system orders to populate in Area Admin
      const ordersResponse = await fetch('/api/admin/orders');
      if (ordersResponse.ok) {
        const orderData = await ordersResponse.json();
        if (orderData.orders) {
          setOrders(orderData.orders);
        }
      }
      
      alert(`✅ Successo! Il preventivo ${quoteNumber} è stato convertito felicemente nell'Ordine di Fornitura ${newOrderNumber} e inserito nei sistemi di logistica!`);
    } catch (err) {
      console.error(err);
      alert("Impossibile convertire il preventivo in ordine: " + err);
    }
  };

  // Submit quote email to client via Simulated SMTP logging
  const handleSendQuoteEmail = async () => {
    if (!selectedQuote) return;
    
    setIsEmailSending(true);
    setEmailSendResult("");
    
    const subtotal = quoteItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const iva = subtotal * 0.22;
    const finalTotal = subtotal + iva;
    
    try {
      const response = await fetch('/api/quotes/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: selectedQuote.id,
          quoteNumber: quoteNumber,
          email: qEmail,
          customerName: qName,
          items: quoteItems,
          total: finalTotal
        })
      });
      
      if (!response.ok) {
        throw new Error("Errore del client mail server");
      }
      
      // Update quote status to 'reviewed' (Preventivo inviato)
      const quoteId = selectedQuote.id;
      await updateDoc(doc(db, 'b2b_requests', quoteId), {
        name: qName,
        company: qCompany,
        email: qEmail,
        phone: qPhone,
        vatId: qVatId,
        quoteNumber,
        items: quoteItems,
        status: 'reviewed', // Preventivo inviato
        updatedAt: serverTimestamp()
      });
      
      setSelectedQuote((prev: any) => ({
        ...prev,
        status: 'reviewed',
        name: qName,
        company: qCompany,
        email: qEmail,
        phone: qPhone,
        vatId: qVatId,
        quoteNumber,
        items: quoteItems
      }));
      setQuoteStatusVal('reviewed');
      
      setEmailSendResult("📧 Preventivo inviato con successo via e-mail al cliente! Trova la copia completa nel Registro Notifiche.");
      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setEmailSendResult("❌ Errore nell'invio del preventivo commerciale.");
    } finally {
      setIsEmailSending(false);
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
    setQuoteReplyMsg(q.adminInternalNote || "");
    
    // Editable customer variables
    setQName(q.name || "");
    setQCompany(q.company || "");
    setQEmail(q.email || "");
    setQPhone(q.phone || "");
    setQVatId(q.vatId || "");
    
    // Assign or generate standard quote estimate number: "2026-X"
    if (q.quoteNumber) {
      setQuoteNumber(q.quoteNumber);
    } else {
      // Find index of this quote in quotes array to assign a nice sequential index
      const idx = quotes.length - quotes.findIndex(item => item.id === q.id);
      const seqStr = String(idx > 0 ? idx : 1).padStart(3, "0");
      setQuoteNumber(`2026-${seqStr}`);
    }

    // Set interactive quote items! If the database already had items, use them; otherwise, parse from the text form.
    if (q.items && q.items.length > 0) {
      setQuoteItems(q.items);
    } else {
      // Extract quantity if possible
      let initialQty = 1;
      const parsedQty = parseInt(q.qty);
      if (!isNaN(parsedQty) && parsedQty > 0) {
        initialQty = parsedQty;
      }
      
      setQuoteItems([
        {
          id: `qi-${Date.now()}`,
          name: q.products || "Servizio / Materiale Di Consumo Stampa",
          quantity: initialQty,
          price: 15.00 // Default initial price, fully editable
        }
      ]);
    }
    
    setEmailSendResult("");
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
      case 'pending':
      case 'pending_review':
      case 'Nuovo':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded">Nuovo</span>;
      case 'reviewed':
      case 'sent':
      case 'Preventivo inviato':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded">Preventivo inviato</span>;
      case 'accepted':
      case 'Accettato':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 text-[10px] font-bold uppercase px-2 py-0.5 rounded">Accettato</span>;
      case 'processing':
      case 'In lavorazione':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded">In lavorazione</span>;
      case 'shipped':
      case 'Spedito':
        return <span className="bg-cyan-50 text-cyan-705 border border-cyan-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded">Spedito</span>;
      case 'completed':
      case 'Completato':
        return <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded">Completato</span>;
      case 'cancelled':
      case 'Annullato':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded">Annullato</span>;
      default:
        return <span className="bg-slate-50 text-slate-700 text-[10px] px-2 py-0.5 rounded">{status}</span>;
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
                    placeholder="" 
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
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 overflow-hidden shadow-sm p-1">
                  <img 
                    src="/assets/images/inkprint_new_logo_1779957051282.png" 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                  />
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
                    {/* List of B2B query requests (Col-span-4) - ID, Cliente, Data, Stato */}
                    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Richieste Consumabili B2B</h3>
                        <span className="bg-blue-50 text-blue-700 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded">Logistica</span>
                      </div>

                      {quotes.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 space-y-2 font-semibold">
                          <Inbox size={32} className="mx-auto opacity-50" />
                          <p className="text-xs uppercase tracking-wider">Nessuna richiesta ricevuta</p>
                        </div>
                      ) : (
                        <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-1">
                          {quotes.map(q => {
                            const dateObj = q.createdAt ? (q.createdAt.toDate ? q.createdAt.toDate() : new Date(q.createdAt)) : (q.date ? new Date(q.date) : new Date());
                            const dateStrForm = dateObj.toLocaleDateString('it-IT');
                            const isSel = selectedQuote?.id === q.id;
                            return (
                              <div 
                                key={q.id}
                                onClick={() => selectQuote(q)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${isSel ? 'border-indigo-600 bg-indigo-50/20 shadow-sm' : 'border-slate-150 bg-slate-50/40 hover:bg-slate-50'}`}
                              >
                                <div className="flex justify-between items-start">
                                  <span className="text-[10px] font-black text-indigo-600 tracking-wider font-mono">{q.id}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">{dateStrForm}</span>
                                </div>
                                <h4 className="text-xs font-black text-slate-950 uppercase mt-1 line-clamp-1">{q.company && q.company !== 'N/A' ? q.company : q.name}</h4>
                                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-200/50">
                                  <span className="text-[9px] text-slate-500 font-mono">Pezzi: {q.qty}</span>
                                  {getQuoteBadge(q.status)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Highly Interactive Document Generator & Work Station (Col-span-8) */}
                    <div className="lg:col-span-8">
                      {selectedQuote ? (
                        <div className="bg-white border border-slate-200 rounded-3xl shadow-md overflow-hidden text-xs">
                          {/* Workspace header */}
                          <div className="bg-slate-950 text-white p-5 flex justify-between items-center">
                            <div>
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block font-mono">B2B QUOTATION CENTER</span>
                              <h3 className="text-sm font-black uppercase tracking-tight text-white">Pratica: {selectedQuote.id}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-[10px] font-bold text-slate-400 font-mono">Fattura / Prev N°</label>
                              <input 
                                type="text"
                                className="bg-slate-900 border border-slate-800 text-white font-mono font-black text-center text-xs p-1.5 w-24 rounded focus:outline-none focus:border-indigo-500"
                                value={quoteNumber}
                                onChange={(e) => setQuoteNumber(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="p-6 space-y-6">
                            {/* Editable Customer Fields */}
                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150 space-y-3.5">
                              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block font-mono">Dati Anagrafici Cliente</span>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-550 block">Rappresentante / Nome *</label>
                                  <input 
                                    type="text" 
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900 outline-none focus:border-indigo-500"
                                    value={qName} 
                                    onChange={(e) => setQName(e.target.value)} 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-550 block">Ragione Sociale / Azienda</label>
                                  <input 
                                    type="text" 
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900 outline-none focus:border-indigo-500"
                                    value={qCompany} 
                                    onChange={(e) => setQCompany(e.target.value)} 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-550 block">Partita IVA / Codice Fiscale</label>
                                  <input 
                                    type="text" 
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                                    value={qVatId} 
                                    onChange={(e) => setQVatId(e.target.value)} 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-55 block">Insegna E-Mail *</label>
                                  <input 
                                    type="email" 
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900 outline-none focus:border-indigo-500"
                                    value={qEmail} 
                                    onChange={(e) => setQEmail(e.target.value)} 
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[9px] font-bold text-slate-55 block">Recapito Telefonico Diretto</label>
                                  <input 
                                    type="text" 
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900 outline-none focus:border-indigo-500"
                                    value={qPhone} 
                                    onChange={(e) => setQPhone(e.target.value)} 
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Client demand text note */}
                            <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100 text-[11px] leading-relaxed">
                              <strong className="text-amber-800">Richiesta Originale:</strong> {selectedQuote.products} (Qta stimata: {selectedQuote.qty} pz)
                              {selectedQuote.message && <div className="mt-1 font-medium text-slate-600 italic">" {selectedQuote.message} "</div>}
                            </div>

                            {/* Interactive Items Table */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block font-mono">Righe Di Fornitura Preventivo</span>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setQuoteItems([
                                      ...quoteItems,
                                      {
                                        id: `qi-${Date.now()}`,
                                        name: "Toner Compatibile / Cartuccia Inkjet",
                                        quantity: 1,
                                        price: 15.00
                                      }
                                    ]);
                                  }}
                                  className="text-[9px] bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 uppercase font-black tracking-wider rounded"
                                >
                                  + Nuova Riga Prodotto
                                </button>
                              </div>

                              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-450 uppercase tracking-wider">
                                      <th className="p-3 w-7/12">Consumabile / Descrizione Riga</th>
                                      <th className="p-3 w-1.5/12 text-center">Qtà</th>
                                      <th className="p-3 w-2/12 text-right">Prez. Unit (€)</th>
                                      <th className="p-3 w-1.5/12 text-right">Rim.</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {quoteItems.map((item, index) => (
                                      <tr key={item.id} className="hover:bg-slate-50/50">
                                        <td className="p-2">
                                          <input 
                                            type="text"
                                            className="w-full bg-white focus:bg-slate-50 border border-slate-200 rounded/md px-2 py-1 font-semibold text-slate-900 text-xs"
                                            value={item.name}
                                            onChange={(e) => {
                                              const updated = [...quoteItems];
                                              updated[index].name = e.target.value;
                                              setQuoteItems(updated);
                                            }}
                                            placeholder="Nome o codice consumabile"
                                          />
                                        </td>
                                        <td className="p-2">
                                          <input 
                                            type="number"
                                            className="w-14 mx-auto text-center bg-white border border-slate-200 focus:bg-slate-50 rounded/md px-1 py-1 font-bold text-slate-900 text-xs"
                                            value={item.quantity}
                                            min="1"
                                            onChange={(e) => {
                                              const updated = [...quoteItems];
                                              updated[index].quantity = parseInt(e.target.value) || 1;
                                              setQuoteItems(updated);
                                            }}
                                          />
                                        </td>
                                        <td className="p-2">
                                          <input 
                                            type="number"
                                            step="0.01"
                                            className="w-20 text-right bg-white border border-slate-200 focus:bg-slate-50 rounded/md px-2 py-1 font-bold text-slate-900 text-xs"
                                            value={item.price}
                                            onChange={(e) => {
                                              const updated = [...quoteItems];
                                              updated[index].price = parseFloat(e.target.value) || 0;
                                              setQuoteItems(updated);
                                            }}
                                          />
                                        </td>
                                        <td className="p-2 text-center">
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              const updated = quoteItems.filter(qi => qi.id !== item.id);
                                              setQuoteItems(updated);
                                            }}
                                            className="w-6 h-6 rounded bg-rose-50 hover:bg-rose-150 text-rose-600 flex items-center justify-center font-bold text-sm"
                                          >
                                            ✕
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Totals & Notes Display */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-bold">
                              {/* Left: Proposal Message / Reply text block */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">Note per Preventivo o Lettera Accompagnamento Email</label>
                                <textarea
                                  value={quoteReplyMsg}
                                  onChange={(e) => setQuoteReplyMsg(e.target.value)}
                                  placeholder="Scrivi qui i termini di consegna o condizioni di sconto personalizzate per questo preventivo. Verranno stampate sul PDF."
                                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-900 outline-none h-28"
                                />
                              </div>

                              {/* Right: Tax Breakdown */}
                              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-2.5 font-mono text-[11px]">
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider block">Quadro Economico B2B</span>
                                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                  <span className="text-slate-400">Subtotale Imponibile:</span>
                                  <span className="text-white">€ {quoteItems.reduce((acc, i) => acc + (i.quantity * i.price), 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                  <span className="text-slate-400">IVA d'Imposta (22%):</span>
                                  <span className="text-white">€ {(quoteItems.reduce((acc, i) => acc + (i.quantity * i.price), 0) * 0.22).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-indigo-400 text-xs font-black pt-1">
                                  <span>TOTALE COMPLESSIVO:</span>
                                  <span>€ {(quoteItems.reduce((acc, i) => acc + (i.quantity * i.price), 0) * 1.22).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Interactive B2B actions and state machine */}
                            <div className="pt-5 border-t border-slate-150 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1 flex-1 max-w-xs">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">Aggiorna Stato Pratica</label>
                                  <select 
                                    value={quoteStatusVal}
                                    onChange={(e) => setQuoteStatusVal(e.target.value)}
                                    className="w-full bg-slate-100 hover:bg-slate-150 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500"
                                  >
                                    <option value="pending_review">Nuovo</option>
                                    <option value="reviewed">Preventivo inviato</option>
                                    <option value="accepted">Accettato</option>
                                    <option value="processing">In lavorazione</option>
                                    <option value="shipped">Spedito</option>
                                    <option value="completed">Completato</option>
                                    <option value="cancelled">Annullato</option>
                                  </select>
                                </div>

                                <div className="flex gap-2 self-end">
                                  <button 
                                    type="button" 
                                    onClick={() => handleUpdateQuote()}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] px-5 py-3 rounded-xl transition-all"
                                  >
                                    Salva Stato e Righe
                                  </button>
                                  
                                  <button 
                                    type="button" 
                                    onClick={handleConvertToOrder}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-[10px] px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-50 flex items-center gap-1.5"
                                  >
                                    ✅ Converti in Ordine
                                  </button>
                                </div>
                              </div>

                              {/* Document Printing, Shipping notes, Email actions */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setShowDocType("preventivo");
                                    setShowPrintModal(true);
                                  }}
                                  className="bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200 rounded-xl p-3 font-black uppercase tracking-wider text-[9px] transition-all flex flex-col justify-center items-center gap-1.5"
                                >
                                  <Printer size={16} />
                                  🖨️ Genera PDF Preventivo
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setShowDocType("ddt");
                                    setShowPrintModal(true);
                                  }}
                                  className="bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200 rounded-xl p-3 font-black uppercase tracking-wider text-[9px] transition-all flex flex-col justify-center items-center gap-1.5"
                                >
                                  <Truck size={16} />
                                  📦 Genera DDT Trasporto
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setShowDocType("conferma_ordine");
                                    setShowPrintModal(true);
                                  }}
                                  className="bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200 rounded-xl p-3 font-black uppercase tracking-wider text-[9px] transition-all flex flex-col justify-center items-center gap-1.5"
                                >
                                  <FileText size={16} />
                                  🧾 Genera Conferma Ordine
                                </button>
                                <button 
                                  type="button"
                                  disabled={isEmailSending}
                                  onClick={handleSendQuoteEmail}
                                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl p-3 font-black uppercase tracking-wider text-[9px] transition-all flex flex-col justify-center items-center gap-1.5 shadow-sm"
                                >
                                  <Mail size={16} />
                                  {isEmailSending ? "Invio in corso..." : "📧 Invia Preventivo Email"}
                                </button>
                              </div>

                              {emailSendResult && (
                                <p className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-150 p-2.5 rounded-xl text-center">
                                  {emailSendResult}
                                </p>
                              )}
                              
                              {actionSuccess && (
                                <p className="text-[11px] font-extrabold text-green-700 bg-green-50 border border-green-150 p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5">
                                  <Check size={14} /> Database sincronizzato correttamente nel Cloud!
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-4">
                          <FileText size={44} className="mx-auto opacity-50 text-indigo-500" />
                          <p className="text-xs font-bold uppercase tracking-widest leading-relaxed max-w-sm mx-auto">Seleziona una richiesta di preventivo B2B dalla lista per accedere al Quadro Economico interattivo, calcolare l'IVA ed esportare i documenti professionali erogati.</p>
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

                {/* --- 7. TAB MULTI-CHANNEL INTEGRATIONS PANEL (PRESTASHOP & DANEA EASYFATT & CSV) --- */}
                {dashboardTab === "danea" && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
                    {/* Header bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                          <Layers className="text-indigo-600 animate-pulse" /> Sincronizzazione Gestionale &amp; WebService
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Predisposizione avanzata e ponte tecnologico per Danea Easyfatt, e-commerce PrestaShop e flussi CSV.</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 text-xs font-black uppercase px-2.5 py-1 rounded-xl tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                        GATEWAYS ATTIVI B2B
                      </span>
                    </div>

                    {/* CONTROL VERIFICATIONS WIDGET FOR PRE-DEPLOY */}
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-2.5">
                          <Shield size={20} className={`${[checkedHosting, checkedPrestashop, checkedEasyfatt, checkedEasyPrestaModule].filter(Boolean).length === 4 ? 'text-green-600' : 'text-amber-600'}`} />
                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Verifica Requisiti Preliminari di Collegamento (Pre-Deploy)</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Controlla l'infrastruttura richiesta prima di procedere con la pubblicazione in produzione.</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl shrink-0 tracking-wider font-mono border ${
                          [checkedHosting, checkedPrestashop, checkedEasyfatt, checkedEasyPrestaModule].filter(Boolean).length === 4 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {[checkedHosting, checkedPrestashop, checkedEasyfatt, checkedEasyPrestaModule].filter(Boolean).length} di 4 Controlli
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${checkedHosting ? 'bg-white border-indigo-600 shadow-sm' : 'bg-slate-100/50 hover:bg-slate-100 border-slate-200'}`}>
                          <input 
                            type="checkbox" 
                            checked={checkedHosting}
                            onChange={(e) => setCheckedHosting(e.target.checked)}
                            className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" 
                          />
                          <div className="space-y-1">
                            <span className="text-xs font-black text-slate-900 block">1. Hai già un Hosting attivo?</span>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                              Necessario per alloggiare il sito e-commerce o l'interfaccia API che risponde alle richieste dei toner e della fatturazione telematiche.
                            </p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${checkedPrestashop ? 'bg-white border-indigo-600 shadow-sm' : 'bg-slate-100/50 hover:bg-slate-100 border-slate-200'}`}>
                          <input 
                            type="checkbox" 
                            checked={checkedPrestashop}
                            onChange={(e) => setCheckedPrestashop(e.target.checked)}
                            className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" 
                          />
                          <div className="space-y-1">
                            <span className="text-xs font-black text-slate-900 block">2. Hai già installato PrestaShop?</span>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                              L'ambiente e-commerce deve essere attivo (versione 1.7 o 8.x) con le API Webservice abilitate e con i permessi di lettura/scrittura attivi.
                            </p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${checkedEasyfatt ? 'bg-white border-indigo-600 shadow-sm relative' : 'bg-slate-100/50 hover:bg-slate-100 border-slate-200 shadow-none'}`}>
                          <input 
                            type="checkbox" 
                            checked={checkedEasyfatt}
                            onChange={(e) => setCheckedEasyfatt(e.target.checked)}
                            className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" 
                          />
                          <div className="space-y-1">
                            <span className="text-xs font-black text-slate-900 block">3. Hai una licenza Easyfatt attiva?</span>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                              Disporre di Danea Easyfatt versione Enterprise (o Professional idonea) con funzionalità e-commerce per lo scambio flussi XML.
                            </p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${checkedEasyPrestaModule ? 'bg-white border-indigo-600 shadow-sm' : 'bg-slate-100/50 hover:bg-slate-100 border-slate-200'}`}>
                          <input 
                            type="checkbox" 
                            checked={checkedEasyPrestaModule}
                            onChange={(e) => setCheckedEasyPrestaModule(e.target.checked)}
                            className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" 
                          />
                          <div className="space-y-1">
                            <span className="text-xs font-black text-slate-900 block">4. Hai il modulo di collegamento Easyfatt ↔ PrestaShop?</span>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                              Il modulo di raccordo tradurrà agilmente i flussi d'acquisto in fatture elettroniche, preventivi commerciali avanzati, DDT e giacenze.
                            </p>
                          </div>
                        </label>
                      </div>

                      <div className="pt-1">
                        {[checkedHosting, checkedPrestashop, checkedEasyfatt, checkedEasyPrestaModule].filter(Boolean).length === 4 ? (
                          <div className="bg-emerald-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-md shadow-emerald-100">
                            <span className="text-xl">🏆</span>
                            <div className="flex-1">
                              <span className="text-xs font-black block uppercase tracking-wide">Pronto per il deploy</span>
                              <p className="text-[10px] opacity-90 font-medium leading-none mt-1">L'architettura Ink&amp;Print è ora pronta per essere allacciata con i canali e-commerce e con i gestionali Danea Easyfatt.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-500 text-white rounded-2xl p-4 flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            <div className="flex-1">
                              <span className="text-xs font-black block uppercase tracking-wide">Verifiche Fondamentali in Sospeso ({4 - [checkedHosting, checkedPrestashop, checkedEasyfatt, checkedEasyPrestaModule].filter(Boolean).length} richiesti)</span>
                              <p className="text-[10px] opacity-90 font-medium leading-none mt-1">Soddisfa tutti i requisiti elencati sopra spuntando le opzioni interattive prima di lanciare la pubblicazione in produzione.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Navigation Sub-Tabs and Channels */}
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                      <button
                        onClick={() => setSyncSubTab("danea")}
                        className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${syncSubTab === "danea" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        📊 Danea Easyfatt
                      </button>
                      <button
                        onClick={() => setSyncSubTab("prestashop")}
                        className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${syncSubTab === "prestashop" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        ⚡ PrestaShop API
                      </button>
                      <button
                        onClick={() => setSyncSubTab("csv")}
                        className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${syncSubTab === "csv" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        📋 Catalogo CSV
                      </button>
                    </div>

                    {/* TAB CONTENT 1: DANEA EASYFATT */}
                    {syncSubTab === "danea" && (
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
                                Scarica XML Easyfatt ({orders.length} ordini)
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
                                    className="text-[10px] text-slate-455 hover:text-blue-600 font-sans font-black uppercase tracking-tight"
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
                                    className="text-[10px] text-slate-455 hover:text-blue-600 font-sans font-black uppercase tracking-tight"
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

                        {/* Right Side: Operations Sandbox & Diagnostics */}
                        <div className="space-y-6">
                          {/* 1. Diagnostics Console */}
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
                                className="bg-slate-850 hover:bg-slate-850 border border-slate-700 text-white font-black text-[11px] uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all flex items-center gap-1"
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

                          {/* 2. Stock sync simulator */}
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
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-2xl shadow-md transition-all active:scale-95 text-center block w-full sm:w-auto"
                              >
                                Invia &amp; Sincronizza Prodotti
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT 2: PRESTASHOP WEBSERVICE */}
                    {syncSubTab === "prestashop" && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Parameters configuration */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                          <div>
                            <span className="text-[9px] font-black tracking-widest text-indigo-500 uppercase block">Integrazione PrestaShop</span>
                            <h4 className="font-extrabold text-sm text-slate-900 uppercase">Credenziali WebService API</h4>
                            <p className="text-xs text-slate-500">Imposta i dati del Webservice attivo nel retroportale PrestaShop per permettere la sincronizzazione.</p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-black uppercase text-slate-700">Stato Collegamento</span>
                                <p className="text-[11px] text-slate-400">Attiva o disattiva il modulo gateway sincrono.</p>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={psActive} 
                                onChange={(e) => setPsActive(e.target.checked)}
                                className="w-10 h-5 bg-slate-200 rounded-full appearance-none cursor-pointer checked:bg-indigo-600 relative after:content-[''] after:absolute after:h-4 after:w-4 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 checked:after:translate-x-5 after:transition-all"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">URL Negozio PrestaShop</label>
                              <input 
                                type="url" 
                                value={psUrl}
                                onChange={(e) => setPsUrl(e.target.value)}
                                placeholder="https://mio-prestashop.it/api"
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-2xl py-2.5 px-3.5 text-xs text-slate-800 outline-none font-semibold"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chiave d'Accesso WebService (API Key)</label>
                              <input 
                                type="text" 
                                value={psApiKey}
                                onChange={(e) => setPsApiKey(e.target.value)}
                                placeholder="PS_MOCKKEY12345"
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-2xl py-2.5 px-3.5 text-xs text-slate-800 outline-none font-mono"
                              />
                            </div>

                            <div className="pt-2">
                              <button
                                onClick={handleSavePrestaShopConfig}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider py-3 rounded-2xl shadow-md transition-all active:scale-95"
                              >
                                Salva Credenziali PrestaShop
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Synchronization controls and logs */}
                        <div className="space-y-6">
                          <div className="bg-gradient-to-br from-indigo-50/40 to-slate-200/20 p-6 rounded-3xl border border-indigo-100 space-y-4">
                            <span className="text-[10px] font-black tracking-widest text-indigo-700 uppercase block font-mono">Motore Sincronia Real-time</span>
                            <h4 className="font-extrabold text-sm text-slate-900 uppercase">Azioni PrestaShop Predisposte</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <button
                                disabled={isPsSyncing}
                                onClick={handleSyncPrestaShopProducts}
                                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-4 text-left space-y-1 hover:border-indigo-300 transition-all shadow-sm"
                              >
                                <span className="font-black text-xs uppercase tracking-tight block">⬇ Scarica Catalogo</span>
                                <span className="text-[10px] text-slate-400 font-medium block">Allinea prezzi, compatibilità e giacenze dei prodotti.</span>
                                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold block mt-2 text-center">Ultima: {psLastProducts || "Nessuna"}</span>
                              </button>

                              <button
                                disabled={isPsSyncing}
                                onClick={handleSyncPrestaShopOrders}
                                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-4 text-left space-y-1 hover:border-indigo-300 transition-all shadow-sm"
                              >
                                <span className="font-black text-xs uppercase tracking-tight block">⬆ Esporta Ordini</span>
                                <span className="text-[10px] text-slate-400 font-medium block">Invia le vendite della logistica per generare doc sul CMS.</span>
                                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold block mt-2 text-center">Ultima: {psLastOrders || "Nessuna"}</span>
                              </button>
                            </div>
                          </div>

                          {/* Logging Console block */}
                          <div className="bg-slate-950 rounded-3xl p-5 text-slate-300 border border-slate-800 font-mono text-[10px] space-y-2.5 shadow-xl max-h-[220px] overflow-y-auto">
                            <div className="flex justify-between items-center text-[9px] font-black text-indigo-400 border-b border-slate-900 pb-1.5">
                              <span>REGISTRO SINCRONIE PRESTASHOP</span>
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            </div>
                            <div className="space-y-1">
                              {psLogs.map((log, idx) => (
                                <div key={idx} className="leading-relaxed hover:text-white">
                                  <span className="text-slate-500">&gt;</span> {log}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT 3: CATALOGO CSV IMPORT/EXPORT */}
                    {syncSubTab === "csv" && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* CSV Exporting panel */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                          <div>
                            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block font-mono">Moduli Esportazione Catalogo</span>
                            <h4 className="font-extrabold text-sm text-slate-900 uppercase">Esporta Catalogo Prodotti CSV</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                              Interroga ed esporta l'intero database di toner e cartucce in un file `.csv` editabile per fogli di calcolo (Excel, Numbers, LibreOffice).
                            </p>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                              <span>Numero Consumabili in Listino:</span>
                              <span className="text-slate-900">12 Toner &amp; Cartucce</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                              <span>Separatore standard file:</span>
                              <span className="bg-white text-[10px] font-mono border px-1.5 py-0.5 rounded text-indigo-600">Virgola ( , )</span>
                            </div>
                          </div>

                          <div className="pt-2">
                            <a
                              href="/api/products/export-csv"
                              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider py-3 px-6 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                              <Download size={16} />
                              Sblocca &amp; Esporta CSV Catalogo
                            </a>
                          </div>
                        </div>

                        {/* CSV Importing panel */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                          {/* Part 1: Product Data */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900 uppercase">1. Importa Prezzi &amp; Giacenze CSV</h4>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                                Allinea i prezzi e la disponibilità caricando un file CSV con intestazione <code className="bg-slate-100 font-mono text-[10px] px-1 rounded hover:bg-slate-200">sku,price,availability</code>.
                              </p>
                            </div>

                            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center hover:bg-slate-50/50 hover:border-indigo-400 transition-all cursor-pointer relative bg-slate-50/20">
                              <input 
                                type="file" 
                                accept=".csv"
                                onChange={handleCsvFileChanged}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <div className="space-y-2">
                                <span className="text-2xl block">📋</span>
                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-wide block">Carica Listino Prodotti</span>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Trascina qui il file o clicca per esplorare</p>
                              </div>
                            </div>

                            {isCsvUploading && (
                              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-indigo-700 text-[10px] font-bold uppercase">
                                <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                                Elaborazione magazzino...
                              </div>
                            )}

                            {csvFeedback && (
                              <div className={`p-3 rounded-2xl text-[10px] font-bold ${successCsvCount !== null ? "bg-green-50 border border-green-200 text-green-700" : "bg-rose-50 border border-rose-200 text-rose-700"}`}>
                                {csvFeedback}
                              </div>
                            )}
                          </div>

                          <div className="h-px bg-slate-100"></div>

                          {/* Part 2: Image Mappings */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900 uppercase">2. Carica Mappatura Immagini</h4>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                                Collega immagini ad alta risoluzione agli SKU caricando un CSV con intestazione <code className="bg-slate-100 font-mono text-[10px] px-1 rounded hover:bg-slate-200">sku,image</code>.
                              </p>
                            </div>

                            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center hover:bg-slate-50/50 hover:border-blue-400 transition-all cursor-pointer relative bg-slate-50/20">
                              <input 
                                type="file" 
                                accept=".csv"
                                onChange={handleImageCsvFileChanged}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <div className="space-y-2">
                                <span className="text-2xl block">🖼️</span>
                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-wide block">Carica Mappatura Foto</span>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Allinea le immagini dei toner per SKU</p>
                              </div>
                            </div>

                            {isImageCsvUploading && (
                              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl p-3 text-blue-700 text-[10px] font-bold uppercase">
                                <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                                Elaborazione immagini...
                              </div>
                            )}

                            {imageCsvFeedback && (
                              <div className={`p-3 rounded-2xl text-[10px] font-bold ${successImageCount !== null ? "bg-green-50 border border-green-200 text-green-700" : "bg-rose-50 border border-rose-200 text-rose-700"}`}>
                                {imageCsvFeedback}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}



              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HIGH-POLISHED INTERACTIVE PRINT SHEET MODAL DIALOG --- */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-4 sm:p-6" id="print-modal-container">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-6">
              
              {/* Modal Control Panel header */}
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  <span className="text-xs font-black uppercase tracking-wider">Generatore Documenti professionali erogati</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Printer size={14} />🖨️ Stampa / Salva PDF
                  </button>
                  <button 
                    onClick={() => {
                      setShowPrintModal(false);
                      setShowDocType(null);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all"
                  >
                    Chiudi Finestra
                  </button>
                </div>
              </div>

              {/* Printable target sheet container */}
              <div className="p-8 md:p-12 bg-white text-slate-950 font-sans border border-slate-100 print:border-none print:shadow-none" id="printable-document-sheet">
                
                {/* Print Sheet styles overrides injection */}
                <style dangerouslySetInnerHTML={{__html: `
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    #printable-document-sheet, #printable-document-sheet * {
                      visibility: visible !important;
                    }
                    #printable-document-sheet {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      border: none !important;
                      box-shadow: none !important;
                    }
                    #print-modal-container {
                      background: transparent !important;
                      padding: 0 !important;
                    }
                  }
                `}} />

                {/* Letterhead section */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-lg text-slate-900 tracking-tight">INK&amp;PRINT s.r.l.</span>
                      <span className="text-[10px] border border-slate-950 font-medium px-1.5 py-0.2 rounded-md tracking-wider">LOGISTICA</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 font-semibold space-y-0.5 leading-snug">
                      <p>Via Francesco Baracca 123 - 00148 Roma (RM)</p>
                      <p>Telefono: +39 06 9876543 | Partiva IVA: IT09876543210</p>
                      <p>E-mail: logistica@inkprintbydenise.com | Pec: pec@inkprint.it</p>
                    </div>
                  </div>

                  <div className="text-right space-y-1.5 border-l-4 border-slate-900 pl-6 py-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Tipologia Pratica</span>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                      {showDocType === "preventivo" && "PREVENTIVO DI CONSUMABILI"}
                      {showDocType === "ddt" && "DOCUMENTO DI TRASPORTO (DDT)"}
                      {showDocType === "conferma_ordine" && "CONFERMA D'ORDINE CLIENTE"}
                    </h2>
                    <p className="text-[11px] font-extrabold text-slate-800 font-mono">
                      {showDocType === "preventivo" && `N°: ${quoteNumber}`}
                      {showDocType === "ddt" && `N° DDT: DDT-2026-${selectedQuote?.id ? selectedQuote.id.substring(3, 8) : "105"}`}
                      {showDocType === "conferma_ordine" && `N° ORD: CO-2026-${selectedQuote?.id ? selectedQuote.id.substring(3, 8) : "105"}`}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold">Data Erogazione: {new Date().toLocaleDateString('it-IT')}</p>
                  </div>
                </div>

                {/* Sender & Receiver Address Details Block */}
                <div className="grid grid-cols-2 gap-8 mb-8 text-[11.5px] leading-relaxed">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block font-mono">Vettore Mittente / Speditore</span>
                    <strong className="text-slate-950 uppercase font-black">Ink&amp;Print By Denise s.r.l.</strong>
                    <p className="text-slate-550 font-medium">Ufficio Resi e Logistica B2B - Nodo Centrale di Sincronia</p>
                    <p className="text-slate-550 font-medium">Dispositivo logistico convalidato PrestaShop / Danea Easyfatt</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-[8.5px] font-black text-indigo-600 uppercase tracking-widest block font-mono">Cliente Destinatario</span>
                    <strong className="text-slate-950 uppercase font-black leading-none block">{selectedQuote?.company || qCompany || selectedQuote?.name || qName || "Privato / Consumatore"}</strong>
                    {selectedQuote?.name && <p className="text-slate-650 font-semibold italic">Alla C.A: Dott. {selectedQuote.name}</p>}
                    <div className="text-slate-600 font-bold space-y-0.2">
                      {selectedQuote?.email && <p>E-mail: {selectedQuote.email}</p>}
                      {selectedQuote?.phone && <p>Telefono: {selectedQuote.phone}</p>}
                      {(selectedQuote?.vatId || qVatId) && <p>P. IVA / Cod. Fisc: {selectedQuote?.vatId || qVatId}</p>}
                    </div>
                  </div>
                </div>

                {/* DDT Specific details block */}
                {showDocType === "ddt" && (
                  <div className="bg-slate-50 border border-slate-205 p-4 rounded-xl grid grid-cols-4 gap-4 text-[10.5px] mb-8 font-mono">
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase font-sans font-black tracking-wider block">Causale Trasporto</span>
                      <strong className="text-slate-900">Vendita</strong>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase font-sans font-black tracking-wider block">Porto</span>
                      <strong className="text-slate-900">Assegnato</strong>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase font-sans font-black tracking-wider block">Aspetto Beni</span>
                      <strong className="text-slate-900">Cartone compatibile</strong>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase font-sans font-black tracking-wider block">Corriere Incaricato</span>
                      <strong className="text-slate-900">{carrierVal || "SDA Express Courier"}</strong>
                    </div>
                  </div>
                )}

                {/* Items table layout */}
                <div className="border border-slate-900 rounded-xl overflow-hidden mb-8">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[9.5px] uppercase font-black tracking-wider font-mono">
                        <th className="p-3 w-7/12">Consumabile Compatibile / Servizio Erogato</th>
                        <th className="p-3 w-1.5/12 text-center">Quantità</th>
                        <th className="p-3 w-2/12 text-right">Prezzo Unit. (€)</th>
                        <th className="p-3 w-1.5/12 text-right">IVA (%)</th>
                        <th className="p-3 w-2/12 text-right">Subtotale (€)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {quoteItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                          <td className="p-3 text-center font-bold tracking-tight">{item.quantity}</td>
                          <td className="p-3 text-right font-mono">€ {item.price.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono">22%</td>
                          <td className="p-3 text-right font-mono font-bold">€ {(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Economic summary or DDT signatures */}
                {showDocType !== "ddt" ? (
                  <div className="flex justify-between items-start gap-12 font-mono text-[11px]">
                    <div className="flex-1 max-w-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-normal font-sans text-[10.5px]">
                      <strong className="text-slate-800 block mb-1">Termini di Consegna &amp; Condizioni</strong>
                      <p>{quoteReplyMsg || "Consegna gratuita ed espresso a cura dello speditore tramite corriere nazionale. Termini di validità preventivo commerciale: 30gg. I prezzi dei toner compatibili sono comprensivi di ecofuel."}</p>
                    </div>

                    <div className="w-68 space-y-2 border-t-2 border-slate-900 pt-3">
                      <div className="flex justify-between text-slate-600">
                        <span>Totale Imponibile:</span>
                        <span>€ {quoteItems.reduce((acc, i) => acc + (i.quantity * i.price), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 border-b border-dashed border-slate-200 pb-1.5">
                        <span>Imposta (IVA 22%):</span>
                        <span>€ {(quoteItems.reduce((acc, i) => acc + (i.quantity * i.price), 0) * 0.22).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-extrabold text-xs">
                        <span>TOTALE COMPLESSIVO:</span>
                        <span>€ {(quoteItems.reduce((acc, i) => acc + (i.quantity * i.price), 0) * 1.22).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-6 pt-16 text-[10px] text-center font-bold uppercase tracking-wider text-slate-600">
                    <div className="border-t border-slate-400 pt-2 leading-relaxed">
                      Firma Conducente
                    </div>
                    <div className="border-t border-slate-400 pt-2 leading-relaxed">
                      Firma Mittente
                    </div>
                    <div className="border-t border-slate-400 pt-2 leading-relaxed">
                      Firma per Ricevuta Destinatario
                    </div>
                  </div>
                )}

                {/* Document footer notice */}
                <div className="mt-16 pt-6 border-t border-slate-200 text-center space-y-1">
                  <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase">Piattaforma Logistica Integrata Ink&amp;Print By Denise s.r.l.</p>
                  <p className="text-[8px] text-slate-400 font-semibold">Documento generato telematicamente e sincronizzato con PrestaShop &amp; Easyfatt. Validità fiscale sancita in sede di allineamento magazzino.</p>
                </div>

              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

