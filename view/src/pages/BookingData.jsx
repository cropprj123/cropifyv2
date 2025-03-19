import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import Chip from '@mui/material/Chip';
import Typography from "@mui/joy/Typography";
import UsersContent from "./UsersContent";
import PieChart from "../components/PieChart";
import { Button } from "@mui/joy";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const DeliveryStatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={status?.charAt(0).toUpperCase() + status?.slice(1) || 'N/A'} 
      color={getStatusColor(status)}
      size="small"
    />
  );
};

export default function BookingData() {
  const [bookingData, setBookingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [revenue, setRevenue] = useState("");
  const [totalProd, setTotalProd] = useState("");
  // const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(false);

  const [pieChart, setPieChart] = useState(false);

  useEffect(function () {
    async function getallbooking() {
      try {
        setIsLoading(true);
        setError("");
        const response = await axios.get(`/api/v1/bookings/getallbooking`);
        console.log("response bok dat", response); // Handle the response as needed

        if (response.status !== 200)
          throw new Error("Something went wrong with fetchintg crops");

        //console.log("all rev", response.data);
        setRevenue(response.data.totalRevenue);
        setTotalProd(response.data.total);

        const bookingData = response.data.data.data;
        //console.log("all book", bookingData);
        if (bookingData.length === 0) {
          throw new Error("No crops found");
        }
        setBookingData(bookingData);

        setIsLoading(false);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    getallbooking();
  }, []);
  const handleDownloadExcel = async () => {
    try {
      const response = await fetch(
        "/api/v1/bookings/report"
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bookingsdata.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
  };

  return (
    <>
      <div className="h-screen overflow-y-auto">
        <div className="flex flex-row gap-2">
          <Button
            size="md"
            variant="solid"
            color="primary"
            onClick={() => setPieChart(!pieChart)}
          >
            {pieChart ? "Show Bar Graph" : "Show Pie Chart"}
          </Button>

          <Button
            size="md"
            variant="solid"
            color="success"
            onClick={handleDownloadExcel}
          >
            Download Excel
          </Button>
        </div>

        {pieChart ? <PieChart /> : <UsersContent />}
        <div className="mt-8 mb-6 ">
          {/* <h1>Recent transactions in the app</h1> */}
          <div className="flex flex-row gap-4">
            <Typography level="h3">Recent transactions in the app</Typography>



          </div>
        </div>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Users</StyledTableCell>
                <StyledTableCell>Crop Bought</StyledTableCell>
                <StyledTableCell>Sold by</StyledTableCell>
                <StyledTableCell>Price (₹)</StyledTableCell>
                <StyledTableCell>Date bought</StyledTableCell>
                <StyledTableCell>Delivery Status</StyledTableCell>
                <StyledTableCell>Verification</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {error}
                  </TableCell>
                </TableRow>
              ) : bookingData && bookingData.length > 0 ? (
                bookingData.map((data) => (
                  <StyledTableRow key={data._id}>
                    <StyledTableCell component="th" scope="row">
                      <div className="flex items-center">
                        <Avatar alt="User Photo" src={data.user?.photo} />
                        <span className="ml-3">{data.user?.name || 'N/A'}</span>
                      </div>
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row">
                      <div className="flex items-center">
                        <Avatar alt="Crop Image" src={data.crop?.image} />
                        <span className="ml-3">{data.crop?.name || 'N/A'}</span>
                      </div>
                    </StyledTableCell>
                    <StyledTableCell>{data.crop?.soldby?.name || 'PruthVij Desai'}</StyledTableCell>
                    <StyledTableCell>₹ {data.price?.toLocaleString() || 'N/A'}</StyledTableCell>
                    <StyledTableCell>
                      {data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) : 'N/A'}
                    </StyledTableCell>
                    <StyledTableCell>
                      <DeliveryStatusChip status={data.deliveryStatus} />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip 
                        label={data.isVerified ? "Verified" : "Pending"} 
                        color={data.isVerified ? "success" : "warning"}
                        size="small"
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No booking data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}
