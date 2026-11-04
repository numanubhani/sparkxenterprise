// Lucide icons referenced by name from data files.
import {
  BadgeCheck, Boxes, Building2, Cable, CalendarClock, ClipboardCheck, ClipboardList, Clock, Cpu, CreditCard, Database, Fan,
  FileCheck2, FileText, Gauge, Globe, Globe2, HardDrive, Headphones, Layers, LifeBuoy, MapPin, MessageSquare, Network, Package,
  PackageCheck, Plane, Receipt, Rocket, Scale, Search, Server, ServerCog, Settings, ShieldCheck, Ship, Sparkles, Thermometer,
  Truck, UserCheck, Users, Wrench, Zap,
} from 'lucide-react';

export const ICONS = {
  BadgeCheck, Boxes, Building2, Cable, CalendarClock, ClipboardCheck, ClipboardList, Clock, Cpu, CreditCard, Database, Fan,
  FileCheck2, FileText, Gauge, Globe, Globe2, HardDrive, Headphones, Layers, LifeBuoy, MapPin, MessageSquare, Network, Package,
  PackageCheck, Plane, Receipt, Rocket, Scale, Search, Server, ServerCog, Settings, ShieldCheck, Ship, Sparkles, Thermometer,
  Truck, UserCheck, Users, Wrench, Zap,
};

export const getIcon = (name) => ICONS[name] || Sparkles;
