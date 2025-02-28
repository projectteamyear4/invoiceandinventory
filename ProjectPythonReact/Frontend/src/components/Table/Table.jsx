import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import React, { useState } from "react";
import "./Table.css";

const rows = [
  { name: "ភីហ្សា", trackingId: "KH001", date: "2/02/2025", status: "បានអនុម័ត" }, // Pizza - Approved
  { name: "ប៊ឺហ្គឺ", trackingId: "KH002", date: "2/02/2025", status: "រង់ចាំ" }, // Burger - Pending
  { name: "សាំងវិច", trackingId: "KH003", date: "2/02/2025", status: "បានដឹកជញ្ជូន" }, // Sandwich - Delivered
  { name: "បាយឆា", trackingId: "KH004", date: "2/02/2025", status: "បានអនុម័ត" }, // Fried Rice - Approved
  { name: "មីកញ្ចប់", trackingId: "KH005", date: "2/02/2025", status: "រង់ចាំ" }, // Instant Noodles - Pending
  { name: "អន្សម", trackingId: "KH006", date: "2/02/2025", status: "បានដឹកជញ្ជូន" }, // Sticky Rice - Delivered
  { name: "កាហ្វេ", trackingId: "KH007", date: "2/02/2025", status: "បានអនុម័ត" }, // Coffee - Approved
  { name: "តែ", trackingId: "KH008", date: "2/02/2025", status: "រង់ចាំ" }, // Tea - Pending
  { name: "ភីហ្សា", trackingId: "KH001", date: "2/02/2025", status: "បានអនុម័ត" }, // Pizza - Approved
  { name: "ប៊ឺហ្គឺ", trackingId: "KH002", date: "2/02/2025", status: "រង់ចាំ" }, // Burger - Pending
  { name: "សាំងវិច", trackingId: "KH003", date: "2/02/2025", status: "បានដឹកជញ្ជូន" }, // Sandwich - Delivered
  { name: "បាយឆា", trackingId: "KH004", date: "2/02/2025", status: "បានអនុម័ត" }, // Fried Rice - Approved
  { name: "មីកញ្ចប់", trackingId: "KH005", date: "2/02/2025", status: "រង់ចាំ" }, // Instant Noodles - Pending
  { name: "អន្សម", trackingId: "KH006", date: "2/02/2025", status: "បានដឹកជញ្ជូន" }, // Sticky Rice - Delivered
  { name: "កាហ្វេ", trackingId: "KH007", date: "2/02/2025", status: "បានអនុម័ត" }, // Coffee - Approved
  { name: "តែ", trackingId: "KH008", date: "2/02/2025", status: "រង់ចាំ" }, // Tea - Pending
  { name: "នំបញ្ចុក", trackingId: "KH009", date: "2/02/2025", status: "បានដឹកជញ្ជូន" }, // Num Banh Chok - Delivered
  { name: "បាយសី", trackingId: "KH010", date: "2/02/2025", status: "បានអនុម័ត" }, // Sticky Rice Cake - Approved
  { name: "នំបញ្ចុក", trackingId: "KH009", date: "2/02/2025", status: "បានដឹកជញ្ជូន" }, // Num Banh Chok - Delivered
  { name: "បាយសី", trackingId: "KH010", date: "2/02/2025", status: "បានអនុម័ត" }, // Sticky Rice Cake - Approved
];

const makeStyle = (status) => {
  if (status === "បានអនុម័ត") { // Approved
    return { background: "#e8f5e9", color: "#2e7d32" }; // Light green
  } else if (status === "រង់ចាំ") { // Pending
    return { background: "#ffebee", color: "#c62828" }; // Light red
  } else { // Delivered
    return { background: "#e3f2fd", color: "#1976d2" }; // Light blue
  }
};

export default function PaginatedTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="Table">
      <h2>ការកម្ម៉ង់ថ្មីៗ</h2> {/* Recent Orders */}
      <TableContainer
        component={Paper}
        className="table-container"
      >
        <Table stickyHeader>
          <TableHead>
          <TableRow>
              <TableCell sx={{ fontFamily: "'Inter', 'Noto Sans Khmer', sans-serif" }}>ផលិតផល</TableCell> {/* Product */}
              <TableCell sx={{ fontFamily: "'Inter', 'Noto Sans Khmer', sans-serif" }} align="left">លេខតាមដាន</TableCell> {/* Tracking ID */}
              <TableCell sx={{ fontFamily: "'Inter', 'Noto Sans Khmer', sans-serif" }} align="left">កាលបរិច្ឆេទ</TableCell> {/* Date */}
              <TableCell sx={{ fontFamily: "'Inter', 'Noto Sans Khmer', sans-serif" }} align="left">ស្ថានភាព</TableCell> {/* Status */}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.trackingId} className="table-row">
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="left">{row.trackingId}</TableCell>
                  <TableCell align="left">{row.date}</TableCell>
                  <TableCell align="left">
                    <span className="status" style={makeStyle(row.status)}>
                      {row.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 15]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
  );
}