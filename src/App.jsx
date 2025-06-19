//const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ShoppingCart, X, Plus, Minus, Trash2, Sparkles } from 'lucide-react';

// --- 環境變數設定 ---
// 這一行是 Vite 專案讀取環境變數的標準方式。
// Vite 在建置專案時，會自動將 `import.meta.env.VITE_API_BASE_URL` 替換為您在 Vercel 上設定的實際網址。
// 在某些非 Vite 的程式碼檢查工具中 (例如本預覽環境)，可能會看到一個關於 `import.meta` 的 "WARNING" (警告)，
// 這是因為該工具不認識 Vite 的語法。這個警告是正常的，並不會影響您在本機開發或線上部署的實際運行。
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';


// --- i18n 多國語言資料 ---
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
    notesPlaceholder: "有什麼特別需求嗎？ (例如：不要香菜)",
    table: "桌號",
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
  // ... 其他語言的翻譯 ...
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
    notesPlaceholder: "Any special requests? (e.g., no cilantro)",
    table: "Table",
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
};


// --- 主應用程式組件 ---
export default function App() {
  const [lang, setLang] = useState('zh');
  const [cart, setCart] = useState([]);
  const [menuData, setMenuData] = useState({ main: [], side: [], drink: [], dessert: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(false); // AI 功能開關

  const t = useMemo(() => translations[lang] || translations.en, [lang]);

  // 從後端獲取菜單和設定
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 獲取菜單
        const menuRes = await fetch(`${API_URL}/api/menu`);
        const menu = await menuRes.json();
        setMenuData(menu);
        
        // 獲取 AI 設定 (管理者開關)
        const settingsRes = await fetch(`${API_URL}/api/settings`);
        const settings = await settingsRes.json();
        setIsAiEnabled(settings.isAiEnabled);

      } catch (error) {
        console.error("無法從後端獲取資料:", error);
      }
    };
    fetchData();
  }, []);

  const categoryRefs = {
    main: useRef(null), side: useRef(null), drink: useRef(null), dessert: useRef(null),
  };

  const scrollToCategory = (categoryId) => {
    categoryRefs[categoryId].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  const handleAddToCart = (item, options, notes) => {
    const cartItem = { ...item, cartId: Date.now(), quantity: 1, selectedOptions: options, notes };
    setCart(prevCart => [...prevCart, cartItem]);
    setSelectedItem(null);
  };
  
  const updateCartItemQuantity = (cartId, delta) => {
    setCart(cart => cart.map(item => item.cartId === cartId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };
  
  const removeFromCart = (cartId) => {
    setCart(cart => cart.filter(item => item.cartId !== cartId));
  };
  
  // *** 新增：送出訂單的處理函式 ***
  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;

    const orderData = {
      tableNumber: "A1", // 暫時寫死，未來應從網址參數獲取
      totalAmount: totalAmount,
      items: cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        notes: item.notes || "",
        // 如果需要，也可以傳送客製化選項
      }))
    };

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('伺服器回應錯誤');
      }

      const result = await response.json();
      console.log('訂單成功送出:', result);
      alert(t.orderSuccess); // 暫用 alert，未來可換成更美觀的提示框
      setCart([]); // 清空購物車
      setIsCartOpen(false); // 關閉購物車

    } catch (error) {
      console.error('送出訂單失敗:', error);
      alert(t.orderFail);
    }
  };


  const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  
  const LanguageSwitcher = () => (
    <div className="relative">
      <select value={lang} onChange={(e) => setLang(e.target.value)} className="appearance-none bg-white bg-opacity-80 backdrop-blur-sm text-gray-800 font-semibold py-2 px-4 pr-8 rounded-full shadow-md focus:outline-none">
        {Object.keys(translations).map(key => (<option key={key} value={key}>{translations[key].language}</option>))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"><ChevronDown size={20} /></div>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="sticky top-0 z-20 bg-white bg-opacity-80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center">
        <LanguageSwitcher />
        <div className="text-center">
            <div className="font-bold text-lg text-gray-800">{t.menu}</div>
            <div className="text-sm text-gray-500">{t.table}: A1</div>
        </div>
        <div className="text-right text-gray-800 font-bold" onClick={() => setIsCartOpen(true)}>${totalAmount}</div>
      </header>
      
      <nav className="sticky top-[72px] z-20 bg-white/90 backdrop-blur-md shadow-sm overflow-x-auto">
        <div className="flex justify-center items-center space-x-2 sm:space-x-6 px-4">
          {Object.keys(t.categories).map(key => (<button key={key} onClick={() => scrollToCategory(key)} className="py-3 px-2 sm:px-4 text-sm sm:text-base font-semibold text-gray-600 whitespace-nowrap hover:text-orange-500 focus:text-orange-500 border-b-2 border-transparent focus:border-orange-500 transition-colors duration-200">{t.categories[key]}</button>))}
        </div>
      </nav>

      <main className="p-4 max-w-2xl mx-auto">
        {Object.keys(menuData).map(categoryKey => (
          <section key={categoryKey} ref={categoryRefs[categoryKey]} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pt-4">{t.categories[categoryKey]}</h2>
            <div className="space-y-4">
              {(menuData[categoryKey] || []).map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden flex cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => setSelectedItem(item)}>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-lg text-gray-900">{item.name?.[lang] || item.name?.zh}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.description?.[lang] || item.description?.zh}</p>
                    <p className="font-semibold text-orange-500 mt-2">${item.price}</p>
                  </div>
                  <img src={item.image} alt={item.name?.[lang] || item.name?.zh} className="w-32 h-32 object-cover"/>
                </div>
              ))}
            </div>
          </section>
        ))}
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
      
      {/* *** 修改：傳入 handleSubmitOrder 和 isAiEnabled *** */}
      {isCartOpen && <CartModal cart={cart} t={t} lang={lang} menuData={menuData} totalAmount={totalAmount} isAiEnabled={isAiEnabled} onClose={() => setIsCartOpen(false)} onUpdateQuantity={updateCartItemQuantity} onRemove={removeFromCart} onSubmitOrder={handleSubmitOrder} />}
    </div>
  );
}

// --- 餐點詳情彈窗組件 (小幅修改以應對多語言)---
const ItemDetailModal = ({ item, t, lang, onClose, onAddToCart }) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const initialOptions = {};
    item.options.forEach(optionKey => {
      const optionValues = Object.keys(t.options[optionKey]);
      if (optionValues.length > 1) {
          initialOptions[optionKey] = Object.keys(t.options[optionKey]).filter(k => k !== 'name')[0];
      }
    });
    setSelectedOptions(initialOptions);
  }, [item, t]);
  
  const handleOptionChange = (group, value) => { setSelectedOptions(prev => ({ ...prev, [group]: value })); };
  const handleSubmit = () => { onAddToCart(item, selectedOptions, notes); };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end sm:items-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl animate-slide-up">
        <div className="relative">
          <img src={item.image} alt={item.name?.[lang] || item.name?.zh} className="w-full h-48 object-cover rounded-t-2xl sm:rounded-t-lg" />
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/70 rounded-full p-2 text-gray-800 hover:bg-white"><X size={24} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-300px)]">
          <h2 className="text-2xl font-bold mb-2">{item.name?.[lang] || item.name?.zh}</h2>
          <p className="text-gray-600 mb-4">{item.description?.[lang] || item.description?.zh}</p>
          <p className="text-2xl font-bold text-orange-500 mb-6">${item.price}</p>
          {item.options.map(optionKey => (
            <div key={optionKey} className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{t.options[optionKey].name}</h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(t.options[optionKey]).filter(k => k !== 'name').map(valueKey => (
                  <button key={valueKey} onClick={() => handleOptionChange(optionKey, valueKey)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedOptions[optionKey] === valueKey ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{t.options[optionKey][valueKey]}</button>
                ))}
              </div>
            </div>
          ))}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t.notes}</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition" rows="3" placeholder={t.notesPlaceholder}></textarea>
          </div>
        </div>
        <div className="p-4 bg-white border-t border-gray-200"><button onClick={handleSubmit} className="w-full bg-orange-500 text-white text-lg font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300">{t.addToCart} - ${item.price}</button></div>
      </div>
    </div>
  );
};

// --- 購物車彈窗組件 (整合 Gemini AI 和送出訂單) ---
const CartModal = ({ cart, t, lang, menuData, totalAmount, isAiEnabled, onClose, onUpdateQuantity, onRemove, onSubmitOrder }) => {
    const [isRecommending, setIsRecommending] = useState(false);
    const [recommendation, setRecommendation] = useState('');

    const handleGetRecommendation = async () => {
        setIsRecommending(true); setRecommendation('');
        const cartItemNames = cart.map(item => item.name[lang] || item.name.zh).join(', ');
        const availableMenuItems = Object.values(menuData).flat().filter(menuItem => !cart.find(cartItem => cartItem.id === menuItem.id)).map(item => item.name[lang] || item.name.zh).join(', ');
        
        // 將呼叫 Gemini 的邏輯移至後端，以確保 API 金鑰的安全性
        const recommendationRequest = {
            language: translations[lang]?.language || "English",
            cartItems: cartItemNames,
            availableItems: availableMenuItems,
        };

        try {
            // 現在呼叫我們自己的後端 API 端點來獲取推薦
            const response = await fetch(`${API_URL}/api/recommendation`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(recommendationRequest) 
            });

            if (!response.ok) { throw new Error(`API call failed with status: ${response.status}`); }
            
            const result = await response.json();
            
            if (result.recommendation) {
                setRecommendation(result.recommendation);
            } else { 
                throw new Error("AI response was empty or malformed."); 
            }
        } catch (error) {
            setRecommendation(t.orderFail); console.error('Error fetching recommendation:', error);
        } finally {
            setIsRecommending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={onClose}>
            <div className="bg-gray-50 w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in-right" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{t.cart}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </header>
                
                {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-gray-500"><ShoppingCart size={48} className="mb-4"/><p>{t.emptyCart}</p></div>
                ) : (
                    <main className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.map(item => (
                            <div key={item.cartId} className="bg-white p-3 rounded-lg shadow-sm flex items-start space-x-3">
                                <img src={item.image} alt={item.name?.[lang] || item.name?.zh} className="w-20 h-20 object-cover rounded-md" />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{item.name?.[lang] || item.name?.zh}</p>
                                    <div className="text-xs text-gray-500 mt-1">{Object.entries(item.selectedOptions).map(([group, option]) => (<span key={group} className="mr-2">{t.options[group][option]}</span>))}</div>
                                    {item.notes && <p className="text-xs text-orange-600 mt-1 italic">"{item.notes}"</p>}
                                    <p className="font-semibold text-gray-700 mt-1">${item.price}</p>
                                </div>
                                <div className="flex flex-col items-end justify-between h-full">
                                    <button onClick={() => onRemove(item.cartId)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                    <div className="flex items-center bg-gray-100 rounded-full">
                                        <button onClick={() => onUpdateQuantity(item.cartId, -1)} className="p-1.5 text-gray-600"><Minus size={16} /></button>
                                        <span className="px-2 text-sm font-bold">{item.quantity}</span>
                                        <button onClick={() => onUpdateQuantity(item.cartId, 1)} className="p-1.5 text-gray-600"><Plus size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* 根據 isAiEnabled 決定是否顯示按鈕 */}
                        {isAiEnabled && (
                            <div className="pt-4">
                                <button onClick={handleGetRecommendation} disabled={isRecommending} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center disabled:bg-blue-300 disabled:cursor-wait">
                                    {t.getRecommendation}
                                </button>
                            </div>
                        )}
                        {(isRecommending || recommendation) && (
                             <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex items-center mb-2"><Sparkles className="text-orange-500 mr-2" size={20} /><h4 className="font-semibold text-orange-700">{t.aiRecommendation}</h4></div>
                                {isRecommending ? (<p className="text-sm text-gray-600 animate-pulse">{t.aiThinking}</p>) : (<p className="text-sm text-gray-700 whitespace-pre-wrap">{recommendation}</p>)}
                            </div>
                        )}
                    </main>
                )}
                
                <footer className="p-4 bg-white border-t">
                    <div className="flex justify-between items-center mb-4"><span className="text-lg font-semibold text-gray-800">{t.total}</span><span className="text-2xl font-bold text-orange-500">${totalAmount}</span></div>
                    {/* 綁定 onClick 事件以送出訂單 */}
                    <button onClick={onSubmitOrder} disabled={cart.length === 0} className="w-full bg-green-500 text-white text-lg font-bold py-3 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed">
                        {t.submitOrder}
                    </button>
                </footer>
            </div>
        </div>
    );
};

// --- 添加一些 CSS 動畫 ---
const style = document.createElement('style');
style.textContent = ` @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.3s ease-out; } @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; } `;
document.head.appendChild(style);
