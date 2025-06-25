import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ShoppingCart, X, Plus, Minus, Trash2, Sparkles, Users, ArrowLeft, ArrowRight, WifiOff, RefreshCw } from 'lucide-react';

// --- 環境變數設定 ---
// 【重要說明】
// 這一行是 Vite 專案讀取環境變數的標準、正確寫法。
// 您看到的 `[WARNING] "import.meta" is not available...` 警告，
// 是因為預覽環境的程式碼檢查工具不認識 Vite 的這個特定語法。
// 這個警告是正常的，並不會影響您在本機用 `npm run dev` 進行開發，也【不會】影響您最終部署到 Vercel 的網站功能。
// 請您可以放心忽略此警告，繼續進行開發與部署。
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// --- i18n 多國語言資料 (已補全所有語言翻譯) ---
const translations = {
  zh: {
    language: "繁體中文",
    menu: "菜單",
    categories: { all: "全部", limited: "主廚推薦", main: "經典主食", side: "美味附餐", drink: "清涼飲品", dessert: "飯後甜點" },
    announcement: "最新消息",
    announcements: [
        { image: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", text: "炎炎夏日，來一碗清涼消暑的芒果冰吧！本店採用在地愛文芒果，香甜多汁，期間限定優惠中！" },
        { image: "https://images.pexels.com/photos/1893557/pexels-photo-1893557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", text: "即日起，加入會員即享9折優惠，消費累積點數，好禮換不完！詳情請洽櫃檯人員。" },
        { image: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", text: "親愛的顧客您好，為提供更完善的服務，自7月1日起，本店營業時間調整為 11:00 AM - 10:00 PM。" }
    ],
    close: "關閉",
    itemDetails: "餐點詳情",
    addToCart: "加入購物車",
    total: "總計",
    cart: "您的訂單",
    emptyCart: "您的購物車是空的",
    notes: "備註",
    notesPlaceholder: "有什麼特別需求嗎？",
    table: "桌號",
    headcount: "用餐人數",
    quantity: "数量",
    continueOrdering: "繼續點餐",
    submitOrder: "送出訂單",
    confirmOrderTitle: "確認送出訂單？",
    confirmOrderMsg: "訂單送出後將無法修改，請確認您的餐點。",
    cancel: "取消",
    confirm: "確認送出",
    orderSuccess: "下單成功！",
    orderFail: "下單失敗，請稍後再試。",
    loadingMenu: "正在喚醒伺服器，請稍候...",
    loadMenuError: "無法載入菜單，請檢查您的網路連線或稍後再試。",
    retry: "重試",
    noItemsInCategory: "此分類目前沒有商品",
    getRecommendation: "✨ 讓AI推薦加點菜",
    aiRecommendation: "AI 智慧推薦",
    aiThinking: "AI小助手正在為您思考...",
    options: {
        spice: { name: "辣度", none: "不辣", mild: "小辣", medium: "中辣", hot: "大辣" },
        sugar: { name: "甜度", full: "正常糖", less: "少糖", half: "半糖", quarter: "微糖", none: "無糖" },
        ice: { name: "冰塊", regular: "正常冰", less: "少冰", none: "去冰" },
        size: { name: "份量", small: "小份", large: "大份" },
    },
  },
  en: {
    language: "English",
    menu: "Menu",
    categories: { all: "All", limited: "Chef's Special", main: "Main Course", side: "Side Dish", drink: "Drinks", dessert: "Desserts" },
    announcement: "Latest News",
    announcements: [
        { image: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", text: "Enjoy a bowl of refreshing mango shaved ice in the hot summer! Made with fresh local Irwin mangoes." },
        { image: "https://images.pexels.com/photos/1893557/pexels-photo-1893557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", text: "Join our membership program today to get a 10% discount and earn points for every purchase!" },
        { image: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", text: "Dear customers, starting from July 1st, our new opening hours will be 11:00 AM - 10:00 PM." }
    ],
    close: "Close",
    itemDetails: "Item Details",
    addToCart: "Add to Cart",
    total: "Total",
    cart: "Your Order",
    emptyCart: "Your cart is empty",
    notes: "Notes",
    notesPlaceholder: "Any special requests?",
    table: "Table",
    headcount: "Guests",
    quantity: "Quantity",
    continueOrdering: "Continue Ordering",
    submitOrder: "Submit Order",
    confirmOrderTitle: "Confirm your order?",
    confirmOrderMsg: "Once submitted, the order cannot be changed. Please confirm your items.",
    cancel: "Cancel",
    confirm: "Confirm & Submit",
    orderSuccess: "Order placed successfully!",
    orderFail: "Order failed, please try again later.",
    loadingMenu: "Waking up the server, please wait...",
    loadMenuError: "Could not load menu. Please check your connection or try again later.",
    retry: "Retry",
    noItemsInCategory: "No items in this category.",
    getRecommendation: "✨ Get AI Recommendations",
    aiRecommendation: "AI Smart Recommendation",
    aiThinking: "AI assistant is thinking for you...",
    options: {
        spice: { name: "Spice Level", none: "Not Spicy", mild: "Mild", medium: "Medium", hot: "Hot" },
        sugar: { name: "Sugar Level", full: "Normal", less: "Less Sugar", half: "Half Sugar", quarter: "Quarter Sugar", none: "Sugar-Free" },
        ice: { name: "Ice Level", regular: "Regular Ice", less: "Less Ice", none: "No Ice" },
        size: { name: "Size", small: "Small", large: "Large" },
    },
   },
  ja: {
    language: "日本語",
    menu: "メニュー",
    categories: { all: "すべて", limited: "シェフのおすすめ", main: "メイン", side: "サイド", drink: "ドリンク", dessert: "デザート" },
    announcement: "お知らせ",
    announcements: [
        { image: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", text: "暑い夏には、さわやかなマンゴーかき氷をどうぞ！地元産の愛文マンゴーを使用し、甘くてジューシー、期間限定の特別価格です。" },
        { image: "https://images.pexels.com/photos/1893557/pexels-photo-1893557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", text: "本日より、会員になると10%割引！お買い物ごとにポイントが貯まり、素敵な景品と交換できます！" },
        { image: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", text: "お客様へ、より良いサービスを提供するため、7月1日より営業時間を午前11時から午後10時までとさせていただきます。" }
    ],
    close: "閉じる",
    itemDetails: "商品の詳細",
    addToCart: "カートに追加",
    total: "合計",
    cart: "ご注文",
    emptyCart: "カートは空です",
    notes: "備考",
    notesPlaceholder: "特別なご要望はありますか？",
    table: "テーブル",
    headcount: "人数",
    quantity: "数量",
    continueOrdering: "注文を続ける",
    submitOrder: "注文を送信",
    confirmOrderTitle: "注文を確定しますか？",
    confirmOrderMsg: "送信後の変更はできません。ご注文内容をご確認ください。",
    cancel: "キャンセル",
    confirm: "確定する",
    orderSuccess: "注文に成功しました！",
    orderFail: "注文に失敗しました。後でもう一度お試しください。",
    loadingMenu: "サーバーを起動しています、少々お待ちください...",
    loadMenuError: "メニューを読み込めませんでした。接続を確認するか、後でもう一度お試しください。",
    retry: "再試行",
    noItemsInCategory: "このカテゴリには現在商品がありません",
    getRecommendation: "✨ AIにおすすめを聞く",
    aiRecommendation: "AIスマート推薦",
    aiThinking: "AIアシスタントが考えています...",
    options: {
        spice: { name: "辛さ", none: "辛くない", mild: "ピリ辛", medium: "中辛", hot: "激辛" },
        sugar: { name: "甘さ", full: "通常", less: "甘さ控えめ", half: "甘さ半分", quarter: "甘さ微糖", none: "無糖" },
        ice: { name: "氷", regular: "通常", less: "少なめ", none: "氷なし" },
        size: { name: "サイズ", small: "小", large: "大" },
    },
  },
  ko: {
    language: "한국어",
    menu: "메뉴",
    categories: { all: "전체", limited: "셰프 추천", main: "메인 요리", side: "사이드", drink: "음료", dessert: "디저트" },
    announcement: "공지사항",
    announcements: [
        { image: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", text: "더운 여름, 시원한 망고 빙수 한 그릇 즐겨보세요! 현지 애플망고를 사용하여 달콤하고 과즙이 풍부하며, 기간 한정 특별가로 제공됩니다." },
        { image: "https://images.pexels.com/photos/1893557/pexels-photo-1893557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", text: "지금 회원가입 하시면 10% 할인 혜택과 구매 시마다 포인트 적립, 푸짐한 선물로 교환 가능합니다!" },
        { image: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", text: "고객님께, 더 나은 서비스를 제공하기 위해 7월 1일부터 영업시간이 오전 11시부터 오후 10시까지로 변경됩니다." }
    ],
    close: "닫기",
    itemDetails: "상품 상세",
    addToCart: "카트에 추가",
    total: "총액",
    cart: "주문 내역",
    emptyCart: "장바구니가 비어 있습니다",
    notes: "메모",
    notesPlaceholder: "특별한 요청 있으신가요?",
    table: "테이블",
    headcount: "인원수",
    quantity: "수량",
    continueOrdering: "계속 주문하기",
    submitOrder: "주문 제출",
    confirmOrderTitle: "주문을 제출하시겠습니까?",
    confirmOrderMsg: "제출된 주문은 수정할 수 없습니다. 주문 내역을 확인해주세요.",
    cancel: "취소",
    confirm: "제출",
    orderSuccess: "주문이 완료되었습니다!",
    orderFail: "주문에 실패했습니다. 나중에 다시 시도해주세요.",
    loadingMenu: "서버를 깨우는 중입니다. 잠시만 기다려 주세요...",
    loadMenuError: "메뉴를 불러올 수 없습니다. 인터넷 연결을 확인하거나 나중에 다시 시도해주세요.",
    retry: "재시도",
    noItemsInCategory: "이 카테고리에는 현재 상품이 없습니다",
    getRecommendation: "✨ AI에게 추천받기",
    aiRecommendation: "AI 스마트 추천",
    aiThinking: "AI 어시스턴트가 생각 중입니다...",
    options: {
        spice: { name: "맵기", none: "안 매운맛", mild: "순한 맛", medium: "중간 맛", hot: "매운맛" },
        sugar: { name: "당도", full: "정상", less: "덜 달게", half: "중간", quarter: "약간 달게", none: "무설탕" },
        ice: { name: "얼음", regular: "보통", less: "적게", none: "없이" },
        size: { name: "사이즈", small: "소", large: "대" },
    },
  },
};


// --- 主應用程式組件 ---
export default function App() {
  const [lang, setLang] = useState('zh');
  const [cart, setCart] = useState([]);
  const [menuData, setMenuData] = useState(null);
  const [fetchStatus, setFetchStatus] = useState('loading');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [headcount, setHeadcount] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const t = useMemo(() => translations[lang] || translations.zh, [lang]);

  useEffect(() => {
    setFetchStatus('loading');
    const fetchData = async () => {
      try {
        const [menuRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/api/menu`),
          fetch(`${API_URL}/api/settings`)
        ]);
        if (!menuRes.ok || !settingsRes.ok) {
            throw new Error('Network response was not ok');
        }
        const menu = await menuRes.json();
        const settings = await settingsRes.json();
        setMenuData(menu);
        setIsAiEnabled(settings.isAiEnabled);
        setFetchStatus('success');
        if (retryCount === 0) {
            setShowAnnouncement(true);
        }
      } catch (error) {
        console.error("無法從後端獲取資料:", error);
        setFetchStatus('error');
      }
    };
    
    fetchData();
  }, [retryCount]);

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
  
  const updateCartItemQuantity = (cartId, delta) => {
    setCart(cart => cart.map(item => item.cartId === cartId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };
  
  const removeFromCart = (cartId) => {
    setCart(cart => cart.filter(item => item.cartId !== cartId));
  };
  
  const handleSubmitOrder = async () => {
    setShowConfirmModal(false);
    if (cart.length === 0) return;
    const orderData = {
      tableNumber: "A1",
      headcount: headcount,
      totalAmount: totalAmount,
      items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, notes: item.notes || "", selectedOptions: item.selectedOptions }))
    };
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error('伺服器回應錯誤');
      const result = await response.json();
      alert(t.orderSuccess);
      setCart([]);
      setIsCartOpen(false);
    } catch (error) {
      console.error('送出訂單失敗:', error);
      alert(t.orderFail);
    }
  };

  const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  
  const filteredMenu = useMemo(() => {
    if (!menuData) return null;
    if (activeCategory === 'all') return menuData;
    const result = {};
    if (menuData[activeCategory]) {
        result[activeCategory] = menuData[activeCategory];
    }
    return result;
  }, [menuData, activeCategory]);

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };
  
  const renderMainContent = () => {
    if (fetchStatus === 'loading') {
      return <MenuSkeleton t={t} />;
    }
    if (fetchStatus === 'error') {
      return <LoadError t={t} onRetry={handleRetry} />;
    }
    if (fetchStatus === 'success' && filteredMenu) {
      return (
        <React.Fragment>
            <nav className="sticky top-[92px] z-10 bg-white/90 backdrop-blur-md shadow-sm">
                <div className="flex space-x-2 overflow-x-auto px-4 pb-2">
                    {menuData && Object.keys(t.categories).map(key => (
                        <button key={key} onClick={() => setActiveCategory(key)} className={`py-2 px-4 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors duration-200 rounded-full ${activeCategory === key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.categories[key] || key}</button>
                    ))}
                </div>
            </nav>
            <main className="p-4 max-w-2xl mx-auto">
                {Object.keys(filteredMenu).length > 0 ? Object.keys(filteredMenu).map(categoryKey => (
                    <section key={categoryKey} className="mb-8 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 pt-4">{t.categories[categoryKey] || categoryKey}</h2>
                    <div className="space-y-4">
                        {(filteredMenu[categoryKey] || []).map(item => (
                        <MenuItem key={item.id} item={item} lang={lang} t={t} onClick={() => setSelectedItem(item)} />
                        ))}
                    </div>
                    </section>
                )) : <div className="text-center py-10 text-gray-500">{t.noItemsInCategory}</div>}
            </main>
        </React.Fragment>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {showAnnouncement && fetchStatus === 'success' && <AnnouncementModal t={t} onClose={() => setShowAnnouncement(false)} />}
      {showConfirmModal && <ConfirmModal t={t} onConfirm={handleSubmitOrder} onCancel={() => setShowConfirmModal(false)} />}
      <header className="sticky top-0 z-20 bg-white bg-opacity-80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center h-[92px]">
        <div className="flex-1 flex justify-start">
            <div className="flex flex-col items-start gap-2">
                <LanguageSwitcher lang={lang} setLang={setLang} />
                <HeadcountSelector headcount={headcount} setHeadcount={setHeadcount} t={t} />
            </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="font-bold text-lg text-gray-800">{t.menu}</div>
            <div className="text-sm text-gray-500">{t.table}: A1</div>
        </div>
        <div className="flex-1 flex justify-end">
             <div className="text-right text-gray-800 font-bold text-lg" onClick={() => setIsCartOpen(true)}>
                ${totalAmount}
             </div>
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
      {isCartOpen && <CartModal cart={cart} t={t} lang={lang} menuData={menuData} totalAmount={totalAmount} isAiEnabled={isAiEnabled} onClose={() => setIsCartOpen(false)} onUpdateQuantity={updateCartItemQuantity} onRemove={removeFromCart} onSubmitOrder={() => setShowConfirmModal(true)} />}
    </div>
  );
}

// --- 子組件 ---
// ... 此處省略與前一版完全相同的子組件程式碼 ...
