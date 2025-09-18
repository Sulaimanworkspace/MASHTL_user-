export interface ChatPreview {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
}

export const chatList: ChatPreview[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    lastMessage: 'شكرًا لك! سأتابع معك قريبًا.',
    time: '10:30 ص',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'خالد علي',
    lastMessage: 'تم استلام الطلب بنجاح.',
    time: '09:15 ص',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
  },
  {
    id: '3',
    name: 'سعيد حسن',
    lastMessage: 'هل تحتاج إلى مساعدة إضافية؟',
    time: '08:45 ص',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
  },
];

export default chatList; 