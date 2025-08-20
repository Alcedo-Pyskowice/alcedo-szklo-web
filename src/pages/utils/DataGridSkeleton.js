import React from 'react';

/**
 * Reusable DataGrid Skeleton Component
 * @param {Object} props
 * @param {number} props.rowCount - Number of skeleton rows to display (default: 10)
 * @param {number} props.columnCount - Number of columns (default: 7)
 * @param {string} props.title - Optional title for the grid
 * @param {boolean} props.showFilter - Show filter row skeleton (default: false)
 * @param {boolean} props.showPager - Show pager skeleton (default: false)
 * @param {boolean} props.isNested - Is this a nested/detail grid (default: false)
 * @param {string} props.className - Additional CSS classes
 */
export const DataGridSkeleton = ({
  rowCount = 10,
  columnCount = 7,
  title = '',
  showFilter = false,
  showPager = false,
  isNested = false,
  className = '',
  header = true,
  columnButton = true
}) => {
  const containerClass = isNested
    ? 'skeleton-container skeleton-detail-grid'
    : 'skeleton-container skeleton-main-grid';

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Header */}
      {header && (
        <div className={isNested ? 'skeleton-header skeleton-header-small' : 'skeleton-header'}>
          {title ? (
            <div className={isNested ? 'skeleton-title' : 'skeleton-title skeleton-title-large'}></div>
          ) : (
            <div className="skeleton-spacer"></div>
          )}
          { columnButton && (
          <div className="skeleton-button"></div> 
          )}
        </div> )}
      
      {/* Filter Row */}
      {showFilter && (
        <div className="skeleton-filter-row">
          {[...Array(columnCount)].map((_, index) => (
            <div key={`filter-${index}`} className="skeleton-filter-cell"></div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="skeleton-table">
        <div className="skeleton-table-header">
          {[...Array(columnCount)].map((_, index) => (
            <div key={`header-${index}`} className="skeleton-cell skeleton-header-cell"></div>
          ))}
        </div>
        <div className="skeleton-table-body">
          {[...Array(rowCount)].map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="skeleton-row">
              {[...Array(columnCount)].map((_, colIndex) => (
                <div key={`cell-${rowIndex}-${colIndex}`} className="skeleton-cell"></div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pager */}
      {showPager && (
        <div className="skeleton-pager">
          <div className="skeleton-pager-info"></div>
          <div className="skeleton-pager-buttons">
            {[...Array(5)].map((_, index) => (
              <div key={`pager-${index}`} className="skeleton-pager-button"></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Main Grid Skeleton - Preset for main data grids
 */
export const MainGridSkeleton = (props) => (
  <div className="dx-card" style={{ padding: "15px" }}>
    <DataGridSkeleton
      rowCount={10}
      columnCount={7}
      showFilter={true}
      showPager={true}
      title="Loading..."
      {...props}
    />
  </div>
);

/**
 * Master Detail Skeleton - Preset for nested grids
 */
export const MasterDetailSkeleton = (props) => (
  <DataGridSkeleton
    rowCount={5}
    columnCount={7}
    isNested={true}
    {...props}
  />
);

/**
 * Simple Table Skeleton - Preset for simple tables
 */
export const SimpleTableSkeleton = (props) => (
  <DataGridSkeleton
    rowCount={10}
    columnCount={5}
    isNested={true}
    showFilter={false}
    showPager={false}
    {...props}
  />
);
