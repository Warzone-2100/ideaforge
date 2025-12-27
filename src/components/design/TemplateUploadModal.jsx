import { useState, useEffect, useCallback } from 'react';
import { X, Upload, Loader2, Check, AlertCircle } from 'lucide-react';
import { aiService } from '../../services/aiService';

const CATEGORIES = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'settings', label: 'Settings' },
  { value: 'admin', label: 'Admin Panel' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'portfolio', label: 'Portfolio' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_WIDTH = 1200;
const ACCEPTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg'];

export default function TemplateUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('dashboard');
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setName('');
    setCategory('dashboard');
    setNotes('');
    setError(null);
    setIsAnalyzing(false);
    setShowSuccess(false);
  };

  // Validate file
  const validateFile = (file) => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Invalid format. Please upload PNG or JPG.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image too large. Maximum 5MB.';
    }
    return null;
  };

  // Compress image if needed
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Resize if width exceeds max
          if (width > MAX_IMAGE_WIDTH) {
            const ratio = MAX_IMAGE_WIDTH / width;
            width = MAX_IMAGE_WIDTH;
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64
          const base64 = canvas.toDataURL(file.type, 0.9);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection
  const handleFileSelect = async (file) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSelectedFile(file);
      const compressedBase64 = await compressImage(file);
      setPreview(compressedBase64);
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process image. Please try another file.');
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Click to browse
  const handleBrowseClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ACCEPTED_FORMATS.join(',');
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
  };

  // Change image
  const handleChangeImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  // Handle ESC key
  const handleClose = () => {
    if (preview && !isAnalyzing) {
      if (window.confirm('You have uploaded an image. Close anyway?')) {
        onClose();
      }
    } else if (!isAnalyzing) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, preview, isAnalyzing]);

  // Analyze with AI
  const handleAnalyze = async () => {
    if (!preview || !name.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Call AI service to analyze the template
      const result = await aiService.analyzeTemplate(preview, name.trim(), category, notes.trim());

      if (result.success) {
        // Prepare template object for parent component
        const template = {
          name: name.trim(),
          category,
          notes: notes.trim(),
          thumbnail: preview,
          analysis: result.analysis,
          cost: result.cost,
          model: result.model,
          tokens: result.tokens,
        };

        // Show success state
        setShowSuccess(true);

        // Call parent's success handler
        if (onUploadSuccess) {
          onUploadSuccess(template);
        }

        // Close modal after brief success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Template analysis error:', err);
      setError(err.message || 'Failed to analyze. Check your connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isOpen) return null;

  const canAnalyze = preview && name.trim() && !isAnalyzing;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Upload className="w-5 h-5 text-indigo-400" />
              Upload Design Screenshot
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              AI will analyze layout, colors, and components
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Close (ESC)"
            disabled={isAnalyzing}
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Success State */}
          {showSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-400">Analysis complete!</p>
                <p className="text-xs text-green-400/70 mt-0.5">Template added to library</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-400">Error</p>
                <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Drag & Drop Zone / Image Preview */}
          {!preview ? (
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className={`
                border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all duration-200
                ${isDragging
                  ? 'border-indigo-400 bg-indigo-500/10'
                  : 'border-zinc-700 hover:border-indigo-500 hover:bg-indigo-500/5'
                }
              `}
            >
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className={`
                  p-4 rounded-full transition-colors
                  ${isDragging ? 'bg-indigo-500/20' : 'bg-zinc-800'}
                `}>
                  <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-400' : 'text-zinc-400'}`} />
                </div>
                <div>
                  <p className="text-base font-medium text-zinc-200">
                    Drag & drop screenshot here
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    or click to browse (PNG, JPG - max 5MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="flex flex-col items-center">
                <img
                  src={preview}
                  alt="Template preview"
                  className="max-w-full h-auto rounded-lg border border-zinc-700 shadow-lg"
                  style={{ maxWidth: '400px' }}
                />
                <p className="text-xs text-zinc-500 mt-2">
                  {formatFileSize(selectedFile?.size || 0)}
                </p>
              </div>

              {/* Change Image Button */}
              <button
                onClick={handleChangeImage}
                disabled={isAnalyzing}
                className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-300 rounded-lg transition-colors text-sm font-medium"
              >
                Change image
              </button>
            </div>
          )}

          {/* Form Fields */}
          {preview && (
            <div className="space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Template Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Stripe Dashboard Style"
                  disabled={isAnalyzing}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isAnalyzing}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Notes <span className="text-zinc-500">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional: Any specific details about this design"
                  disabled={isAnalyzing}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 resize-y disabled:opacity-50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-8 py-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Cost estimate:</span>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
              ~$0.015 per analysis
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isAnalyzing}
              className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-300 rounded-lg transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with Gemini Flash 3...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Analyze with AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
