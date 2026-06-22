import {
  Home, Play, BrainCircuit, Map, Clock, Timer, Dumbbell,
  ArrowRight, ArrowLeft, AlertTriangle, Lightbulb,
  TrendingUp, TrendingDown, Minus, Check, Star,
  Search, Download, HelpCircle, Trophy, Zap,
  Users, ShieldCheck, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Plus, Info, Loader, List, ListFilter, BarChart2, Activity,
  Target, Award, Flame, Calendar, Settings, Bell, X, Edit2,
  Moon, Ruler, RotateCcw, CheckCircle, AlertCircle,
  Pencil, Trash2, Share2, MessageCircle, ClipboardList, RefreshCw,
  LogOut, User, Lock, Unlock, Eye, EyeOff, Send, ChevronDown as ChevronDownAlt,
  MoreVertical, Utensils, Apple, Coffee, Beef, Fish, Salad,
  ArrowUp, ArrowDown, BookOpen, Layers, Copy, ExternalLink,
} from "lucide-react";

const MAP = {
  Home, Play, BrainCircuit, Map, Clock, Timer, Dumbbell,
  ArrowRight, ArrowLeft, AlertTriangle, Lightbulb,
  TrendingUp, TrendingDown, Minus, Check, Star,
  Search, Download, HelpCircle, Trophy, Zap,
  Users, ShieldCheck, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Plus, Info, Loader, List, ListFilter, BarChart2, Activity,
  Target, Award, Flame, Calendar, Settings, Bell, X, Edit2,
  Moon, Ruler, RotateCcw, CheckCircle, AlertCircle,
  Pencil, Trash2, Share2, MessageCircle, ClipboardList, RefreshCw,
  LogOut, User, Lock, Unlock, Eye, EyeOff, Send,
  MoreVertical, Utensils, Apple, Coffee, Beef, Fish, Salad,
  ArrowUp, ArrowDown, BookOpen, Layers, Copy, ExternalLink,
};

export default function Icon({ name, size = 24, strokeWidth = 1.5, ...props }) {
  const Comp = MAP[name] || HelpCircle;
  return <Comp size={size} strokeWidth={strokeWidth} {...props} />;
}
