import { Store } from '../App';
import { Badge } from './ui/badge';
import { MapPin, Clock, User } from 'lucide-react';

interface StoreItemProps {
  store: Store;
}

export function StoreItem({ store }: StoreItemProps) {
  const getSeatingBadge = (hasSeating: string) => {
    switch (hasSeating) {
      case 'yes':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">좌석 있음</Badge>;
      case 'no':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">좌석 없음</Badge>;
      case 'unknown':
      default:
        return <Badge variant="outline">정보 없음</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '오늘';
    } else if (diffDays === 2) {
      return '어제';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
            {getSeatingBadge(store.hasSeating)}
          </div>
          
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{store.address}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>최근 업데이트: {formatDate(store.lastUpdated)}</span>
            </div>
            {store.reportedBy && (
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <span>제보자: {store.reportedBy}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}