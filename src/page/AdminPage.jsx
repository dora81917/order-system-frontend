import React, { useState, useEffect } from 'react';
import { Book, Edit, Settings, LogOut, PlusCircle, Trash2, Save, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
                setIsLoggedIn(true);
                setError('');
            } else {
                setError('密碼錯誤，請重試。');
            }
        } catch (err) {
            setError('登入失敗，請檢查後端伺服器是否正在運行。');
        }
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
                            className="w-full px-4 py-2 border rounded-lg mb-4"
                        />
                        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                            登入
                        </button>
                        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
                <h2 className="text-2xl font-semibold mb-8">管理後台</h2>
                <nav className="flex flex-col space-y-2">
                    <button onClick={() => setActiveTab('instructions')} className={`flex items-center gap-3 p-2 rounded-lg text-left ${activeTab === 'instructions' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                        <Book /> 使用說明
                    </button>
                    <button onClick={() => setActiveTab('menu')} className={`flex items-center gap-3 p-2 rounded-lg text-left ${activeTab === 'menu' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                        <Edit /> 菜單維護
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 p-2 rounded-lg text-left ${activeTab === 'settings' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                        <Settings /> 功能開關
                    </button>
                </nav>
                <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-800 bg-red-600 mt-auto w-full text-left">
                    <LogOut /> 登出
                </button>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'instructions' && <Instructions />}
                {activeTab === 'menu' && <MenuManagement />}
                {activeTab === 'settings' && <SettingsManagement />}
            </main>
        </div>
    );
};

// --- 后台子组件 ---

const Instructions = () => (
    <div>
        <h1 className="text-3xl font-bold mb-4">後台使用說明</h1>
        <div className="prose max-w-none bg-white p-6 rounded-lg shadow">
            <p>歡迎使用點餐系統後台。您可以在這裡進行系統維護與設定。</p>
            
            <h2 className="mt-6">菜單維護</h2>
            <p>在此頁面，您可以：</p>
            <ul>
                <li><strong>查看所有餐點</strong>：目前的完整菜單會條列顯示。</li>
                <li><strong>新增餐點</strong>：點擊「新增餐點」按鈕，填寫表單即可上架新產品。</li>
                <li><strong>編輯餐點</strong>：點擊品項旁的「編輯」按鈕，修改後儲存即可更新。</li>
                <li><strong>刪除餐點</strong>：點擊品項旁的「刪除」按鈕，確認後即可下架產品。</li>
            </ul>

            <h2 className="mt-6">功能開關</h2>
            <p>在此頁面，您可以即時開啟或關閉特定功能：</p>
            <ul>
                <li><strong>AI 推薦功能</strong>：開啟後，購物車頁面會出現「讓 AI 推薦加點菜」的按鈕。</li>
                <li><strong>儲存訂單至 Google Sheet</strong>：開啟後，每筆成功送出的訂單資料都會自動寫入您設定的 Google Sheet。</li>
            </ul>

            <h2 className="mt-6">安全性</h2>
            <p>後台密碼儲存於後端環境變數 `ADMIN_PASSWORD` 中。若要修改密碼，請直接更新您在 Render 平台上的此環境變數即可。</p>
        </div>
    </div>
);

const SettingsManagement = () => {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/admin/settings`)
            .then(res => res.json())
            .then(data => setSettings(data));
    }, []);

    const handleToggle = async (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        await fetch(`${API_URL}/api/admin/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [key]: newSettings[key] }),
        });
    };

    if (!settings) return <p>正在載入設定...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">功能開關</h1>
            <div className="space-y-4 max-w-md">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                    <span className="font-medium">AI 推薦功能</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.isAiEnabled} onChange={() => handleToggle('isAiEnabled')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                    <span className="font-medium">儲存訂單至 Google Sheet</span>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.saveToGoogleSheet} onChange={() => handleToggle('saveToGoogleSheet')} className="sr-only peer" />
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
                const flatMenu = Object.values(data).flat();
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
                <button onClick={() => setEditingItem({ name: { zh: '', en: '' }, description: { zh: '', en: '' }, price: '', category: 'main', image: '', options: '' })} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600">
                    <PlusCircle size={20} /> 新增餐點
                </button>
            </div>

            {editingItem && <MenuItemForm item={editingItem} onSave={handleSave} onCancel={() => setEditingItem(null)} />}

            <div className="bg-white shadow rounded-lg mt-6">
                <ul className="divide-y divide-gray-200">
                    {menu.map(item => (
                        <li key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                                <img src={item.image} alt={item.name.zh} className="w-16 h-16 object-cover rounded"/>
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

    useEffect(() => {
        setFormData(item);
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = item.id ? `${API_URL}/api/menu_items/${item.id}` : `${API_URL}/api/menu_items`;
        const method = item.id ? 'PUT' : 'POST';

        const payload = { ...formData, price: parseInt(formData.price, 10) };
        
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        onSave();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{item.id ? '編輯餐點' : '新增餐點'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">中文名稱</label>
                        <input type="text" name="name.zh" value={formData.name.zh} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">英文名稱</label>
                        <input type="text" name="name.en" value={formData.name.en} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">中文描述</label>
                        <textarea name="description.zh" value={formData.description.zh} onChange={handleChange} className="w-full p-2 border rounded" rows="2"></textarea>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">英文描述</label>
                        <textarea name="description.en" value={formData.description.en} onChange={handleChange} className="w-full p-2 border rounded" rows="2"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">價格</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">分類</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded">
                            <option value="main">經典主食</option>
                            <option value="side">美味附餐</option>
                            <option value="drink">清涼飲品</option>
                            <option value="dessert">飯後甜點</option>
                            <option value="limited">主廚推薦</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">圖片 URL</label>
                        <input type="text" name="image" value={formData.image} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">可用選項 (用逗號分隔, e.g., spice,size,ice)</label>
                        <input type="text" name="options" value={formData.options} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300">
                        <XCircle size={20} /> 取消
                    </button>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
                        <Save size={20} /> 儲存
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPage;