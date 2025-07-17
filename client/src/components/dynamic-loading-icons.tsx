import { Globe, Smartphone, Monitor, Camera, Search, BarChart3, Bot, FileText, Download } from "lucide-react";

interface DynamicLoadingIconProps {
  step: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const stepIcons = [
  { icon: Globe, color: "text-blue-500" },        // Starting browser automation
  { icon: Globe, color: "text-green-500" },       // Connecting to website
  { icon: Smartphone, color: "text-purple-500" }, // Mobile performance analysis
  { icon: Monitor, color: "text-indigo-500" },    // Desktop performance analysis
  { icon: Camera, color: "text-pink-500" },       // Mobile screenshot
  { icon: Camera, color: "text-orange-500" },     // Desktop screenshot
  { icon: Search, color: "text-emerald-500" },    // SEO metadata
  { icon: BarChart3, color: "text-blue-600" },    // Core Web Vitals
  { icon: BarChart3, color: "text-purple-600" },  // Waterfall resources
  { icon: Bot, color: "text-red-500" },           // AI content analysis
  { icon: FileText, color: "text-slate-500" },    // Compiling recommendations
];

export function DynamicLoadingIcon({ step, size = "md", className = "" }: DynamicLoadingIconProps) {
  const iconData = stepIcons[step] || stepIcons[0];
  const Icon = iconData.icon;
  
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Icon 
        className={`${sizeClasses[size]} ${iconData.color} animate-pulse`}
      />
    </div>
  );
}

export function GeneratingReportIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <Download className={`${sizeClasses[size]} text-green-500 animate-bounce`} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
      </div>
    </div>
  );
}