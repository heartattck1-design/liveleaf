import { useState } from 'react';
import { Upload, ArrowRight, Loader2, Sprout } from 'lucide-react';
import { BACKEND_BASE_URL } from '../../config';
import { LiveleafLogo } from '../layout/LiveleafLogo';

interface PlantSetupScreenProps {
  onComplete: (plantDetails: { scientificName?: string; commonName?: string }) => void;
}

export function PlantSetupScreen({ onComplete }: PlantSetupScreenProps) {
  const [scientificName, setScientificName] = useState('');
  const [commonName, setCommonName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('liveleaf_token');
      const formData = new FormData();
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      formData.append('scientific_name', scientificName);
      formData.append('common_name', commonName);

      const response = await fetch(`${BACKEND_BASE_URL}/plant/analyze`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // If /plant/analyze isn't available or fails without an image in demo, allow fallback
        if (!selectedFile && !scientificName) {
          throw new Error(data?.msg ?? 'Please upload a plant photo or provide details.');
        }
      }

      const plantInfo = {
        scientificName: scientificName || data?.analysis?.scientific_name || 'Monstera deliciosa',
        commonName: commonName || data?.analysis?.common_name || 'Swiss Cheese Plant',
      };

      setIsSubmitting(false);
      onComplete(plantInfo);
    } catch (err) {
      // In case backend is offline during offline prototype testing, allow proceeding smoothly
      if (scientificName || selectedFile) {
        onComplete({
          scientificName: scientificName || 'Monstera deliciosa',
          commonName: commonName || 'Swiss Cheese Plant',
        });
      } else {
        setError(err instanceof Error ? err.message : 'Failed to analyze plant.');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-4 py-8">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 flex justify-center">
          <LiveleafLogo title="Liveleaf" subtitle="Plant Setup & AI Identification" />
        </div>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Sprout className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Identify Your Plant</h1>
          <p className="mt-1 text-xs text-slate-500">
            Upload a photo of your plant or enter its species details. We will send this to the backend AI analysis pipeline.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Plant Photo (Optional)</label>
            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-emerald-500">
              {previewUrl ? (
                <div className="relative h-40 w-full overflow-hidden rounded-xl">
                  <img src={previewUrl} alt="Plant preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center">
                  <Upload className="mb-2 h-8 w-8 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700">Click to upload plant photo</span>
                  <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, JPEG up to 10MB</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Common Name</label>
              <input
                type="text"
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                placeholder="e.g. Swiss Cheese Plant"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Scientific Name</label>
              <input
                type="text"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                placeholder="e.g. Monstera deliciosa"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2D6A4F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1B4332] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Plant & Sending to Backend...
              </>
            ) : (
              <>
                Continue to ESP32 Connection
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
