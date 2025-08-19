import Form from "devextreme-react/form";
import { GroupItem, Item } from "devextreme-react/form";
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axios/instance";
import { LoadPanel } from "devextreme-react/load-panel";
import  notify from "devextreme/ui/notify";

// API functions
const fetchProfileParameters = async () => {
  const response = await axiosInstance.get(`/profile/parameters?group=10,14,17,99&columns=2`);
  return response.data.data;
};

const updateProfileParameter = async ({ id, value }) => {
  const response = await axiosInstance.put(`/profile/parameter/update`, { 
    data: { USP_ID: id, USP_VALUE: value } 
  });
  return response;
};

export default function Profile() {
  const queryClient = useQueryClient();

  // Fetch profile parameters
  const { 
    data: paramFormData = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['profileParameters'],
    queryFn: fetchProfileParameters,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update parameter mutation
  const updateParamMutation = useMutation({
    mutationFn: updateProfileParameter,
    onMutate: async ({ id, value, symbol }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profileParameters'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['profileParameters']);

      // Optimistically update the cache
      queryClient.setQueryData(['profileParameters'], (old) => {
        if (!old) return old;
        return old.map(item => 
          item.USP_ID === id 
            ? { ...item, USP_VALUE: value }
            : item
        );
      });

      // Return a context object with the snapshotted value
      return { previousData, symbol, value };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousData) {
        queryClient.setQueryData(['profileParameters'], context.previousData);
      }
      
      // Show error notification
      notify({
        message: 'Failed to update parameter. Please try again.',
        type: 'error',
        displayTime: 3000,
      });
    },
    onSuccess: (response, variables, context) => {
      // Update localStorage if ANAM field was updated successfully
      if (context?.symbol === "ANAM" && response?.status === 200) {
        localStorage.setItem('name', context.value);
      }

      // Show success notification (optional)
      notify({
        message: 'Parameter updated successfully',
        type: 'success',
        displayTime: 2000,
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ['profileParameters'] });
    },
  });

  // Transform data into form values
  const formValues = useMemo(() => {
    if (!paramFormData || paramFormData.length === 0) {
      return {};
    }
    
    return paramFormData.reduce((acc, item) => {
      acc[item.PA_SYMBOL] = item.USP_VALUE;
      return acc;
    }, {});
  }, [paramFormData]);

  // Group data for display
  const groupedData = useMemo(() => {
    if (!paramFormData || paramFormData.length === 0) {
      return [];
    }

    const columnsMap = new Map();
    let currentColumnKey = '1';

    paramFormData.forEach(item => {
      if (item.PA_TYPE === '.') {
        if (item.column) {
          currentColumnKey = item.column.toString();
        }

        if (!columnsMap.has(currentColumnKey)) {
          columnsMap.set(currentColumnKey, {
            id: `column-container-${currentColumnKey}`,
            innerGroups: [],
          });
        }

        columnsMap.get(currentColumnKey).innerGroups.push({
          id: item.PA_ID,
          caption: item.PA_VALUE,
          items: [],
        });

      } else {
        if (!columnsMap.has(currentColumnKey)) {
          columnsMap.set(currentColumnKey, {
            id: `column-container-${currentColumnKey}`,
            innerGroups: [],
          });
        }

        const columnContainer = columnsMap.get(currentColumnKey);

        if (columnContainer.innerGroups.length === 0) {
          columnContainer.innerGroups.push({
            id: `default-group-for-col-${currentColumnKey}`,
            caption: undefined,
            items: [],
          });
        }

        const lastGroup = columnContainer.innerGroups[columnContainer.innerGroups.length - 1];
        lastGroup.items.push(item);
      }
    });

    const finalColumns = Array.from(columnsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
      .map(entry => entry[1]);

    return finalColumns;
  }, [paramFormData]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="dx-card" style={{ padding: "15px", minHeight: "200px" }}>
        <LoadPanel 
          visible={true}
          message="Loading profile parameters..."
          position={{ of: '.dx-card' }}
        />
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="dx-card" style={{ padding: "15px" }}>
        <div className="error-container" style={{ textAlign: 'center', padding: '20px' }}>
          <h3>Error loading profile</h3>
          <p>{error?.message || 'An unexpected error occurred'}</p>
          <button 
            className="dx-button"
            onClick={() => refetch()}
            style={{ marginTop: '10px' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dx-card" style={{ padding: "15px" }}>
      <Form
        formData={formValues}
        colCount={4}
      >
        {groupedData.map((columnGroup) => (
          <GroupItem
            key={columnGroup.id}
            caption={columnGroup.caption}
            colSpan={2}
          >
            {columnGroup.innerGroups.map((innerGroup) => (
              <GroupItem
                key={innerGroup.id}
                caption={innerGroup.caption}
              >
                {innerGroup.items.map((item) => {
                  let eType = "";
                  let eOptions = {};

                  switch (item.PA_TYPE) {
                    case "S": eType = "dxTextBox"; break;
                    case "I": eType = "dxNumberBox"; break;
                    case "P":
                      eType = "dxNumberBox";
                      eOptions.format = item.PA_FORMAT;
                      break;
                    case "B": eType = "dxCheckBox"; break;
                    default: return null;
                  }

                  return (
                    <Item
                      dataField={item.PA_SYMBOL}
                      key={item.PA_ID}
                      editorType={eType}
                      label={{ text: item.PA_NAME }}
                      editorOptions={{
                        onValueChanged: (e) => {
                          updateParamMutation.mutate({
                            id: item.USP_ID,
                            value: e.value,
                            symbol: item.PA_SYMBOL
                          });
                        },
                        disabled: updateParamMutation.isLoading,
                        ...eOptions,
                      }}
                    />
                  );
                })}
              </GroupItem>
            ))}
          </GroupItem>
        ))}
      </Form>
    </div>
  );
}
