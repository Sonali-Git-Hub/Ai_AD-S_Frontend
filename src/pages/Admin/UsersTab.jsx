import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';
import { Search, Settings, Ban, Trash2, Check } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { getUserData } from '../../userStore/userData';
import { API } from '../../types.js';
import toast from 'react-hot-toast';
import DeleteConfirmModal from '../../Components/DeleteConfirmModal';
import { LoadingSpinner } from './AdminCommon';

const UsersTab = () => {
    const { t } = useLanguage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [upgradeData, setUpgradeData] = useState({ planName: '', expiryDate: '' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });

    useEffect(() => {
        fetchUsers();
        fetchPlans();
    }, []);

    const [availablePlans, setAvailablePlans] = useState([]);

    const fetchPlans = async () => {
        try {
            const data = await apiService.getPlans();
            setAvailablePlans(Array.isArray(data) ? data : data.plans || []);
        } catch (err) {
            console.error('Failed to fetch plans:', err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await apiService.getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockToggle = async (userId, currentStatus) => {
        try {
            await apiService.toggleBlockUser(userId, !currentStatus);
            toast.success(currentStatus ? 'User unblocked' : 'User blocked');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update user status');
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModal.userId) return;
        try {
            await apiService.deleteUser(deleteModal.userId);
            toast.success('User deleted');
            setDeleteModal({ isOpen: false, userId: null });
            fetchUsers();
        } catch (err) {
            toast.error('Failed to delete user');
            setDeleteModal({ isOpen: false, userId: null });
        }
    };

    const [isUpgrading, setIsUpgrading] = useState(null); // track userId being upgraded

    const handleManualUpgrade = async (userId) => {
        if (!upgradeData.planName) {
            toast.error('Please select a plan');
            return;
        }

        setIsUpgrading(userId);
        try {
            const response = await fetch(`${API}/admin/manual-upgrade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getUserData()?.token}`
                },
                body: JSON.stringify({ userId, ...upgradeData })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Plan upgraded successfully');
                setUpgradeData({ planName: '', expiryDate: '' });
                fetchUsers();
            } else {
                toast.error(data.message || 'Failed to upgrade plan');
            }
        } catch (err) {
            console.error("Upgrade error:", err);
            toast.error('Failed to upgrade plan');
        } finally {
            setIsUpgrading(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
                <input
                    type="text"
                    placeholder={t('searchUsersPlaceholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-subtext/50 text-maintext"
                />
            </div>

            {/* User List */}
            <div className="space-y-2">
                {filteredUsers.length === 0 && (
                    <p className="text-center text-subtext py-8 text-sm">{t('noUsersFound')}</p>
                )}
                {filteredUsers.map(user => (
                    <motion.div
                        key={user._id || user.id}
                        layout
                        className="bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-4 hover:border-primary/20 transition-all"
                    >
                        <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/account.png'; }} />
                                    ) : (
                                        <span className="font-bold text-primary text-sm">
                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-maintext text-sm truncate">{user.name}</p>
                                    <p className="text-xs text-subtext truncate">{user.email}</p>
                                </div>
                                {user.isBlocked && (
                                    <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[10px] font-bold uppercase">{t('block')}</span>
                                )}
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${user.planName?.toLowerCase().includes('pro') ? 'bg-amber-500/10 text-amber-500' :
                                        user.planName?.toLowerCase().includes('founder') ? 'bg-purple-500/10 text-purple-500' :
                                            'bg-primary/10 text-primary'
                                    }`}>
                                    {user.planName || user.role || 'Free Plan'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedUser(selectedUser === (user._id || user.id) ? null : (user._id || user.id))}
                                    className="p-2 rounded-lg hover:bg-primary/10 text-subtext hover:text-primary transition-all"
                                    title={t('manage')}
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleBlockToggle(user._id || user.id, user.isBlocked)}
                                    className={`p-2 rounded-lg transition-all ${user.isBlocked ? 'hover:bg-green-500/10 text-green-500' : 'hover:bg-amber-500/10 text-amber-500'}`}
                                    title={user.isBlocked ? t('unblock') : t('block')}
                                >
                                    {user.isBlocked ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, userId: user._id || user.id })}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all"
                                    title={t('delete')}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {selectedUser === (user._id || user.id) && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-white/10 mt-3 pt-3"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        className="flex-1 min-w-[120px] bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-maintext"
                                        value={upgradeData.planName}
                                        onChange={(e) => setUpgradeData({ ...upgradeData, planName: e.target.value })}
                                    >
                                        <option value="">{t('selectPlan')}</option>
                                        {availablePlans.map(p => (
                                            <option key={p._id} value={p.planName}>{p.planName}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="date"
                                        className="flex-1 min-w-[120px] bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-maintext"
                                        value={upgradeData.expiryDate}
                                        onChange={(e) => setUpgradeData({ ...upgradeData, expiryDate: e.target.value })}
                                    />
                                    <button
                                        onClick={() => handleManualUpgrade(user._id || user.id)}
                                        disabled={isUpgrading === (user._id || user.id)}
                                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all whitespace-nowrap"
                                    >
                                        {isUpgrading === (user._id || user.id) ? t('loading') : t('upgrade')}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, userId: null })}
                onConfirm={handleDeleteUser}
                title={t('deleteUserTitle')}
                description={t('deleteUserDesc')}
            />
        </div>
    );
};

export default UsersTab;
