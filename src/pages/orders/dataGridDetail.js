import { useQuery } from "@tanstack/react-query";
import DataGrid from "devextreme-react/data-grid";
import { Column } from "devextreme-react/data-grid";
import axiosInstance from "../../axios/instance";
import "./orders.css"
const DataGridDetail = (props) => {

  const { data: queryPosition } = useQuery({
    queryKey: ['orderPosition', props.data.data.DC_ID],
    queryFn: async () => {
      const response = await axiosInstance.get(`/order/positions/${props.data.data.DC_ID}/1/1000000`)
      return response.data.data
    }
  })

  return (
    <>
      <DataGrid
        dataSource={queryPosition}
        showBorders={true}
        showColumnLines={true}
        onRowPrepared={(e) => {
          if (e.rowType === 'data') {
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
          dataType="number"
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
    </>
  );
};
export default DataGridDetail;
