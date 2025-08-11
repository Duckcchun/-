import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

interface ReportFormProps {
  onSuccess: () => void;
}

export function ReportForm({ onSuccess }: ReportFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    hasSeating: 'unknown',
    reporterName: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error('편의점 이름과 주소는 필수 입력 항목입니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3e44bc02/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('편의점 정보가 성공적으로 제보되었습니다!');
        setFormData({
          name: '',
          address: '',
          hasSeating: 'unknown',
          reporterName: '',
          notes: ''
        });
        onSuccess();
      } else {
        const errorText = await response.text();
        console.error('제보 실패:', errorText);
        toast.error('제보 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('제보 중 오류:', error);
      toast.error('제보 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="space-y-2">
        <Label htmlFor="name">편의점 이름 *</Label>
        <Input
          id="name"
          type="text"
          placeholder="예: 세븐일레븐 강남점"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">주소 *</Label>
        <Input
          id="address"
          type="text"
          placeholder="예: 서울시 강남구 테헤란로 123"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div className="space-y-3">
        <Label>좌석 여부 *</Label>
        <RadioGroup
          value={formData.hasSeating}
          onValueChange={(value) => setFormData({ ...formData, hasSeating: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="yes" />
            <Label htmlFor="yes">좌석 있음 (앉아서 취식 가능)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no" />
            <Label htmlFor="no">좌석 없음 (서서 취식만 가능)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unknown" id="unknown" />
            <Label htmlFor="unknown">확실하지 않음</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reporterName">제보자 이름 (선택)</Label>
        <Input
          id="reporterName"
          type="text"
          placeholder="익명"
          value={formData.reporterName}
          onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">추가 정보 (선택)</Label>
        <Textarea
          id="notes"
          placeholder="좌석 개수, 테이블 형태, 기타 특이사항 등..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? '제보 중...' : '제보하기'}
      </Button>
    </form>
  );
}