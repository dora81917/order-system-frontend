import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ShoppingCart, X, Plus, Minus, Trash2, Sparkles, Users, ArrowLeft, ArrowRight, WifiOff, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const translations = {
  zh: {
    language: "繁體中文", menu: "菜單", announcement: "最新消息", close: "關閉", itemDetails: "餐點詳情", addToCart: "加入購物車", total: "總計", cart: "您的訂單", emptyCart: "您的購物車是空的", notes: "備註", notesPlaceholder: "有什麼特別需求嗎？", table: "桌號", headcount: "用餐人數", quantity: "數量", continueOrdering: "繼續點餐", submitOrder: "送出訂單", confirmOrderTitle: "確認送出訂單？", confirmOrderMsg: "訂單送出後將無法修改，請確認您的餐點。", cancel: "取消", confirm: "確認送出", orderSuccess: "下單成功！", orderFail: "下單失敗，請稍後再試。", loadingMenu: "正在喚醒伺服器，請稍候...", loadMenuError: "無法載入菜單，請檢查您的網路連線或稍後再試。", retry: "重試", noItemsInCategory: "此分類目前沒有商品", getRecommendation: "✨ 讓AI推薦加點菜", aiRecommendation: "AI 智慧推薦", aiThinking: "AI小助手正在為您思考...", options: { spice: { name: "辣度", none: "不辣", mild: "小辣", medium: "中辣", hot: "大辣" }, sugar: { name: "甜度", full: "正常糖", less: "少糖", half: "半糖", quarter: "微糖", none: "無糖" }, ice: { name: "冰塊", regular: "正常冰", less: "少冰", none: "去冰" }, size: { name: "份量", small: "小份", large: "大份" }, },
  },
  en: {
    language: "English", menu: "Menu", announcement: "Latest News", close: "Close", itemDetails: "Item Details", addToCart: "Add to Cart", total: "Total", cart: "Your Order", emptyCart: "Your cart is empty", notes: "Notes", notesPlaceholder: "Any special requests?", table: "Table", headcount: "Guests", quantity: "Quantity", continueOrdering: "Continue Ordering", submitOrder: "Submit Order", confirmOrderTitle: "Confirm your order?", confirmOrderMsg: "Once submitted, the order cannot be changed. Please confirm your items.", cancel: "Cancel", confirm: "Confirm & Submit", orderSuccess: "Order placed successfully!", orderFail: "Order failed, please try again later.", loadingMenu: "Waking up the server, please wait...", loadMenuError: "Could not load menu. Please check your connection or try again later.", retry: "Retry", noItemsInCategory: "No items in this category.", getRecommendation: "✨ Get AI Recommendations", aiRecommendation: "AI Smart Recommendation", aiThinking: "AI assistant is thinking for you...", options: { spice: { name: "Spice Level", none: "Not Spicy", mild: "Mild", medium: "Medium", hot: "Hot" }, sugar: { name: "Sugar Level", full: "Normal", less: "Less Sugar", half: "Half Sugar", quarter: "Quarter Sugar", none: "Sugar-Free" }, ice: { name: "Ice Level", regular: "Regular Ice", less: "Less Ice", none: "No Ice" }, size: { name: "Size", small: "Small", large: "Large" }, },
  },
  ja: {
    language: "日本語", menu: "メニュー", announcement: "お知らせ", close: "閉じる", itemDetails: "商品の詳細", addToCart: "カートに追加", total: "合計", cart: "ご注文", emptyCart: "カートは空です", notes: "備考", notesPlaceholder: "特別なご要望はありますか？", table: "テーブル", headcount: "人数", quantity: "数量", continueOrdering: "注文を続ける", submitOrder: "注文を送信", confirmOrderTitle: "注文を確定しますか？", confirmOrderMsg: "送信後の変更はできません。ご注文内容をご確認ください。", cancel: "キャンセル", confirm: "確定する", orderSuccess: "注文に成功しました！", orderFail: "注文に失敗しました。後でもう一度お試しください。", loadingMenu: "サーバーを起動しています、少々お待ちください...", loadMenuError: "メニューを読み込めませんでした。接続を確認するか、後でもう一度お試しください。", retry: "再試行", noItemsInCategory: "このカテゴリには現在商品がありません", getRecommendation: "✨ AIにおすすめを聞く", aiRecommendation: "AIスマート推薦", aiThinking: "AIアシスタントが考えています...", options: { spice: { name: "辛さ", none: "辛くない", mild: "ピリ辛", medium: "中辛", hot: "激辛" }, sugar: { name: "甘さ", full: "通常", less: "甘さ控えめ", half: "甘さ半分", quarter: "甘さ微糖", none: "無糖" }, ice: { name: "氷", regular: "通常", less: "少なめ", none: "氷なし" }, size: { name: "サイズ", small: "小", large: "大" }, },
  },
  ko: {
    language: "한국어", menu: "메뉴", announcement: "공지사항", close: "닫기", itemDetails: "상품 상세", addToCart: "카트에 추가", total: "총액", cart: "주문 내역", emptyCart: "장바구니가 비어 있습니다", notes: "메모", notesPlaceholder: "특별한 요청 있으신가요?", table: "테이블", headcount: "인원수", quantity: "수량", continueOrdering: "계속 주문하기", submitOrder: "주문 제출", confirmOrderTitle: "주문을 제출하시겠습니까?", confirmOrderMsg: "제출된 주문은 수정할 수 없습니다. 주문 내역을 확인해주세요.", cancel: "취소", confirm: "제출", orderSuccess: "주문이 완료되었습니다!", orderFail: "주문에 실패했습니다. 나중에 다시 시도해주세요.", loadingMenu: "서버를 깨우는 중입니다. 잠시만 기다려 주세요...", loadMenuError: "메뉴를 불러올 수 없습니다. 인터넷 연결을 확인하거나 나중에 다시 시도해주세요。", retry: "재시도", noItemsInCategory: "이 카테고리에는 현재 상품이 없습니다", getRecommendation: "✨ AI에게 추천받기", aiRecommendation: "AI 스마트 추천", aiThinking: "AI 어시스턴트가 생각 중입니다...", options: { spice: { name: "맵기", none: "안 매운맛", mild: "순한 맛", medium: "중간 맛", hot: "매운맛" }, sugar: { name: "당도", full: "정상", less: "덜 달게", half: "중간", quarter: "약간 달게", none: "무설탕" }, ice: { name: "얼음", regular: "보통", less: "적게", none: "없이" }, size: { name: "사이즈", small: "소", large: "대" }, },
  },
};

export default function MenuPage() {
  const [lang, setLang] = useState('zh');
  const [cart, setCart] = useState([]);
  const [menuData, setMenuData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [fetchStatus, setFetchStatus] = useState('loading');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [settings, setSettings] = useState({});
  const [headcount, setHeadcount] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const t = useMemo(() => translations[lang] || translations.zh, [lang]);

  useEffect(() => {
    const fetchData = async () => {
      setFetchStatus('loading');
      try {
        const [menuResponse, settingsResponse] = await Promise.all([
          fetch(`${API_URL}/api/menu`),
          fetch(`${API_URL}/api/settings`)
        ]);
        if (!menuResponse.ok || !settingsResponse.ok) throw new Error('Network response was not ok');
        
        const { menu, categories: fetchedCategories } = await menuResponse.json();
        const appSettings = await settingsResponse.json();
        
        setMenuData(menu);
        setCategories(fetchedCategories);
        setSettings(appSettings);
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

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-bg-color', settings.themeBgColor || '#F9FAFB');
    root.style.setProperty('--theme-header-color', settings.themeHeaderColor || '#FFFFFF');
    root.style.setProperty('--theme-text-color', settings.themeTextColor || '#1F2937');
    root.style.setProperty('--theme-primary-color', settings.themePrimaryColor || '#F97316');
    root.style.setProperty('--theme-item-bg-color', settings.themeItemBgColor || '#FFFFFF');
    
    if (settings.themeBgImageUrl) {
      root.style.setProperty('--theme-bg-image-url', `url(${settings.themeBgImageUrl})`);
    } else {
      root.style.setProperty('--theme-bg-image-url', 'none');
    }
  }, [settings]);

  const subTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const transactionFee = useMemo(() => Math.round(subTotal * ((settings.transactionFeePercent || 0) / 100)), [subTotal, settings.transactionFeePercent]);
  const totalAmount = useMemo(() => subTotal + transactionFee, [subTotal, transactionFee]);
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  
  const handleAddToCart = (item, options, notes, quantity) => { const optionsKey = JSON.stringify(Object.keys(options).sort().map(key => `${key}:${options[key]}`)); const notesKey = notes || ''; const uniqueId = `${item.id}-${optionsKey}-${notesKey}`; const existingItemIndex = cart.findIndex(cartItem => cartItem.uniqueId === uniqueId); if (existingItemIndex > -1) { const updatedCart = [...cart]; updatedCart[existingItemIndex].quantity += quantity; setCart(updatedCart); } else { const cartItem = { ...item, cartId: Date.now(), uniqueId, quantity, selectedOptions: options, notes }; setCart(prevCart => [...prevCart, cartItem]); } setSelectedItem(null); };
  const updateCartItemQuantity = (cartId, delta) => setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  const removeFromCart = (cartId) => setCart(cart => cart.filter(item => item.cartId !== cartId));
  const handleRetry = () => setRetryCount(c => c + 1);
  const handleSubmitOrder = async () => { setShowConfirmModal(false); if (cart.length === 0) return; const orderData = { tableNumber: "A1", headcount, totalAmount: subTotal, fee: transactionFee, finalAmount: totalAmount, items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, notes: item.notes || "", selectedOptions: item.selectedOptions })) }; try { const response = await fetch(`${API_URL}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData), }); if (!response.ok) throw new Error('伺服器回應錯誤'); await response.json(); alert(t.orderSuccess); setCart([]); setIsCartOpen(false); } catch (error) { console.error('送出訂單失敗:', error); alert(t.orderFail); } };

  const renderMainContent = () => {
    if (fetchStatus === 'loading') return <MenuSkeleton t={t} />;
    if (fetchStatus === 'error') return <LoadError t={t} onRetry={handleRetry} />;
    if (fetchStatus === 'success' && menuData) {
      const categoryKeysInOrder = ['all', ...categories.map(c => c.key)];
      const itemsToDisplay = activeCategory === 'all' 
        ? categories.map(c => c.key) 
        : (menuData[activeCategory] ? [activeCategory] : []);

      return (
        <>
          <nav className="sticky top-[100px] z-10 bg-[var(--theme-header-color)] bg-opacity-80 backdrop-blur-md shadow-sm">
            <div className="flex space-x-2 overflow-x-auto px-4 py-3">
              {categoryKeysInOrder.map(key => {
                const nameObj = key === 'all' ? { zh: '全部', en: 'All', ja: 'すべて', ko: '전체' } : categories.find(c => c.key === key)?.name;
                if (!nameObj || (key !== 'all' && (!menuData[key] || menuData[key].length === 0))) return null;
                return (
                  <button key={key} onClick={() => setActiveCategory(key)} className={`py-2 px-3 text-sm font-semibold whitespace-nowrap transition-colors duration-200 rounded-full ${activeCategory === key ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  style={activeCategory === key ? {backgroundColor: 'var(--theme-primary-color)'} : {}}
                  >
                    {nameObj[lang] || nameObj.zh}
                  </button>
                )
              })}
            </div>
          </nav>
          <main className="p-4 max-w-2xl mx-auto">
            {itemsToDisplay.length > 0 ? itemsToDisplay.map(categoryKey => {
                const categoryInfo = categories.find(c => c.key === categoryKey);
                if (!categoryInfo || !menuData[categoryKey] || menuData[categoryKey].length === 0) return null;
                return (
                    <section key={categoryKey} className="mb-8 scroll-mt-28">
                        <h2 className="text-2xl font-bold mb-4 pt-4" style={{color: 'var(--theme-text-color)'}}>{categoryInfo.name[lang] || categoryInfo.name.zh}</h2>
                        <div className="space-y-4">
                        {(menuData[categoryKey] || []).map(item => (
                            <MenuItem key={item.id} item={item} lang={lang} t={t} onClick={() => setSelectedItem(item)} themeColor={settings.themeItemBgColor} />
                        ))}
                        </div>
                    </section>
                )
            }) : <div className="text-center py-10 text-gray-500">{t.noItemsInCategory}</div>}
          </main>
        </>
      );
    }
    return null;
  };
  
  return (
    <div 
      className="bg-[var(--theme-bg-color)] min-h-screen font-sans bg-cover bg-center bg-fixed"
      style={{ 
        color: 'var(--theme-text-color)',
        backgroundImage: `var(--theme-bg-image-url)`
      }}
    >
      {showAnnouncement && fetchStatus === 'success' && <AnnouncementModal t={t} announcements={settings.announcements} onClose={() => setShowAnnouncement(false)} />}
      {showConfirmModal && <ConfirmModal t={t} onConfirm={handleSubmitOrder} onCancel={() => setShowConfirmModal(false)} />}
      
      <header className="sticky top-0 z-20 bg-[var(--theme-header-color)] bg-opacity-80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center h-[100px]">
        <div className="flex-1 flex flex-col items-start justify-center gap-2">
            <LanguageSwitcher lang={lang} setLang={setLang} />
            <HeadcountSelector headcount={headcount} setHeadcount={setHeadcount} lang={lang} />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
            {settings.useLogo ? (
                <img src={settings.logoUrl || '/images/default-logo.png'} alt="Restaurant Logo" className="h-12 mx-auto" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x50/F97316/FFFFFF?text=Logo'; }} />
            ) : (
                <div className="font-bold text-xl" style={{color: 'var(--theme-text-color)'}}>{t.menu}</div>
            )}
            <div className="text-sm text-gray-500 mt-1">{t.table}: A1</div>
        </div>
        <div className="flex-1 flex justify-end">
             <div className="text-right font-bold text-lg cursor-pointer" style={{color: 'var(--theme-primary-color)'}} onClick={() => setIsCartOpen(true)}>${totalAmount}</div>
        </div>
      </header>
      
      {renderMainContent()}
      
      {cart.length > 0 && (
         <div className="fixed bottom-6 right-6 z-30">
            <button onClick={() => setIsCartOpen(true)} className="text-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 hover:opacity-90 transition-all duration-300 transform hover:scale-110" style={{backgroundColor: 'var(--theme-primary-color)'}}>
              <ShoppingCart size={28}/>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{totalItems}</span>
            </button>
        </div>
      )}

      {selectedItem && <ItemDetailModal item={selectedItem} t={t} lang={lang} onClose={() => setSelectedItem(null)} onAddToCart={handleAddToCart} settings={settings} />}
      {isCartOpen && <CartModal cart={cart} t={t} lang={lang} menuData={menuData} subTotal={subTotal} transactionFee={transactionFee} totalAmount={totalAmount} settings={settings} onClose={() => setIsCartOpen(false)} onUpdateQuantity={updateCartItemQuantity} onRemove={removeFromCart} onSubmitOrder={() => setShowConfirmModal(true)} />}
    </div>
  );
}

const MenuItem = ({ item, lang, t, onClick, themeColor }) => ( <div className="rounded-xl shadow-md overflow-hidden flex cursor-pointer hover:shadow-lg transition-shadow duration-300" style={{ backgroundColor: themeColor }} onClick={onClick} > <div className="flex-1 p-4"> <h3 className="font-bold text-lg" style={{color: 'var(--theme-text-color)'}}>{item.name?.[lang] || item.name?.zh}</h3> <p className="text-gray-600 text-sm mt-1">{item.description?.[lang] || item.description?.zh}</p> <p className="font-semibold mt-2" style={{color: 'var(--theme-primary-color)'}}>${item.price}</p> </div> <img src={item.image} alt={item.name?.[lang] || item.name?.zh} className="w-32 h-32 object-cover"/> </div> );
const AnnouncementModal = ({ t, announcements, onClose }) => { const [currentIndex, setCurrentIndex] = useState(0); const touchStartX = useRef(0); const touchEndX = useRef(0); if(!announcements || announcements.length === 0) return null; const prevSlide = () => setCurrentIndex(i => (i === 0 ? announcements.length - 1 : i - 1)); const nextSlide = () => setCurrentIndex(i => (i === announcements.length - 1 ? 0 : i + 1)); const handleTouchStart = (e) => touchStartX.current = e.targetTouches[0].clientX; const handleTouchMove = (e) => touchEndX.current = e.targetTouches[0].clientX; const handleTouchEnd = () => { if (touchStartX.current - touchEndX.current > 50) nextSlide(); if (touchStartX.current - touchEndX.current < -50) prevSlide(); }; return ( <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4"> <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 text-center animate-slide-up relative" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}> <h2 className="text-2xl font-bold text-orange-500 mb-4">{t.announcement}</h2> <div className="relative h-80 overflow-hidden"> {announcements.map((ann, index) => ( <div key={ann.id || index} className="absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out" style={{ transform: `translateX(${(index - currentIndex) * 100}%)` }}> <img src={ann.image} alt={`Announcement ${index + 1}`} className="w-full h-48 object-cover rounded-lg mb-4" /> <p className="text-gray-700">{ann.text}</p> </div> ))} </div> <div className="flex justify-center items-center my-4 space-x-2"> {announcements.map((_, index) => (<div key={index} className={`w-3 h-3 rounded-full transition-colors ${currentIndex === index ? 'bg-orange-500' : 'bg-gray-300'}`}></div>))} </div> <button onClick={onClose} className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors mt-2">{t.close}</button> <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white/80 transition-colors"><ArrowLeft /></button> <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white/80 transition-colors"><ArrowRight /></button> </div> </div> ); };
const ConfirmModal = ({ t, onConfirm, onCancel }) => ( <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4"> <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 animate-slide-up"> <h3 className="text-xl font-bold text-gray-800 mb-2">{t.confirmOrderTitle}</h3> <p className="text-gray-600 mb-6">{t.confirmOrderMsg}</p> <div className="flex gap-4"> <button onClick={onCancel} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors">{t.cancel}</button> <button onClick={onConfirm} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors">{t.confirm}</button> </div> </div> </div> );
const LanguageSwitcher = ({ lang, setLang }) => ( <div className="relative"> <select value={lang} onChange={(e) => setLang(e.target.value)} className="appearance-none bg-white bg-opacity-80 backdrop-blur-sm text-gray-800 font-semibold py-1 px-3 pr-8 rounded-full shadow-sm focus:outline-none text-sm"> {Object.keys(translations).map(key => (<option key={key} value={key}>{translations[key].language}</option>))} </select> <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"><ChevronDown size={16} /></div> </div> );
const HeadcountSelector = ({ headcount, setHeadcount, lang }) => { const getUnitText = (num) => { if (lang === 'zh' || lang === 'ja') return '人'; if (lang === 'ko') return '명'; return num > 1 ? 'guests' : 'guest'; }; return ( <div className="relative flex items-center"> <Users size={16} className="text-gray-600 absolute left-2.5 z-10 pointer-events-none" /> <select value={headcount} onChange={e => setHeadcount(parseInt(e.target.value, 10))} className="appearance-none bg-white bg-opacity-80 backdrop-blur-sm text-gray-800 font-semibold py-1 pl-8 pr-3 rounded-full shadow-sm focus:outline-none text-sm" > {Array.from({ length: 10 }, (_, i) => i + 1).map(num => ( <option key={num} value={num}> {num} {getUnitText(num)} </option> ))} </select> </div> ); };
const MenuSkeleton = ({ t }) => ( <div className="space-y-8 animate-pulse pt-4"> <div className="text-center text-gray-500 font-semibold">{t.loadingMenu}</div> {[...Array(3)].map((_, i) => ( <div key={i}> <div className="h-8 w-1/3 bg-gray-300 rounded-lg mb-4"></div> <div className="space-y-4"> {[...Array(2)].map((_, j) => ( <div key={j} className="bg-white rounded-xl shadow-md overflow-hidden flex"> <div className="flex-1 p-4"> <div className="h-6 w-3/4 bg-gray-300 rounded"></div> <div className="h-4 w-full bg-gray-200 rounded mt-2"></div> <div className="h-4 w-2/3 bg-gray-200 rounded mt-1"></div> <div className="h-5 w-1/4 bg-gray-300 rounded mt-2"></div> </div> <div className="w-32 h-32 bg-gray-300"></div> </div> ))} </div> </div> ))} </div> );
const LoadError = ({ t, onRetry }) => ( <div className="text-center py-20"> <WifiOff className="mx-auto h-16 w-16 text-red-400" /> <h3 className="mt-4 text-xl font-semibold text-gray-800">載入失敗</h3> <p className="mt-2 text-gray-500">{t.loadMenuError}</p> <button onClick={onRetry} className="mt-6 inline-flex items-center gap-2 bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors"> <RefreshCw size={18} /> {t.retry} </button> </div> );
const ItemDetailModal = ({ item, t, lang, onClose, onAddToCart, settings }) => { const [selectedOptions, setSelectedOptions] = useState({}); const [notes, setNotes] = useState(''); const [quantity, setQuantity] = useState(1); useEffect(() => { const initialOptions = {}; if (item.options && Array.isArray(item.options)) { item.options.forEach(optionKey => { if (t.options[optionKey]) { const optionValues = Object.keys(t.options[optionKey]).filter(k => k !== 'name'); if (optionValues.length > 0) { initialOptions[optionKey] = optionValues[0]; } } }); } setSelectedOptions(initialOptions); }, [item, t]); const handleOptionChange = (group, value) => { setSelectedOptions(prev => ({ ...prev, [group]: value })); }; const handleSubmit = () => { onAddToCart(item, selectedOptions, notes, quantity); }; return ( <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end sm:items-center p-4"> <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl animate-slide-up"> <div className="relative"> <img src={item.image} alt={item.name?.[lang] || item.name?.zh} className="w-full h-48 object-cover rounded-t-2xl sm:rounded-t-lg" /> <button onClick={onClose} className="absolute top-3 right-3 bg-white/70 rounded-full p-2 text-gray-800 hover:bg-white transition-colors"><X size={24} /></button> </div> <div className="p-6 overflow-y-auto max-h-[calc(100vh-350px)]"> <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--theme-text-color)'}}>{item.name?.[lang] || item.name?.zh}</h2> <p className="text-gray-600 mb-4">{item.description?.[lang] || item.description?.zh}</p> <p className="text-2xl font-bold mb-6" style={{color: 'var(--theme-primary-color)'}}>${item.price}</p> {item.options && Array.isArray(item.options) && item.options.map(optionKey => ( <div key={optionKey} className="mb-6"> <h3 className="text-lg font-semibold mb-3" style={{color: 'var(--theme-text-color)'}}>{t.options[optionKey]?.name}</h3> <div className="flex flex-wrap gap-2"> {t.options[optionKey] && Object.keys(t.options[optionKey]).filter(k => k !== 'name').map(valueKey => ( <button key={valueKey} onClick={() => handleOptionChange(optionKey, valueKey)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedOptions[optionKey] === valueKey ? 'text-white' : 'bg-gray-200 text-gray-700'}`} style={selectedOptions[optionKey] === valueKey ? {backgroundColor: 'var(--theme-primary-color)'} : {}}>{t.options[optionKey][valueKey]}</button>))} </div> </div>))} <div className="mb-6"> <h3 className="text-lg font-semibold mb-3" style={{color: 'var(--theme-text-color)'}}>{t.notes}</h3> <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition" rows="3" placeholder={t.notesPlaceholder} style={{'--tw-ring-color': 'var(--theme-primary-color)'}}></textarea> </div> </div> <div className="p-4 bg-white border-t border-gray-200"> <div className="flex justify-between items-center mb-4"> <h3 className="text-lg font-semibold" style={{color: 'var(--theme-text-color)'}}>{t.quantity}</h3> <div className="flex items-center bg-gray-100 rounded-full"> <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"><Minus size={20} /></button> <span className="px-4 text-lg font-bold w-12 text-center" style={{color: 'var(--theme-text-color)'}}>{quantity}</span> <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"><Plus size={20} /></button> </div> </div> <button onClick={handleSubmit} className="w-full text-white text-lg font-bold py-3 rounded-lg transition-colors duration-300" style={{backgroundColor: 'var(--theme-primary-color)'}}>{t.addToCart} - ${item.price * quantity}</button> </div> </div> </div> ); };
const CartModal = ({ cart, t, lang, menuData, subTotal, transactionFee, totalAmount, settings, onClose, onUpdateQuantity, onRemove, onSubmitOrder }) => { const [isRecommending, setIsRecommending] = useState(false); const [recommendation, setRecommendation] = useState(''); const handleGetRecommendation = async () => { setIsRecommending(true); setRecommendation(''); const controller = new AbortController(); const timeoutId = setTimeout(() => controller.abort(), 15000); const cartItemNames = cart.map(item => item.name?.[lang] || item.name.zh).join(', '); const menuItems = menuData ? Object.values(menuData).flat() : []; const availableMenuItems = menuItems.filter(menuItem => !cart.find(cartItem => cartItem.id === menuItem.id)).map(item => item.name?.[lang] || item.name.zh).join(', '); const recommendationRequest = { language: translations[lang]?.language || "English", cartItems: cart.length > 0 ? cartItemNames : null, availableItems: availableMenuItems }; try { const response = await fetch(`${API_URL}/api/recommendation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(recommendationRequest), signal: controller.signal }); clearTimeout(timeoutId); if (!response.ok) throw new Error(`API call failed with status: ${response.status}`); const result = await response.json(); if (result.recommendation) { setRecommendation(result.recommendation); } else { throw new Error("AI response was empty or malformed."); } } catch (error) { if (error.name === 'AbortError') { setRecommendation("AI小助手忙線中，請稍後再試。"); } else { setRecommendation(t.orderFail); } console.error('Error fetching recommendation:', error); } finally { setIsRecommending(false); } }; return ( <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={onClose}> <div className="bg-gray-50 w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in-right" onClick={e => e.stopPropagation()}> <header className="p-4 border-b flex justify-between items-center"> <h2 className="text-xl font-bold text-gray-800">{t.cart}</h2> <button onClick={onClose} className="flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700"><ArrowLeft size={18} />{t.continueOrdering}</button> </header> <main className="flex-1 overflow-y-auto p-4 space-y-4"> {cart.length === 0 ? ( <div className="text-center text-gray-500 py-10"><ShoppingCart size={48} className="mx-auto text-gray-300" /><p className="mt-4">{t.emptyCart}</p></div> ) : ( cart.map(item => ( <div key={item.cartId} className="bg-white p-3 rounded-lg shadow-sm flex items-start space-x-3"> <img src={item.image} alt={item.name?.[lang] || item.name?.zh} className="w-20 h-20 object-cover rounded-md flex-shrink-0" /> <div className="flex-1"> <p className="font-bold text-gray-800">{item.name?.[lang] || item.name?.zh}</p> <div className="text-xs text-gray-500 mt-1">{item.selectedOptions && Object.values(item.selectedOptions).map(optKey => { const optionGroupKey = Object.keys(t.options).find(groupKey => t.options[groupKey]?.[optKey]); return t.options[optionGroupKey]?.[optKey] || optKey; }).join(', ')}</div> {item.notes && <p className="text-xs text-orange-600 mt-1 italic">"{item.notes}"</p>} <p className="font-semibold text-gray-700 mt-1">${item.price}</p> </div> <div className="flex flex-col items-end justify-between h-full"> <button onClick={() => onRemove(item.cartId)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button> <div className="flex items-center bg-gray-100 rounded-full"> <button onClick={() => onUpdateQuantity(item.cartId, -1)} className="p-2.5 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"><Minus size={20} /></button> <span className="px-3 text-lg font-bold w-10 text-center">{item.quantity}</span> <button onClick={() => onUpdateQuantity(item.cartId, 1)} className="p-2.5 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"><Plus size={20} /></button> </div> </div> </div> )) )} {settings.isAiEnabled && ( <div className="pt-4"><button onClick={handleGetRecommendation} disabled={isRecommending} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center disabled:bg-blue-300 disabled:cursor-wait"><Sparkles size={18} className="mr-2" />{cart.length > 0 ? t.getRecommendation : '不知道吃什麼？讓AI推薦！'}</button></div>)} {(isRecommending || recommendation) && ( <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200"> <div className="flex items-center mb-2"><Sparkles className="text-orange-500 mr-2" size={20} /><h4 className="font-semibold text-orange-700">{t.aiRecommendation}</h4></div> {isRecommending ? (<p className="text-sm text-gray-600 animate-pulse">{t.aiThinking}</p>) : (<p className="text-sm text-gray-700 whitespace-pre-wrap">{recommendation}</p>)} </div>)} </main> <footer className="p-4 bg-white border-t"> <div className="flex justify-between items-center mb-1"><span className="text-md text-gray-600">小計</span><span className="text-md font-medium text-gray-800">${subTotal}</span></div> <div className="flex justify-between items-center mb-4"><span className="text-md text-gray-600">服務費 ({settings.transactionFeePercent || 0}%)</span><span className="text-md font-medium text-gray-800">${transactionFee}</span></div> <div className="flex justify-between items-center mb-4 border-t pt-4"><span className="text-lg font-semibold text-gray-800">{t.total}</span><span className="text-2xl font-bold text-orange-500">${totalAmount}</span></div> <button onClick={onSubmitOrder} disabled={cart.length === 0} className="w-full bg-green-500 text-white text-lg font-bold py-3 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed">{t.submitOrder}</button> </footer> </div> </div> ); };
