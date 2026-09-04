import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Gift, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Key, 
  Save 
} from 'lucide-react';
import { AIProvider, OllamaStatus } from './types';

interface AIProviderConfigProps {
  aiProvider: AIProvider;
  setAiProvider: (provider: AIProvider) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  onSaveApiKey: () => void;
  ollamaStatus: OllamaStatus;
  ollamaModel: string;
  setOllamaModel: (model: string) => void;
  availableModels: string[];
  onCheckOllamaConnection: () => void;
}

export const AIProviderConfig: React.FC<AIProviderConfigProps> = ({
  aiProvider,
  setAiProvider,
  apiKey,
  setApiKey,
  onSaveApiKey,
  ollamaStatus,
  ollamaModel,
  setOllamaModel,
  availableModels,
  onCheckOllamaConnection
}) => {
  return (
    <div className="space-y-4">
      {/* Groq AI Info */}
      <div className="relative p-6 border-2 rounded-xl border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Groq AI-Powered Generation</h3>
              <Badge className="text-xs font-medium bg-blue-100 text-blue-800 border-blue-200">
                Powered by Groq
              </Badge>
              <Badge className="text-xs font-medium bg-green-100 text-green-800 border-green-200">
                <Gift className="h-3 w-3 mr-1" />
                Miễn phí
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Sử dụng Groq AI để tạo câu hỏi chất lượng cao - Hoàn toàn miễn phí
            </p>
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800">Trạng thái kết nối AI</h4>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-green-700">Đã cấu hình</span>
          </div>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>✅ Groq AI đã sẵn sàng:</strong> Bạn có thể sử dụng tính năng tạo câu hỏi bằng AI ngay bây giờ!
          </p>
          <p className="text-xs text-green-700 mt-1">
            Sử dụng mô hình llama-3.1-8b-instant để tạo câu hỏi chất lượng cao
          </p>
        </div>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <div className="p-1 rounded-lg bg-blue-100">
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <AlertDescription className="text-blue-800">
              <strong>🤖 Groq AI:</strong> Sử dụng mô hình llama-3.1-8b-instant để tạo câu hỏi chất lượng cao
              <br />
              <span className="text-sm">• Cần cấu hình API key (miễn phí tại console.groq.com)</span>
              <br />
              <span className="text-sm">• Tạo câu hỏi đa dạng và phù hợp với nội dung</span>
              <br />
              <span className="text-sm">• Hỗ trợ tất cả loại câu hỏi TOEIC</span>
              <br />
              <span className="text-sm">• Tốc độ xử lý nhanh và ổn định</span>
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* AI Provider Selection */}
      <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-800">Chọn AI Provider</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Groq Option */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              aiProvider === 'groq' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
            onClick={() => setAiProvider('groq')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-800">Groq AI (Cloud)</h4>
                <p className="text-sm text-blue-600">Nhanh, miễn phí, không cần cài đặt</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="text-xs bg-green-100 text-green-800">Miễn phí</Badge>
                  <Badge className="text-xs bg-blue-100 text-blue-800">Nhanh</Badge>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                aiProvider === 'groq' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {aiProvider === 'groq' && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
              </div>
            </div>
          </div>

          {/* Ollama Option */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              aiProvider === 'ollama' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
            onClick={() => setAiProvider('ollama')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-800">Ollama (Local)</h4>
                <p className="text-sm text-purple-600">Chạy local, bảo mật cao, không cần internet</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="text-xs bg-purple-100 text-purple-800">Local</Badge>
                  <Badge className={`text-xs ${
                    ollamaStatus === 'connected' 
                      ? 'bg-green-100 text-green-800' 
                      : ollamaStatus === 'checking'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ollamaStatus === 'checking' ? 'Đang kiểm tra...' : 
                     ollamaStatus === 'connected' ? 'Đã kết nối' : 'Chưa kết nối'}
                  </Badge>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                aiProvider === 'ollama' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
              }`}>
                {aiProvider === 'ollama' && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Ollama Status Info */}
        {aiProvider === 'ollama' && ollamaStatus === 'disconnected' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">
                <strong>Ollama chưa được kết nối.</strong> Vui lòng:
              </p>
            </div>
            <ol className="list-decimal list-inside text-sm text-red-600 mt-2 space-y-1">
              <li>Đảm bảo Ollama đang chạy: <code className="bg-red-100 px-1 rounded">ollama serve</code></li>
              <li>Kiểm tra model có sẵn: <code className="bg-red-100 px-1 rounded">ollama list</code></li>
              <li>Pull model nếu cần: <code className="bg-red-100 px-1 rounded">ollama pull llama3.1:8b</code></li>
            </ol>
            <Button 
              onClick={onCheckOllamaConnection}
              variant="outline" 
              size="sm" 
              className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Kiểm tra lại
            </Button>
          </div>
        )}
        
        {/* Ollama Model Selection - Only show when connected */}
        {aiProvider === 'ollama' && ollamaStatus === 'connected' && availableModels.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700 font-medium">
                Chọn model Ollama:
              </p>
            </div>
            <div className="space-y-2">
              {availableModels.filter(m => !m.includes('embed')).map((model) => (
                <div 
                  key={model}
                  className={`p-2 border rounded cursor-pointer transition-all ${
                    ollamaModel === model 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                  onClick={() => setOllamaModel(model)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{model}</p>
                      <p className="text-xs text-gray-500">
                        {model.includes('llama3') ? 'Chất lượng cao, chậm' : 
                         model.includes('gemma') ? 'Nhanh, ít RAM' : 
                         'Model khác'}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      ollamaModel === model ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                    }`}>
                      {ollamaModel === model && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-green-600 mt-2">
              💡 <strong>Khuyến nghị:</strong> llama3:latest cho chất lượng tốt nhất, gemma3:1b cho tốc độ nhanh nhất
            </p>
          </div>
        )}
      </div>

      {/* API Key Configuration - Only show for Groq */}
      {aiProvider === 'groq' && (
        <div className="space-y-4 p-4 border rounded-lg bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Cấu hình Groq API Key</h3>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Nhập Groq API Key (bắt đầu với gsk_)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={onSaveApiKey}
                disabled={!apiKey || apiKey.length < 10}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu
              </Button>
            </div>
            <div className="text-sm text-yellow-700">
              <p>🔑 <strong>Lấy API Key miễn phí:</strong></p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Truy cập <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">console.groq.com</a></li>
                <li>Đăng ký/Đăng nhập tài khoản</li>
                <li>Vào "API Keys" → "Create API Key"</li>
                <li>Copy API key và paste vào ô trên</li>
              </ol>
              <p className="mt-2 text-xs">
                💡 API key sẽ được lưu trong localStorage và chỉ sử dụng trên trình duyệt này
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
