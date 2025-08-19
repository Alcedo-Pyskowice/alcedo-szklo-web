import Form, { GroupItem, Item } from "devextreme-react/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axios/instance";
import { useMemo } from "react";

// --- API Functions ---
const fetchParams = async (DC_ID) => {
  const { data } = await axiosInstance.get(`/order/parameters/${DC_ID}`);
  return data.data;
};

const updateParam = async ({ DCP_ID, DCP_VALUE }) => {
  const { data } = await axiosInstance.put(`/order/parameter/update`, { data: { DCP_ID, DCP_VALUE } });
  return data;
};

// --- Component ---
export default function OrderPopupParams({ DC_ID }) {
  const queryClient = useQueryClient();

  // --- TanStack Query & Mutation ---
  const { data: paramData, isLoading } = useQuery({
    queryKey: ['orderParams', DC_ID],
    queryFn: () => fetchParams(DC_ID),
    enabled: !!DC_ID,
    refetchOnWindowFocus: false
  });

  const updateParamMutation = useMutation({
    mutationFn: updateParam,
    onSuccess: () => {
      // Invalidate to refetch and ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['orderParams', DC_ID] });
    },
    onError: (error) => console.error("Error updating parameter:", error),
  });

  // --- Data Transformation for Form ---
  const { formValues, groupedData } = useMemo(() => {
    if (!paramData) return { formValues: {}, groupedData: [] };

    const values = paramData.reduce((acc, item) => {
      acc[item.PA_SYMBOL] = item.DCP_VALUE;
      return acc;
    }, {});

    const groups = paramData.reduce((acc, item) => {
      if (item.PA_TYPE === '.') {
        acc.push({ id: item.PA_ID, caption: item.PA_VALUE, items: [] });
      } else {
        if (acc.length === 0) {
          acc.push({ id: 'default-group-0', caption: undefined, items: [] });
        }
        acc[acc.length - 1].items.push(item);
      }
      return acc;
    }, []);

    return { formValues: values, groupedData: groups };
  }, [paramData]);

  if (isLoading) return <div>Ładowanie parametrów...</div>;

  // --- Render ---
  return (
    <Form formData={formValues} colCount={4}>
      {groupedData.map((group) => (
        <GroupItem key={group.id} caption={group.caption} colSpan={4}>
          {group.items.map((item) => {
            let editorType = "";
            let editorOptions = {};
            switch (item.PA_TYPE) {
              case "S": editorType = "dxTextBox"; break;
              case "I": editorType = "dxNumberBox"; break;
              case "P": editorType = "dxNumberBox"; editorOptions.format = item.PA_FORMAT; break;
              case "B": editorType = "dxCheckBox"; break;
              default: return null;
            }

            return (
              <Item
                dataField={item.PA_SYMBOL}
                key={item.PA_ID}
                editorType={editorType}
                label={{ text: item.PA_NAME }}
                editorOptions={{
                  ...editorOptions,
                  onValueChanged: (e) => {
                    updateParamMutation.mutate({ DCP_ID: item.DCP_ID, DCP_VALUE: e.value });
                  },
                }}
                colSpan={4}
              />
            );
          })}
        </GroupItem>
      ))}
    </Form>
  );
}
