import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ShoppingCart, X, Plus, Minus, Trash2, Sparkles } from 'lucide-react';

// --- i18n 多國語言資料 (已加入 AI 相關文字) ---
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
    orderHistory: "點餐歷史",
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
    notesPlaceholder: "Any special requests? (e.g., no cilantro)",
    table: "Table",
    orderHistory: "Order History",
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
    notesPlaceholder: "特別なご要望はありますか？ (例：パクチー抜き)",
    table: "テーブル",
    orderHistory: "注文履歴",
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
    notesPlaceholder: "특별한 요청 있으신가요? (예: 고수 빼주세요)",
    table: "테이블",
    orderHistory: "주문 내역",
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
  const [menuData, setMenuData] = useState({ main: [], side: [], drink: [], dessert: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // 模擬從後端獲取菜單
  useEffect(() => {
    const fetchMenu = async () => {
      // 在實際應用中，您會 fetch('http://localhost:8080/api/menu')
      // 這裡我們直接使用後端 server.js 中的模擬資料
      const mockBackendResponse = {
        main: [
          { id: 1, name: { zh: "招牌牛肉麵", en: "Signature Beef Noodle Soup", ja: "特製牛肉麺", ko: "시그니처 소고기 국수" }, price: 180, image: "https://placehold.co/600x400/EAD9C8/513C2C?text=牛肉麵", description: { zh: "慢火燉煮的牛骨高湯，搭配軟嫩牛腱肉與Q彈麵條。", en: "Slow-cooked beef broth with tender beef shank and chewy noodles.", ja: "じっくり煮込んだ牛骨スープに、柔らかい牛すじ肉ともちもちの麺。", ko: "오랜 시간 푹 고아낸 소고기 육수와 부드러운 아롱사태, 쫄깃한 면발." }, options: ['spice', 'size'] },
          { id: 2, name: { zh: "香煎雞腿排飯", en: "Pan-Fried Chicken Steak Rice", ja: "鶏もも肉のソテーライス", ko: "치킨 스테이크 라이스" }, price: 220, image: "https://placehold.co/600x400/D8C2A8/4D4030?text=雞腿排", description: { zh: "外皮酥脆、肉質多汁的雞腿排，附三樣配菜。", en: "Crispy skin and juicy chicken steak, served with three side dishes.", ja: "皮はパリッと、肉はジューシーな鶏もも肉のソテー、3種のおかず付き。", ko: "바삭한 껍질과 육즙 가득한 닭다리살 스테이크, 세 가지 반찬 포함." }, options: ['size'] },
        ],
        side: [
          { id: 3, name: { zh: "黃金炸豆腐", en: "Golden Fried Tofu", ja: "揚げ出し豆腐", ko: "황금 튀김 두부" }, price: 60, image: "https://placehold.co/600x400/F0E4D4/8A6D3B?text=炸豆腐", description: { zh: "外酥內嫩，搭配特調蒜蓉醬油。", en: "Crispy on the outside, soft on the inside, with special garlic soy sauce.", ja: "外はサクサク、中はふんわり。特製にんにく醤油でどうぞ。", ko: "겉은 바삭하고 속은 부드러우며, 특제 마늘 간장 소스와 함께 제공됩니다." }, options: ['spice'] },
        ],
        drink: [
          { id: 4, name: { zh: "珍珠奶茶", en: "Bubble Milk Tea", ja: "タピオカミルクティー", ko: "버블 밀크티" }, price: 70, image: "https://placehold.co/600x400/C8B4A4/3E2E1E?text=珍奶", description: { zh: "經典台灣味，香濃奶茶與Q彈珍珠的完美結合。", en: "Classic Taiwanese flavor, a perfect blend of rich milk tea and chewy bubbles.", ja: "定番の台湾の味。濃厚なミルクティーとタピオカの完璧な組み合わせ。", ko: "클래식한 대만 음료, 진한 밀크티와 쫄깃한 버블의 완벽한 조화." }, options: ['sugar', 'ice'] },
        ],
        dessert: [
            { id: 5, name: { zh: "法式烤布蕾", en: "Crème brûlée", ja: "クレームブリュレ", ko: "크렘 브륄레" }, price: 90, image: "https://placehold.co/600x400/F5D5A4/8C5A2B?text=烤布蕾", description: { zh: "香草卡士達與焦脆糖衣的絕妙搭配。", en: "A delightful combination of vanilla custard and a crispy caramelized sugar top.", ja: "バニラカスタードとカリカリのカラメルが見事に調和しています。", ko: "바닐라 커스터드와 바삭한 카라멜 설탕의 절묘한 조화." }, options: [] },
        ]
      };
      setMenuData(mockBackendResponse);
    };
    fetchMenu();
  }, []);

  const categoryRefs = {
    main: useRef(null), side: useRef(null), drink: useRef(null), dessert: useRef(null),
  };

  const t = useMemo(() => translations[lang], [lang]);

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
              {menuData[categoryKey].map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden flex cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => setSelectedItem(item)}>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-lg text-gray-900">{item.name[lang]}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.description[lang]}</p>
                    <p className="font-semibold text-orange-500 mt-2">${item.price}</p>
                  </div>
                  <img src={item.image} alt={item.name[lang]} className="w-32 h-32 object-cover"/>
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

      {selectedItem && <ItemDetailModal item={selectedItem} t={t} onClose={() => setSelectedItem(null)} onAddToCart={handleAddToCart} />}
      {isCartOpen && <CartModal cart={cart} t={t} lang={lang} menuData={menuData} totalAmount={totalAmount} onClose={() => setIsCartOpen(false)} onUpdateQuantity={updateCartItemQuantity} onRemove={removeFromCart} />}
    </div>
  );
}

// --- 餐點詳情彈窗組件 ---
const ItemDetailModal = ({ item, t, onClose, onAddToCart }) => {
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
          <img src={item.image} alt={item.name[t.language.slice(0,2)]} className="w-full h-48 object-cover rounded-t-2xl sm:rounded-t-lg" />
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/70 rounded-full p-2 text-gray-800 hover:bg-white"><X size={24} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-300px)]">
          <h2 className="text-2xl font-bold mb-2">{item.name[t.language.slice(0,2)]}</h2>
          <p className="text-gray-600 mb-4">{item.description[t.language.slice(0,2)]}</p>
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

// --- 購物車彈窗組件 (整合 Gemini AI) ---
const CartModal = ({ cart, t, lang, menuData, totalAmount, onClose, onUpdateQuantity, onRemove }) => {
    const [isRecommending, setIsRecommending] = useState(false);
    const [recommendation, setRecommendation] = useState('');

    const handleGetRecommendation = async () => {
        setIsRecommending(true);
        setRecommendation('');

        const cartItemNames = cart.map(item => item.name[lang]).join(', ');
        const allMenuItems = Object.values(menuData).flat();
        const availableMenuItems = allMenuItems
            .filter(menuItem => !cart.find(cartItem => cartItem.id === menuItem.id))
            .map(item => item.name[lang])
            .join(', ');

        const prompt = `You are a friendly restaurant AI assistant. The user's current language is ${translations[lang].language}. Please respond ONLY in ${translations[lang].language}. The user has these items in their cart: ${cartItemNames}. Based on their cart, suggest one or two additional items from the available menu. Explain briefly and enticingly why they would be a good choice. Do not suggest items already in the cart. Here is the list of available menu items to choose from: ${availableMenuItems}. Keep the response concise, friendly, and formatted as a simple paragraph.`;
        
        try {
            const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = ""; // API 金鑰將在執行環境中提供
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) { throw new Error(`API call failed with status: ${response.status}`); }

            const result = await response.json();

            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                const text = result.candidates[0].content.parts[0].text;
                setRecommendation(text);
            } else {
                const errorMessages = { zh: "抱歉，AI推薦功能暫時無法使用。", en: "Sorry, the AI recommendation feature is unavailable.", ja: "申し訳ありませんが、AI機能は利用できません。", ko: "죄송합니다, AI 추천 기능을 사용할 수 없습니다." };
                setRecommendation(errorMessages[lang] || errorMessages.en);
                console.error("Gemini API response was empty or malformed:", result);
            }
        } catch (error) {
            const errorMessages = { zh: "推薦功能載入失敗，請檢查網路。", en: "Failed to load recommendation. Check connection.", ja: "おすすめの読み込みに失敗しました。", ko: "추천을 로드하지 못했습니다." };
            setRecommendation(errorMessages[lang] || errorMessages.en);
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
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </header>
                
                {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-gray-500"><ShoppingCart size={48} className="mb-4"/><p>{t.emptyCart}</p></div>
                ) : (
                    <main className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.map(item => (
                            <div key={item.cartId} className="bg-white p-3 rounded-lg shadow-sm flex items-start space-x-3">
                                <img src={item.image} alt={item.name[lang]} className="w-20 h-20 object-cover rounded-md" />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{item.name[lang]}</p>
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
                        <div className="pt-4">
                            <button onClick={handleGetRecommendation} disabled={isRecommending} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center disabled:bg-blue-300 disabled:cursor-wait">
                                {t.getRecommendation}
                            </button>
                        </div>
                        {(isRecommending || recommendation) && (
                             <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex items-center mb-2">
                                    <Sparkles className="text-orange-500 mr-2" size={20} />
                                    <h4 className="font-semibold text-orange-700">{t.aiRecommendation}</h4>
                                </div>
                                {isRecommending ? (
                                    <p className="text-sm text-gray-600 animate-pulse">{t.aiThinking}</p>
                                ) : (
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{recommendation}</p>
                                )}
                            </div>
                        )}
                    </main>
                )}
                
                <footer className="p-4 bg-white border-t">
                    <div className="flex justify-between items-center mb-4"><span className="text-lg font-semibold text-gray-800">{t.total}</span><span className="text-2xl font-bold text-orange-500">${totalAmount}</span></div>
                    <button disabled={cart.length === 0} className="w-full bg-green-500 text-white text-lg font-bold py-3 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed">送出訂單</button>
                </footer>
            </div>
        </div>
    );
};

// --- 添加一些 CSS 動畫 ---
const style = document.createElement('style');
style.textContent = ` @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.3s ease-out; } @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; } `;
document.head.appendChild(style);
