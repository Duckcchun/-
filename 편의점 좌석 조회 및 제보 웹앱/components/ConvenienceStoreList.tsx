import { Store } from '../App';
import { StoreItem } from './StoreItem';
import { Button } from './ui/button';
import { RefreshCw, Store as StoreIcon } from 'lucide-react';

interface ConvenienceStoreListProps {
  stores: Store[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ConvenienceStoreList({ stores, isLoading, onRefresh }: ConvenienceStoreListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <StoreIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">편의점을 찾을 수 없습니다</h3>
          <p className="text-gray-500 mb-4">
            검색 조건을 변경하거나 새로운 편의점 정보를 제보해보세요.
          </p>
          <Button 
            onClick={onRefresh}
            variant="outline"
            className="inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            편의점 목록 ({stores.length}개)
          </h2>
          <Button 
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {stores.map((store) => (
          <StoreItem key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}