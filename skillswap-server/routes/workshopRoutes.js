const express = require("express");

const router = express.Router();

const {
  getAllWorkshops,
  getWorkshopById,
  createWorkshop,
  reserveWorkshop,
  leaveWorkshop,
} = require("../controllers/workshopController");

const authMiddleware = require("../middleware/authMiddleware");

// ======================================
// Workshops
// ======================================

// GET /api/workshops
router.get("/", authMiddleware, getAllWorkshops);

// GET /api/workshops/:id
router.get(
  "/:id",
  authMiddleware,
  getWorkshopById
);

// POST /api/workshops
router.post(
  "/",
  authMiddleware,
  createWorkshop
);

// POST /api/workshops/:id/reserve
router.post(
  "/:id/reserve",
  authMiddleware,
  reserveWorkshop
);

// DELETE /api/workshops/:id/leave
router.delete(
  "/:id/leave",
  authMiddleware,
  leaveWorkshop
);

module.exports = router;