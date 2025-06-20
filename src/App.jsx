import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ShoppingCart, X, Plus, Minus, Trash2, Sparkles, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// --- i18n 多國語言資料 (已加入日文與韓文) ---
const translations = {
  zh: {
    language: "繁體中文",
    menu: "菜單",
    categories: { main: "主餐", side: "附餐", drink: "飲品", dessert: "甜點" },
    itemDetails: "餐點詳情",
    addToCart: "加入購物車",
    total: "總計",
    cart: "您的訂單",
    emptyCart: "您的購物車是空的",
    notes: "備註",
    notesPlaceholder: "有什麼特別需求嗎？",
    table: "桌號",
    headcount: "用餐人數",
    quantity: "數量",
    submitOrder: "送出訂單",
    orderSuccess: "下單成功！",
    orderFail: "下單失敗，請稍後再試。",
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
    categories: { main: "Main Course", side: "Side Dish", drink: "Drinks", dessert: "Desserts" },
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
    submitOrder: "Submit Order",
    orderSuccess: "Order placed successfully!",
    orderFail: "Order failed, please try again later.",
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
    categories: { main: "メイン", side: "サイド", drink: "ドリンク", dessert: "デザート" },
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
    submitOrder: "注文を送信",
    orderSuccess: "注文に成功しました！",
    orderFail: "注文に失敗しました。後でもう一度お試しください。",
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
    categories: { main: "메인 요리", side: "사이드", drink: "음료", dessert: "디저트" },
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
    submitOrder: "주문 제출",
    orderSuccess: "주문이 완료되었습니다!",
    orderFail: "주문에 실패했습니다. 나중에 다시 시도해주세요.",
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [headcount, setHeadcount] = useState(1);

  const t = useMemo(() => translations[lang] || translations.en, [lang]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/api/menu`),
          fetch(`${API_URL}/api/settings`)
        ]);
        const menu = await menuRes.json();
        const settings = await settingsRes.json();
        setMenuData(menu);
        setIsAiEnabled(settings.isAiEnabled);
      } catch (error) {
        console.error("無法從後端獲取資料:", error);
        setMenuData({});
      }
    };
    fetchData();
  }, []);

  const categoryRefs = {
    main: useRef(null), side: useRef(null), drink: useRef(null), dessert: useRef(null),
  };

  const scrollToCategory = (categoryId) => {
    categoryRefs[categoryId].current.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleAddToCart = (item, options, notes, quantity) => {
    const cartItem = { ...item, cartId: Date.now(), quantity, selectedOptions: options, notes };
    setCart(prevCart => [...prevCart, cartItem]);
    setSelectedItem(null);
  };
  
  const updateCartItemQuantity = (cartId, delta) => {
    setCart(cart => cart.map(item => item.cartId === cartId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };
  
  const removeFromCart = (cartId) => {
    setCart(cart => cart.filter(item => item.cartId !== cartId));
  };
  
  const handleSubmitOrder = async () => {
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
      console.log('訂單成功送出:', result);
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
  
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="sticky top-0 z-20 bg-white bg-opacity-80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center">
        <LanguageSwitcher lang={lang} setLang={setLang} />
        <div className="text-center">
            <div className="font-bold text-lg text-gray-800">{t.menu}</div>
            <div className="text-sm text-gray-500">{t.table}: A1</div>
        </div>
        <HeadcountSelector headcount={headcount} setHeadcount={setHeadcount} t={t} />
      </header>
      
      <nav className="sticky top-[76px] z-20 bg-white/90 backdrop-blur-md shadow-sm overflow-x-auto">
        <div className="flex justify-center items-center space-x-2 sm:space-x-6 px-4">
          {menuData && Object.keys(menuData).map(key => (<button key={key} onClick={() => scrollToCategory(key)} className="py-3 px-2 sm:px-4 text-sm sm:text-base font-semibold text-gray-600 whitespace-nowrap hover:text-orange-500 focus:text-orange-500 border-b-2 border-transparent focus:border-orange-500 transition-colors duration-200">{t.categories[key] || key}</button>))}
        </div>
      </nav>

      <main className="p-4 max-w-2xl mx-auto">
        {!menuData ? ( <MenuSkeleton /> ) : (
          Object.keys(menuData).map(categoryKey => (
            <section key={categoryKey} ref={categoryRefs[categoryKey]} className="mb-8 scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pt-4">{t.categories[categoryKey] || categoryKey}</h2>
              <div className="space-y-4">
                {(menuData[categoryKey] || []).map(item => (
                  <MenuItem key={item.id} item={item} lang={lang} t={t} onClick={() => setSelectedItem(item)} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {cart.length > 0 && (
         <div className="fixed bottom-6 right-6 z-30">
            <button onClick={() => setIsCartOpen(true)} className="bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 hover:bg-orange-600 transition-all duration-300 transform hover:scale-110">
              <ShoppingCart size={28}/>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{totalItems}</span>
            </button>
        </div>
      )}

      {selectedItem && <ItemDetailModal item={selectedItem} t={t} lang={lang} onClose={() => setSelectedItem(null)} onAddToCart={handleAddToCart} />}
      {isCartOpen && <CartModal cart={cart} t={t} lang={lang} menuData={menuData} totalAmount={totalAmount} isAiEnabled={isAiEnabled} onClose={() => setIsCartOpen(false)} onUpdateQuantity={updateCartItemQuantity} onRemove={removeFromCart} onSubmitOrder={handleSubmitOrder} />}
    </div>
  );
}

// --- 子組件 ---
const LanguageSwitcher = ({ lang, setLang }) => ( <div className="relative"> <select value={lang} onChange={(e) => setLang(e.target.value)} className="appearance-none bg-white bg-opacity-80 backdrop-blur-sm text-gray-800 font-semibold py-2 px-4 pr-8 rounded-full shadow-md focus:outline-none"> {Object.keys(translations).map(key => (<option key={key} value={key}>{translations[key].language}</option>))} </select> <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"><ChevronDown size={20} /></div> </div> );
const HeadcountSelector = ({ headcount, setHeadcount, t }) => ( <div className="flex items-center space-x-2"> <Users size={20} className="text-gray-600" /> <select value={headcount} onChange={e => setHeadcount(parseInt(e.target.value, 10))} className="appearance-none bg-white bg-opacity-80 backdrop-blur-sm text-gray-800 font-semibold py-2 pl-3 pr-8 rounded-full shadow-md focus:outline-none"> {Array.from({ length: 10 }, (_, i) => i + 1).map(num => ( <option key={num} value={num}>{num} {t.headcount.includes("人") ? "人" : ""}</option> ))} </select> </div> );
const MenuItem = ({ item, lang, t, onClick }) => ( <div className="bg-white rounded-xl shadow-md overflow-hidden flex cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={onClick}> <div className="flex-1 p-4"> <h3 className="font-bold text-lg text-gray-900">{item.name?.[lang] || item.name?.zh}</h3> <p className="text-gray-600 text-sm mt-1">{item.description?.[lang] || item.description?.zh}</p> <p className="font-semibold text-orange-500 mt-2">${item.price}</p> </div> <img src={item.image} alt={item.name?.[lang] || item.name?.zh} className="w-32 h-32 object-cover"/> </div> );
const MenuSkeleton = () => ( <div className="space-y-8 animate-pulse"> {[...Array(3)].map((_, i) => ( <div key={i}> <div className="h-8 w-1/3 bg-gray-300 rounded-lg mb-4"></div> <div className="space-y-4"> {[...Array(2)].map((_, j) => ( <div key={j} className="bg-white rounded-xl shadow-md overflow-hidden flex"> <div className="flex-1 p-4"> <div className="h-6 w-3/4 bg-gray-300 rounded"></div> <div className="h-4 w-full bg-gray-200 rounded mt-2"></div> <div className="h-4 w-2/3 bg-gray-200 rounded mt-1"></div> <div className="h-5 w-1/4 bg-gray-300 rounded mt-2"></div> </div> <div className="w-32 h-32 bg-gray-300"></div> </div> ))} </div> </div> ))} </div> );

const ItemDetailModal = ({ item, t, lang, onClose, onAddToCart }) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1); // *** 新增：數量狀態 ***

  useEffect(() => { /* ... */ }, [item, t]);
  
  const handleOptionChange = (group, value) => { setSelectedOptions(prev => ({ ...prev, [group]: value })); };
  const handleSubmit = () => { onAddToCart(item, selectedOptions, notes, quantity); };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end sm:items-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl animate-slide-up">
        {/* ... Modal Header ... */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-300px)]">
          {/* ... Item Details ... */}
          {item.options && item.options.map(optionKey => ( <div key={optionKey}>{/* ... Options ... */}</div> ))}
          {/* ... Notes Textarea ... */}
        </div>
        {/* *** 修改：加入數量選擇器 *** */}
        <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t.quantity}</h3>
                <div className="flex items-center bg-gray-100 rounded-full">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-gray-600 rounded-full hover:bg-gray-200"><Minus size={20} /></button>
                    <span className="px-4 text-lg font-bold">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-gray-600 rounded-full hover:bg-gray-200"><Plus size={20} /></button>
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

const CartModal = ({ cart, t, lang, totalAmount, isAiEnabled, onClose, onUpdateQuantity, onRemove, onSubmitOrder }) => {
    /* ... AI 推薦邏輯保持不變 ... */
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={onClose}>
            <div className="bg-gray-50 w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in-right" onClick={e => e.stopPropagation()}>
                <header>{/* ... */}</header>
                <main className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.map(item => (
                        <div key={item.cartId} className="bg-white p-3 rounded-lg shadow-sm flex items-start space-x-3">
                            <img src={item.name?.[lang] || item.name?.zh} alt={item.name[lang]} className="w-20 h-20 object-cover rounded-md" />
                            <div className="flex-1">{/* ... Item details ... */}</div>
                            <div className="flex flex-col items-end justify-between h-full">
                                <button onClick={() => onRemove(item.cartId)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                                {/* *** 修改：加大數量修改按鈕的點擊範圍和尺寸 *** */}
                                <div className="flex items-center bg-gray-100 rounded-full">
                                    <button onClick={() => onUpdateQuantity(item.cartId, -1)} className="p-2 text-gray-600"><Minus size={20} /></button>
                                    <span className="px-3 text-lg font-bold">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.cartId, 1)} className="p-2 text-gray-600"><Plus size={20} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* ... AI Recommendation section ... */}
                </main>
                <footer className="p-4 bg-white border-t">
                    <div className="flex justify-between items-center mb-4"><span className="text-lg font-semibold text-gray-800">{t.total}</span><span className="text-2xl font-bold text-orange-500">${totalAmount}</span></div>
                    <button onClick={onSubmitOrder} disabled={cart.length === 0} className="w-full bg-green-500 text-white text-lg font-bold py-3 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed">
                        {t.submitOrder}
                    </button>
                </footer>
            </div>
        </div>
    );
};
