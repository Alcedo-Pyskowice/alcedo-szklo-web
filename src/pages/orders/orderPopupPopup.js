import { Form } from "devextreme-react";
import { GroupItem, Item } from "devextreme-react/form";
import { useCallback, useEffect, useState } from "react";
import GlassRender from "./glassRender";

const opcjeList = [
  { id: 0, name: 'Kształt' },
  { id: 1, name: 'Szprosy' },
]

// @TODO
// fetch danych poszczegolnych pozycji z zamowienia do datagrida albo puscic datasource 
// dorobic cala funkcjonalnosc forma, zmiana wymiarow szyby itp itd
// zrobic switcha, ktory bedzie zmienial widok miedzy Form a GlassRender, tak, zeby GlassRender nie renderowalo sie na poczatku, tylko wtedy, kiedy chce uzytkownik 
export default function OrderPopupPopup({ formData, handleFieldDataChanged }) {
  const [selectedValues, setSelectedValues] = useState([]);

  const handleSelectionChanged = (e) => {
    setSelectedValues(e.value);
  };

  return (
    <div>
      <Form
        colCount={4}
        formData={formData}
        onFieldDataChanged={handleFieldDataChanged}
      >
        <Item
          dataField="TP_POS"
          editorType="dxTextBox"
          label={{ text: "Pozycja" }}
          colSpan={1}
        />
        <Item
          dataField="TP_SYMBOL"
          editorType="dxTextBox"
          label={{ text: "Symbol" }}
          colSpan={1}
        />
        <Item
          dataField="TP_TYPE"
          editorType="dxSelectBox"
          label={{ text: "Rodzaj" }}
          editorOptions={{
            dataSource: [
              {
                value: 'Z',
                label: 'Struktura/zespolenie'
              },
              {
                value: "S",
                label: "Szkło pojedyncze/obróbka"
              }
            ],
            valueExpr: 'value',
            displayExpr: 'label'
          }}
          colSpan={1}
        />
        <Item
          dataField="TP_SZPROS_KSZTALT"
          editorType="dxTagBox"
          editorOptions={{
            dataSource: opcjeList,
            displayExpr: "name",
            valueExpr: "id",
            value: selectedValues,
            onValueChanged: handleSelectionChanged,
            showSelectionControls: true,
            placeholder: "Wybierz opcje..."
          }}
          label={{ text: "Opcje" }}
          colSpan={1}
        />
        <Item
          dataField="opisPozycji"
          editorType="dxTextBox"
          label={{ text: "Opis pozycji" }}
          colSpan={4}
        />
        <GroupItem caption="Wymiary:"
          colSpan={4}
          colCount={3}
        >
          <Item
            dataField="TP_W"
            editorType="dxNumberBox"
            label={{ text: "Szerokość [mm]" }}
            colSpan={1}
          />
          <Item
            dataField="TP_H"
            editorType="dxNumberBox"
            label={{ text: "Wysokość [mm]" }}
            colSpan={1}
          />
          <Item
            dataField="TP_QNT"
            editorType="dxNumberBox"
            label={{ text: "Ilość [szt.]" }}
            colSpan={1}
          />
          <Item
            dataField="TP_IDENT"
            editorType="dxTextBox"
            label={{ text: "Identyfikacja" }}
            colSpan={3}
          />
        </GroupItem>
      </Form>
    </div>
  )
}
