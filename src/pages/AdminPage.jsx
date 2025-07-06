import React, { useState, useEffect, useRef } from 'react';
import { Book, Edit, Settings, LogOut, PlusCircle, Trash2, Save, XCircle, Loader2, Image as ImageIcon, UploadCloud, GripVertical, Store } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 迷你翻譯物件，供表單顯示中文標籤
const translations = {
  zh: {
    options: {
        spice: { name: "辣度" },
        sugar: { name: "甜度" },
        ice: { name: "冰塊" },
        size: { name: "份量" },
    },
  },
};

// --- 主元件 ---
const AdminPage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('instructions');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (response.ok) {
                sessionStorage.setItem('admin-auth', 'true');
                setIsLoggedIn(true);
                setError('');
            } else {
                setError('密碼錯誤，請重試。');
            }
        } catch (err) {
            setError('登入失敗，請檢查後端伺服器是否正在運行。');
        }
    };
    
    useEffect(() => {
        if (sessionStorage.getItem('admin-auth') === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('admin-auth');
        setIsLoggedIn(false);
    };

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-center mb-6">後台管理登入</h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="請輸入管理密碼"
                            className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            登入
                        </button>
                        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
                <h2 className="text-2xl font-semibold mb-8">管理後台</h2>
                <nav className="flex flex-col space-y-2">
                    <button onClick={() => setActiveTab('instructions')} className={`flex items-center gap-3 p-2 rounded-lg text-left ${activeTab === 'instructions' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                        <Book size={20} /> 使用說明
                    </button>
                    <button onClick={() => setActiveTab('storefront')} className={`flex items-center gap-3 p-2 rounded-lg text-left ${activeTab === 'storefront' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                        <Store size={20} /> 店面設定
                    </button>
                    <button onClick={() => setActiveTab('menu')} className={`flex items-center gap-3 p-2 rounded-lg text-left ${activeTab === 'menu' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                        <Edit size={20} /> 菜單維護
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 p-2 rounded-lg text-left ${activeTab === 'settings' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                        <Settings size={20} /> 功能開關
                    </button>
                </nav>
                <button onClick={handleLogout} className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-800 bg-red-600 mt-auto w-full text-left">
                    <LogOut size={20} /> 登出
                </button>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'instructions' && <Instructions />}
                {activeTab === 'storefront' && <StorefrontSettings />}
                {activeTab === 'menu' && <MenuManagement />}
                {activeTab === 'settings' && <SettingsManagement />}
            </main>
        </div>
    );
};

// --- 子組件 ---

const Instructions = () => (
    <div>
        <h1 className="text-3xl font-bold mb-4">後台使用說明</h1>
        <div className="prose max-w-none bg-white p-6 rounded-lg shadow">
            <p>歡迎使用點餐系統後台。您可以在這裡進行系統維護與設定。</p>
            <h2 className="mt-6">店面設定</h2>
            <p>管理顧客看到的第一印象：</p>
            <ul>
                <li><strong>店家 Logo 設定</strong>：上傳您的 Logo，並選擇要在菜單頂部顯示 Logo 還是純文字店名。</li>
                <li><strong>最新消息公告管理</strong>：自由新增、編輯、刪除、排序您的圖文公告。</li>
                <li><strong>交易手續費設定</strong>：設定要向顧客收取的訂單手續費百分比。</li>
            </ul>
            <h2 className="mt-6">菜單維護</h2>
            <p>在此頁面，您可以：</p>
            <ul>
                <li><strong>查看所有餐點</strong>：目前的完整菜單會條列顯示。</li>
                <li><strong>新增餐點 (AI翻譯)</strong>：點擊「新增餐點」按鈕，只需填寫中文名稱與描述，系統將自動為您翻譯成英文。</li>
                <li><strong>編輯餐點</strong>：點擊品項旁的「編輯」按鈕，修改後儲存即可更新。(註：編輯模式目前不會重新觸發AI翻譯)</li>
                <li><strong>刪除餐點</strong>：點擊品項旁的「刪除」按鈕，確認後即可下架產品。</li>
            </ul>
            <h2 className="mt-6">功能開關</h2>
            <p>在此頁面，您可以即時開啟或關閉特定功能：</p>
            <ul>
                <li><strong>儲存訂單至資料庫</strong>：是否將訂單資料儲存在系統資料庫中。</li>
                <li><strong>儲存訂單至 Google Sheet</strong>：是否將訂單資料自動寫入您設定的 Google Sheet。</li>
                <li><strong>AI 推薦功能</strong>：開啟後，購物車頁面會出現「讓 AI 推薦加點菜」的按鈕。</li>
            </ul>
            <p className="font-bold text-red-600">注意：為了確保訂單不遺失，「儲存至資料庫」和「儲存至 Google Sheet」必須至少開啟一項。</p>
        </div>
    </div>
);

const SettingsManagement = () => {
    const [settings, setSettings] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/admin/settings`)
            .then(res => res.json())
            .then(data => setSettings(data));
    }, []);

    const handleToggle = async (key) => {
        const tempSettings = { ...settings, [key]: !settings[key] };

        if (key === 'saveToDatabase' || key === 'saveToGoogleSheet') {
            if (!tempSettings.saveToDatabase && !tempSettings.saveToGoogleSheet) {
                setError('錯誤：必須至少啟用一種訂單儲存方式！');
                setTimeout(() => setError(''), 3000);
                return;
            }
        }
        setError('');
        setSettings(tempSettings);
        await fetch(`${API_URL}/api/admin/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [key]: tempSettings[key] }),
        });
    };

    if (!settings) return <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> 正在載入設定...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">功能開關</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <div className="space-y-4 max-w-md">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                    <span className="font-medium">儲存訂單至資料庫</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={!!settings.saveToDatabase} onChange={() => handleToggle('saveToDatabase')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                    <span className="font-medium">儲存訂單至 Google Sheet</span>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={!!settings.saveToGoogleSheet} onChange={() => handleToggle('saveToGoogleSheet')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                    <span className="font-medium">AI 推薦功能</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={!!settings.isAiEnabled} onChange={() => handleToggle('isAiEnabled')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

const MenuManagement = () => {
    const [menu, setMenu] = useState([]);
    const [editingItem, setEditingItem] = useState(null); 
    const fetchMenu = () => {
        fetch(`${API_URL}/api/menu`)
            .then(res => res.json())
            .then(data => {
                const flatMenu = Object.values(data).flat().sort((a, b) => a.id - b.id);
                setMenu(flatMenu);
            });
    };
    useEffect(fetchMenu, []);
    const handleDelete = async (id) => {
        if (window.confirm('確定要刪除這個品項嗎？此操作無法復原。')) {
            await fetch(`${API_URL}/api/menu_items/${id}`, { method: 'DELETE' });
            fetchMenu();
        }
    };
    const handleSave = () => {
        setEditingItem(null);
        fetchMenu();
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">菜單維護</h1>
                <button onClick={() => setEditingItem({ isNew: true, name: { zh: '', en: '' }, description: { zh: '', en: '' }, price: '', category: 'main', image: '', options: '' })} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors">
                    <PlusCircle size={20} /> 新增餐點
                </button>
            </div>
            {editingItem && <MenuItemForm item={editingItem} onSave={handleSave} onCancel={() => setEditingItem(null)} />}
            <div className="bg-white shadow rounded-lg mt-6">
                <ul className="divide-y divide-gray-200">
                    {menu.map(item => (
                        <li key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                                <img src={item.image || 'https://placehold.co/100x100?text=No+Image'} alt={item.name.zh} className="w-16 h-16 object-cover rounded bg-gray-100"/>
                                <div>
                                    <p className="font-bold">{item.name.zh} ({item.name.en})</p>
                                    <p className="text-sm text-gray-500">${item.price}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setEditingItem(item)} className="p-2 text-blue-600 hover:text-blue-800"><Edit /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:text-red-800"><Trash2 /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const MenuItemForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(item);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // 當 item prop 改變時 (例如從新增切換到編輯)，重設表單
        const initialOptions = { spice: false, sugar: false, ice: false, size: false };
        if (item && item.options) {
            const optionsArray = Array.isArray(item.options) ? item.options : item.options.split(',');
            optionsArray.forEach(opt => {
                if (opt in initialOptions) {
                    initialOptions[opt] = true;
                }
            });
        }
        setFormData(item);
        setAvailableOptions(initialOptions);
    }, [item]);

    const [availableOptions, setAvailableOptions] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (e) => {
        const { name, checked } = e.target;
        setAvailableOptions(prev => ({ ...prev, [name]: checked }));
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        try {
            const response = await fetch(`${API_URL}/api/admin/upload-image`, {
                method: 'POST',
                body: uploadFormData,
            });
            const data = await response.json();
            if (response.ok) {
                setFormData(prev => ({ ...prev, image: data.imageUrl }));
            } else {
                alert(`圖片上傳失敗: ${data.message}`);
            }
        } catch (error) {
            alert('圖片上傳時發生網路錯誤');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const optionsString = Object.keys(availableOptions).filter(key => availableOptions[key]).join(',');

        if (item.isNew) {
            const payload = {
                name_zh: formData.name.zh,
                description_zh: formData.description.zh,
                price: parseInt(formData.price, 10),
                category: formData.category,
                image: formData.image,
                options: optionsString,
            };
            await fetch(`${API_URL}/api/admin/translate-and-add-item`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } else {
            const payload = { ...formData, price: parseInt(formData.price, 10), options: optionsString };
            await fetch(`${API_URL}/api/menu_items/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        }
        
        setIsSubmitting(false);
        onSave();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">{item.isNew ? '新增餐點 (AI自動翻譯)' : '編輯餐點'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">中文名稱*</label>
                        <input type="text" value={formData.name.zh} onChange={e => setFormData({...formData, name: {...formData.name, zh: e.target.value}})} className="mt-1 w-full p-2 border rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">價格*</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">中文描述</label>
                        <textarea value={formData.description.zh} onChange={e => setFormData({...formData, description: {...formData.description, zh: e.target.value}})} className="mt-1 w-full p-2 border rounded-md" rows="2"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">分類*</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white">
                            <option value="main">經典主食</option>
                            <option value="side">美味附餐</option>
                            <option value="drink">清涼飲品</option>
                            <option value="dessert">飯後甜點</option>
                            <option value="limited">主廚推薦</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">圖片</label>
                        <div className="mt-1 flex items-center gap-4">
                            <img src={formData.image || 'https://placehold.co/100x100/f0f0f0/ccc?text=No+Image'} alt="Preview" className="w-24 h-24 object-cover rounded-md bg-gray-100" />
                            <div className="flex-1">
                                 <input type="text" name="image" value={formData.image} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="請貼上圖片網址或從下方上傳"/>
                                 <button type="button" onClick={() => fileInputRef.current.click()} disabled={isUploading} className="cursor-pointer mt-2 inline-flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                     {isUploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={16} />}
                                     {isUploading ? '上傳中...' : '或選擇檔案上傳'}
                                 </button>
                                 <input ref={fileInputRef} id="image-upload" type="file" className="sr-only" onChange={(e) => handleImageUpload(e.target.files[0])} accept="image/png, image/jpeg, image/webp" />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">可用選項</label>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                            {Object.keys(availableOptions).map(opt => (
                                <label key={opt} className="flex items-center gap-2">
                                    <input type="checkbox" name={opt} checked={availableOptions[opt]} onChange={handleOptionChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span>{translations.zh.options[opt]?.name || opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <button type="button" onClick={onCancel} disabled={isSubmitting} className="bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors disabled:opacity-50">
                        <XCircle size={20} /> 取消
                    </button>
                    <button type="submit" disabled={isSubmitting || isUploading} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-wait">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSubmitting ? '儲存中...' : '儲存'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const StorefrontSettings = () => {
    const [settings, setSettings] = useState({});
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const logoFileInputRef = useRef(null);

    // 載入所有設定和公告
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [settingsRes, announcementsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/settings`),
                fetch(`${API_URL}/api/admin/announcements`)
            ]);
            const settingsData = await settingsRes.json();
            const announcementsData = await announcementsRes.json();
            setSettings(settingsData);
            setAnnouncements(announcementsData);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleAnnouncementChange = (id, field, value) => {
        setAnnouncements(prev => prev.map(ann => ann.id === id ? { ...ann, [field]: value } : ann));
    };
    
    const handleImageUpload = async (file, callback) => {
        if (!file) return;
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        try {
            const response = await fetch(`${API_URL}/api/admin/upload-image`, { method: 'POST', body: uploadFormData });
            const data = await response.json();
            if (response.ok) {
                callback(data.imageUrl);
            } else {
                alert(`圖片上傳失敗: ${data.message}`);
            }
        } catch (error) {
            alert('圖片上傳時發生網路錯誤');
        }
    };

    const handleAddNewAnnouncement = () => {
        const newAnnouncement = { id: `new-${Date.now()}`, image: '', text: '', isNew: true };
        setAnnouncements(prev => [...prev, newAnnouncement]);
    };

    const handleRemoveAnnouncement = (id) => {
        setAnnouncements(prev => prev.filter(ann => ann.id !== id));
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        // 儲存設定
        await fetch(`${API_URL}/api/admin/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });

        // 儲存公告
        for (const ann of announcements) {
            const payload = { image: ann.image, text: ann.text };
            if (ann.isNew) {
                await fetch(`${API_URL}/api/admin/announcements`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch(`${API_URL}/api/admin/announcements/${ann.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
        }
        // 刪除已移除的公告
        const originalAnnouncements = await (await fetch(`${API_URL}/api/admin/announcements`)).json();
        const announcementsToDelete = originalAnnouncements.filter(origAnn => !announcements.some(currAnn => currAnn.id === origAnn.id));
        for (const ann of announcementsToDelete) {
             await fetch(`${API_URL}/api/admin/announcements/${ann.id}`, { method: 'DELETE' });
        }


        setIsSaving(false);
        alert('所有設定已儲存！');
        // 重新載入以確保同步
        const updatedAnnouncements = await (await fetch(`${API_URL}/api/admin/announcements`)).json();
        setAnnouncements(updatedAnnouncements);
    };

    if (isLoading) return <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> 正在載入店面設定...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">店面設定</h1>
            
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">店家 Logo 設定</h2>
                <div className="flex items-center gap-2 mb-4">
                    <input type="checkbox" id="useLogo" checked={!!settings.useLogo} onChange={(e) => handleSettingChange('useLogo', e.target.checked)} className="h-4 w-4 rounded" />
                    <label htmlFor="useLogo">在菜單頁面使用 Logo 取代文字標題</label>
                </div>
                <div className={`transition-opacity duration-300 ${settings.useLogo ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <label className="block text-sm font-medium text-gray-700">Logo 圖片</label>
                    <div className="mt-1 flex items-center gap-4">
                        <img src={settings.logoUrl || 'https://placehold.co/150x50/f0f0f0/ccc?text=Logo'} alt="Logo Preview" className="h-16 bg-gray-100 rounded p-1" />
                        <div className="flex-1">
                             <input type="text" value={settings.logoUrl || ''} onChange={(e) => handleSettingChange('logoUrl', e.target.value)} className="w-full p-2 border rounded-md" placeholder="請貼上圖片網址或從下方上傳"/>
                             <button type="button" onClick={() => logoFileInputRef.current.click()} className="cursor-pointer mt-2 inline-flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <UploadCloud size={16} /> 上傳 Logo
                             </button>
                             <input ref={logoFileInputRef} type="file" className="sr-only" onChange={(e) => handleImageUpload(e.target.files[0], (url) => handleSettingChange('logoUrl', url))} accept="image/png, image/jpeg, image/webp" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">最新消息公告管理</h2>
                <div className="space-y-4">
                    {announcements.map((ann, index) => (
                        <div key={ann.id} className="flex items-start gap-4 p-4 border rounded-md">
                           <GripVertical className="mt-8 text-gray-400 cursor-grab" />
                           <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">公告圖片 URL</label>
                                <input type="text" value={ann.image} onChange={(e) => handleAnnouncementChange(ann.id, 'image', e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                                <label className="block text-sm font-medium text-gray-700 mt-2">公告文字</label>
                                <textarea value={ann.text} onChange={(e) => handleAnnouncementChange(ann.id, 'text', e.target.value)} className="mt-1 w-full p-2 border rounded-md" rows="3"></textarea>
                           </div>
                           <button onClick={() => handleRemoveAnnouncement(ann.id)} className="text-red-500 hover:text-red-700"><Trash2 size={20} /></button>
                        </div>
                    ))}
                </div>
                <button onClick={handleAddNewAnnouncement} className="mt-4 inline-flex items-center gap-2 bg-gray-100 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-200">
                    <PlusCircle size={16} /> 新增一則公告
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">交易手續費設定</h2>
                 <label className="block text-sm font-medium text-gray-700">手續費 (%)</label>
                <input type="number" value={settings.transactionFeePercent || 0} onChange={e => handleSettingChange('transactionFeePercent', e.target.value)} className="mt-1 w-full max-w-xs p-2 border rounded-md" min="0" step="0.1" />
                <p className="text-xs text-gray-500 mt-1">設定顧客結帳時，需額外支付的交易手續費百分比。輸入 5 代表 5%。</p>
            </div>

             <div className="mt-8 text-right">
                <button onClick={handleSaveAll} disabled={isSaving} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-blue-300">
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                    {isSaving ? '儲存中...' : '儲存所有設定'}
                </button>
            </div>
        </div>
    );
};

export default AdminPage;
