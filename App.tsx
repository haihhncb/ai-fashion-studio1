
import React, { useState, useEffect } from 'react';
import { EditorMode, EditorConfig, ProcessingState, ImageResult, CameraAngle } from './types';
import { ModeSelector } from './components/ModeSelector';
import { ImageUploader } from './components/ImageUploader';
import { AngleSelector } from './components/AngleSelector';
import { processImage } from './services/geminiService';

const App: React.FC = () => {
  const [config, setConfig] = useState<EditorConfig>({
    mode: EditorMode.VIRTUAL_TRY_ON,
    baseImage: null,
    referenceImage: null,
    cameraAngle: 'FRONT'
  });

  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    status: '',
    progress: 0
  });

  const [history, setHistory] = useState<ImageResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!config.baseImage) {
      setError("Vui lòng tải ảnh gốc lên.");
      return;
    }

    if ((config.mode === EditorMode.VIRTUAL_TRY_ON || config.mode === EditorMode.FACE_SWAP) && !config.referenceImage) {
      setError("Vui lòng tải ảnh tham chiếu lên.");
      return;
    }

    setError(null);
    setProcessing({ isProcessing: true, status: 'Đang phân tích yêu cầu...', progress: 20 });

    try {
      setProcessing(prev => ({ ...prev, status: 'Đang xử lý bằng AI...', progress: 60 }));
      const resultUrl = await processImage(config);
      
      const newResult: ImageResult = {
        id: Math.random().toString(36).substr(2, 9),
        originalUrl: config.baseImage,
        processedUrl: resultUrl,
        mode: config.mode,
        timestamp: Date.now()
      };

      setHistory([newResult, ...history]);
      setProcessing({ isProcessing: false, status: 'Hoàn tất', progress: 100 });
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra trong quá trình xử lý.");
      setProcessing({ isProcessing: false, status: '', progress: 0 });
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `trung-ai-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">App By <span className="text-blue-600">Trung 1.0.1</span></h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>Commercial Edition</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mode Selection */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">1. Chọn chế độ xử lý</h2>
            <span className="text-xs bg-slate-200 px-2 py-1 rounded font-mono">STRICT_MODE: ON</span>
          </div>
          <ModeSelector 
            currentMode={config.mode} 
            onModeChange={(mode) => setConfig({ ...config, mode, referenceImage: null })} 
          />
        </section>

        <div className="grid lg:grid-cols-12 gap-8 mt-8">
          {/* Editor Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-6">2. Tải tài nguyên</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ImageUploader 
                  label={config.mode === EditorMode.REMOVE_TEXT || config.mode === EditorMode.CAMERA_ANGLE ? "Ảnh cần xử lý" : "Ảnh người mẫu gốc"}
                  image={config.baseImage}
                  onImageChange={(img) => setConfig({ ...config, baseImage: img })}
                />

                {(config.mode === EditorMode.VIRTUAL_TRY_ON || config.mode === EditorMode.FACE_SWAP) && (
                  <ImageUploader 
                    label={config.mode === EditorMode.VIRTUAL_TRY_ON ? "Ảnh quần áo mẫu" : "Ảnh khuôn mặt tham chiếu"}
                    image={config.referenceImage}
                    onImageChange={(img) => setConfig({ ...config, referenceImage: img })}
                  />
                )}
              </div>

              {config.mode === EditorMode.CAMERA_ANGLE && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Chọn góc máy mục tiêu</h3>
                  <AngleSelector 
                    selected={config.cameraAngle || 'FRONT'} 
                    onChange={(angle) => setConfig({ ...config, cameraAngle: angle })} 
                  />
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                disabled={processing.isProcessing || !config.baseImage}
                onClick={handleProcess}
                className={`w-full mt-8 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  processing.isProcessing || !config.baseImage
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98]'
                }`}
              >
                {processing.isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
  <circle
    className="opacity-25"
    cx="12"
    cy="12"
    r="10"
    stroke="currentColor"
    strokeWidth="4"
    fill="none"
  />
  <path
    className="opacity-75"
    fill="currentColor"
    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
  />
</svg>
</>
  ) : (
    <span>{processing.label || "Xử lý ngay"}</span>
  )}
</button>   );
}

export default App;
