import { DataGrid } from "devextreme-react";
import { Column } from "devextreme-react/data-grid";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../axios/instance";
import "./orders.css"
const DataGridDetail = (props) => {

  const [positionsDataGridData, setPositionsDataGridData] = useState([])

  useEffect(() => {
    fetchPositions(props.data.data.DC_ID)
  }, [])

  const fetchPositions = async (DC_ID) => {
    try {
      const response = await axiosInstance.get(`/orders/positions/${DC_ID}/1/1000000`)
      console.log(response.data.data)
      setPositionsDataGridData(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <React.Fragment>
      <DataGrid
        dataSource={positionsDataGridData}
        showBorders={true}
        columnAutoWidth={true}
        onRowPrepared={(e) => {
          if(e.rowType === 'data'){
            switch (e.data.TP_STATE) {
              case 'P':
                e.rowElement.classList.add('production-row')
                break;
              case 'H':
                e.rowElement.classList.add('hartowanie-row')
                break;
              case 'T':
                e.rowElement.classList.add('hartowanie-row')
                break;
              case 'Z':
                e.rowElement.classList.add('zamowione-row')
                break;
              case 'C':
                e.rowElement.classList.add('ciecie-row')
                break;
              case 'R':
                e.rowElement.classList.add('ramki-row')
                break;
              case 'B':
                e.rowElement.classList.add('baza-row')
                break;
              case 'G':
                e.rowElement.classList.add('gotowe-row')
                break;
              case 'W':
                e.rowElement.classList.add('wyslane-row')
                break;
              case 'D':
                e.rowElement.classList.add('dostarczone-row')
                break;
              case 'A':
                e.rowElement.classList.add('dostarczone-row')
                break;
              default:
                break;
            }
          }
        }}
      >
        <Column
          dataField="TP_ID"
          caption="Numer"
        />
        <Column
          dataField="TP_SYMBOL"
          caption="Symbol"
        />
        <Column
          dataField="TP_NAME"
          caption="Nazwa"
        />
        <Column
          dataField=""
          caption="Typ Produktu"
        />
        <Column
          dataField="TP_QNT"
          caption="Ilość"
        />
        <Column
          dataField="TP_STATE"
          caption="Stan"
        />
        <Column
          dataField=""
          caption="Gotowe"
        />
        <Column
          dataField=""
          caption="Rozliczone"
        />
        <Column
          dataField=""
          caption="Wys/Trans"
        />
        <Column
          dataField="TP_WIDTH"
          caption="Szerokość"
        />
        <Column
          dataField="TP_LENGTH"
          caption="Wysokość"
        />
        <Column
          dataField=""
          caption="Nr kształtu"
        />
        <Column
          dataField=""
          caption="Identyfikator"
        />

      </DataGrid>
    </React.Fragment>
  );
};
export default DataGridDetail;
