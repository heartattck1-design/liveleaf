import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowRight, Loader2, Sprout, Upload } from 'lucide-react';

import { analyzePlantPhoto, getRequiredBearerHeaders } from '../../services/api';
import { BACKEND_BASE_URL } from '../../config';
import type { PlantAnalysisResponse } from '../../types/plantAnalysis';
import type { PlantProfile } from '../../types/plant';
import { createBasicPlantProfile, createPlantProfileFromAnalysis } from '../../utils/plantProfile';
import { LiveleafLogo } from '../layout/LiveleafLogo';
import { PlantAnalysisResult } from './PlantAnalysisResult';

interface PlantSetupScreenProps {
  onComplete: (plant: PlantProfile) => void;
}

export function PlantSetupScreen({ onComplete }: PlantSetupScreenProps) {
  const [scientificName, setScientificName] = useState('');
  const [commonName, setCommonName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PlantAnalysisResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('The image must be 10 MB or smaller.');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysis(null);
    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (selectedFile) {
        setAnalysis(
          await analyzePlantPhoto(selectedFile, {
            commonName,
            scientificName,
          }),
        );
        return;
      }

      if (!scientificName.trim() && !commonName.trim()) {
        throw new Error('Upload a plant photo or enter its common or scientific name.');
      }

      const formData = new FormData();
      formData.append('scientific_name', scientificName);
      formData.append('common_name', commonName);

      const response = await fetch(`${BACKEND_BASE_URL}/plant/analyze`, {
        method: 'POST',
        headers: {
          ...getRequiredBearerHeaders(),
        },
        body: formData,
      });
      const data = (await response.json().catch(() => null)) as
        | { msg?: string; analysis?: { scientific_name?: string; common_name?: string } }
        | null;

      if (!response.ok) {
        throw new Error(data?.msg ?? 'Plant analysis request failed.');
      }

      onComplete(
        createBasicPlantProfile(
          commonName || data?.analysis?.common_name || 'Swiss Cheese Plant',
          scientificName || data?.analysis?.scientific_name || 'Monstera deliciosa',
        ),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to analyze the plant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex justify-center">
          <LiveleafLogo title="Liveleaf" subtitle="Plant Setup & AI Identification" />
        </div>

        {analysis ? (
          <PlantAnalysisResult
            result={analysis}
            onContinue={() =>
              onComplete(createPlantProfileFromAnalysis(analysis))
            }
          />
        ) : (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Sprout className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">Identify Your Plant</h1>
              <p className="mt-1 text-xs text-slate-500">
                Upload a photo for AI identification and environment analysis, or enter the plant details manually.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="plant-photo" className="text-sm font-medium text-slate-700">
                  Plant Photo (Optional)
                </label>
                <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-emerald-500">
                  {previewUrl ? (
                    <div className="relative h-40 w-full overflow-hidden rounded-xl">
                      <img src={previewUrl} alt="Selected plant preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        aria-label="Remove selected photo"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          setAnalysis(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="plant-photo" className="flex cursor-pointer flex-col items-center justify-center">
                      <Upload className="mb-2 h-8 w-8 text-emerald-600" />
                      <span className="text-xs font-semibold text-slate-700">Click to upload plant photo</span>
                      <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, JPEG up to 10 MB</span>
                    </label>
                  )}
                  <input
                    id="plant-photo"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={previewUrl ? 'sr-only' : 'hidden'}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="common-name" className="text-xs font-medium text-slate-700">Common Name</label>
                  <input
                    id="common-name"
                    type="text"
                    value={commonName}
                    onChange={(event) => setCommonName(event.target.value)}
                    placeholder="e.g. Swiss Cheese Plant"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="scientific-name" className="text-xs font-medium text-slate-700">Scientific Name</label>
                  <input
                    id="scientific-name"
                    type="text"
                    value={scientificName}
                    onChange={(event) => setScientificName(event.target.value)}
                    placeholder="e.g. Monstera deliciosa"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2D6A4F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {selectedFile ? 'Analyzing photo and environment...' : 'Analyzing plant...'}
                  </>
                ) : (
                  <>
                    {selectedFile ? 'Analyze plant photo' : 'Continue to ESP32 Connection'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
