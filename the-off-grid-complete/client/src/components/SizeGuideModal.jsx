import React from "react";
import { X } from "lucide-react";

/* =========================================================
   SIZE GUIDE MODAL
   A simple, editable measurement chart. Update the ROWS
   array below with your own brand's measurements (in inches).
========================================================= */

const ROWS = [
  { size: "S", chest: "38", length: "27", shoulder: "17" },
  { size: "M", chest: "40", length: "28", shoulder: "18" },
  { size: "L", chest: "42", length: "29", shoulder: "19" },
  { size: "XL", chest: "44", length: "30", shoulder: "20" },
  { size: "XXL", chest: "46", length: "31", shoulder: "21" },
];

export default function SizeGuideModal({ onClose }) {
  return (
    <div
      className="size-guide-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="size-guide-modal">

        <button
          type="button"
          className="size-guide-close"
          onClick={onClose}
          aria-label="Close size guide"
        >
          <X size={18} />
        </button>

        <span>THE OFF GRID / FIT GUIDE</span>

        <h2>SIZE GUIDE</h2>

        <table className="size-guide-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Chest (in)</th>
              <th>Length (in)</th>
              <th>Shoulder (in)</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.size}>
                <td>{row.size}</td>
                <td>{row.chest}</td>
                <td>{row.length}</td>
                <td>{row.shoulder}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="size-guide-note">
          Measurements are body measurements in inches, taken flat.
          For the most relaxed fit, size up. If you're between sizes,
          we recommend sizing up for a comfortable, everyday feel.
        </p>

      </div>
    </div>
  );
}
