import { useState, useEffect } from 'react';
import { Camera, Brain, Loader, Bug, Leaf, Upload, AlertTriangle, Shield, CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const PestManagement = () => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [aiDetectionResult, setAiDetectionResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const { t } = useLanguage();

  useEffect(() => {
    testAPIConnection();
  }, []);

  const testAPIConnection = async () => {
    try {
      const response = await fetch('https://api.plant.id/v3/health_assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': 'yPq0vbF5MD12uUFSoBRLz5fMGX2jiNNy8uop3gE6YVOU80WJiB'
        },
        body: JSON.stringify({
          images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==']
        })
      });

      if (response.status < 500) {
        setApiStatus('online');
      }
    } catch {
      setApiStatus('offline');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setAiDetectionResult(null);
    setError(null);

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);

    try {
      const base64Image = await fileToBase64(file);

      const response = await fetch('https://api.plant.id/v3/health_assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': 'yPq0vbF5MD12uUFSoBRLz5fMGX2jiNNy8uop3gE6YVOU80WJiB'
        },
        body: JSON.stringify({
          images: [base64Image],
          latitude: 49.207,
          longitude: 16.608,
          similar_images: true
        })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const result = processV3Response(data);
      setAiDetectionResult(result);
      setApiStatus('online');

    } catch (err) {
      console.error('Plant.id API Error:', err);

      const mockResult = await analyzeImageLocally(file);
      setAiDetectionResult(mockResult);
      setError({
        title: 'Using Advanced Simulation',
        message: 'API connection issue - using local analysis',
        code: 'SIMULATION_MODE'
      });
      setApiStatus('offline');

    } finally {
      setUploadingImage(false);
    }
  };

  const processV3Response = (data) => {
    const result = data.result;

    if (result.is_healthy?.binary === false && result.disease?.suggestions?.length > 0) {
      const disease = result.disease.suggestions[0];

      return {
        type: 'disease_detected',
        name: disease.name,
        confidence: Math.round(disease.probability * 100),
        scientificName: disease.details?.scientific_name,
        description: disease.details?.description || 'Plant disease detected',
        treatment: disease.details?.treatment?.chemical?.[0] ||
                  disease.details?.treatment?.biological?.[0] ||
                  'Apply appropriate fungicide or pesticide',
        prevention: disease.details?.treatment?.prevention?.[0] ||
                   'Remove infected leaves, improve air circulation',
        source: 'Plant.id v3 AI'
      };
    }

    return {
      type: 'healthy',
      name: 'Healthy Plant',
      confidence: Math.round((result.is_healthy?.probability || 0.85) * 100),
      description: 'No diseases detected. Plant appears healthy.',
      source: 'Plant.id v3 AI'
    };
  };

  const analyzeImageLocally = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          let brownCount = 0, yellowCount = 0, greenCount = 0;

          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (r > 150 && g < 100 && b < 100) brownCount++;
            if (r > 200 && g > 180 && b < 120) yellowCount++;
            if (g > r && g > b) greenCount++;
          }

          const total = brownCount + yellowCount + greenCount;
          const brownPercent = (brownCount / total) * 100;
          const yellowPercent = (yellowCount / total) * 100;

          let result;
          if (brownPercent > 5 || yellowPercent > 10) {
            result = {
              type: 'disease_detected',
              name: brownPercent > yellowPercent ? 'Leaf Spot Disease' : 'Nutrient Deficiency',
              confidence: Math.min(Math.max(brownPercent, yellowPercent) * 3, 85),
              description: brownPercent > yellowPercent
                ? 'Brown spots detected - Possible fungal infection'
                : 'Yellowing detected - Possible nutrient deficiency',
              treatment: brownPercent > yellowPercent
                ? 'Apply copper-based fungicide weekly for 3 weeks'
                : 'Apply balanced NPK fertilizer and check soil pH',
              prevention: 'Avoid overhead watering, ensure proper drainage',
              source: 'Local Image Analysis'
            };
          } else {
            result = {
              type: 'healthy',
              name: 'Healthy Plant',
              confidence: 90,
              message: 'No significant issues detected',
              description: 'Leaf coloration appears normal',
              source: 'Local Image Analysis'
            };
          }

          resolve(result);
        };
        img.src = e.target?.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleReset = () => {
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    setUploadedImage(null);
    setAiDetectionResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">

        <div className="mb-6">
          <div className={`p-4 rounded-xl shadow-sm border ${
            apiStatus === 'online'
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300'
              : apiStatus === 'offline'
              ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300'
              : 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {apiStatus === 'online' ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : apiStatus === 'offline' ? (
                  <AlertTriangle className="text-yellow-600" size={24} />
                ) : (
                  <Loader className="animate-spin text-blue-600" size={24} />
                )}
                <div>
                  <h3 className="font-bold text-gray-800">
                    {apiStatus === 'online' ? t('plantIdOnline') :
                     apiStatus === 'offline' ? t('plantIdOffline') :
                     t('plantIdChecking')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {apiStatus === 'online' ? t('plantIdStatusOnline') :
                     apiStatus === 'offline' ? t('plantIdStatusOffline') :
                     t('plantIdStatusChecking')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Info size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">v3.0 API</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-lg mb-6">
            <Brain className="text-white" size={52} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t('aiScannerTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('aiScannerSubtitle')}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">

          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {t('uploadLeafTitle')}
              </h2>
              <p className="text-gray-600">
                {t('uploadLeafSubtitle')}
              </p>
            </div>

            <div className="border-4 border-dashed border-green-300 rounded-3xl p-10 text-center bg-gradient-to-b from-green-50 to-white">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-2xl mb-8">
                <Camera className="text-green-600" size={56} />
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {uploadingImage ? t('aiAnalysisInProgress') : t('captureOrUpload')}
              </h3>

              <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
                {t('bestResultsText')}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <div className="px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 active:scale-95 shadow-lg">
                    {uploadingImage ? (
                      <div className="flex items-center gap-3">
                        <Loader className="animate-spin" size={28} />
                        <span>{t('analyzingWithAI')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Upload size={28} />
                        <span>{t('selectImageButton')}</span>
                      </div>
                    )}
                  </div>
                </label>

                {uploadedImage && (
                  <button
                    onClick={handleReset}
                    className="px-12 py-5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-bold text-xl hover:shadow-xl transition-all duration-300 shadow-md"
                  >
                    {t('clearImageButton')}
                  </button>
                )}
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl mb-2">🌱</div>
                  <h4 className="font-bold text-gray-800 mb-1">Leaf Focus</h4>
                  <p className="text-sm text-gray-600">Clear view of leaf surface</p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl mb-2">💡</div>
                  <h4 className="font-bold text-gray-800 mb-1">Good Lighting</h4>
                  <p className="text-sm text-gray-600">Natural daylight preferred</p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-bold text-gray-800 mb-1">Close-up</h4>
                  <p className="text-sm text-gray-600">Focus on problem areas</p>
                </div>
              </div>
            </div>
          </div>

          {uploadedImage && (
            <div className="px-8 md:px-12 pb-8">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">{t('imagePreviewTitle')}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">{t('readyForAI')}</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <img
                    src={uploadedImage}
                    alt="Uploaded leaf"
                    className="max-h-80 rounded-xl shadow-lg border-4 border-white"
                  />
                </div>
              </div>
            </div>
          )}

      {error && (
            <div className="px-8 md:px-12 pb-8">
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <Shield className="text-yellow-600 mt-1" size={28} />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-yellow-800 mb-2">{t('simulationTitle')}</h3>
                    <p className="text-yellow-700 mb-4">{t('simulationMessage')}</p>
                    <div className="bg-white/70 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>{t('technicalInfoTitle')}</strong> {apiStatus === 'online'
                          ? t('technicalInfoOnline')
                          : t('technicalInfoOffline')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {aiDetectionResult && (
            <div className="p-8 md:p-12 bg-gradient-to-b from-gray-50 to-white">
              <div className={`rounded-3xl overflow-hidden border-4 shadow-2xl ${
                aiDetectionResult.type === 'disease_detected'
                  ? 'border-red-400 shadow-red-200/30'
                  : 'border-green-400 shadow-green-200/30'
              }`}>

                <div className={`p-8 md:p-12 ${
                  aiDetectionResult.type === 'disease_detected'
                    ? 'bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50'
                    : 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50'
                }`}>
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className={`p-6 rounded-full shadow-lg ${
                        aiDetectionResult.type === 'disease_detected'
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      }`}>
                        {aiDetectionResult.type === 'disease_detected' ? (
                          <Bug size={44} />
                        ) : (
                          <Leaf size={44} />
                        )}
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-medium">
                            {aiDetectionResult.source}
                          </span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">
                          {aiDetectionResult.type === 'disease_detected'
                            ? t('diseaseDetectedTitle')
                            : t('plantHealthyTitle')}
                        </h2>
                        <p className="text-2xl text-gray-600 mt-2">{aiDetectionResult.name}</p>
                        {aiDetectionResult.plantName && (
                          <p className="text-gray-500 mt-1">Plant: {aiDetectionResult.plantName}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-xl min-w-[220px]">
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-3">{t('aiConfidenceLabel')}</div>
                        <div className="text-5xl font-bold text-gray-800 mb-6">
                          {aiDetectionResult.confidence}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div
                            className={`h-3 rounded-full transition-all duration-1000 ${
                              aiDetectionResult.confidence > 80 ? 'bg-green-500' :
                              aiDetectionResult.confidence > 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${aiDetectionResult.confidence}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div className="space-y-8">
                      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                          <AlertTriangle className="text-blue-600" size={24} />
                          <h3 className="text-2xl font-bold text-gray-800">{t('diagnosisDetailsTitle')}</h3>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {aiDetectionResult.description}
                        </p>

                        {aiDetectionResult.scientificName && (
                          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                            <div className="font-medium text-blue-800 mb-1">{t('scientificClassificationTitle')}</div>
                            <div className="text-blue-700 italic">{aiDetectionResult.scientificName}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-8">
                      {aiDetectionResult.type === 'disease_detected' ? (
                        <>
                          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-2xl shadow-md border border-red-100">
                            <h3 className="text-2xl font-bold text-red-700 mb-6">{t('treatmentTitle')}</h3>
                            <div className="bg-white/70 p-6 rounded-xl">
                              <p className="text-gray-700 text-lg">{aiDetectionResult.treatment}</p>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-red-600">
                              <AlertTriangle size={20} />
                              <span className="text-sm">{t('treatmentFooter')}</span>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-2xl shadow-md border border-blue-100">
                            <h3 className="text-2xl font-bold text-blue-700 mb-6">{t('preventionTitle')}</h3>
                            <div className="bg-white/70 p-6 rounded-xl">
                              <p className="text-gray-700 text-lg">{aiDetectionResult.prevention}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl shadow-md border border-green-100">
                          <h3 className="text-2xl font-bold text-green-700 mb-6">{t('careRecoTitle')}</h3>
                          <div className="space-y-4">
                            {[
                              'Water regularly but avoid overwatering',
                              'Provide adequate sunlight exposure',
                              'Apply balanced fertilizer quarterly',
                              'Monitor for early pest signs',
                              'Prune dead or damaged leaves',
                              'Ensure proper soil drainage'
                            ].map((tip, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <span className="text-gray-700">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-5 rounded-xl font-bold text-xl transition-all duration-300 shadow-lg"
                    >
                      {t('analyzeAnotherImageButton')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {!aiDetectionResult && !uploadingImage && (
            <div className="p-8 md:p-12 border-t border-gray-200">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('poweredByPlantIdTitle')}</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {t('poweredByPlantIdText')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                  <div className="text-3xl mb-4">🤖</div>
                  <h4 className="font-bold text-gray-800 mb-2">{t('aiPoweredTitle')}</h4>
                  <p className="text-gray-600">{t('aiPoweredText')}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                  <div className="text-3xl mb-4">🌍</div>
                  <h4 className="font-bold text-gray-800 mb-2">{t('globalDatabaseTitle')}</h4>
                  <p className="text-gray-600">{t('globalDatabaseText')}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl">
                  <div className="text-3xl mb-4">⚡</div>
                  <h4 className="font-bold text-gray-800 mb-2">{t('realtimeTitle')}</h4>
                  <p className="text-gray-600">{t('realtimeText')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>{t('plantIdFooter')}</p>
        </div>
      </div>
    </div>
  );
};

export default PestManagement;
