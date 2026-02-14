import {
  LayoutDashboard,
  ShieldCheck,
  Car,
  CarFront,
  Search,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: '대시보드', to: '/dashboard', icon: LayoutDashboard },
  { label: '경비원 관리', to: '/bouncers', icon: ShieldCheck },
  { label: '입주민 차량 관리', to: '/residents', icon: Car },
  { label: '방문 차량 관리', to: '/visitors', icon: CarFront },
  { label: '차량 조회', to: '/reports', icon: Search },
  { label: '공지사항 관리', to: '/notices', icon: Megaphone },
];
