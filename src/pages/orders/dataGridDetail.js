import { useQuery } from "@tanstack/react-query";
import DataGrid from "devextreme-react/data-grid";
import { Column } from "devextreme-react/data-grid";
import axiosInstance from "../../axios/instance";
import { DataGridSkeleton } from "../utils/DataGridSkeleton";
import "./orders.css"
const DataGridDetail = (props) => {

  const dcId = props.data.data.DC_ID;
  const { data: queryPosition, isFetching } = useQuery({
    queryKey: ['orderPosition', dcId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/order/positions/${dcId}/1/1000000`)
      return response.data.data
    },
    refetchOnWindowFocus: false,
  })

  if (isFetching) {
    return (<DataGridSkeleton isNested={true} header={false} rowCount={2} />)
  }

  return (
    <>
      <DataGrid
        dataSource={queryPosition}
        columnAutoWidth={true}
        showRowLines={true}
        showColumnHeaders={true}
        showBorders={true}
        showColumnLines={true}
        onRowPrepared={(e) => {
          if (e.rowType === 'data') {
            switch (e.data.TP_STATE) {
              case 'P':
                e.rowElement.classList.add('status-p')
                break;
              case 'H':
              case 'T':
                e.rowElement.classList.add('status-h')
                break;
              case 'Z':
                e.rowElement.classList.add('status-z')
                break;
              case 'C':
                e.rowElement.classList.add('status-c')
                break;
              case 'R':
                e.rowElement.classList.add('status-r')
                break;
              case 'B':
                e.rowElement.classList.add('status-b')
                break;
              case 'G':
                e.rowElement.classList.add('status-g')
                break;
              case 'W':
                e.rowElement.classList.add('status-w')
                break;
              case 'D':
              case 'A':
                e.rowElement.classList.add('status-d')
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
