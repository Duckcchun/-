import { useState, useEffect } from "react";
import { ConvenienceStoreList } from "./components/ConvenienceStoreList";
import { SearchBar } from "./components/SearchBar";
import { ReportForm } from "./components/ReportForm";
import { Button } from "./components/ui/button";
import { PlusCircle, MapPin } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";
import { Toaster } from "./components/ui/sonner";

export interface Store {
  id: string;
  name: string;
  address: string;
  hasSeating: "yes" | "no" | "unknown";
  lastUpdated: string;
  reportedBy?: string;
  latitude?: number;
  longitude?: number;
}

export default function App() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    loadStores();
    initializeSampleData();
  }, []);

  const initializeSampleData = async () => {
    try {
      const { projectId, publicAnonKey } = await import(
        "./utils/supabase/info"
      );
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e44bc02/init-sample-data`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );
    } catch (error) {
      console.log(
        "샘플 데이터 초기화 중 오류 (무시됨):",
        error,
      );
    }
  };

  const loadStores = async () => {
    try {
      setIsLoading(true);
      const { projectId, publicAnonKey } = await import(
        "./utils/supabase/info"
      );
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e44bc02/stores`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setStores(data);
        setFilteredStores(data);
      } else {
        console.error(
          "편의점 데이터 로드 실패:",
          await response.text(),
        );
      }
    } catch (error) {
      console.error("편의점 데이터 로드 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredStores(stores);
      return;
    }

    const filtered = stores.filter(
      (store) =>
        store.name
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        store.address
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
    setFilteredStores(filtered);
  };

  const handleReportSuccess = () => {
    setIsReportOpen(false);
    loadStores(); // 데이터 새로고침
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                편의점 좌석 찾기
              </h1>
            </div>
            <Sheet
              open={isReportOpen}
              onOpenChange={setIsReportOpen}
            >
              <SheetTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  좌석 정보 제보
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>편의점 좌석 정보 제보</SheetTitle>
                  <SheetDescription>
                    새로운 편의점의 좌석 정보를 제보해주세요.
                  </SheetDescription>
                </SheetHeader>
                <ReportForm onSuccess={handleReportSuccess} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* 검색 바 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              편의점 검색
            </h2>
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <MapPin className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  편의점 좌석 정보를 확인하세요
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    앉아서 취식할 수 있는 좌석이 있는 편의점을
                    찾아보세요. 정보가 없는 편의점이 있다면 직접
                    제보해주시면 다른 사용자들에게 도움이
                    됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 편의점 목록 */}
          <ConvenienceStoreList
            stores={filteredStores}
            isLoading={isLoading}
            onRefresh={loadStores}
          />
        </div>
      </main>

      {/* Toast 알림 */}
      <Toaster />
    </div>
  );
}