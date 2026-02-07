'use client';

import { useEffect, useState, useCallback } from 'react';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { api } from '@/lib/api';
import { format } from 'date-fns';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, pages: 1 });

  const loadReviews = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.getReviews(`page=${page}&limit=15`);
      if (data.success) {
        setReviews(data.reviews);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">All user reviews and ratings</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">No reviews yet</h3>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{review.parentId?.name || 'Unknown Parent'}</p>
                    <p className="text-xs text-gray-400">{review.parentId?.phoneNumber}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{review.comment || 'No comment'}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Nanny: <span className="text-gray-600 font-medium">{review.nannyId?.name || 'Unknown'}</span></span>
                  <span>{format(new Date(review.createdAt), 'dd MMM yyyy')}</span>
                </div>
                {review.bookingId && (
                  <p className="text-xs text-gray-400 mt-1">Booking: <span className="font-mono">{review.bookingId?.bookingId || '—'}</span></p>
                )}
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => loadReviews(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</span>
              <button onClick={() => loadReviews(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
