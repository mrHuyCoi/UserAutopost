import { MessageCircle, Building2, MessageSquare } from "lucide-react";

export const generateBotResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('giá') || lowerMessage.includes('bao nhiêu')) {
    return 'Dạ, về giá cả sản phẩm/dịch vụ, em sẽ kiểm tra và báo lại cho anh/chị một mức giá hợp lý ạ. Anh/chị có thể cho em biết cụ thể sản phẩm/dịch vụ nào không?';
  } else if (lowerMessage.includes('dịch vụ') || lowerMessage.includes('sửa chữa')) {
    return 'Dạ, bên em có các dịch vụ sửa chữa như thay màn hình, thay pin, ép kính, thay camera, sửa lỗi phần mềm. Anh/chị cần sửa loại máy nào ạ?';
  } else if (lowerMessage.includes('linh kiện') || lowerMessage.includes('phụ kiện')) {
    return 'Dạ, bên em có đầy đủ các linh kiện thay thế chính hãng cho nhiều dòng điện thoại. Anh/chị cần linh kiện gì và cho máy nào ạ?';
  } else {
    return 'Dạ, em hiểu câu hỏi của anh/chị rồi ạ. Để em hỗ trợ tốt hơn, anh/chị có thể nói rõ hơn về nhu cầu được không ạ?';
  }
};

export const getChannelIcon = (type: 'zalo' | 'zalo-oa' | 'messenger') => {
  const baseClasses = "w-10 h-10 rounded-lg flex items-center justify-center text-white";
  
  switch (type) {
    case 'zalo':
      return (<div className={`${baseClasses} bg-blue-600`}><MessageCircle size={20} /></div>);
    case 'zalo-oa':
      return <div className={`${baseClasses} bg-blue-400`}><Building2 size={20} /></div>;
    case 'messenger':
      return <div className={`${baseClasses} bg-blue-500`}><MessageSquare size={20} /></div>;
    default:
      return <div className={`${baseClasses} bg-gray-500`}><MessageCircle size={20} /></div>;
  }
};