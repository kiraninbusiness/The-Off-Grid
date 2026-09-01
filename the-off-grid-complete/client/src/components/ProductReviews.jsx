import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { api } from "../api";

/* =========================================================
   STAR ROW (read-only)
========================================================= */

function StarRow({ rating, size = 14 }) {
  return (
    <span className="review-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

/* =========================================================
   PRODUCT REVIEWS SECTION
========================================================= */

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ count: 0, average: 0 });
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isLoggedIn = Boolean(localStorage.getItem("thrift_token"));

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    api(`/reviews/${productId}`)
      .then((data) => {
        if (cancelled) return;
        setReviews(data.reviews || []);
        setSummary(data.summary || { count: 0, average: 0 });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    setSubmitting(true);

    try {
      const saved = await api(`/reviews/${productId}`, {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      });

      setReviews((current) => [saved, ...current]);
      setSummary((current) => {
        const count = current.count + 1;
        const total = current.average * current.count + rating;
        return {
          count,
          average: Math.round((total / count) * 10) / 10,
        };
      });

      setRating(0);
      setComment("");
    } catch (err) {
      setError(err.message || "Couldn't submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="product-reviews">

      <div className="product-reviews-header">

        <div>
          <span>THE OFF GRID / REVIEWS</span>
          <h2>WHAT PEOPLE SAY</h2>
        </div>

        {summary.count > 0 && (
          <div className="product-reviews-summary">
            <strong>{summary.average}</strong>
            <div>
              <StarRow rating={summary.average} size={16} />
              <span>
                {summary.count} review{summary.count === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        )}

      </div>

      {isLoggedIn ? (
        <form className="review-form" onSubmit={handleSubmit}>

          <div className="review-form-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={n <= rating ? "active" : ""}
                onClick={() => setRating(n)}
                aria-label={`Rate ${n} stars`}
              >
                <Star size={22} fill={n <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>

          <textarea
            placeholder="Share your experience with this piece (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
          />

          {error && <p className="checkout-error">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
          </button>

        </form>
      ) : (
        <div className="review-login-note">
          <Link to="/account">Log in</Link> to leave a review of this product.
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="review-empty">
          No reviews yet. Be the first to share your thoughts.
        </p>
      )}

      {reviews.length > 0 && (
        <div className="review-list">
          {reviews.map((r) => (
            <div className="review-item" key={r.id}>
              <div className="review-item-head">
                <StarRow rating={r.rating} />
                <strong>{r.user_name || "Verified buyer"}</strong>
                <span className="review-item-date">
                  {new Date(r.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {r.comment && <p>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

    </section>
  );
}
