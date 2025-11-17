import React from 'react';
import { MessageCircle, Building2, MessageSquare } from 'lucide-react';

interface ChannelIconProps {
  type: 'zalo' | 'zalo-oa' | 'messenger';
  size?: number;
  className?: string;
}

export const ChannelIcon: React.FC<ChannelIconProps> = ({ 
  type, 
  size = 20,
  className = "w-10 h-10" 
}) => {
  const baseClasses = `${className} rounded-lg flex items-center justify-center text-white`;
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'zalo': return 'bg-blue-600';
      case 'zalo-oa': return 'bg-blue-400';
      case 'messenger': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'zalo': return <MessageCircle size={size} />;
      case 'zalo-oa': return <Building2 size={size} />;
      case 'messenger': return <MessageSquare size={size} />;
      default: return <MessageCircle size={size} />;
    }
  };

  return (
    <div className={`${baseClasses} ${getBackgroundColor()}`}>
      {getIcon()}
    </div>
  );
};