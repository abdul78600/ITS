import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard,
  HeadphonesIcon,
  Ticket,
  FileQuestion,
  BookOpen,
  Laptop,
  Smartphone,
  Network,
  Database,
  HardDrive,
  BarChart,
  Shield,
  Globe,
  Server,
  Cloud,
  ShieldCheck,
  KeyRound,
  Bell,
  AlertTriangle,
  FileCheck,
  Building2,
  FileText,
  Users,
  TrendingUp,
  ShoppingCart,
  FileSpreadsheet,
  DollarSign,
  CheckSquare,
  Settings,
  Save,
  Activity,
  ChevronDown,
  ChevronRight,
  FileBox,
  MonitorSmartphone,
  FileCode2,
  ServerCog,
  X,
  ClipboardList,
  Home,
  Plus,
  Package,
  Eye,
  Lock
} from 'lucide-react';

interface MenuItem {
  id: string;
  icon: any;
  label: string;
  color: string;
  submenu?: MenuItem[];
}

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentPage, onPageChange, isOpen, onClose }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Handle swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;

    // If swiped left more than 50px, close the sidebar
    if (diff > 50) {
      onClose();
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  // Close sidebar on page change in mobile view
  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
    onClose();
  };

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      color: 'text-blue-400'
    },
    {
      id: 'service-desk',
      icon: HeadphonesIcon,
      label: 'Service Desk',
      color: 'text-green-400',
      submenu: [
        { id: 'create-ticket', icon: Plus, label: 'Create Ticket', color: 'text-green-400' },
        { id: 'tickets', icon: Ticket, label: 'All Tickets', color: 'text-green-400' },
        { id: 'knowledge-base', icon: BookOpen, label: 'Knowledge Base', color: 'text-green-400' }
      ]
    },
    {
      id: 'asset-management',
      icon: Laptop,
      label: 'Asset Management',
      color: 'text-purple-400',
      submenu: [
        { id: 'hardware', icon: MonitorSmartphone, label: 'Hardware', color: 'text-purple-400' },
        { id: 'software-management', icon: Package, label: 'Software', color: 'text-purple-400' },
        { id: 'mobile-devices', icon: Smartphone, label: 'Mobile Devices', color: 'text-purple-400' },
        { id: 'network-management', icon: Network, label: 'Network Devices', color: 'text-purple-400' }
      ]
    },
    {
      id: 'database-management',
      icon: Database,
      label: 'Database Management',
      color: 'text-cyan-400',
      submenu: [
        { id: 'database-instances', icon: HardDrive, label: 'Database Instances', color: 'text-cyan-400' },
        { id: 'backup-management', icon: Save, label: 'Backup Management', color: 'text-cyan-400' },
        { id: 'performance-monitoring', icon: Activity, label: 'Performance Monitoring', color: 'text-cyan-400' }
      ]
    },
    {
      id: 'domain-hosting',
      icon: Globe,
      label: 'Domain & Hosting',
      color: 'text-orange-400',
      submenu: [
        { id: 'domain-management', icon: Globe, label: 'Domain Management', color: 'text-orange-400' },
        { id: 'hosting-services', icon: Server, label: 'Hosting Services', color: 'text-orange-400' },
        { id: 'ssl-certificates', icon: Shield, label: 'SSL Certificates', color: 'text-orange-400' }
      ]
    },
    {
      id: 'infrastructure',
      icon: ServerCog,
      label: 'Infrastructure',
      color: 'text-blue-400',
      submenu: [
        { id: 'servers', icon: Server, label: 'Servers', color: 'text-blue-400' },
        { id: 'storage', icon: HardDrive, label: 'Storage', color: 'text-blue-400' },
        { id: 'network', icon: Network, label: 'Network', color: 'text-blue-400' },
        { id: 'cloud-services', icon: Cloud, label: 'Cloud Services', color: 'text-blue-400' }
      ]
    },
    {
      id: 'security',
      icon: ShieldCheck,
      label: 'Security',
      color: 'text-red-400',
      submenu: [
        { id: 'access-control', icon: Lock, label: 'Access Control', color: 'text-red-400' },
        { id: 'security-monitoring', icon: Eye, label: 'Security Monitoring', color: 'text-red-400' },
        { id: 'incidents', icon: AlertTriangle, label: 'Incidents', color: 'text-red-400' },
        { id: 'compliance', icon: FileCheck, label: 'Compliance', color: 'text-red-400' }
      ]
    },
    {
      id: 'vendor-management',
      icon: Building2,
      label: 'Vendor Management',
      color: 'text-orange-400',
      submenu: [
        { id: 'contracts', icon: FileText, label: 'Contracts', color: 'text-orange-400' },
        { id: 'agreements', icon: FileText, label: 'Agreements', color: 'text-orange-400' },
        { id: 'performance', icon: BarChart, label: 'Performance', color: 'text-orange-400' },
        { id: 'contacts', icon: Users, label: 'Contacts', color: 'text-orange-400' }
      ]
    },
    {
      id: 'it-procurement',
      icon: ShoppingCart,
      label: 'IT Procurement',
      color: 'text-green-400',
      submenu: [
        { id: 'purchase-requests', icon: FileSpreadsheet, label: 'Purchase Requests', color: 'text-green-400' },
        { id: 'purchase-orders', icon: ShoppingCart, label: 'Purchase Orders', color: 'text-green-400' },
        { id: 'budget', icon: DollarSign, label: 'Budget', color: 'text-green-400' },
        { id: 'approvals', icon: CheckSquare, label: 'Approvals', color: 'text-green-400' }
      ]
    },
    {
      id: 'system-admin',
      icon: Settings,
      label: 'System Admin',
      color: 'text-purple-400',
      submenu: [
        { id: 'users', icon: Users, label: 'Users', color: 'text-purple-400' },
        { id: 'roles', icon: Shield, label: 'Roles & Permissions', color: 'text-purple-400' },
        { id: 'system-settings', icon: Settings, label: 'Settings', color: 'text-purple-400' },
        { id: 'system-logs', icon: FileBox, label: 'Logs', color: 'text-purple-400' }
      ]
    },
    {
      id: 'reports-analytics',
      icon: TrendingUp,
      label: 'Reports & Analytics',
      color: 'text-blue-400',
      submenu: [
        { id: 'performance', icon: BarChart, label: 'Performance', color: 'text-blue-400' },
        { id: 'usage-statistics', icon: TrendingUp, label: 'Usage Statistics', color: 'text-blue-400' },
        { id: 'audit-logs', icon: FileBox, label: 'Audit Logs', color: 'text-blue-400' },
        { id: 'cost-analysis', icon: DollarSign, label: 'Cost Analysis', color: 'text-blue-400' }
      ]
    }
  ];

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isExpanded = expandedMenus.includes(item.id);
    const Icon = item.icon;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = currentPage === item.id;
    
    return (
      <div key={item.id} className="select-none">
        <button
          onClick={() => {
            if (hasSubmenu) {
              toggleSubmenu(item.id);
            } else {
              handlePageChange(item.id);
            }
          }}
          className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-800 transition-colors
            ${isActive ? 'bg-gray-800' : ''}
            ${level > 0 ? 'pl-8' : ''}`}
        >
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${item.color}`} />
            <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>
              {item.label}
            </span>
          </div>
          {hasSubmenu && (
            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          )}
        </button>
        {hasSubmenu && isExpanded && (
          <div className="ml-4 space-y-1">
            {item.submenu!.map(subItem => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30
        w-64 bg-[#1a2234] text-gray-300
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="h-16 bg-[#1a2234] border-b border-gray-700 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold text-white">IT Management System</h1>
        <button 
          onClick={onClose}
          className="text-gray-300 hover:text-white lg:hidden p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="h-[calc(100vh-4rem)] overflow-y-auto py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>
    </aside>
  );
}