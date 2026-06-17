import {
  Home, Play, BrainCircuit, Map, Clock, Dumbbell,
  ArrowRight, ArrowLeft, AlertTriangle, Lightbulb,
  TrendingUp, TrendingDown, Minus, Check, Star,
  Search, Download, HelpCircle, Trophy, Zap,
  Users, ShieldCheck, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Plus, Info, Loader, List, ListFilter, BarChart2, Activity,
  Target, Award, Flame, Calendar, Settings, Bell, X, Edit2,
} from "lucide-react";

const MAP = {
  Home, Play, BrainCircuit, Map, Clock, Dumbbell,
  ArrowRight, ArrowLeft, AlertTriangle, Lightbulb,
  TrendingUp, TrendingDown, Minus, Check, Star,
  Search, Download, Trophy, Zap,
  Users, ShieldCheck, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Plus, Info, Loader, List, ListFilter, BarChart2, Activity,
  Target, Award, Flame, Calendar, Settings, Bell, X, Edit2,
};

export default function Icon({ name, size = 24, strokeWidth = 1.5, ...props }) {
  const Comp = MAP[name] || HelpCircle;
  return <Comp size={size} strokeWidth={strokeWidth} {...props} />;
}
