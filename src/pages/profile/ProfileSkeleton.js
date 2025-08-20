import React from 'react';

// A reusable component for a single skeleton form item (label + input)
const SkeletonItem = () => (
  <div style={{ marginBottom: '20px' }}>
    <div className="skeleton" style={{ height: '12px', width: '30%', marginBottom: '8px', borderRadius: '4px' }}></div>
    <div className="skeleton" style={{ height: '36px', width: '100%', borderRadius: '4px' }}></div>
  </div>
);

// A reusable component for a group of skeleton items
const SkeletonGroup = ({ itemCount }) => (
  <div style={{ marginBottom: '30px' }}>
    {/* Skeleton for the group caption */}
    <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '24px', borderRadius: '4px' }}></div>
    {/* Renders a specified number of skeleton items */}
    {[...Array(itemCount)].map((_, i) => <SkeletonItem key={i} />)}
  </div>
);

export default function ProfileSkeleton() {
  return (
    <div className="dx-card" style={{ padding: "15px" }}>
      {/* This style block adds the pulsing animation. 
        The background color is set for a dark theme.
      */}
      <style>{`
        @keyframes pulse {
          50% { opacity: 0.5; }
        }
        .skeleton {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          background-color: rgb(255 255 255 / 0.1); /* Use a semi-transparent white for dark themes */
        }
      `}</style>

      {/* The main layout mimics your form's two-column structure */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
        
        {/* Left Column */}
        <div>
          <SkeletonGroup itemCount={8} /> {/* Corresponds to "Dane Firmy" */}
          <SkeletonGroup itemCount={2} /> {/* Corresponds to "Dane kontaktowe" */}
        </div>
        
        {/* Right Column */}
        <div>
          <SkeletonGroup itemCount={6} /> {/* Corresponds to "Pola testowe" */}
        </div>

      </div>
    </div>
  );
}
