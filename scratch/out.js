import React, { useState, useEffect, Suspense } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CreditCard,
  Package,
  Settings,
  BarChart3,
  Search,
  Shield,
  Ban,
  Trash2,
  Plus,
  Edit2,
  X,
  TrendingUp,
  DollarSign,
  Activity,
  Zap,
  ChevronDown,
  Save,
  RefreshCw,
  ArrowLeft,
  FileUp,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  FileText,
  PlusCircle,
  Headphones,
  BookOpen,
  MessageSquare,
  Image,
  Layers,
  Clock,
  Video,
  Filter,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Bot,
  Calendar,
  Mail,
  PieChart,
  AlertTriangle,
  Cpu,
  TrendingDown,
  BarChart2
} from "lucide-react";
import { apiService } from "../services/apiService";
import { getUserData } from "../userStore/userData";
import { API } from "../types.js";
import { logo } from "../constants.js";
import toast from "react-hot-toast";
import { COOKIE_POLICY_DEFAULTS, TERMS_OF_SERVICE_DEFAULTS, PRIVACY_POLICY_DEFAULTS } from "../Tools/AI_Legal/constants/legalDefaults";
import AdminHelpDesk from "../Components/AdminHelpDesk";
const KnowledgeUpload = React.lazy(() => import("../Tools/AI_Base/KnowledgeUpload").catch(() => ({ default: () => /* @__PURE__ */ React.createElement("div", { className: "p-8 text-center text-subtext" }, "AI Base Module not found.") })));
const KnowledgeManagement = React.lazy(() => import("../Tools/AI_Base/KnowledgeManagement").catch(() => ({ default: () => /* @__PURE__ */ React.createElement("div", { className: "p-8 text-center text-subtext" }, "AI Base Module not found.") })));
import DeleteConfirmModal from "../Components/DeleteConfirmModal";
const ADMIN_EMAIL = "admin@uwo24.com";
const LoadingSpinner = () => /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center py-16" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" }));
const TabButton = ({ active, icon: Icon, label, onClick }) => /* @__PURE__ */ React.createElement(
  "button",
  {
    onClick,
    title: label,
    className: `flex items-center gap-2 px-3 py-2.5 sm:px-5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${active ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-subtext hover:bg-white/20 dark:hover:bg-white/10 hover:text-maintext"}`
  },
  /* @__PURE__ */ React.createElement(Icon, { className: "w-4 h-4 shrink-0" }),
  /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, label)
);
const StatCard = ({ icon: Icon, label, value, color = "primary", trend }) => /* @__PURE__ */ React.createElement(
  motion.div,
  {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-primary/30 transition-all"
  },
  /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" }),
  /* @__PURE__ */ React.createElement("div", { className: "relative z-10" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("div", { className: `w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center` }, /* @__PURE__ */ React.createElement(Icon, { className: `w-5 h-5 text-${color}` })), trend && /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg" }, trend)), /* @__PURE__ */ React.createElement("p", { className: "text-2xl font-black text-maintext" }, value), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-subtext uppercase tracking-wider mt-1" }, label))
);
const SectionCard = ({ title, children, action }) => /* @__PURE__ */ React.createElement("div", { className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between p-5 border-b border-white/20 dark:border-white/10" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-maintext text-lg" }, title), action), /* @__PURE__ */ React.createElement("div", { className: "p-5" }, children));
const OverviewTab = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await apiService.getAdminOverviewStats();
      setStats(data.stats || data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 1e4);
    return () => clearInterval(interval);
  }, []);
  if (loading) return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-20 gap-4" }, /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-8 h-8 text-primary animate-spin" }), /* @__PURE__ */ React.createElement("p", { className: "text-subtext text-sm" }, t("loadingRealTimeOverview")));
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h2", { className: "text-sm font-bold text-subtext uppercase tracking-widest flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Activity, { className: "w-4 h-4 text-primary" }), " ", t("livePlatformActivity")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => fetchStats(true),
      disabled: refreshing,
      className: "p-2 rounded-lg hover:bg-primary/10 text-primary transition-all disabled:opacity-50",
      title: "Manual Refresh"
    },
    /* @__PURE__ */ React.createElement(RefreshCw, { className: `w-4 h-4 ${refreshing ? "animate-spin" : ""}` })
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" }, /* @__PURE__ */ React.createElement(StatCard, { icon: Users, label: t("totalUsers"), value: stats?.totalUsers ?? 0 }), /* @__PURE__ */ React.createElement(StatCard, { icon: Activity, label: t("activeSubscriptions"), value: stats?.activeSubscriptions ?? 0, color: "emerald-500" }), /* @__PURE__ */ React.createElement(StatCard, { icon: DollarSign, label: t("totalRevenue"), value: `\u20B9${stats?.totalRevenue ?? 0}`, color: "amber-500" }), /* @__PURE__ */ React.createElement(StatCard, { icon: Headphones, label: t("support"), value: stats?.pendingTickets ?? 0, color: "primary", trend: stats?.pendingTickets > 0 ? "Action Required" : "All Clear" })), stats?.toolUsage && stats.toolUsage.length > 0 && /* @__PURE__ */ React.createElement(SectionCard, { title: t("toolUsageAnalytics") }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, stats.toolUsage.map((tool, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex items-center justify-between p-3 bg-white/20 dark:bg-white/5 rounded-xl border border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-maintext text-sm" }, tool._id || "Unknown"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 text-xs text-subtext" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-primary" }, tool.count, " uses")))))));
};
const UsersTab = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [upgradeData, setUpgradeData] = useState({ planName: "", expiryDate: "" });
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
      console.error("Failed to fetch plans:", err);
    }
  };
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleBlockToggle = async (userId, currentStatus) => {
    try {
      await apiService.toggleBlockUser(userId, !currentStatus);
      toast.success(currentStatus ? "User unblocked" : "User blocked");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user status");
    }
  };
  const handleDeleteUser = async () => {
    if (!deleteModal.userId) return;
    try {
      await apiService.deleteUser(deleteModal.userId);
      toast.success("User deleted");
      setDeleteModal({ isOpen: false, userId: null });
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user");
      setDeleteModal({ isOpen: false, userId: null });
    }
  };
  const [isUpgrading, setIsUpgrading] = useState(null);
  const handleManualUpgrade = async (userId) => {
    if (!upgradeData.planName) {
      toast.error("Please select a plan");
      return;
    }
    setIsUpgrading(userId);
    try {
      const response = await fetch(`${API}/admin/manual-upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getUserData()?.token}`
        },
        body: JSON.stringify({ userId, ...upgradeData })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Plan upgraded successfully");
        setUpgradeData({ planName: "", expiryDate: "" });
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to upgrade plan");
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      toast.error("Failed to upgrade plan");
    } finally {
      setIsUpgrading(null);
    }
  };
  const filteredUsers = users.filter(
    (u) => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (loading) return /* @__PURE__ */ React.createElement(LoadingSpinner, null);
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: t("searchUsersPlaceholder"),
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value),
      className: "w-full bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-subtext/50 text-maintext"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, filteredUsers.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "text-center text-subtext py-8 text-sm" }, t("noUsersFound")), filteredUsers.map((user) => /* @__PURE__ */ React.createElement(
    motion.div,
    {
      key: user._id || user.id,
      layout: true,
      className: "bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-4 hover:border-primary/20 transition-all"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-start sm:items-center justify-between flex-wrap gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-white/10 shrink-0" }, user.avatar ? /* @__PURE__ */ React.createElement("img", { src: user.avatar, alt: user.name, className: "w-full h-full object-cover", onError: (e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = "/account.png";
    } }) : /* @__PURE__ */ React.createElement("span", { className: "font-bold text-primary text-sm" }, user.name?.charAt(0)?.toUpperCase() || "U")), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-maintext text-sm truncate" }, user.name), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-subtext truncate" }, user.email)), user.isBlocked && /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[10px] font-bold uppercase" }, t("block")), /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${user.planName?.toLowerCase().includes("pro") ? "bg-amber-500/10 text-amber-500" : user.planName?.toLowerCase().includes("founder") ? "bg-purple-500/10 text-purple-500" : "bg-primary/10 text-primary"}` }, user.planName || user.role || "Free Plan")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setSelectedUser(selectedUser === (user._id || user.id) ? null : user._id || user.id),
        className: "p-2 rounded-lg hover:bg-primary/10 text-subtext hover:text-primary transition-all",
        title: t("manage")
      },
      /* @__PURE__ */ React.createElement(Settings, { className: "w-4 h-4" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleBlockToggle(user._id || user.id, user.isBlocked),
        className: `p-2 rounded-lg transition-all ${user.isBlocked ? "hover:bg-green-500/10 text-green-500" : "hover:bg-amber-500/10 text-amber-500"}`,
        title: user.isBlocked ? t("unblock") : t("block")
      },
      user.isBlocked ? /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4" }) : /* @__PURE__ */ React.createElement(Ban, { className: "w-4 h-4" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setDeleteModal({ isOpen: true, userId: user._id || user.id }),
        className: "p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all",
        title: t("delete")
      },
      /* @__PURE__ */ React.createElement(Trash2, { className: "w-4 h-4" })
    ))),
    selectedUser === (user._id || user.id) && /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { height: 0, opacity: 0 },
        animate: { height: "auto", opacity: 1 },
        exit: { height: 0, opacity: 0 },
        className: "overflow-hidden border-t border-white/10 mt-3 pt-3"
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement(
        "select",
        {
          className: "flex-1 min-w-[120px] bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-maintext",
          value: upgradeData.planName,
          onChange: (e) => setUpgradeData({ ...upgradeData, planName: e.target.value })
        },
        /* @__PURE__ */ React.createElement("option", { value: "" }, t("selectPlan")),
        availablePlans.map((p) => /* @__PURE__ */ React.createElement("option", { key: p._id, value: p.planName }, p.planName))
      ), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "date",
          className: "flex-1 min-w-[120px] bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-maintext",
          value: upgradeData.expiryDate,
          onChange: (e) => setUpgradeData({ ...upgradeData, expiryDate: e.target.value })
        }
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => handleManualUpgrade(user._id || user.id),
          disabled: isUpgrading === (user._id || user.id),
          className: "px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all whitespace-nowrap"
        },
        isUpgrading === (user._id || user.id) ? t("loading") : t("upgrade")
      ))
    )
  ))), /* @__PURE__ */ React.createElement(
    DeleteConfirmModal,
    {
      isOpen: deleteModal.isOpen,
      onClose: () => setDeleteModal({ isOpen: false, userId: null }),
      onConfirm: handleDeleteUser,
      title: t("deleteUserTitle"),
      description: t("deleteUserDesc")
    }
  ));
};
const formatFeatureString = (feature, plan) => {
  if (!feature || !plan) return feature;
  let result = feature;
  if (/total AI messages/i.test(result) || /total messages/i.test(result) || /AI messages/i.test(result)) {
    if (plan.chatLimit === -1 || plan.chatScope === "unlimited") {
      return "Unlimited AI Chat";
    } else {
      result = result.replace(/\d+/, plan.chatLimit ?? 100);
    }
  }
  if (/months validity/i.test(result) || /month validity/i.test(result) || /days validity/i.test(result)) {
    const months = Math.round((plan.validityDays || 90) / 30);
    result = result.replace(/\d+/, months);
  }
  if (/Images\/day/i.test(result)) {
    result = result.replace(/\d+/, plan.imageLimit ?? 0);
  }
  if (/Carousel\/day/i.test(result)) {
    result = result.replace(/\d+/, plan.carouselLimit ?? 0);
  }
  if (/Videos\/day/i.test(result)) {
    result = result.replace(/\d+/, plan.videoLimit ?? 0);
  }
  return result;
};
const PlansTab = () => {
  const { t } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({
    planId: "",
    planName: "",
    priceMonthly: "",
    priceYearly: "",
    validityDays: "",
    features: ""
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, planId: null });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetchPlans();
  }, []);
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPlans();
      setPlans(Array.isArray(data) ? data : data.plans || []);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async () => {
    setSaving(true);
    try {
      const body = {
        planId: form.planId,
        planName: form.planName,
        priceMonthly: Number(form.priceMonthly),
        priceYearly: Number(form.priceYearly),
        validityDays: Number(form.validityDays),
        features: form.features.split(",").map((f) => f.trim()).filter(Boolean)
      };
      let data;
      if (editingPlan) {
        data = await apiService.updatePlan(editingPlan._id, body);
      } else {
        data = await apiService.createPlan(body);
      }
      if (data.success) {
        toast.success(editingPlan ? "Plan updated" : "Plan created");
        resetForm();
        fetchPlans();
      } else {
        toast.error(data.message || "Failed");
      }
    } catch (err) {
      toast.error("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteModal.planId) return;
    try {
      await apiService.deletePlan(deleteModal.planId);
      toast.success("Plan deleted");
      setDeleteModal({ isOpen: false, planId: null });
      fetchPlans();
    } catch (err) {
      toast.error("Failed to delete plan");
      setDeleteModal({ isOpen: false, planId: null });
    }
  };
  const startEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      planId: plan.planId || "",
      planName: plan.planName || "",
      priceMonthly: plan.priceMonthly?.toString() || "",
      priceYearly: plan.priceYearly?.toString() || "",
      validityDays: plan.validityDays?.toString() ?? "90",
      features: (plan.features || []).map((f) => formatFeatureString(f, plan)).join(", ")
    });
    setShowForm(true);
  };
  const resetForm = () => {
    setForm({
      planId: "",
      planName: "",
      priceMonthly: "",
      priceYearly: "",
      validityDays: "",
      features: ""
    });
    setEditingPlan(null);
    setShowForm(false);
  };
  if (loading) return /* @__PURE__ */ React.createElement(LoadingSpinner, null);
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-end" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        resetForm();
        setShowForm(!showForm);
      },
      className: "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }),
    " New Plan"
  )), /* @__PURE__ */ React.createElement(AnimatePresence, null, showForm && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { height: 0, opacity: 0 },
      animate: { height: "auto", opacity: 1 },
      exit: { height: 0, opacity: 0 },
      className: "overflow-hidden"
    },
    /* @__PURE__ */ React.createElement("div", { className: "bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-5 space-y-4" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-maintext" }, editingPlan ? "Edit Plan" : "Create New Plan"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-subtext" }, "Plan ID"), /* @__PURE__ */ React.createElement(
      "input",
      {
        placeholder: "e.g. starter-plan",
        value: form.planId,
        onChange: (e) => setForm((p) => ({ ...p, planId: e.target.value })),
        className: "w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-subtext" }, "Plan Name"), /* @__PURE__ */ React.createElement(
      "input",
      {
        placeholder: "e.g. Starter",
        value: form.planName,
        onChange: (e) => setForm((p) => ({ ...p, planName: e.target.value })),
        className: "w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-subtext" }, "Monthly Price (\u20B9)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        placeholder: "e.g. 499",
        type: "number",
        value: form.priceMonthly,
        onChange: (e) => setForm((p) => ({ ...p, priceMonthly: e.target.value })),
        className: "w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-subtext" }, "Yearly Price (\u20B9)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        placeholder: "e.g. 4990",
        type: "number",
        value: form.priceYearly,
        onChange: (e) => setForm((p) => ({ ...p, priceYearly: e.target.value })),
        className: "w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-subtext" }, "Validity (Days)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        placeholder: "e.g. 30",
        type: "number",
        value: form.validityDays,
        onChange: (e) => setForm((p) => ({ ...p, validityDays: e.target.value })),
        className: "w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner"
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-subtext" }, "Features List (Comma-separated)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        placeholder: "e.g. Unlimited AI Chat, CashFlow Explorer, Web & Deep Search",
        value: form.features,
        onChange: (e) => setForm((p) => ({ ...p, features: e.target.value })),
        className: "w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 justify-end" }, /* @__PURE__ */ React.createElement("button", { onClick: resetForm, className: "px-4 py-2 rounded-xl text-sm font-bold text-subtext hover:text-maintext hover:bg-white/20 transition-all" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { onClick: handleSubmit, className: "px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20" }, editingPlan ? "Update" : "Create")))
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, plans.map((plan) => /* @__PURE__ */ React.createElement("div", { key: plan._id, className: "bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-5 hover:border-primary/20 transition-all" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between mb-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-maintext" }, plan.planName), /* @__PURE__ */ React.createElement("div", { className: "mt-1 space-y-0.5" }, /* @__PURE__ */ React.createElement("p", { className: "text-lg font-black text-primary leading-none" }, "\u20B9", plan.priceMonthly, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-subtext font-normal ml-1" }, "/mo")), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-subtext" }, "Yearly: \u20B9", plan.priceYearly, " (\u20B9", Math.round(plan.priceYearly / 12), "/mo)"))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-1" }, /* @__PURE__ */ React.createElement("button", { onClick: () => startEdit(plan), className: "p-2 rounded-lg hover:bg-primary/10 text-subtext hover:text-primary transition-all" }, /* @__PURE__ */ React.createElement(Edit2, { className: "w-4 h-4" })), /* @__PURE__ */ React.createElement("button", { onClick: () => setDeleteModal({ isOpen: true, planId: plan._id }), className: "p-2 rounded-lg hover:bg-red-500/10 text-subtext hover:text-red-500 transition-all" }, /* @__PURE__ */ React.createElement(Trash2, { className: "w-4 h-4" })))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5 text-xs text-subtext border-t border-white/10 pt-3" }, /* @__PURE__ */ React.createElement("p", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Clock, { className: "w-3.5 h-3.5 text-primary animate-pulse" }), "Validity: ", /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-maintext" }, plan.validityDays, " days")), /* @__PURE__ */ React.createElement("p", { className: "flex items-center gap-2 text-[10px] opacity-70" }, /* @__PURE__ */ React.createElement(CreditCard, { className: "w-3.5 h-3.5" }), "ID: ", plan.planId)))), plans.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "text-subtext text-sm col-span-full text-center py-8" }, "No plans created yet")), /* @__PURE__ */ React.createElement(
    DeleteConfirmModal,
    {
      isOpen: deleteModal.isOpen,
      onClose: () => setDeleteModal({ isOpen: false, planId: null }),
      onConfirm: handleDelete,
      title: "Delete Plan?",
      description: "Are you sure you want to delete this plan? This action cannot be undone."
    }
  ));
};
const ToolLimitTab = () => {
  const { t } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [editedPlans, setEditedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await apiService.getPlans();
        const plansList = Array.isArray(data) ? data : data.plans || [];
        setPlans(plansList);
        setEditedPlans(JSON.parse(JSON.stringify(plansList)));
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);
  const handleValueChange = (planId, field, value) => {
    setEditedPlans((prev) => prev.map((p) => {
      if (p._id === planId) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };
  const hasUnsavedChanges = JSON.stringify(plans) !== JSON.stringify(editedPlans);
  const handleSaveAll = async () => {
    setSaving(true);
    let successCount = 0;
    let failCount = 0;
    const modified = editedPlans.filter((ep) => {
      const original = plans.find((p) => p._id === ep._id);
      return JSON.stringify(ep) !== JSON.stringify(original);
    });
    for (const plan of modified) {
      try {
        const body = {
          planId: plan.planId,
          planName: plan.planName,
          priceMonthly: Number(plan.priceMonthly),
          priceYearly: Number(plan.priceYearly),
          chatLimit: Number(plan.chatLimit),
          chatScope: plan.chatScope,
          imageLimit: Number(plan.imageLimit),
          carouselLimit: Number(plan.carouselLimit),
          videoLimit: Number(plan.videoLimit),
          editImageAllowed: Boolean(plan.editImageAllowed),
          cashflowAllowed: Boolean(plan.cashflowAllowed),
          validityDays: Number(plan.validityDays),
          aiLegalAllowed: Boolean(plan.aiLegalAllowed),
          aiAdsAllowed: Boolean(plan.aiAdsAllowed),
          voiceGenAllowed: Boolean(plan.voiceGenAllowed),
          webSearchAllowed: Boolean(plan.webSearchAllowed),
          deepSearchAllowed: Boolean(plan.deepSearchAllowed),
          codeWriterAllowed: Boolean(plan.codeWriterAllowed),
          documentConvertAllowed: Boolean(plan.documentConvertAllowed),
          features: plan.features,
          badge: plan.badge,
          isPopular: plan.isPopular,
          isActive: plan.isActive
        };
        const res = await apiService.updatePlan(plan._id, body);
        if (res.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`Failed to update plan ${plan.planName}:`, err);
        failCount++;
      }
    }
    if (successCount > 0) {
      toast.success(`Successfully saved ${successCount} plan limit configuration${successCount > 1 ? "s" : ""}`);
    }
    if (failCount > 0) {
      toast.error(`Failed to save ${failCount} plan configurations`);
    }
    try {
      const data = await apiService.getPlans();
      const freshPlans = Array.isArray(data) ? data : data.plans || [];
      setPlans(freshPlans);
      setEditedPlans(JSON.parse(JSON.stringify(freshPlans)));
    } catch (err) {
      console.error("Failed to reload plans:", err);
    } finally {
      setSaving(false);
    }
  };
  if (loading) return /* @__PURE__ */ React.createElement(LoadingSpinner, null);
  const services = [
    {
      category: "Plan Core Settings",
      items: [
        {
          name: "AI Chat Scope",
          description: "Chat availability type",
          field: "chatScope",
          type: "select",
          options: [
            { value: "total", label: "Lifetime Cap" },
            { value: "unlimited", label: "Unlimited" }
          ]
        },
        {
          name: "AI Chat Limit",
          description: "Max messages count (-1 for unlimited)",
          field: "chatLimit",
          type: "number"
        },
        {
          name: "Validity (Days)",
          description: "Plan expiration duration",
          field: "validityDays",
          type: "number"
        }
      ]
    },
    {
      category: "BUSINESS",
      items: [
        {
          name: "AI Legal\u2122 Advisor",
          description: "Access to AI Legal documents and toolkit",
          field: "aiLegalAllowed",
          type: "boolean"
        },
        {
          name: "AI Cashflow\u2122",
          description: "Permission to access stock analysis tabs",
          field: "cashflowAllowed",
          type: "boolean"
        },
        {
          name: "AI ADS\u2122 Agent",
          description: "Access to AI Ads and Social Media generation",
          field: "aiAdsAllowed",
          type: "boolean"
        }
      ]
    },
    {
      category: "CREATE",
      items: [
        {
          name: "AI Image Generation",
          description: "Daily image creation limit",
          field: "imageLimit",
          type: "number"
        },
        {
          name: "AI Image Editor",
          description: "Permission to edit/transform images",
          field: "editImageAllowed",
          type: "boolean"
        },
        {
          name: "AI Carousel Generation",
          description: "Daily AIAD carousel limit",
          field: "carouselLimit",
          type: "number"
        },
        {
          name: "AI Video Generation",
          description: "Daily video creation limit",
          field: "videoLimit",
          type: "number"
        },
        {
          name: "Voice Generation",
          description: "Text-to-speech audio synthesis",
          field: "voiceGenAllowed",
          type: "boolean"
        }
      ]
    },
    {
      category: "INTELLIGENCE",
      items: [
        {
          name: "AI Web Search",
          description: "Real-time web search capability",
          field: "webSearchAllowed",
          type: "boolean"
        },
        {
          name: "AI Deep Search",
          description: "AI Deep Search capability",
          field: "deepSearchAllowed",
          type: "boolean"
        },
        {
          name: "AI Code Writer",
          description: "Programming support and code generator",
          field: "codeWriterAllowed",
          type: "boolean"
        },
        {
          name: "AI Document Converter",
          description: "Access to document format conversion tool",
          field: "documentConvertAllowed",
          type: "boolean"
        }
      ]
    }
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6 pb-24" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-bold text-maintext" }, "Plan Services & Limits (Tool Matrix)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-subtext" }, "Directly edit limits, permissions, and service capabilities for each plan in the grid below.")), /* @__PURE__ */ React.createElement("div", { className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse min-w-[800px]" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-white/20 dark:border-white/10 bg-white/20 dark:bg-black/20" }, /* @__PURE__ */ React.createElement("th", { className: "p-4 text-xs font-bold text-subtext uppercase tracking-wider w-[280px]" }, "Service / Tool Name"), editedPlans.map((plan) => /* @__PURE__ */ React.createElement("th", { key: plan._id, className: "p-4 text-xs font-black text-maintext uppercase tracking-wider text-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-sm text-maintext" }, plan.planName), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-primary/80 lowercase font-medium mt-0.5" }, "\u20B9", plan.priceMonthly, "/mo")))))), /* @__PURE__ */ React.createElement("tbody", null, services.map((cat, idx) => /* @__PURE__ */ React.createElement(React.Fragment, { key: idx }, /* @__PURE__ */ React.createElement("tr", { className: "bg-white/10 dark:bg-white/5" }, /* @__PURE__ */ React.createElement("td", { colSpan: editedPlans.length + 1, className: "px-4 py-2 text-xs font-extrabold text-primary uppercase tracking-wider" }, cat.category)), cat.items.map((item, itemIdx) => /* @__PURE__ */ React.createElement("tr", { key: itemIdx, className: "border-b border-white/10 dark:border-b-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "p-4" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-maintext text-sm" }, item.name), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-subtext/80 mt-0.5" }, item.description)), editedPlans.map((plan) => {
    const val = plan[item.field];
    return /* @__PURE__ */ React.createElement("td", { key: plan._id, className: "p-4 text-center" }, item.type === "boolean" && /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: !!val,
        onChange: (e) => handleValueChange(plan._id, item.field, e.target.checked),
        className: "w-4.5 h-4.5 accent-primary rounded border-white/20 cursor-pointer flex items-center justify-center mx-auto"
      }
    ), item.type === "number" && /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        value: val ?? 0,
        onChange: (e) => handleValueChange(plan._id, item.field, Number(e.target.value)),
        className: "bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-1.5 px-3 text-xs outline-none focus:border-primary text-maintext font-bold text-center w-24 mx-auto block no-spinner font-mono"
      }
    ), item.type === "select" && /* @__PURE__ */ React.createElement(
      "select",
      {
        value: val || "",
        onChange: (e) => handleValueChange(plan._id, item.field, e.target.value),
        className: "bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-1.5 px-3 text-xs outline-none focus:border-primary text-maintext font-bold text-center max-w-[150px] mx-auto block font-mono"
      },
      item.options.map((opt) => /* @__PURE__ */ React.createElement("option", { key: opt.value, value: opt.value, className: "bg-slate-50 dark:bg-zinc-900 text-maintext text-xs font-semibold" }, opt.label))
    ));
  })))))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white/20 dark:bg-white/5 rounded-2xl p-4 border border-white/10 flex items-start gap-3" }, /* @__PURE__ */ React.createElement(AlertCircle, { className: "w-5 h-5 text-primary shrink-0 mt-0.5" }), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-subtext space-y-1" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-maintext" }, "Quick Edit Matrix"), /* @__PURE__ */ React.createElement("p", null, "Adjust limits and check permissions directly in the comparison grid. Changes are kept locally until you click the save bar at the bottom."))), /* @__PURE__ */ React.createElement(AnimatePresence, null, hasUnsavedChanges && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 },
      className: "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-6 px-6 py-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl rounded-2xl min-w-[320px] md:min-w-[500px]"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 text-maintext" }, /* @__PURE__ */ React.createElement(AlertCircle, { className: "w-5 h-5 text-amber-500 shrink-0" }), /* @__PURE__ */ React.createElement("div", { className: "text-left" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-maintext" }, "Unsaved Changes"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-subtext" }, "You have modified the plan limits and permissions matrix."))),
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 font-semibold" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setEditedPlans(JSON.parse(JSON.stringify(plans))),
        className: "px-4 py-2 text-xs font-bold text-subtext hover:text-maintext hover:bg-white/10 rounded-xl transition-all"
      },
      "Reset"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleSaveAll,
        disabled: saving,
        className: "flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
      },
      saving ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-3.5 h-3.5 animate-spin" }), "Saving...") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Save, { className: "w-3.5 h-3.5" }), "Save All Changes")
    ))
  )));
};
const SettingsTab = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiService.getAdminSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);
  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateAdminSettings(settings);
      toast.success("Settings saved");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };
  if (loading) return /* @__PURE__ */ React.createElement(LoadingSpinner, null);
  return /* @__PURE__ */ React.createElement(
    SectionCard,
    {
      title: "Admin Settings",
      action: /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: handleSave,
          disabled: saving,
          className: "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        },
        saving ? /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ React.createElement(Save, { className: "w-4 h-4" }),
        "Save"
      )
    },
    /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-subtext" }, "Organization Name"), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: settings?.organizationName || "",
        onChange: (e) => setSettings((p) => ({ ...p, organizationName: e.target.value })),
        className: "w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-subtext" }, "Default AI Model"), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: settings?.defaultModel || "",
        onChange: (e) => setSettings((p) => ({ ...p, defaultModel: e.target.value })),
        className: "w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-subtext" }, "Max Tokens Per User"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        value: settings?.maxTokensPerUser || "",
        onChange: (e) => setSettings((p) => ({ ...p, maxTokensPerUser: Number(e.target.value) })),
        className: "w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-subtext" }, "Allow Public Signup"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setSettings((p) => ({ ...p, allowPublicSignup: !p.allowPublicSignup })),
        className: `w-full py-3 rounded-xl font-bold text-sm transition-all border ${settings?.allowPublicSignup ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-red-500/10 border-red-500/30 text-red-500"}`
      },
      settings?.allowPublicSignup ? "Enabled" : "Disabled"
    )))
  );
};
const LegalPagesTab = () => {
  const { t } = useLanguage();
  const [selectedPage, setSelectedPage] = useState("cookie-policy");
  const [pageData, setPageData] = useState({ sections: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  useEffect(() => {
    fetchPage();
  }, [selectedPage]);
  const getDefaultsForPage = (type) => {
    switch (type) {
      case "cookie-policy":
        return COOKIE_POLICY_DEFAULTS;
      case "terms-of-service":
        return TERMS_OF_SERVICE_DEFAULTS;
      case "privacy-policy":
        return PRIVACY_POLICY_DEFAULTS;
      default:
        return [];
    }
  };
  const fetchPage = async () => {
    setLoading(true);
    try {
      const data = await apiService.getLegalPage(selectedPage);
      if (data && data.sections && data.sections.length > 0) {
        setPageData(data);
      } else {
        setPageData({
          sections: [],
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    } catch (err) {
      toast.error("Failed to fetch legal page data");
      setPageData({ sections: [] });
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateLegalPage(selectedPage, pageData.sections);
      toast.success("Legal page updated successfully");
    } catch (err) {
      toast.error("Failed to update legal page");
    } finally {
      setSaving(false);
    }
  };
  const addSection = () => {
    setPageData((prev) => ({
      ...prev,
      sections: [...prev.sections, { title: "New Section", content: [{ subtitle: "New Subtitle", text: "Section content here..." }] }]
    }));
  };
  const removeSection = (index) => {
    setPageData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };
  const updateSection = (index, field, value) => {
    setPageData((prev) => {
      const newSections = [...prev.sections];
      newSections[index] = { ...newSections[index], [field]: value };
      return { ...prev, sections: newSections };
    });
  };
  const addContent = (sectionIndex) => {
    setPageData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        content: [...newSections[sectionIndex].content, { subtitle: "New Subtitle", text: "Content text here..." }]
      };
      return { ...prev, sections: newSections };
    });
  };
  const removeContent = (sectionIndex, contentIndex) => {
    setPageData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        content: newSections[sectionIndex].content.filter((_, i) => i !== contentIndex)
      };
      return { ...prev, sections: newSections };
    });
  };
  const updateContent = (sectionIndex, contentIndex, field, value) => {
    setPageData((prev) => {
      const newSections = [...prev.sections];
      const newContent = [...newSections[sectionIndex].content];
      newContent[contentIndex] = { ...newContent[contentIndex], [field]: value };
      newSections[sectionIndex] = { ...newSections[sectionIndex], content: newContent };
      return { ...prev, sections: newSections };
    });
  };
  const parseLegalDocument = (text) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const sections = [];
    let currentSection = null;
    lines.forEach((line) => {
      const isMetaInfo = /^(Effective Date|Last Updated|Revision|Version)\s*:?/i.test(line);
      const isHeader = !isMetaInfo && (/^#+\s+/.test(line) || /^(ARTICLE|SECTION|CHAPTER|UNIT)\s+([IVXLCDM\d]+)/i.test(line) || /^\d+[\.\)]\s+[A-Z][^a-z]/.test(line) && line.length < 60 || line.length > 3 && line.length < 50 && line === line.toUpperCase() && !line.includes(":") && !line.endsWith("."));
      if (isHeader) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          title: line.replace(/^#+\s*/, "").trim(),
          content: []
        };
      } else if (currentSection) {
        const isBulletOrList = /^[•\-\*\u2022\u2023\u2043\u2044]/.test(line) || /^\d+[\.\)]\s/.test(line);
        const isMetaInfoLine = /^(Effective Date|Last Updated|Revision|Version)\s*:?/i.test(line);
        const isSubtitle = !isBulletOrList && !isMetaInfoLine && (line.length < 100 && (line.endsWith(":") || !line.endsWith(".")) || /^###\s+/.test(line));
        if (isSubtitle && !line.includes("http")) {
          currentSection.content.push({
            subtitle: line.replace(/^#+\s*/, "").replace(/:$/, "").trim(),
            text: ""
          });
        } else {
          if (currentSection.content.length === 0) {
            currentSection.content.push({ subtitle: "General Terms", text: line });
          } else {
            const lastUnit = currentSection.content[currentSection.content.length - 1];
            if (lastUnit.text) {
              lastUnit.text += "\n\n" + line;
            } else {
              lastUnit.text = line;
            }
          }
        }
      } else {
        currentSection = {
          title: "Policy Overview",
          content: [{ subtitle: "Introduction", text: line }]
        };
      }
    });
    if (currentSection) sections.push(currentSection);
    return sections.map((s) => ({
      ...s,
      content: s.content.map((c) => ({
        ...c,
        text: (c.text || "").trim()
      })).filter((c) => c.text.length > 0)
    })).filter((s) => s.content.length > 0);
  };
  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsParsing(true);
    try {
      const res = await apiService.parseLegalDoc(file);
      if (res.success && res.sections && res.sections.length > 0) {
        setPageData((prev) => ({ ...prev, sections: res.sections }));
        toast.success(`Successfully parsed ${res.sections.length} sections from ${file.name}!`);
      } else {
        toast.error("Could not detect sections in the document.");
      }
    } catch (err) {
      console.error("Doc upload error:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      toast.error(errMsg || "Failed to parse document. Ensure it is a valid PDF, DOCX, or TXT file.");
    } finally {
      setIsParsing(false);
      e.target.value = "";
    }
  };
  if (loading) return /* @__PURE__ */ React.createElement(LoadingSpinner, null);
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 bg-white/20 dark:bg-white/5 rounded-xl p-1 border border-white/10 overflow-x-auto admin-horizontal-scrollbar" }, ["cookie-policy", "terms-of-service", "privacy-policy"].map((type) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: type,
      onClick: () => setSelectedPage(type),
      className: `px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedPage === type ? "bg-primary text-white shadow-md" : "text-subtext hover:bg-white/10 hover:text-maintext"}`
    },
    type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("label", { className: `flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-maintext rounded-xl font-bold text-sm transition-all border border-white/20 cursor-pointer ${isParsing ? "opacity-50 cursor-not-allowed" : ""}` }, isParsing ? /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-4 h-4 animate-spin text-primary" }) : /* @__PURE__ */ React.createElement(FileUp, { className: "w-4 h-4" }), isParsing ? "Parsing..." : "Upload Document", /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "file",
      className: "hidden",
      accept: ".txt,.md,.pdf,.docx",
      onChange: handleDocUpload,
      disabled: isParsing
    }
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSave,
      disabled: saving || isParsing,
      className: "flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
    },
    saving ? /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ React.createElement(Save, { className: "w-4 h-4" }),
    "Save Changes"
  ))), /* @__PURE__ */ React.createElement(
    SectionCard,
    {
      title: `${selectedPage.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} Content Management`,
      action: /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: addSection,
          className: "flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold text-maintext border border-white/10 transition-all"
        },
        /* @__PURE__ */ React.createElement(PlusCircle, { className: "w-3.5 h-3.5" }),
        "Add Section"
      )
    },
    /* @__PURE__ */ React.createElement("div", { className: "space-y-8" }, pageData.sections.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "text-center py-12 border-2 border-dashed border-white/10 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-subtext text-sm mb-4" }, "No content found. Please create the first section to start building this page."), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: addSection,
        className: "px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all"
      },
      "Create First Section"
    )), pageData.sections.map((section, sIdx) => /* @__PURE__ */ React.createElement("div", { key: sIdx, className: "relative bg-white/10 dark:bg-white/5 rounded-2xl p-6 border border-white/10" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => removeSection(sIdx),
        className: "absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
      },
      /* @__PURE__ */ React.createElement(Trash2, { className: "w-4 h-4" })
    ), /* @__PURE__ */ React.createElement("div", { className: "mb-6 space-y-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black uppercase tracking-widest text-primary" }, "Section Title"), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: section.title,
        onChange: (e) => updateSection(sIdx, "title", e.target.value),
        className: "w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-primary/50 text-maintext"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "space-y-6 ml-6 pl-6 border-l-2 border-primary/10" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-black uppercase tracking-widest text-primary/50" }, "Section Content Units"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => addContent(sIdx),
        className: "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] bg-primary text-white hover:opacity-90 font-bold transition-all shadow-lg shadow-primary/20"
      },
      /* @__PURE__ */ React.createElement(Plus, { className: "w-3 h-3" }),
      " Add Content Unit"
    )), section.content.map((item, cIdx) => /* @__PURE__ */ React.createElement("div", { key: cIdx, className: "bg-white/5 dark:bg-black/40 rounded-2xl p-6 space-y-4 relative group border border-white/5 hover:border-primary/30 transition-all" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => removeContent(sIdx, cIdx),
        className: "absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
      },
      /* @__PURE__ */ React.createElement(Trash2, { className: "w-3.5 h-3.5" })
    ), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-1.5 h-1.5 rounded-full bg-primary shrink-0" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: item.subtitle,
        onChange: (e) => updateContent(sIdx, cIdx, "subtitle", e.target.value),
        placeholder: "Subtitle (e.g. 1.1 Eligibility)",
        className: `w-full bg-transparent border-none p-0 text-sm font-bold outline-none text-maintext placeholder:text-subtext/20 ${["General Terms", "Policy Overview", "Introduction", "N/A", ""].includes(item.subtitle) ? "opacity-20 italic font-normal" : ""}`
      }
    )), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: item.text,
        onChange: (e) => updateContent(sIdx, cIdx, "text", e.target.value),
        rows: 3,
        className: "w-full bg-transparent border-none p-0 text-xs outline-none text-subtext resize-none placeholder:text-subtext/30"
      }
    ))))))))
  ));
};
const KnowledgeBaseTab = () => {
  const { t } = useLanguage();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.success(t("uploadSuccessKnowledge"));
  };
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement(Suspense, { fallback: /* @__PURE__ */ React.createElement("div", { className: "p-8 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" })) }, /* @__PURE__ */ React.createElement(
    SectionCard,
    {
      title: t("ingestNewKnowledge"),
      action: /* @__PURE__ */ React.createElement("span", { className: "text-xs text-subtext font-medium" }, t("addFilesWebsitesRAG"))
    },
    /* @__PURE__ */ React.createElement(KnowledgeUpload, { onUploadSuccess: handleUploadSuccess })
  ), /* @__PURE__ */ React.createElement(SectionCard, { title: t("knowledgeAssetsManagement") }, /* @__PURE__ */ React.createElement(KnowledgeManagement, { key: refreshTrigger }))));
};
const STATUS_META = {
  active: { label: "Active", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  completed: { label: "Completed", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  abandoned: { label: "Abandoned", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  failed: { label: "Failed", color: "bg-red-500/15 text-red-400 border-red-500/30" }
};
const MODE_LABELS = {
  NORMAL_CHAT: "Normal Chat",
  chat: "Normal Chat",
  CHAT: "Normal Chat",
  web_search: "Web Search",
  DEEP_SEARCH: "Deep Search",
  CODE_WRITER: "Code Writer",
  CODING_HELP: "Code Writer",
  code: "Code Writer",
  LEGAL_TOOLKIT: "AI Legal",
  legal: "AI Legal",
  IMAGE_GENERATION: "Generate Image",
  imageGen: "Generate Image",
  image: "Generate Image",
  VIDEO_GENERATION: "Generate Video",
  videoGen: "Generate Video",
  video: "Generate Video",
  AUDIO_CONVERT: "Convert to Audio",
  audioGen: "Convert to Audio",
  audio: "Convert to Audio",
  DOCUMENT_CONVERT: "Convert Documents",
  document: "Convert Documents",
  IMAGE_EDIT: "Edit Image",
  editImage: "Edit Image",
  edit_image: "Edit Image",
  CASHFLOW: "AI CashFlow",
  ai_cashflow: "AI CashFlow"
};
const SessionStatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { label: status, color: "bg-gray-500/15 text-gray-400 border-gray-500/30" };
  return /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${meta.color}` }, meta.label);
};
const ChatSessionsTab = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [selectedSession, setSelectedSession] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mailModal, setMailModal] = useState({ isOpen: false, email: "", subject: "", message: "", sending: false });
  const handleOpenMailModal = (email) => {
    setMailModal({
      isOpen: true,
      email: email || "",
      subject: "Notification from AISA Admin",
      message: "",
      sending: false
    });
  };
  const handleSendMail = async (e) => {
    e.preventDefault();
    if (!mailModal.email || !mailModal.message) {
      toast.error("Recipient email and message are required.");
      return;
    }
    setMailModal((prev) => ({ ...prev, sending: true }));
    try {
      const res = await apiService.sendEmailToUser({
        toEmail: mailModal.email,
        subject: mailModal.subject || "Message from AISA Admin",
        message: mailModal.message
      });
      if (res.success) {
        toast.success("Email sent successfully!");
        setMailModal({ isOpen: false, email: "", subject: "", message: "", sending: false });
      } else {
        toast.error(res.message || "Failed to send email.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email.");
    } finally {
      setMailModal((prev) => ({ ...prev, sending: false }));
    }
  };
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await apiService.getAdminChatSessionStats();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error("Chat session stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  };
  const fetchSessions = async (page = 1) => {
    setLoading(true);
    try {
      const data = await apiService.getAdminChatSessions({
        page,
        limit: pagination.limit,
        search,
        status: filterStatus,
        mode: filterMode,
        dateFrom,
        dateTo
      });
      if (data.success) {
        setSessions(data.sessions || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 });
      }
    } catch (err) {
      console.error("Chat sessions list error:", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchDetail = async (sessionId) => {
    setDetailLoading(true);
    try {
      const data = await apiService.getAdminChatSessionDetail(sessionId);
      if (data.success) setSelectedSession(data.session);
    } catch (err) {
      console.error("Chat session detail error:", err);
    } finally {
      setDetailLoading(false);
    }
  };
  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    fetchSessions(1);
  }, [search, filterStatus, filterMode, dateFrom, dateTo]);
  const handleApplyFilters = () => fetchSessions(1);
  const formatDate = (val) => {
    if (!val) return "\u2014";
    return new Date(typeof val === "number" ? val : val).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const statCards = [
    { label: "Total Sessions", value: stats?.totalSessions ?? "\u2014", icon: MessageSquare, color: "text-primary" },
    { label: "Active Now", value: stats?.statusCounts?.active ?? "\u2014", icon: Activity, color: "text-blue-400" },
    { label: "Completed", value: stats?.statusCounts?.completed ?? "\u2014", icon: Check, color: "text-green-400" },
    { label: "Abandoned", value: stats?.statusCounts?.abandoned ?? "\u2014", icon: AlertCircle, color: "text-amber-400" },
    { label: "Failed", value: stats?.statusCounts?.failed ?? "\u2014", icon: Ban, color: "text-red-400" },
    { label: "Total Messages", value: stats?.totalMessages ?? "\u2014", icon: Layers, color: "text-purple-400" },
    { label: "Avg Messages/Session", value: stats?.avgMessages ?? "\u2014", icon: TrendingUp, color: "text-cyan-400" },
    { label: "Avg Duration", value: stats?.avgDuration ?? "\u2014", icon: Clock, color: "text-pink-400" },
    { label: "Guest Sessions", value: stats?.totalGuestSessions ?? "\u2014", icon: Users, color: "text-orange-400" }
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-3" }, statCards.map((card, i) => /* @__PURE__ */ React.createElement(
    motion.div,
    {
      key: i,
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: i * 0.04 },
      className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 hover:border-primary/30 transition-all group"
    },
    /* @__PURE__ */ React.createElement(card.icon, { className: `w-4 h-4 ${card.color}` }),
    /* @__PURE__ */ React.createElement("p", { className: `text-xl font-black ${statsLoading ? "opacity-30 animate-pulse" : ""} text-maintext` }, statsLoading ? "\u2026" : card.value),
    /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-semibold text-subtext uppercase tracking-wider leading-tight" }, card.label)
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-3 sm:p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-stretch sm:items-end" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full sm:flex-1 sm:min-w-48" }, /* @__PURE__ */ React.createElement(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search by name, email or session ID\u2026",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      className: "w-full bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-subtext/40 text-maintext"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto items-end" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1 flex-1 min-w-[120px]" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-subtext uppercase tracking-wider" }, "Status"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: filterStatus,
      onChange: (e) => setFilterStatus(e.target.value),
      className: "bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-maintext outline-none focus:border-primary/50 transition-all"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "All Statuses"),
    /* @__PURE__ */ React.createElement("option", { value: "active" }, "Active"),
    /* @__PURE__ */ React.createElement("option", { value: "completed" }, "Completed"),
    /* @__PURE__ */ React.createElement("option", { value: "abandoned" }, "Abandoned"),
    /* @__PURE__ */ React.createElement("option", { value: "failed" }, "Failed")
  )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1 flex-1 min-w-[120px]" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-subtext uppercase tracking-wider" }, "Mode"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: filterMode,
      onChange: (e) => setFilterMode(e.target.value),
      className: "bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-maintext outline-none focus:border-primary/50 transition-all"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "All Modes"),
    /* @__PURE__ */ React.createElement("option", { value: "NORMAL_CHAT" }, "Normal Chat"),
    /* @__PURE__ */ React.createElement("option", { value: "web_search" }, "Web Search"),
    /* @__PURE__ */ React.createElement("option", { value: "DEEP_SEARCH" }, "Deep Search"),
    /* @__PURE__ */ React.createElement("option", { value: "CODE_WRITER" }, "Code Writer"),
    /* @__PURE__ */ React.createElement("option", { value: "LEGAL_TOOLKIT" }, "AI Legal"),
    /* @__PURE__ */ React.createElement("option", { value: "IMAGE_GENERATION" }, "Generate Image"),
    /* @__PURE__ */ React.createElement("option", { value: "VIDEO_GENERATION" }, "Generate Video"),
    /* @__PURE__ */ React.createElement("option", { value: "AUDIO_CONVERT" }, "Convert to Audio"),
    /* @__PURE__ */ React.createElement("option", { value: "DOCUMENT_CONVERT" }, "Convert Documents"),
    /* @__PURE__ */ React.createElement("option", { value: "IMAGE_EDIT" }, "Edit Image"),
    /* @__PURE__ */ React.createElement("option", { value: "CASHFLOW" }, "AI CashFlow")
  )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1 flex-1 min-w-[110px]" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-subtext uppercase tracking-wider" }, "From"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      value: dateFrom,
      onChange: (e) => setDateFrom(e.target.value),
      className: "bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-maintext outline-none focus:border-primary/50 transition-all"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1 flex-1 min-w-[110px]" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-subtext uppercase tracking-wider" }, "To"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      value: dateTo,
      onChange: (e) => setDateTo(e.target.value),
      className: "bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-maintext outline-none focus:border-primary/50 transition-all"
    }
  ))), (search || filterStatus || filterMode || dateFrom || dateTo) && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setSearch("");
        setFilterStatus("");
        setFilterMode("");
        setDateFrom("");
        setDateTo("");
      },
      className: "px-4 py-2.5 rounded-xl text-sm font-bold text-subtext hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/10"
    },
    /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-b border-white/20 dark:border-white/10" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-maintext text-base flex items-center gap-2" }, /* @__PURE__ */ React.createElement(MessageSquare, { className: "w-4 h-4 text-primary" }), "Chat Sessions", !loading && /* @__PURE__ */ React.createElement("span", { className: "text-xs text-subtext font-normal ml-1" }, "(", pagination.total, " total)")), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    fetchStats();
    fetchSessions(pagination.page);
  }, className: "p-2 rounded-lg hover:bg-primary/10 text-primary transition-all", title: "Refresh" }, /* @__PURE__ */ React.createElement(RefreshCw, { className: `w-4 h-4 ${loading ? "animate-spin" : ""}` }))), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto -mx-px" }, /* @__PURE__ */ React.createElement("table", { className: "w-full min-w-[720px] text-sm" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-white/10" }, ["Session ID", "User", "Email", "Mode", "Start Time", "Duration", "Total", "User", "AI", "Status"].map((h, i) => /* @__PURE__ */ React.createElement("th", { key: i, className: "px-4 py-3 text-left text-[10px] font-bold text-subtext uppercase tracking-wider whitespace-nowrap" }, h)))), /* @__PURE__ */ React.createElement("tbody", null, loading ? Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ React.createElement("tr", { key: i, className: "border-b border-white/5" }, Array.from({ length: 10 }).map((_2, j) => /* @__PURE__ */ React.createElement("td", { key: j, className: "px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "h-3 bg-white/10 rounded-full animate-pulse", style: { width: `${40 + Math.random() * 40}%` } }))))) : sessions.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 10, className: "text-center py-12 text-subtext text-sm" }, /* @__PURE__ */ React.createElement(MessageSquare, { className: "w-8 h-8 mx-auto mb-2 opacity-30" }), "No sessions found")) : sessions.map((s, i) => /* @__PURE__ */ React.createElement(
    motion.tr,
    {
      key: s.sessionId || i,
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { delay: i * 0.02 },
      onClick: () => fetchDetail(s.sessionId),
      className: "border-b border-white/5 hover:bg-primary/5 cursor-pointer transition-all group"
    },
    /* @__PURE__ */ React.createElement("td", { className: "px-4 py-3" }, /* @__PURE__ */ React.createElement("span", { className: "font-mono text-[11px] text-primary/80 group-hover:text-primary transition-colors" }, s.sessionId?.slice(0, 12), "\u2026")),
    /* @__PURE__ */ React.createElement("td", { className: "px-4 py-3" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-maintext text-xs whitespace-nowrap" }, s.userName || "Guest")),
    /* @__PURE__ */ React.createElement("td", { className: "px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-subtext text-xs whitespace-nowrap" }, s.userEmail || "\u2014"), s.userEmail && s.userEmail !== "\u2014" && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          handleOpenMailModal(s.userEmail);
        },
        className: "p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100",
        title: "Send Email to User"
      },
      /* @__PURE__ */ React.createElement(Mail, { className: "w-3 h-3" })
    ))),
    /* @__PURE__ */ React.createElement("td", { className: "px-4 py-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-subtext whitespace-nowrap" }, MODE_LABELS[s.detectedMode] || s.detectedMode || "\u2014")),
    /* @__PURE__ */ React.createElement("td", { className: "px-4 py-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-subtext whitespace-nowrap" }, formatDate(s.createdAt))),
    /* @__PURE__ */ React.createElement("td", { className: "px-4 py-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono text-subtext" }, s.duration || "\u2014")),
    /* @__PURE__ */ React.createElement("td", { className: "px-4 py-3 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-maintext" }, s.totalMessages ?? 0)),
    /* @__PURE__ */ React.createElement("td", { className: "px-4 py-3 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-blue-400 font-semibold" }, s.userMessages ?? 0)),
    /* @__PURE__ */ React.createElement("td", { className: "px-4 py-3 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-emerald-400 font-semibold" }, s.aiMessages ?? 0)),
    /* @__PURE__ */ React.createElement("td", { className: "px-4 py-3" }, /* @__PURE__ */ React.createElement(SessionStatusBadge, { status: s.sessionStatus }))
  ))))), pagination.totalPages > 1 && /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-t border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-subtext" }, "Page ", pagination.page, " of ", pagination.totalPages, " \xA0\xB7\xA0 ", pagination.total, " sessions"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      disabled: pagination.page <= 1 || loading,
      onClick: () => fetchSessions(pagination.page - 1),
      className: "p-2 rounded-lg hover:bg-primary/10 text-subtext hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    },
    /* @__PURE__ */ React.createElement(ChevronLeft, { className: "w-4 h-4" })
  ), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-maintext px-2" }, pagination.page), /* @__PURE__ */ React.createElement(
    "button",
    {
      disabled: pagination.page >= pagination.totalPages || loading,
      onClick: () => fetchSessions(pagination.page + 1),
      className: "p-2 rounded-lg hover:bg-primary/10 text-subtext hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    },
    /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ React.createElement(AnimatePresence, null, (selectedSession || detailLoading) && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[2050] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4",
      onClick: (e) => {
        if (e.target === e.currentTarget) setSelectedSession(null);
      }
    },
    /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 40 },
        transition: { type: "spring", damping: 28, stiffness: 300 },
        className: "bg-white dark:bg-[#12141a] border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-6 py-4 border-b border-white/10" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(MessageSquare, { className: "w-4 h-4 text-primary" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-maintext text-sm" }, "Session Detail"), selectedSession && /* @__PURE__ */ React.createElement("p", { className: "text-xs font-mono text-subtext" }, selectedSession.sessionId))), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setSelectedSession(null),
          className: "p-2 rounded-xl hover:bg-white/10 text-subtext hover:text-maintext transition-all"
        },
        /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
      )),
      detailLoading ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center flex-1 py-12" }, /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-6 h-6 text-primary animate-spin" })) : selectedSession && /* @__PURE__ */ React.createElement("div", { className: "flex flex-col flex-1 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 p-5 border-b border-white/10" }, [
        { label: "User", value: selectedSession.userName || "Guest" },
        {
          label: "Email",
          value: selectedSession.userEmail ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-1" }, /* @__PURE__ */ React.createElement("span", null, selectedSession.userEmail), /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => handleOpenMailModal(selectedSession.userEmail),
              className: "flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/20 hover:bg-primary/30 text-primary text-[9px] font-bold uppercase transition-all"
            },
            /* @__PURE__ */ React.createElement(Mail, { className: "w-2.5 h-2.5" }),
            " Send"
          )) : "\u2014"
        },
        { label: "Status", value: /* @__PURE__ */ React.createElement(SessionStatusBadge, { status: selectedSession.sessionStatus }) },
        { label: "Mode", value: MODE_LABELS[selectedSession.detectedMode] || selectedSession.detectedMode || "\u2014" },
        { label: "Duration", value: selectedSession.duration || "\u2014" },
        { label: "Start Time", value: formatDate(selectedSession.createdAt) },
        { label: "Last Activity", value: formatDate(selectedSession.lastModified) },
        { label: "Total Messages", value: selectedSession.totalMessages ?? 0 },
        { label: "User / AI", value: `${selectedSession.userMessages ?? 0} / ${selectedSession.aiMessages ?? 0}` }
      ].map((item, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "bg-white/20 dark:bg-white/5 rounded-xl p-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-subtext uppercase tracking-wider mb-1" }, item.label), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-maintext" }, item.value)))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-5 space-y-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-subtext uppercase tracking-wider mb-3" }, "Conversation History"), !selectedSession.messages || selectedSession.messages.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-center text-subtext text-sm py-6" }, "No messages in this session") : selectedSession.messages.map((msg, idx) => /* @__PURE__ */ React.createElement(
        "div",
        {
          key: msg.id || idx,
          className: `flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`
        },
        msg.role !== "user" && /* @__PURE__ */ React.createElement("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1" }, /* @__PURE__ */ React.createElement(Bot, { className: "w-3 h-3 text-primary" })),
        /* @__PURE__ */ React.createElement("div", { className: `max-w-[80%] rounded-2xl px-3 py-2 text-xs ${msg.role === "user" ? "bg-primary/20 text-maintext rounded-br-sm" : "bg-white/20 dark:bg-white/5 text-maintext rounded-bl-sm"}` }, /* @__PURE__ */ React.createElement("p", { className: "leading-relaxed whitespace-pre-wrap break-words line-clamp-6" }, msg.content), msg.imageUrl && /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-primary mt-1" }, "\u{1F4F8} Image attached"), msg.videoUrl && /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-primary mt-1" }, "\u{1F3AC} Video attached"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-subtext/60 mt-1 text-right" }, msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "")),
        msg.role === "user" && /* @__PURE__ */ React.createElement("div", { className: "w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-1" }, /* @__PURE__ */ React.createElement(UserIcon, { className: "w-3 h-3 text-blue-400" }))
      ))))
    )
  )), /* @__PURE__ */ React.createElement(AnimatePresence, null, mailModal.isOpen && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[2100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4",
      onClick: () => setMailModal((prev) => ({ ...prev, isOpen: false }))
    },
    /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        className: "bg-white dark:bg-[#12141a] border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-lg p-6 relative overflow-hidden",
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Mail, { className: "w-5 h-5 text-primary" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-maintext text-lg font-bold" }, "Send Email to User"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-subtext" }, "Direct communication from AISA\u2122 Admin"))), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setMailModal((prev) => ({ ...prev, isOpen: false })),
          className: "p-2 rounded-xl hover:bg-white/10 text-subtext hover:text-maintext transition-all"
        },
        /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
      )),
      /* @__PURE__ */ React.createElement("form", { onSubmit: handleSendMail, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-subtext uppercase tracking-wider" }, "To"), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "email",
          readOnly: true,
          disabled: true,
          value: mailModal.email,
          className: "w-full bg-white/20 dark:bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-subtext outline-none cursor-not-allowed"
        }
      )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-subtext uppercase tracking-wider font-semibold" }, "Subject"), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "text",
          required: true,
          value: mailModal.subject,
          onChange: (e) => setMailModal((prev) => ({ ...prev, subject: e.target.value })),
          className: "w-full bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm text-maintext outline-none focus:border-primary/50 transition-all",
          placeholder: "Enter email subject..."
        }
      )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-subtext uppercase tracking-wider font-semibold font-bold" }, "Message"), /* @__PURE__ */ React.createElement(
        "textarea",
        {
          required: true,
          rows: 6,
          value: mailModal.message,
          onChange: (e) => setMailModal((prev) => ({ ...prev, message: e.target.value })),
          className: "w-full bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm text-maintext outline-none focus:border-primary/50 transition-all resize-none",
          placeholder: "Write your email message here..."
        }
      )), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-3 pt-4 border-t border-white/10 mt-6" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setMailModal((prev) => ({ ...prev, isOpen: false })),
          className: "px-5 py-2.5 rounded-xl text-sm font-bold text-subtext hover:text-maintext transition-all hover:bg-white/5"
        },
        "Cancel"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "submit",
          disabled: mailModal.sending,
          className: "px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        },
        mailModal.sending ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-4 h-4 animate-spin" }), "Sending...") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Mail, { className: "w-4 h-4" }), "Send Email")
      )))
    )
  )));
};
const AnalyticsTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [drillMode, setDrillMode] = useState(null);
  const [drillData, setDrillData] = useState(null);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await apiService.getAdminAnalytics(range);
      setData(res.analytics);
    } catch (err) {
      console.error("Analytics fetch failed:", err);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const openDrillDown = async (mode) => {
    setDrillMode(mode);
    setDrawerOpen(true);
    setDrillLoading(true);
    setDrillData(null);
    try {
      const res = await apiService.getAdminErrorDrillDown(mode, range);
      setDrillData(res.drillDown);
    } catch (err) {
      console.error("Drill-down fetch failed:", err);
      toast.error("Failed to load error details");
    } finally {
      setDrillLoading(false);
    }
  };
  useEffect(() => {
    fetchAnalytics();
  }, [range]);
  const MODE_LABELS2 = {
    NORMAL_CHAT: "AI Chat",
    LEGAL_TOOLKIT: "Legal Toolkit",
    IMAGE_GENERATION: "Image Generation",
    VIDEO_GENERATION: "Video Generation",
    IMAGE_EDIT: "Image Edit",
    AUDIO_CONVERT: "Audio Convert",
    DOCUMENT_CONVERT: "Document Convert",
    CODE_WRITER: "Code Writer",
    CASHFLOW: "Cashflow",
    RAG: "RAG / Knowledge"
  };
  const MODE_COLORS = [
    "#6C63FF",
    "#FF6584",
    "#43D9B2",
    "#FFB347",
    "#4FC3F7",
    "#E57373",
    "#81C784",
    "#FFD54F",
    "#BA68C8",
    "#4DB6AC"
  ];
  const getLabel = (mode) => MODE_LABELS2[mode] || mode || "Unknown";
  const maxModeCount = data?.modeUsage?.[0]?.count || 1;
  const maxErrorCount = data?.errorByMode?.[0]?.errorCount || 1;
  if (loading) return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-24 gap-4" }, /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-8 h-8 text-primary animate-spin" }), /* @__PURE__ */ React.createElement("p", { className: "text-subtext text-sm" }, "Loading analytics..."));
  const mainContent = /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-black text-maintext flex items-center gap-2" }, /* @__PURE__ */ React.createElement(PieChart, { className: "w-5 h-5 text-primary" }), " Analytics Overview"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-subtext mt-0.5" }, "Error rates, card usage & trends")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-1 bg-white/10 dark:bg-white/5 rounded-xl p-1 border border-white/20" }, ["24h", "7d", "30d", "90d"].map((r) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: r,
      onClick: () => setRange(r),
      className: `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === r ? "bg-primary text-white shadow-md" : "text-subtext hover:text-maintext hover:bg-white/10"}`
    },
    r
  ))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => fetchAnalytics(true),
      disabled: refreshing,
      className: "p-2 rounded-lg hover:bg-primary/10 text-primary transition-all disabled:opacity-50",
      title: "Refresh"
    },
    /* @__PURE__ */ React.createElement(RefreshCw, { className: `w-4 h-4 ${refreshing ? "animate-spin" : ""}` })
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3" }, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0 },
      className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-5 group hover:border-primary/30 transition-all"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(MessageSquare, { className: "w-5 h-5 text-primary" }))),
    /* @__PURE__ */ React.createElement("p", { className: "text-2xl font-black text-maintext" }, data?.summary?.totalSessions ?? 0),
    /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-subtext uppercase tracking-wider mt-1" }, "Total Sessions")
  ), /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.05 },
      className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-5 group hover:border-red-400/30 transition-all"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(AlertTriangle, { className: "w-5 h-5 text-red-400" })), /* @__PURE__ */ React.createElement("span", { className: `text-xs font-bold px-2 py-1 rounded-lg ${data?.summary?.errorRate > 20 ? "text-red-400 bg-red-400/10" : data?.summary?.errorRate > 10 ? "text-amber-400 bg-amber-400/10" : "text-green-400 bg-green-400/10"}` }, data?.summary?.errorRate ?? 0, "%")),
    /* @__PURE__ */ React.createElement("p", { className: "text-2xl font-black text-maintext" }, data?.summary?.totalErrors ?? 0),
    /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-subtext uppercase tracking-wider mt-1" }, "Error Sessions")
  ), /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.1 },
      className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-5 group hover:border-emerald-400/30 transition-all"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Users, { className: "w-5 h-5 text-emerald-400" }))),
    /* @__PURE__ */ React.createElement("p", { className: "text-2xl font-black text-maintext" }, data?.summary?.newUsers ?? 0),
    /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-subtext uppercase tracking-wider mt-1" }, "New Users")
  ), /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.15 },
      className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-5 group hover:border-amber-400/30 transition-all"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Zap, { className: "w-5 h-5 text-amber-400" }))),
    /* @__PURE__ */ React.createElement("p", { className: "text-lg font-black text-maintext truncate" }, getLabel(data?.summary?.topMode)),
    /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-subtext uppercase tracking-wider mt-1" }, "Top Used Card")
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between p-5 border-b border-white/20 dark:border-white/10" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-maintext flex items-center gap-2" }, /* @__PURE__ */ React.createElement(BarChart2, { className: "w-4 h-4 text-primary" }), " Card Usage Breakdown"), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-subtext bg-white/10 px-2 py-1 rounded-lg" }, "Last ", range)), /* @__PURE__ */ React.createElement("div", { className: "p-5 space-y-3" }, (data?.modeUsage || []).length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-center text-subtext text-sm py-6" }, "No data for this period") : (data?.modeUsage || []).map((m, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "space-y-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full shrink-0", style: { backgroundColor: MODE_COLORS[i % MODE_COLORS.length] } }), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-maintext" }, getLabel(m._id))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 text-xs text-subtext" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-maintext" }, m.count), /* @__PURE__ */ React.createElement("span", null, "sessions"))), /* @__PURE__ */ React.createElement("div", { className: "w-full bg-white/10 dark:bg-white/5 rounded-full h-1.5" }, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { width: 0 },
      animate: { width: `${Math.round(m.count / maxModeCount * 100)}%` },
      transition: { duration: 0.6, delay: i * 0.05 },
      className: "h-1.5 rounded-full",
      style: { backgroundColor: MODE_COLORS[i % MODE_COLORS.length] }
    }
  )))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between p-5 border-b border-white/20 dark:border-white/10" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-maintext flex items-center gap-2" }, /* @__PURE__ */ React.createElement(AlertTriangle, { className: "w-4 h-4 text-red-400" }), " Errors by Card/Mode"), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-lg flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Eye, { className: "w-3 h-3" }), " Click to inspect")), /* @__PURE__ */ React.createElement("div", { className: "p-5 space-y-2" }, (data?.errorByMode || []).length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-center text-subtext text-sm py-6" }, "\u{1F389} No errors in this period!") : (data?.errorByMode || []).map((m, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      onClick: () => openDrillDown(m._id),
      className: "w-full text-left group p-3 rounded-xl border border-transparent hover:border-red-400/30 hover:bg-red-400/5 transition-all cursor-pointer space-y-1.5"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full bg-red-400/70 shrink-0" }), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-maintext group-hover:text-red-400 transition-colors" }, getLabel(m._id))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-red-400" }, m.errorCount, " errors"), /* @__PURE__ */ React.createElement("span", { className: "text-subtext" }, m.uniqueSessionCount, " sessions"), /* @__PURE__ */ React.createElement(ChevronRight, { className: "w-3.5 h-3.5 text-subtext group-hover:text-red-400 transition-colors" }))),
    /* @__PURE__ */ React.createElement("div", { className: "w-full bg-white/10 dark:bg-white/5 rounded-full h-1.5" }, /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { width: 0 },
        animate: { width: `${Math.round(m.errorCount / maxErrorCount * 100)}%` },
        transition: { duration: 0.6, delay: i * 0.05 },
        className: "h-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-400"
      }
    ))
  ))))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between p-5 border-b border-white/20 dark:border-white/10" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-maintext flex items-center gap-2" }, /* @__PURE__ */ React.createElement(TrendingUp, { className: "w-4 h-4 text-emerald-400" }), " Daily Sessions Trend")), /* @__PURE__ */ React.createElement("div", { className: "p-5" }, (data?.dailyTrend || []).length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-center text-subtext text-sm py-6" }, "No trend data") : /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-end gap-1.5 h-28" }, (data?.dailyTrend || []).map((d, i) => {
    const maxSessions = Math.max(...(data?.dailyTrend || []).map((x) => x.sessions), 1);
    const heightPct = Math.max(4, Math.round(d.sessions / maxSessions * 100));
    return /* @__PURE__ */ React.createElement("div", { key: i, className: "flex flex-col items-center flex-1 gap-1", title: `${d._id}: ${d.sessions} sessions` }, /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { height: 0 },
        animate: { height: `${heightPct}%` },
        transition: { duration: 0.5, delay: i * 0.03 },
        className: "w-full rounded-t-md bg-gradient-to-t from-primary to-primary/50 min-h-[4px]",
        style: { height: `${heightPct}%` }
      }
    ));
  })), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-[10px] text-subtext px-0.5" }, /* @__PURE__ */ React.createElement("span", null, data?.dailyTrend?.[0]?._id?.slice(5)), /* @__PURE__ */ React.createElement("span", null, data?.dailyTrend?.[Math.floor((data?.dailyTrend?.length || 0) / 2)]?._id?.slice(5)), /* @__PURE__ */ React.createElement("span", null, data?.dailyTrend?.[data?.dailyTrend?.length - 1]?._id?.slice(5))), /* @__PURE__ */ React.createElement("div", { className: "mt-2 grid grid-cols-2 gap-2" }, (data?.dailyTrend || []).slice(-3).reverse().map((d, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex items-center justify-between p-2 bg-white/10 dark:bg-white/5 rounded-xl text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "text-subtext" }, d._id?.slice(5)), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-primary" }, d.sessions))))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between p-5 border-b border-white/20 dark:border-white/10" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-maintext flex items-center gap-2" }, /* @__PURE__ */ React.createElement(AlertCircle, { className: "w-4 h-4 text-amber-400" }), " Error Categories")), /* @__PURE__ */ React.createElement("div", { className: "p-5 space-y-3" }, (data?.topErrors || []).length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-center text-subtext text-sm py-6" }, "\u{1F389} Zero errors found!") : (data?.topErrors || []).map((e, i) => {
    const colors = {
      "Timeout": "#FFB347",
      "Task Failed": "#FF6584",
      "AI Refusal": "#4FC3F7",
      "System Error": "#E57373",
      "General Error": "#BA68C8"
    };
    const color = colors[e.category] || "#6C63FF";
    const maxC = data?.topErrors?.[0]?.count || 1;
    return /* @__PURE__ */ React.createElement("div", { key: i, className: "flex items-center gap-3 p-3 bg-white/10 dark:bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 rounded-lg flex items-center justify-center shrink-0", style: { backgroundColor: color + "20" } }, /* @__PURE__ */ React.createElement(AlertTriangle, { className: "w-4 h-4", style: { color } })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-maintext" }, e.category), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold", style: { color } }, e.count)), /* @__PURE__ */ React.createElement("div", { className: "w-full bg-white/10 rounded-full h-1" }, /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { width: 0 },
        animate: { width: `${Math.round(e.count / maxC * 100)}%` },
        transition: { duration: 0.5, delay: i * 0.05 },
        className: "h-1 rounded-full",
        style: { backgroundColor: color }
      }
    ))));
  })))), (data?.recentErrorSessions || []).length > 0 && /* @__PURE__ */ React.createElement("div", { className: "bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between p-5 border-b border-white/20 dark:border-white/10" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-maintext flex items-center gap-2" }, /* @__PURE__ */ React.createElement(TrendingDown, { className: "w-4 h-4 text-red-400" }), " Recent Error Sessions"), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-subtext" }, "Top ", data?.recentErrorSessions?.length, " sessions with errors")), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-sm" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-white/10" }, /* @__PURE__ */ React.createElement("th", { className: "text-left p-4 text-xs font-bold text-subtext uppercase tracking-wider" }, "Session ID"), /* @__PURE__ */ React.createElement("th", { className: "text-left p-4 text-xs font-bold text-subtext uppercase tracking-wider" }, "Mode / Card"), /* @__PURE__ */ React.createElement("th", { className: "text-left p-4 text-xs font-bold text-subtext uppercase tracking-wider" }, "Errors"), /* @__PURE__ */ React.createElement("th", { className: "text-left p-4 text-xs font-bold text-subtext uppercase tracking-wider" }, "Date"))), /* @__PURE__ */ React.createElement("tbody", null, (data?.recentErrorSessions || []).map((s, i) => /* @__PURE__ */ React.createElement("tr", { key: i, className: "border-b border-white/5 hover:bg-white/5 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "p-4" }, /* @__PURE__ */ React.createElement("span", { className: "font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded-lg" }, s.sessionId?.substring(0, 16), "...")), /* @__PURE__ */ React.createElement("td", { className: "p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-maintext" }, getLabel(s.mode))), /* @__PURE__ */ React.createElement("td", { className: "p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-lg" }, s.errorCount, " errors")), /* @__PURE__ */ React.createElement("td", { className: "p-4 text-xs text-subtext" }, s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-"))))))));
  const maxPatternCount = drillData?.patterns?.[0]?.count || 1;
  const maxDailyErr = Math.max(...(drillData?.dailyErrors || []).map((d) => d.errorCount), 1);
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6 relative" }, mainContent, /* @__PURE__ */ React.createElement(AnimatePresence, null, drawerOpen && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      onClick: () => setDrawerOpen(false),
      className: "fixed inset-0 lg:left-[280px] bg-black/50 backdrop-blur-sm z-40"
    }
  ), /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
      transition: { type: "spring", damping: 28, stiffness: 280 },
      className: "fixed right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-[#0f0f1a] border-l border-white/20 dark:border-white/10 z-50 overflow-y-auto shadow-2xl"
    },
    /* @__PURE__ */ React.createElement("div", { className: "sticky top-0 bg-white/90 dark:bg-[#0f0f1a]/90 backdrop-blur-xl border-b border-white/20 dark:border-white/10 p-5 z-10" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-1" }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-red-400 uppercase tracking-widest" }, "Error Analysis")), /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-black text-maintext" }, MODE_LABELS2[drillMode] || drillMode), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-subtext mt-0.5" }, "Last ", range, " \u2022 Detailed error breakdown")), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setDrawerOpen(false),
        className: "w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-subtext hover:text-maintext transition-all"
      },
      /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
    )), drillData && /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-red-500/10 border border-red-400/20 rounded-xl p-3 text-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-xl font-black text-red-400" }, drillData.totalErrorInstances), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-subtext uppercase tracking-wider mt-0.5" }, "Total Errors")), /* @__PURE__ */ React.createElement("div", { className: "bg-amber-500/10 border border-amber-400/20 rounded-xl p-3 text-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-xl font-black text-amber-400" }, drillData.affectedSessions), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-subtext uppercase tracking-wider mt-0.5" }, "Affected Sessions")))),
    /* @__PURE__ */ React.createElement("div", { className: "p-5 space-y-5" }, drillLoading ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-20 gap-4" }, /* @__PURE__ */ React.createElement(RefreshCw, { className: "w-7 h-7 text-primary animate-spin" }), /* @__PURE__ */ React.createElement("p", { className: "text-subtext text-sm" }, "Analyzing errors...")) : drillData ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-maintext mb-3 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(AlertTriangle, { className: "w-4 h-4 text-amber-400" }), " Error Type Breakdown"), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, drillData.patterns.map((p, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "bg-white/5 border border-white/10 rounded-xl p-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full shrink-0", style: { backgroundColor: p.color } }), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-semibold text-maintext" }, p.label)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold", style: { color: p.color } }, p.count, "\xD7"), /* @__PURE__ */ React.createElement("span", { className: "text-subtext" }, p.sessionCount, " sessions"))), /* @__PURE__ */ React.createElement("div", { className: "w-full bg-white/10 rounded-full h-1.5 mb-2" }, /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { width: 0 },
        animate: { width: `${Math.round(p.count / maxPatternCount * 100)}%` },
        transition: { duration: 0.5, delay: i * 0.04 },
        className: "h-1.5 rounded-full",
        style: { backgroundColor: p.color }
      }
    )), p.samples.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "space-y-1 mt-2" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-subtext uppercase tracking-wider font-bold" }, "Sample Messages:"), p.samples.map((sample, si) => /* @__PURE__ */ React.createElement("div", { key: si, className: "bg-black/10 dark:bg-black/30 rounded-lg px-3 py-2 text-xs text-subtext font-mono leading-relaxed border border-white/5" }, '"', sample.length > 200 ? sample.substring(0, 200) + "..." : sample, '"'))))))), drillData.toolStats.length > 0 && drillData.toolStats[0].tool !== "General" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-maintext mb-3 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Layers, { className: "w-4 h-4 text-primary" }), " Errors by Sub-Tool"), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, drillData.toolStats.slice(0, 6).map((t, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm text-maintext font-medium" }, t.tool), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-lg" }, t.count, " errors"))))), drillData.dailyErrors.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-maintext mb-3 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(TrendingDown, { className: "w-4 h-4 text-red-400" }), " Daily Error Trend"), /* @__PURE__ */ React.createElement("div", { className: "bg-white/5 border border-white/10 rounded-xl p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-end gap-1.5 h-20" }, drillData.dailyErrors.map((d, i) => {
      const heightPct = Math.max(4, Math.round(d.errorCount / maxDailyErr * 100));
      return /* @__PURE__ */ React.createElement("div", { key: i, className: "flex flex-col items-center flex-1 gap-1", title: `${d._id}: ${d.errorCount} errors` }, /* @__PURE__ */ React.createElement(
        motion.div,
        {
          initial: { height: 0 },
          animate: { height: `${heightPct}%` },
          transition: { duration: 0.4, delay: i * 0.03 },
          className: "w-full rounded-t-sm bg-gradient-to-t from-red-500 to-red-300",
          style: { height: `${heightPct}%` }
        }
      ));
    })), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-[9px] text-subtext mt-1" }, /* @__PURE__ */ React.createElement("span", null, drillData.dailyErrors[0]?._id?.slice(5)), /* @__PURE__ */ React.createElement("span", null, drillData.dailyErrors[drillData.dailyErrors.length - 1]?._id?.slice(5))))), drillData.recentSessions.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-maintext mb-3 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Clock, { className: "w-4 h-4 text-subtext" }), " Recent Affected Sessions"), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, drillData.recentSessions.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "bg-white/5 border border-white/10 rounded-xl p-3 space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-lg" }, s.sessionId?.substring(0, 20), "..."), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-lg" }, s.errorCount, " errors"), /* @__PURE__ */ React.createElement("span", { className: "text-subtext" }, s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "-"))), s.topError && /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-subtext bg-black/10 dark:bg-black/30 rounded-lg px-2.5 py-1.5 font-mono leading-relaxed border border-white/5 line-clamp-3" }, s.topError)))))) : /* @__PURE__ */ React.createElement("div", { className: "text-center py-16 text-subtext" }, "No data available"))
  ))));
};
const AdminDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const user = getUserData();
  const isAdmin = user?.token && (user?.email === ADMIN_EMAIL || user?.role === "admin");
  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard/chat", { replace: true });
    }
  }, [isAdmin, navigate]);
  if (!isAdmin) return null;
  const tabs = [
    { id: "overview", label: t("overview"), icon: BarChart3 },
    { id: "users", label: t("users"), icon: Users },
    { id: "chat-sessions", label: "Chat Sessions", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "plans", label: t("plans"), icon: CreditCard },
    { id: "tool-limit", label: t("toolLimit") || "Tool Limit", icon: Shield },
    { id: "legal", label: t("legalPages"), icon: FileText },
    { id: "helpdesk", label: t("helpDesk"), icon: Headphones },
    { id: "knowledge", label: t("knowledge"), icon: BookOpen },
    { id: "settings", label: t("settings"), icon: Settings }
  ];
  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return /* @__PURE__ */ React.createElement(OverviewTab, null);
      case "users":
        return /* @__PURE__ */ React.createElement(UsersTab, null);
      case "chat-sessions":
        return /* @__PURE__ */ React.createElement(ChatSessionsTab, null);
      case "analytics":
        return /* @__PURE__ */ React.createElement(AnalyticsTab, null);
      case "plans":
        return /* @__PURE__ */ React.createElement(PlansTab, null);
      case "tool-limit":
        return /* @__PURE__ */ React.createElement(ToolLimitTab, null);
      case "legal":
        return /* @__PURE__ */ React.createElement(LegalPagesTab, null);
      case "helpdesk":
        return /* @__PURE__ */ React.createElement(AdminHelpDesk, { isOpen: true, isEmbedded: true });
      case "knowledge":
        return /* @__PURE__ */ React.createElement(KnowledgeBaseTab, null);
      case "settings":
        return /* @__PURE__ */ React.createElement(SettingsTab, null);
      default:
        return /* @__PURE__ */ React.createElement(OverviewTab, null);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "h-full overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden shrink-0" }, /* @__PURE__ */ React.createElement("img", { src: logo, alt: "AISA", className: "w-7 h-7 sm:w-9 sm:h-9 object-contain" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-xl sm:text-2xl font-black text-maintext tracking-tight" }, t("adminDashboard")), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] sm:text-xs text-subtext font-semibold uppercase tracking-wider hidden sm:block" }, t("platformManagementConsole")))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("/dashboard/chat"),
      className: "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-subtext hover:text-maintext hover:bg-white/20 dark:hover:bg-white/10 transition-all border border-white/20 dark:border-white/10 shrink-0"
    },
    /* @__PURE__ */ React.createElement(ArrowLeft, { className: "w-4 h-4" }),
    " ",
    /* @__PURE__ */ React.createElement("span", { className: "hidden xs:inline sm:inline" }, t("backToChat"))
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 admin-horizontal-scrollbar scrollbar-hide" }, tabs.map((tab) => /* @__PURE__ */ React.createElement(
    TabButton,
    {
      key: tab.id,
      active: activeTab === tab.id,
      icon: tab.icon,
      label: tab.label,
      onClick: () => setActiveTab(tab.id)
    }
  ))), /* @__PURE__ */ React.createElement(AnimatePresence, { mode: "wait" }, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      key: activeTab,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: 0.2 }
    },
    renderTab()
  ))));
};
export default AdminDashboard;
