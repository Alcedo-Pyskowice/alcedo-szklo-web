import ResponsiveBox from "devextreme-react/responsive-box";
import './optimization.css'
import { useState } from "react";
import { Item, Location } from "devextreme-react/responsive-box";


export default function Optimization() {
  const items = [
    { id: 1, content: 'Pane 1' },
    { id: 2, content: 'Pane 2' },
    { id: 3, content: 'Pane 3' },
    { id: 4, content: 'Pane 4' },
    { id: 5, content: 'Pane 5' },
    { id: 6, content: 'Pane 6' },
    { id: 7, content: 'Pane 7' },
    { id: 8, content: 'Pane 8' },
    { id: 9, content: 'Pane 9' },
    { id: 10, content: 'Pane 10' },
    { id: 11, content: 'Pane 11' },
    { id: 12, content: 'Pane 12' },
    { id: 13, content: 'Pane 13' },
    { id: 14, content: 'Pane 14' },
    { id: 15, content: 'Pane 15' },
    { id: 16, content: 'Pane 16' },
    { id: 17, content: 'Pane 17' },
    { id: 18, content: 'Pane 18' },
    { id: 19, content: 'Pane 19' },
    { id: 20, content: 'Pane 20' },
    // Add more items as needed
  ];

  const pageSize = 10; // Number of items per page

  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(items.length / pageSize);

  const pagedItems = items.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div>
      <ResponsiveBox
        rows={[{ ratio: 1 }, { ratio: 1 }]}
        cols={[{ ratio: 1 }, { ratio: 1 }, { ratio: 1 }, { ratio: 1 }, { ratio: 1 }]}
      >
        {pagedItems.map((item, index) => (
          <Item key={item.id}>
            <Location row={Math.floor(index / 5)} col={index % 5} />
            <div className="dx-card" style={{ padding: 10 }}>
              {item.content}
            </div>
          </Item>
        ))}
      </ResponsiveBox>
      <div className="pager">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))} disabled={currentPage === 0}>
          Previous
        </button>
        <span> Page {currentPage + 1} of {totalPages} </span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))} disabled={currentPage === totalPages - 1}>
          Next
        </button>
      </div>
    </div>
  );
}
