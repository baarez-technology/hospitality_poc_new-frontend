import { createPortal } from 'react-dom';
import { X, Star, ThumbsUp, RefreshCw, XCircle, ExternalLink } from 'lucide-react';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`w-5 h-5 ${
            index < rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewDrawer({ isOpen, data, onClose }) {
  if (!isOpen || !data) return null;

  const handleApprove = () => {
    console.log('Approved response for review:', data.id);
    onClose();
  };

  const handleRegenerate = () => {
    console.log('Regenerating response for review:', data.id);
  };

  const handleReject = () => {
    console.log('Rejected response for review:', data.id);
    onClose();
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-2xl bg-white shadow-xl h-screen overflow-y-auto custom-scrollbar transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-neutral-900">Review Details</h2>
            <p className="text-sm text-neutral-600 mt-1">AI-powered response management</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Review Information */}
          <div className="bg-[#FAF8F6] rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-neutral-900">{data.guestName}</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Room {data.room} • {data.platform}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(data.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-right">
                <StarRating rating={data.rating} />
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#4E5840]/10 text-[#4E5840] border border-[#4E5840]/30">
                  <span className="text-lg">{data.sentiment === 'positive' ? '😊' : data.sentiment === 'neutral' ? '😐' : '😟'}</span>
                  {data.sentiment} ({Math.round(data.sentimentScore * 100)}%)
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">Guest Comment:</h4>
              <p className="text-neutral-700 leading-relaxed">{data.comment}</p>
            </div>

            {data.tags && data.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white rounded-lg text-xs text-neutral-600 border border-neutral-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI-Generated Response */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                AI-Generated Response
              </h3>
              <span className="px-3 py-1 bg-[#5C9BA4]/10 text-[#5C9BA4] rounded-full text-xs font-medium">
                AI Draft
              </span>
            </div>

            <div className="bg-white border-2 border-[#A57865]/30 rounded-xl p-6">
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {data.aiResponseDraft}
              </p>
            </div>

            {/* Response Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-[#FAF8F6] rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-900">{data.aiResponseDraft.split(' ').length}</p>
                <p className="text-xs text-neutral-600">Words</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#4E5840]">High</p>
                <p className="text-xs text-neutral-600">Empathy Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#5C9BA4]">95%</p>
                <p className="text-xs text-neutral-600">Match Quality</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleApprove}
              className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all font-semibold shadow-sm flex items-center justify-center gap-2 group"
            >
              <ThumbsUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Approve & Post Response
            </button>

            <button
              onClick={handleRegenerate}
              className="w-full px-6 py-4 bg-[#5C9BA4] hover:bg-[#4A7C84] text-white rounded-xl transition-all font-semibold shadow-sm flex items-center justify-center gap-2 group"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Regenerate Response
            </button>

            <button
              onClick={handleReject}
              className="w-full px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Reject & Write Manually
            </button>
          </div>

          {/* View on Platform */}
          <div className="pt-4 border-t border-neutral-200">
            <a
              href="#"
              className="flex items-center justify-center gap-2 text-sm text-[#A57865] hover:text-[#A57865] font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              View review on {data.platform}
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
