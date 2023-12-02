import React from "react";
import {
    GridRowModes,
    DataGrid,
    GridActionsCellItem,
    GridRowEditStopReasons,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import axios from "axios";
import "./App.css";
import { Box, Button } from "@mui/material";

const apiUrl =
    "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json";

const App = () => {
    const [rows, setRows] = React.useState([]);
    const [rowModesModel, setRowModesModel] = React.useState({});
    const [rowSelectionModel, setRowSelectionModel] = React.useState([]);

    React.useEffect(() => {
        async function fetchData() {
            const response = await axios.get(apiUrl);
            setRows(response.data);
        }

        fetchData();
    }, []);

    const QuickSearchToolbar = () => {
        return (
            <>
                <h1 className="title">Admin Dashboard</h1>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        margin: "0px 20px",
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={handleDeleteSelectedRowsButtonClick}
                        startIcon={<DeleteIcon />}
                        sx={{ height: "38px" }}
                    >
                        Deleted Selected Rows
                    </Button>
                    <GridToolbarQuickFilter variant="outlined" size="small" />
                </Box>
            </>
        );
    };
    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.Edit },
        });
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View },
        });
    };

    const handleDeleteClick = (id) => () => {
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleDeleteSelectedRowsButtonClick = () => {
        setRows(rows.filter((row) => !rowSelectionModel.includes(row.id)));
        console.log(rows.length);
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };
    const columns = [
        {
            field: "name",
            headerName: "Name",
            headerClassName: "grid-col-header",
            editable: true,
            minWidth: 150,
            flex: 1,
        },
        {
            field: "email",
            headerName: "Email",
            headerClassName: "grid-col-header",
            type: "email",
            editable: true,
            minWidth: 250,
            flex: 1,
        },
        {
            field: "role",
            headerName: "Role",
            headerClassName: "grid-col-header",
            editable: true,
            type: "singleSelect",
            valueOptions: ["member", "admin"],
            minWidth: 150,
            flex: 1,
        },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            headerClassName: "grid-col-header",
            cellClassName: "actions",
            minWidth: 150,
            flex: 1,
            getActions: ({ id }) => {
                const isInEditMode =
                    rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: "primary.main",
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    return (
        <div className="App">
            <DataGrid
                sx={{ m: 2 }}
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                checkboxSelection
                onRowSelectionModelChange={(newRowSelectionModel) => {
                    setRowSelectionModel(newRowSelectionModel);
                }}
                rowSelectionModel={rowSelectionModel}
                initialState={{
                    ...rows.initialState,
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                disableColumnFilter
                disableColumnMenu
                slots={{ toolbar: QuickSearchToolbar }}
            />
        </div>
    );
};

export default App;
