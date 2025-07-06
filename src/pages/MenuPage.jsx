import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ShoppingCart, X, Plus, Minus, Trash2, Sparkles, Users, ArrowLeft, ArrowRight, WifiOff, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 【移除】 translations 中的 announcements 不再需要，將從 API 獲取

export default function MenuPage() {
    // ...
    // 【修改】將 isAiEnabled 等設定移入 settings 物件
    const [settings, setSettings] = useState({
        isAiEnabled: false,
        useLogo: false,
        logoUrl: '',
        transactionFeePercent: 0,
        announcements: [],
    });
    // ...

    // 【修改】useEffect 中只獲取 /api/settings，因為它已包含所有資訊
    useEffect(() => {
        setFetchStatus('loading');
        const fetchData = async () => {
            try {
                const [menuRes, settingsRes] = await Promise.all([
                    fetch(`${API_URL}/api/menu`),
                    fetch(`${API_URL}/api/settings`)
                ]);
                if (!menuRes.ok || !settingsRes.ok) throw new Error('Network response was not ok');
                const menu = await menuRes.json();
                const appSettings = await settingsRes.json();
                setMenuData(menu);
                setSettings(appSettings); // 直接設定從後端來的完整設定
                setFetchStatus('success');
                if (retryCount === 0 && appSettings.announcements?.length > 0) {
                    setShowAnnouncement(true);
                }
            } catch (error) {
                console.error("無法從後端獲取資料:", error);
                setFetchStatus('error');
            }
        };
        fetchData();
    }, [retryCount]);

    // 【修改】計算總金額時，加入手續費
    const subTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    const transactionFee = useMemo(() => Math.round(subTotal * (settings.transactionFeePercent / 100)), [subTotal, settings.transactionFeePercent]);
    const totalAmount = useMemo(() => subTotal + transactionFee, [subTotal, transactionFee]);

    // 【修改】handleSubmitOrder，傳送包含手續費的完整金額
    const handleSubmitOrder = async () => {
        // ...
        const orderData = {
          tableNumber: "A1",
          headcount,
          totalAmount: subTotal, // 餐點總計
          fee: transactionFee,  // 手續費
          finalAmount: totalAmount, // 最終金額
          items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, notes: item.notes || "", selectedOptions: item.selectedOptions }))
        };
        // ...
    };

    // 【修改】公告 Modal 的資料來源
    // ... <AnnouncementModal announcements={settings.announcements} ... />

    // 【修改】Logo 的資料來源
    // ... {settings.useLogo ? (<img src={settings.logoUrl} ... />) : ...}

    // 【修改】購物車 Modal，需傳入 transactionFee
    // ... <CartModal transactionFee={transactionFee} ... />
}

// ... 子組件 ...
// 【修改】AnnouncementModal 現在從 props 接收 announcements
const AnnouncementModal = ({ t, onClose, announcements }) => {
    // ...
};

// 【修改】CartModal，顯示手續費
const CartModal = ({ cart, t, lang, menuData, totalAmount, subTotal, transactionFee, isAiEnabled, onClose, onUpdateQuantity, onRemove, onSubmitOrder }) => {
    // ...
    return (
        // ...
        <footer className="p-4 bg-white border-t">
            <div className="flex justify-between items-center mb-1">
                <span className="text-md text-gray-600">小計</span>
                <span className="text-md font-medium text-gray-800">${subTotal}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
                <span className="text-md text-gray-600">服務費/手續費 ({settings.transactionFeePercent}%)</span>
                <span className="text-md font-medium text-gray-800">${transactionFee}</span>
            </div>
            <div className="flex justify-between items-center mb-4 border-t pt-4">
                <span className="text-lg font-semibold text-gray-800">{t.total}</span>
                <span className="text-2xl font-bold text-orange-500">${totalAmount}</span>
            </div>
            <button onClick={onSubmitOrder} disabled={cart.length === 0} className="w-full bg-green-500 text-white text-lg font-bold py-3 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed">
                {t.submitOrder}
            </button>
        </footer>
        // ...
    );
};
