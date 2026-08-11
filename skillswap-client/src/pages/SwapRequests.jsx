import { useEffect, useState } from "react";

import Avatar from "../components/Avatar";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { useToast } from "../components/Toast";
import API from "../api/axios";


// ==========================================
// Tabs
// ==========================================

const statusTabs = [
  "All",
  "Pending",
  "Accepted",
  "Rejected",
  "Cancelled",
];

const requestTypes = [
  "Received",
  "Sent",
];


// ==========================================
// Convert API Request → UI Row
// ==========================================

function toRow(request, type) {
  const isReceived = type === "Received";

  return {
    id: request._id,

    name: isReceived
      ? request.sender?.fullName || "Unknown User"
      : request.receiver?.fullName || "Unknown User",

    profileImage: isReceived
      ? request.sender?.profileImage
      : request.receiver?.profileImage,

    // Skill offered by sender
    senderSkill:
      request.senderSkill?.title || "—",

    // Skill requested from receiver
    receiverSkill:
      request.receiverSkill?.title || "—",

    status: request.status || "Pending",

    message: request.message || "",

    createdAt: request.createdAt,

    type,
  };
}


// ==========================================
// Component
// ==========================================

export default function SwapRequests() {

  const [tab, setTab] = useState("All");

  const [requestType, setRequestType] =
    useState("Received");

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(null);

  const showToast = useToast();


  // ==========================================
  // Load Requests
  // ==========================================

  const loadRequests = async () => {

    try {

      setLoading(true);

      const endpoint =
        requestType === "Received"
          ? "/swaps/received"
          : "/swaps/sent";

      const response =
        await API.get(endpoint);

      if (response.data?.success) {

        const rows = (
          response.data.swapRequests || []
        ).map((request) =>
          toRow(
            request,
            requestType
          )
        );

        setRequests(rows);

      } else {

        setRequests([]);

      }

    } catch (error) {

      console.error(
        "Load swap requests error:",
        error
      );

      setRequests([]);

      showToast(
        error.response?.data?.message ||
          "Failed to load swap requests",
        "error"
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // Initial Load + Type Change
  // ==========================================

  useEffect(() => {

    loadRequests();

  }, [requestType]);


  // ==========================================
  // Filter Requests
  // ==========================================

  const filtered =
    tab === "All"
      ? requests
      : requests.filter(
          (request) =>
            request.status === tab
        );


  // ==========================================
  // Accept / Reject
  // ==========================================

  const respond = async (
    id,
    status
  ) => {

    const request =
      requests.find(
        (item) =>
          item.id === id
      );

    if (!request) return;


    const endpoint =
      status === "Accepted"
        ? "accept"
        : "reject";


    try {

      setActionLoading(id);


      const response =
        await API.put(
          `/swaps/${id}/${endpoint}`
        );


      // Use backend response when available
      const updatedRequest =
        response.data?.swapRequest;


      setRequests((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status:
                  updatedRequest?.status ||
                  status,
              }
            : item
        )
      );


      if (status === "Accepted") {

        showToast(
          `You accepted ${request.name}'s swap request`,
          "success"
        );

      } else {

        showToast(
          `You declined ${request.name}'s swap request`,
          "info"
        );

      }

    } catch (error) {

      console.error(
        "Swap request action error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Something went wrong",
        "error"
      );

    } finally {

      setActionLoading(null);

    }
  };


  // ==========================================
  // Cancel Sent Request
  // ==========================================

  const cancelRequest = async (
    id
  ) => {

    const request =
      requests.find(
        (item) =>
          item.id === id
      );

    if (!request) return;


    try {

      setActionLoading(id);


      const response =
        await API.put(
          `/swaps/${id}/cancel`
        );


      const updatedRequest =
        response.data?.swapRequest;


      setRequests((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status:
                  updatedRequest?.status ||
                  "Cancelled",
              }
            : item
        )
      );


      showToast(
        "Swap request cancelled successfully",
        "info"
      );

    } catch (error) {

      console.error(
        "Cancel swap request error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to cancel request",
        "error"
      );

    } finally {

      setActionLoading(null);

    }
  };


  // ==========================================
  // Format Date
  // ==========================================

  const formatDate = (
    date
  ) => {

    if (!date) return "";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==========================================
  // Status Counts
  // ==========================================

  const getStatusCount = (
    status
  ) => {

    if (status === "All") {
      return requests.length;
    }

    return requests.filter(
      (request) =>
        request.status === status
    ).length;
  };


  // ==========================================
  // Refresh
  // ==========================================

  const handleRefresh = () => {

    loadRequests();

  };


  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="w-full">

      {/* ======================================
          Header
      ====================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>

          <h1 className="font-display text-2xl font-bold text-ink">
            Swap Requests
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage incoming and outgoing skill
            swap requests
          </p>

        </div>


        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "↻ Refresh"}
        </Button>

      </div>


      {/* ======================================
          Received / Sent Toggle
      ====================================== */}

      <div className="flex flex-wrap gap-2 mb-5">

        {requestTypes.map(
          (type) => (

            <button
              key={type}
              onClick={() => {

                setRequestType(type);

                setTab("All");

              }}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                requestType === type
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
              }`}
            >

              {type}

            </button>

          )
        )}

      </div>


      {/* ======================================
          Status Tabs
      ====================================== */}

      <div className="flex flex-wrap gap-2 mb-6">

        {statusTabs.map(
          (status) => (

            <button
              key={status}
              onClick={() =>
                setTab(status)
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === status
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
              }`}
            >

              {status}

              <span
                className={`ml-2 text-xs ${
                  tab === status
                    ? "text-white/80"
                    : "text-gray-400"
                }`}
              >
                {getStatusCount(
                  status
                )}
              </span>

            </button>

          )
        )}

      </div>


      {/* ======================================
          Loading
      ====================================== */}

      {loading && (

        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">

          <div className="flex justify-center mb-3">

            <div className="w-7 h-7 border-4 border-gray-200 border-t-brand-600 rounded-full animate-spin"></div>

          </div>

          <p className="text-sm text-gray-400">
            Loading swap requests...
          </p>

        </div>

      )}


      {/* ======================================
          Empty
      ====================================== */}

      {!loading &&
        filtered.length === 0 && (

          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">

            <div className="text-4xl mb-3">
              {requestType === "Received"
                ? "📥"
                : "📤"}
            </div>

            <p className="text-sm font-medium text-gray-600">

              No{" "}

              {tab !== "All"
                ? tab.toLowerCase()
                : ""}

              {" "}

              requests.

            </p>

            <p className="text-xs text-gray-400 mt-1">

              {requestType === "Received"
                ? "Incoming requests will appear here."
                : "Requests you send will appear here."}

            </p>

          </div>

        )}


      {/* ======================================
          Request List
      ====================================== */}

      {!loading &&
        filtered.length > 0 && (

          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">

            {filtered.map(
              (request) => (

                <div
                  key={request.id}
                  className="p-5 hover:bg-gray-50/50 transition-colors"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">


                    {/* ==================================
                        User
                    ================================== */}

                    <Avatar
                      name={request.name}
                      image={
                        request.profileImage
                      }
                      size={48}
                    />


                    {/* ==================================
                        Information
                    ================================== */}

                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="text-sm font-semibold text-ink">

                          {request.name}

                        </p>

                        <Badge
                          status={
                            request.status
                          }
                        />

                      </div>


                      {/* ================================
                          Swap Details
                      ================================= */}

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">

                        <div className="bg-gray-50 rounded-xl px-3 py-2">

                          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">

                            They offer

                          </p>

                          <p className="text-xs font-medium text-ink">

                            {request.senderSkill}

                          </p>

                        </div>


                        <div className="bg-brand-50 rounded-xl px-3 py-2">

                          <p className="text-[10px] uppercase tracking-wide text-brand-600 mb-1">

                            They want

                          </p>

                          <p className="text-xs font-medium text-ink">

                            {request.receiverSkill}

                          </p>

                        </div>

                      </div>


                      {/* ================================
                          Message
                      ================================= */}

                      {request.message && (

                        <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2">

                          <p className="text-xs text-gray-500">

                            "{request.message}"

                          </p>

                        </div>

                      )}


                      {/* ================================
                          Date
                      ================================= */}

                      {request.createdAt && (

                        <p className="text-[11px] text-gray-400 mt-2">

                          Sent on{" "}

                          {formatDate(
                            request.createdAt
                          )}

                        </p>

                      )}

                    </div>


                    {/* ==================================
                        Received Actions
                    ================================== */}

                    {requestType ===
                      "Received" &&
                      request.status ===
                        "Pending" && (

                        <div className="flex gap-2 lg:flex-shrink-0">

                          <Button
                            size="sm"
                            disabled={
                              actionLoading ===
                              request.id
                            }
                            onClick={() =>
                              respond(
                                request.id,
                                "Accepted"
                              )
                            }
                          >

                            {actionLoading ===
                            request.id
                              ? "..."
                              : "Accept"}

                          </Button>


                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              actionLoading ===
                              request.id
                            }
                            onClick={() =>
                              respond(
                                request.id,
                                "Rejected"
                              )
                            }
                          >

                            Reject

                          </Button>

                        </div>

                      )}


                    {/* ==================================
                        Sent Actions
                    ================================== */}

                    {requestType ===
                      "Sent" &&
                      request.status ===
                        "Pending" && (

                        <div className="lg:flex-shrink-0">

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              actionLoading ===
                              request.id
                            }
                            onClick={() =>
                              cancelRequest(
                                request.id
                              )
                            }
                          >

                            {actionLoading ===
                            request.id
                              ? "Cancelling..."
                              : "Cancel"}

                          </Button>

                        </div>

                      )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

    </div>
  );
}

