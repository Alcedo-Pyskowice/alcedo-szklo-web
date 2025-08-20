// File: components/common/DataGridWrapper.jsx

import React from 'react';
import { DataGrid } from 'devextreme-react/data-grid';
import { DataGridSkeleton, MainGridSkeleton, MasterDetailSkeleton } from './DataGridSkeleton';

/**
 * Error Component
 */
export const DataGridError = ({ error, onRetry, isNested = false }) => {
  const className = isNested ? 'error-container error-container-small' : 'error-container';
  
  return (
    <div className={className}>
      <p className="error-message">Error: {error}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          Retry
        </button>
      )}
    </div>
  );
};

/**
 * Loading More Indicator
 */
export const LoadingMoreIndicator = ({ visible, message = "Loading more data..." }) => {
  if (!visible) return null;
  
  return (
    <div className="loading-more-indicator">
      <span className="loading-spinner"></span>
      <span>{message}</span>
    </div>
  );
};

/**
 * DataGrid Wrapper with Loading States
 * Handles skeleton loading, error states, and renders the DataGrid
 */
export const DataGridWrapper = ({
  loading,
  error,
  onRetry,
  data,
  skeletonProps = {},
  errorProps = {},
  children,
  isLoadingMore = false,
  loadingMoreMessage,
  containerStyle,
  containerClassName = "dx-card",
  ...dataGridProps
}) => {
  // Show skeleton during initial load
  if (loading && !data?.length) {
    return (
      <div className={containerClassName} style={containerStyle}>
        <MainGridSkeleton {...skeletonProps} />
      </div>
    );
  }

  // Show error state
  if (error && !data?.length) {
    return (
      <div className={containerClassName} style={containerStyle}>
        <DataGridError error={error} onRetry={onRetry} {...errorProps} />
      </div>
    );
  }

  // Render DataGrid with data
  return (
    <div className={containerClassName} style={containerStyle}>
      <DataGrid
        dataSource={data}
        showBorders={true}
        showColumnLines={true}
        showRowLines={true}
        {...dataGridProps}
      >
        {children}
      </DataGrid>
      <LoadingMoreIndicator 
        visible={isLoadingMore} 
        message={loadingMoreMessage}
      />
    </div>
  );
};

/**
 * Master Detail Wrapper
 * Specialized wrapper for nested/detail grids
 */
export const MasterDetailWrapper = ({
  loading,
  error,
  onRetry,
  data,
  skeletonProps = {},
  children,
  ...dataGridProps
}) => {
  // Show skeleton during load
  if (loading) {
    return <MasterDetailSkeleton {...skeletonProps} />;
  }

  // Show error state
  if (error) {
    return <DataGridError error={error} onRetry={onRetry} isNested={true} />;
  }

  // Render DataGrid
  return (
    <DataGrid
      dataSource={data}
      showBorders={true}
      columnAutoWidth={true}
      allowColumnResizing={true}
      showColumnLines={true}
      {...dataGridProps}
    >
      {children}
    </DataGrid>
  );
};
