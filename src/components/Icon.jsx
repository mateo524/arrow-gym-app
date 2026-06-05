import { Home, Play, BrainCircuit, Map, Clock, Dumbbell, ArrowRight, ArrowLeft, AlertTriangle, Lightbulb, TrendingUp, Minus, Check, Star, Search, Download, HelpCircle } from "lucide-react";

const MAP = {
  Home, Play, BrainCircuit, Map, Clock, Dumbbell,
  ArrowRight, ArrowLeft, AlertTriangle, Lightbulb, TrendingUp, Minus, Check,
  Star, Search, Download,
};

export default function Icon({ name, size = 24, strokeWidth = 1.5, ...props }) {
  const Comp = MAP[name] || HelpCircle;
  return <Comp size={size} strokeWidth={strokeWidth} {...props} />;
}
