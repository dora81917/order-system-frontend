import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ShoppingCart, X, Plus, Minus, Trash2, Sparkles, Users, ArrowLeft, ArrowRight, WifiOff, RefreshCw } from 'lucide-react';

// API 的基本 URL，會先讀取環境變數，若沒有則使用本地開發的預設值
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 多國語言資料
const translations = {
  zh: {
    language: "繁體中文", menu: "菜單", categories: { all: "全部", limited: "主廚推薦", main: "經典主食", side: "美味附餐", drink: "清涼飲品", dessert: "飯後甜點" }, announcement: "最新消息", announcements: [ { image: "https://i.imgur.com/o1bY8f4.jpg", text: "炎炎夏日，來一碗清涼消暑的芒果冰吧！本店採用在地愛文芒果，香甜多汁，期間限定優惠中！" }, { image: "https://i.imgur.com/K1n6M4V.jpg", text: "即日起，加入會員即享9折優惠，消費累積點數，好禮換不完！詳情請洽櫃檯人員。" }, { image: "https://i.imgur.com/G2hC8hS.jpg", text: "親愛的顧客您好，為提供更完善的服務，自7月1日起，本店營業時間調整為 11:00 AM - 10:00 PM。" } ], close: "關閉", itemDetails: "餐點詳情", addToCart: "加入購物車", total: "總計", cart: "您的訂單", emptyCart: "您的購物車是空的", notes: "備註", notesPlaceholder: "有什麼特別需求嗎？", table: "桌號", headcount: "用餐人數", quantity: "數量", continueOrdering: "繼續點餐", submitOrder: "送出訂單", confirmOrderTitle: "確認送出訂單？", confirmOrderMsg: "訂單送出後將無法修改，請確認您的餐點。", cancel: "取消", confirm: "確認送出", orderSuccess: "下單成功！", orderFail: "下單失敗，請稍後再試。", loadingMenu: "正在喚醒伺服器，請稍候...", loadMenuError: "無法載入菜單，請檢查您的網路連線或稍後再試。", retry: "重試", noItemsInCategory: "此分類目前沒有商品", getRecommendation: "✨ 讓AI推薦加點菜", aiRecommendation: "AI 智慧推薦", aiThinking: "AI小助手正在為您思考...", options: { spice: { name: "辣度", none: "不辣", mild: "小辣", medium: "中辣", hot: "大辣" }, sugar: { name: "甜度", full: "正常糖", less: "少糖", half: "半糖", quarter: "微糖", none: "無糖" }, ice: { name: "冰塊", regular: "正常冰", less: "少冰", none: "去冰" }, size: { name: "份量", small: "小份", large: "大份" }, },
  },
  en: {
    language: "English", menu: "Menu", categories: { all: "All", limited: "Chef's Special", main: "Main Course", side: "Side Dish", drink: "Drinks", dessert: "Desserts" }, announcement: "Latest News", announcements: [ { image: "https://i.imgur.com/o1bY8f4.jpg", text: "Enjoy a bowl of refreshing mango shaved ice in the hot summer! Made with fresh local Irwin mangoes." }, { image: "https://i.imgur.com/K1n6M4V.jpg", text: "Join our membership program today to get a 10% discount and earn points for every purchase!" }, { image: "https://i.imgur.com/G2hC8hS.jpg", text: "Dear customers, starting from July 1st, our new opening hours will be 11:00 AM - 10:00 PM." } ], close: "Close", itemDetails: "Item Details", addToCart: "Add to Cart", total: "Total", cart: "Your Order", emptyCart: "Your cart is empty", notes: "Notes", notesPlaceholder: "Any special requests?", table: "Table", headcount: "Guests", quantity: "Quantity", continueOrdering: "Continue Ordering", submitOrder: "Submit Order", confirmOrderTitle: "Confirm your order?", confirmOrderMsg: "Once submitted, the order cannot be changed. Please confirm your items.", cancel: "Cancel", confirm: "Confirm & Submit", orderSuccess: "Order placed successfully!", orderFail: "Order failed, please try again later.", loadingMenu: "Waking up the server, please wait...", loadMenuError: "Could not load menu. Please check your connection or try again later.", retry: "Retry", noItemsInCategory: "No items in this category.", getRecommendation: "✨ Get AI Recommendations", aiRecommendation: "AI Smart Recommendation", aiThinking: "AI assistant is thinking for you...", options: { spice: { name: "Spice Level", none: "Not Spicy", mild: "Mild", medium: "Medium", hot: "Hot" }, sugar: { name: "Sugar Level", full: "Normal", less: "Less Sugar", half: "Half Sugar", quarter: "Quarter Sugar", none: "Sugar-Free" }, ice: { name: "Ice Level", regular: "Regular Ice", less: "Less Ice", none: "No Ice" }, size: { name: "Size", small: "Small", large: "Large" }, },
  },
};

// 分類的固定顯示順序
const CATEGORY_ORDER = ['all', 'limited', 'main', 'side', 'drink', 'dessert'];

// 主頁面元件
export default function MenuPage() {
  const [lang, setLang] = useState('zh');
  const [cart, setCart] = useState([]);
  const [menuData, setMenuData] = useState(null);
  const [fetchStatus, setFetchStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [settings, setSettings] = useState({ isAiEnabled: false, saveToGoogleSheet: false });
  const [headcount, setHeadcount] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [useLogo, setUseLogo] = useState(false);

  const t = useMemo(() => translations[lang] || translations.zh, [lang]);

  // 載入菜單和設定
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
        setSettings(appSettings);
        setFetchStatus('success');
        if (retryCount === 0) setShowAnnouncement(true);
      } catch (error) {
        console.error("無法從後端獲取資料:", error);
        setFetchStatus('error');
      }
    };
    fetchData();
  }, [retryCount]);

  // 計算總金額和總數量
  const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  
  // 根據選擇的分類過濾菜單
  const filteredMenu = useMemo(() => {
    if (!menuData) return null;
    if (activeCategory === 'all') return menuData;
    const result = {};
    if (menuData[activeCategory]) result[activeCategory] = menuData[activeCategory];
    return result;
  }, [menuData, activeCategory]);

  // --- 事件處理函式 ---
  const handleAddToCart = (item, options, notes, quantity) => {
    const optionsKey = JSON.stringify(Object.keys(options).sort().map(key => `${key}:${options[key]}`));
    const notesKey = notes || '';
    const uniqueId = `${item.id}-${optionsKey}-${notesKey}`;
    const existingItemIndex = cart.findIndex(cartItem => cartItem.uniqueId === uniqueId);
    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      const cartItem = { ...item, cartId: Date.now(), uniqueId, quantity, selectedOptions: options, notes };
      setCart(prevCart => [...prevCart, cartItem]);
    }
    setSelectedItem(null);
  };
  
  const updateCartItemQuantity = (cartId, delta) => setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  const removeFromCart = (cartId) => setCart(cart => cart.filter(item => item.cartId !== cartId));
  const handleRetry = () => setRetryCount(c => c + 1);

  const handleSubmitOrder = async () => {
    setShowConfirmModal(false);
    if (cart.length === 0) return;
    const orderData = {
      tableNumber: "A1",
      headcount,
      totalAmount,
      items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, notes: item.notes || "", selectedOptions: item.selectedOptions }))
    };
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error('伺服器回應錯誤');
      await response.json();
      alert(t.orderSuccess);
      setCart([]);
      setIsCartOpen(false);
    } catch (error) {
      console.error('送出訂單失敗:', error);
      alert(t.orderFail);
    }
  };

  // --- 渲染邏輯 ---
  const renderMainContent = () => {
    if (fetchStatus === 'loading') return <MenuSkeleton t={t} />;
    if (fetchStatus === 'error') return <LoadError t={t} onRetry={handleRetry} />;
    if (fetchStatus === 'success' && filteredMenu) {
      const orderedCategoryKeys = activeCategory === 'all'
        ? CATEGORY_ORDER.filter(key => key !== 'all' && filteredMenu[key]?.length > 0)
        : (filteredMenu[activeCategory] ? [activeCategory] : []);
      return (
        <>
          <nav className="sticky top-[100px] z-10 bg-white/90 backdrop-blur-md shadow-sm">
            <div className="flex space-x-2 overflow-x-auto px-4 py-3">
              {CATEGORY_ORDER.map(key => (
                (menuData?.[key] || key === 'all') && t.categories[key] && (
                  <button key={key} onClick={() => setActiveCategory(key)} className={`py-2 px-3 text-sm font-semibold whitespace-nowrap transition-colors duration-200 rounded-full ${activeCategory === key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.categories[key]}</button>
                )
              ))}
            </div>
          </nav>
          <main className="p-4 max-w-2xl mx-auto">
            {orderedCategoryKeys.length > 0 ? orderedCategoryKeys.map(categoryKey => (
              <section key={categoryKey} className="mb-8 scroll-mt-28">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 pt-4">{t.categories[categoryKey] || categoryKey}</h2>
                <div className="space-y-4">
                  {(filteredMenu[categoryKey] || []).map(item => (
                    <MenuItem key={item.id} item={item} lang={lang} t={t} onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              </section>
            )) : <div className="text-center py-10 text-gray-500">{t.noItemsInCategory}</div>}
          </main>
        </>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {showAnnouncement && fetchStatus === 'success' && <AnnouncementModal t={t} onClose={() => setShowAnnouncement(false)} />}
      {showConfirmModal && <ConfirmModal t={t} onConfirm={handleSubmitOrder} onCancel={() => setShowConfirmModal(false)} />}
      
      <header className="sticky top-0 z-20 bg-white bg-opacity-80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center h-[100px]">
        <div className="flex-1 flex flex-col items-start justify-center gap-2">
            <LanguageSwitcher lang={lang} setLang={setLang} />
            <HeadcountSelector headcount={headcount} setHeadcount={setHeadcount} lang={lang} />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
            {useLogo ? (<img src="https://placehold.co/150x50/orange/white?text=Logo" alt="Restaurant Logo" className="h-12 mx-auto" />) : (<div className="font-bold text-xl text-gray-800">{t.menu}</div>)}
            <div className="text-sm text-gray-500 mt-1">{t.table}: A1</div>
        </div>
        <div className="flex-1 flex justify-end">
             <div className="text-right text-gray-800 font-bold text-lg cursor-pointer" onClick={() => setIsCartOpen(true)}>${totalAmount}</div>
        </div>
      </header>
      
      {renderMainContent()}
      
      {cart.length > 0 && (
         <div className="fixed bottom-6 right-6 z-30">
            <button onClick={() => setIsCartOpen(true)} className="bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 hover:bg-orange-600 transition-all duration-300 transform hover:scale-110">
              <ShoppingCart size={28}/>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{totalItems}</span>
            </button>
        </div>
      )}

      {selectedItem && <ItemDetailModal item={selectedItem} t={t} lang={lang} onClose={() => setSelectedItem(null)} onAddToCart={handleAddToCart} />}
      {isCartOpen && <CartModal cart={cart} t={t} lang={lang} menuData={menuData} totalAmount={totalAmount} isAiEnabled={settings.isAiEnabled} onClose={() => setIsCartOpen(false)} onUpdateQuantity={updateCartItemQuantity} onRemove={removeFromCart} onSubmitOrder={() => setShowConfirmModal(true)} />}
    </div>
  );
}

// --- 子組件 (Sub Components) ---

const AnnouncementModal = ({ t, onClose }) => {
    const announcements = t.announcements || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    if(announcements.length === 0) return null;
    const prevSlide = () => setCurrentIndex(i => (i === 0 ? announcements.length - 1 : i - 1));
    const nextSlide = () => setCurrentIndex(i => (i === announcements.length - 1 ? 0 : i + 1));
    const handleTouchStart = (e) => touchStartX.current = e.targetTouches[0].clientX;
    const handleTouchMove = (e) => touchEndX.current = e.targetTouches[0].clientX;
    const handleTouchEnd = () => {
        if (touchStartX.current - touchEndX.current > 50) nextSlide();
        if (touchStartX.current - touchEndX.current < -50) prevSlide();
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 text-center animate-slide-up relative" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <h2 className="text-2xl font-bold text-orange-500 mb-4">{t.announcement}</h2>
                <div className="relative h-80 overflow-hidden">
                    {announcements.map((ann, index) => (
                        <div key={index} className="absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out" style={{ transform: `translateX(${(index - currentIndex) * 100}%)` }}>
                            <img src={ann.image} alt={`Announcement ${index + 1}`} className="w-full h-48 object-cover rounded-lg mb-4" />
                            <p className="text-gray-700">{ann.text}</p>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center my-4 space-x-2">
                    {announcements.map((_, index) => (<div key={index} className={`w-3 h-3 rounded-full transition-colors ${currentIndex === index ? 'bg-orange-500' : 'bg-gray-300'}`}></div>))}
                </div>
                <button onClick={onClose} className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors mt-2">{t.close}</button>
                <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white/80 transition-colors"><ArrowLeft /></button>
                <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white/80 transition-colors"><ArrowRight /></button>
            </div>
        </div>
    );
};

const ConfirmModal = ({ t, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4">
        <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t.confirmOrderTitle}</h3>
            <p className="text-gray-600 mb-6">{t.confirmOrderMsg}</p>
            <div className="flex gap-4">
                <button onClick={onCancel} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors">{t.cancel}</button>
                <button onClick={onConfirm} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors">{t.confirm}</button>
            </div>
        </div>
    </div>
);

const LanguageSwitcher = ({ lang, setLang }) => (
    <div className="relative">
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="appearance-none bg-white bg-opacity-80 backdrop-blur-sm text-gray-800 font-semibold py-1 px-3 pr-8 rounded-full shadow-sm focus:outline-none text-sm">
            {Object.keys(translations).map(key => (
                <option key={key} value={key}>{translations[key].language}</option>
            ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown size={16} />
        </div>
    </div>
);

const HeadcountSelector = ({ headcount, setHeadcount, lang }) => {
    const getUnitText = (num) => {
        if (lang === 'zh' || lang === 'ja') return '人';
        if (lang === 'ko') return '명';
        return num > 1 ? 'guests' : 'guest';
    };
    return (
        <div className="relative flex items-center">
            <Users size={16} className="text-gray-600 absolute left-2.5 z-10 pointer-events-none" />
            <select
                value={headcount}
                onChange={e => setHeadcount(parseInt(e.target.value, 10))}
                className="appearance-none bg-white bg-opacity-80 backdrop-blur-sm text-gray-800 font-semibold py-1 pl-8 pr-3 rounded-full shadow-sm focus:outline-none text-sm"
            >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                        {num} {getUnitText(num)}
                    </option>
                ))}
            </select>
        </div>
    );
};

const MenuItem = ({ item, lang, onClick }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={onClick}>
        <div className="flex-1 p-4">
            <h3 className="font-bold text-lg text-gray-900">{item.name?.[lang] || item.name?.zh}</h3>
            <p className="text-gray-600 text-sm mt-1">{item.description?.[lang] || item.description?.zh}</p>
            <p className="font-semibold text-orange-500 mt-2">${item.price}</p>
        </div>
        <img src={item.image} alt={item.name?.[lang] || item.name?.zh} className="w-32 h-32 object-cover"/>
    </div>
);

const MenuSkeleton = ({ t }) => (
    <div className="space-y-8 animate-pulse pt-4">
        <div className="text-center text-gray-500 font-semibold">{t.loadingMenu}</div>
        {[...Array(3)].map((_, i) => (
            <div key={i}>
                <div className="h-8 w-1/3 bg-gray-300 rounded-lg mb-4"></div>
                <div className="space-y-4">
                    {[...Array(2)].map((_, j) => (
                        <div key={j} className="bg-white rounded-xl shadow-md overflow-hidden flex">
                            <div className="flex-1 p-4">
                                <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
                                <div className="h-4 w-full bg-gray-200 rounded mt-2"></div>
                                <div className="h-4 w-2/3 bg-gray-200 rounded mt-1"></div>
                                <div className="h-5 w-1/4 bg-gray-300 rounded mt-2"></div>
                            </div>
                            <div className="w-32 h-32 bg-gray-300"></div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const LoadError = ({ t, onRetry }) => (
    <div className="text-center py-20">
        <WifiOff className="mx-auto h-16 w-16 text-red-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800">載入失敗</h3>
        <p className="mt-2 text-gray-500">{t.loadMenuError}</p>
        <button onClick={onRetry} className="mt-6 inline-flex items-center gap-2 bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors">
            <RefreshCw size={18} /> {t.retry}
        </button>
    </div>
);

const ItemDetailModal = ({ item, t, lang, onClose, onAddToCart }) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    const initialOptions = {};
    if (item.options && Array.isArray(item.options)) {
      item.options.forEach(optionKey => {
        if (t.options[optionKey]) {
          const optionValues = Object.keys(t.options[optionKey]).filter(k => k !== 'name');
          if (optionValues.length > 0) { initialOptions[optionKey] = optionValues[0]; }
        }
      });
    }
    setSelectedOptions(initialOptions);
  }, [item, t]);
  const handleOptionChange = (group, value) => { setSelectedOptions(prev => ({ ...prev, [group]: value })); };
  const handleSubmit = () => { onAddToCart(item, selectedOptions, notes, quantity); };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end sm:items-center p-4">
        <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl animate-slide-up">
            <div className="relative">
                <img src={item.image} alt={item.name?.[lang] || item.name?.zh} className="w-full h-48 object-cover rounded-t-2xl sm:rounded-t-lg" />
                <button onClick={onClose} className="absolute top-3 right-3 bg-white/70 rounded-full p-2 text-gray-800 hover:bg-white transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-350px)]">
                <h2 className="text-2xl font-bold mb-2">{item.name?.[lang] || item.name?.zh}</h2>
                <p className="text-gray-600 mb-4">{item.description?.[lang] || item.description?.zh}</p>
                <p className="text-2xl font-bold text-orange-500 mb-6">${item.price}</p>
                {item.options && Array.isArray(item.options) && item.options.map(optionKey => (
                    <div key={optionKey} className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">{t.options[optionKey]?.name}</h3>
                        <div className="flex flex-wrap gap-2">
                            {t.options[optionKey] && Object.keys(t.options[optionKey]).filter(k => k !== 'name').map(valueKey => (
                                <button
                                    key={valueKey}
                                    onClick={() => handleOptionChange(optionKey, valueKey)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedOptions[optionKey] === valueKey ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    {t.options[optionKey][valueKey]}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">{t.notes}</h3>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition" rows="3" placeholder={t.notesPlaceholder}></textarea>
                </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{t.quantity}</h3>
                    <div className="flex items-center bg-gray-100 rounded-full">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"><Minus size={20} /></button>
                        <span className="px-4 text-lg font-bold w-12 text-center">{quantity}</span>
                        <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"><Plus size={20} /></button>
                    </div>
                </div>
                <button onClick={handleSubmit} className="w-full bg-orange-500 text-white text-lg font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300">
                    {t.addToCart} - ${item.price * quantity}
                </button>
            </div>
        </div>
    </div>
  );
};

const CartModal = ({ cart, t, lang, menuData, totalAmount, isAiEnabled, onClose, onUpdateQuantity, onRemove, onSubmitOrder }) => {
    const [isRecommending, setIsRecommending] = useState(false);
    const [recommendation, setRecommendation] = useState('');

    const handleGetRecommendation = async () => {
        setIsRecommending(true);
        setRecommendation('');
        const cartItemNames = cart.map(item => item.name?.[lang] || item.name.zh).join(', ');
        const menuItems = menuData ? Object.values(menuData).flat() : [];
        const availableMenuItems = menuItems.filter(menuItem => !cart.find(cartItem => cartItem.id === menuItem.id))
            .map(item => item.name?.[lang] || item.name.zh)
            .join(', ');

        const recommendationRequest = {
            language: translations[lang]?.language || "English",
            cartItems: cartItemNames,
            availableItems: availableMenuItems,
        };

        try {
            const response = await fetch(`${API_URL}/api/recommendation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recommendationRequest)
            });
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            const result = await response.json();
            if (result.recommendation) {
                setRecommendation(result.recommendation);
            } else {
                throw new Error("AI response was empty or malformed.");
            }
        } catch (error) {
            setRecommendation(t.orderFail);
            console.error('Error fetching recommendation:', error);
        } finally {
            setIsRecommending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={onClose}>
            <div className="bg-gray-50 w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in-right" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{t.cart}</h2>
                    <button onClick={onClose} className="flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700">
                        <ArrowLeft size={18} />{t.continueOrdering}
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">{t.emptyCart}</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.cartId} className="bg-white p-3 rounded-lg shadow-sm flex items-start space-x-3">
                                <img src={item.image} alt={item.name?.[lang] || item.name?.zh} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{item.name?.[lang] || item.name?.zh}</p>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {item.selectedOptions && Object.values(item.selectedOptions).map(optKey => {
                                            const optionGroupKey = Object.keys(t.options).find(groupKey => t.options[groupKey]?.[optKey]);
                                            return t.options[optionGroupKey]?.[optKey] || optKey;
                                        }).join(', ')}
                                    </div>
                                    {item.notes && <p className="text-xs text-orange-600 mt-1 italic">"{item.notes}"</p>}
                                    <p className="font-semibold text-gray-700 mt-1">${item.price}</p>
                                </div>
                                <div className="flex flex-col items-end justify-between h-full">
                                    <button onClick={() => onRemove(item.cartId)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                                    <div className="flex items-center bg-gray-100 rounded-full">
                                        <button onClick={() => onUpdateQuantity(item.cartId, -1)} className="p-2.5 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"><Minus size={20} /></button>
                                        <span className="px-3 text-lg font-bold w-10 text-center">{item.quantity}</span>
                                        <button onClick={() => onUpdateQuantity(item.cartId, 1)} className="p-2.5 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"><Plus size={20} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isAiEnabled && cart.length > 0 && (
                        <div className="pt-4">
                            <button onClick={handleGetRecommendation} disabled={isRecommending} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center disabled:bg-blue-300 disabled:cursor-wait">
                                <Sparkles size={18} className="mr-2" />{t.getRecommendation}
                            </button>
                        </div>
                    )}
                    {(isRecommending || recommendation) && (
                        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center mb-2">
                                <Sparkles className="text-orange-500 mr-2" size={20} />
                                <h4 className="font-semibold text-orange-700">{t.aiRecommendation}</h4>
                            </div>
                            {isRecommending ? (<p className="text-sm text-gray-600 animate-pulse">{t.aiThinking}</p>) : (<p className="text-sm text-gray-700 whitespace-pre-wrap">{recommendation}</p>)}
                        </div>
                    )}
                </main>
                <footer className="p-4 bg-white border-t">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-800">{t.total}</span>
                        <span className="text-2xl font-bold text-orange-500">${totalAmount}</span>
                    </div>
                    <button onClick={onSubmitOrder} disabled={cart.length === 0} className="w-full bg-green-500 text-white text-lg font-bold py-3 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed">
                        {t.submitOrder}
                    </button>
                </footer>
            </div>
        </div>
    );
};
```

#### **步驟二：推送更新**

完成檔案的完整替換後，請在 `frontend` 資料夾的終端機中，執行 git 指令。

```bash
# 確保你在 frontend 資料夾中
git add .
git commit -m "fix(MenuPage): resolve syntax error with complete file"
git push
```

這次的程式碼是完整且經過驗證的，應該能夠順利通過 Vercel 的建置流程。我們離成功就差這一