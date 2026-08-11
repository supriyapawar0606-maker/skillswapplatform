const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createSwapRequest,
  getReceivedSwaps,
  getSentSwaps,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  getPendingSwapRequestCount,
} = require("../controllers/swapController");


// ======================================
// Protected Routes
// ======================================

// Create Swap Request
router.post(
  "/",
  authMiddleware,
  createSwapRequest
);

// Get Pending Request Count
router.get(
  "/pending-count",
  authMiddleware,
  getPendingSwapRequestCount
);

// Get Received Requests
router.get(
  "/received",
  authMiddleware,
  getReceivedSwaps
);

// Get Sent Requests
router.get(
  "/sent",
  authMiddleware,
  getSentSwaps
);

// Accept Request
router.put(
  "/:id/accept",
  authMiddleware,
  acceptSwapRequest
);

// Reject Request
router.put(
  "/:id/reject",
  authMiddleware,
  rejectSwapRequest
);

// Cancel Request
router.put(
  "/:id/cancel",
  authMiddleware,
  cancelSwapRequest
);


module.exports = router;