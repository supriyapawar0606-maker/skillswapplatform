const Workshop = require("../models/Workshop");
const createNotification = require("../utils/createNotification");

// ======================================
// Get All Workshops
// ======================================

exports.getAllWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find()
      .populate("host", "fullName profileImage")
      .populate("attendees", "fullName profileImage")
      .sort({ scheduledAt: 1 });

    return res.status(200).json({
      success: true,
      count: workshops.length,
      workshops,
    });
  } catch (error) {
    console.error("Get workshops error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load workshops",
    });
  }
};

// ======================================
// Get Single Workshop
// ======================================

exports.getWorkshopById = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id)
      .populate("host", "fullName profileImage")
      .populate("attendees", "fullName profileImage");

    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found",
      });
    }

    return res.status(200).json({
      success: true,
      workshop,
    });
  } catch (error) {
    console.error("Get workshop error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load workshop",
    });
  }
};

// ======================================
// Reserve / Join Workshop
// ======================================

exports.reserveWorkshop = async (req, res) => {
  try {
    // --------------------------------------
    // Authentication
    // --------------------------------------

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userId = req.user.id.toString();

    // --------------------------------------
    // Find Workshop
    // --------------------------------------

    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found",
      });
    }

    // --------------------------------------
    // Cannot join cancelled workshop
    // --------------------------------------

    if (workshop.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "This workshop has been cancelled",
      });
    }

    // --------------------------------------
    // Cannot join completed workshop
    // --------------------------------------

    if (workshop.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "This workshop has already been completed",
      });
    }

    // --------------------------------------
    // Host cannot join own workshop
    // --------------------------------------

    if (workshop.host.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You are the host of this workshop",
      });
    }

    // --------------------------------------
    // Already joined?
    // --------------------------------------

    const alreadyJoined = workshop.attendees.some(
      (attendee) => attendee.toString() === userId
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "You have already reserved a seat",
      });
    }

    // --------------------------------------
    // Check capacity
    // --------------------------------------

    if (workshop.attendees.length >= workshop.capacity) {
      return res.status(400).json({
        success: false,
        message: "Workshop is full",
      });
    }

    // --------------------------------------
    // Add user
    // --------------------------------------

    workshop.attendees.push(req.user.id);

    await workshop.save();

    // --------------------------------------
    // Notification to host
    // --------------------------------------

    try {
      await createNotification({
        user: workshop.host,
        type: "workshop",
        text: `A user joined your workshop "${workshop.title}"`,
        link: `/dashboard/workshops`,
        relatedUser: req.user.id,
      });
    } catch (notificationError) {
      console.error(
        "Workshop notification error:",
        notificationError
      );
    }

    // --------------------------------------
    // Populate response
    // --------------------------------------

    const updatedWorkshop = await Workshop.findById(
      workshop._id
    )
      .populate("host", "fullName profileImage")
      .populate("attendees", "fullName profileImage");

    // --------------------------------------
    // Response
    // --------------------------------------

    return res.status(200).json({
      success: true,
      message: "Workshop seat reserved successfully",
      workshop: updatedWorkshop,
    });
  } catch (error) {
    console.error(
      "Reserve workshop error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to reserve workshop seat",
    });
  }
};

// ======================================
// Leave Workshop
// ======================================

exports.leaveWorkshop = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const workshop = await Workshop.findById(
      req.params.id
    );

    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: "Workshop not found",
      });
    }

    const userId = req.user.id.toString();

    const attendeeIndex =
      workshop.attendees.findIndex(
        (attendee) =>
          attendee.toString() === userId
      );

    if (attendeeIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You have not joined this workshop",
      });
    }

    workshop.attendees.splice(attendeeIndex, 1);

    await workshop.save();

    return res.status(200).json({
      success: true,
      message: "You left the workshop successfully",
      workshop,
    });
  } catch (error) {
    console.error(
      "Leave workshop error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Create Workshop
// ======================================

exports.createWorkshop = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      title,
      description,
      category,
      scheduledAt,
      durationMinutes,
      capacity,
    } = req.body;

    if (!title || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Title and scheduledAt are required",
      });
    }

    const date = new Date(scheduledAt);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date",
      });
    }

    if (date <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Workshop must be scheduled in the future",
      });
    }

    const workshop = await Workshop.create({
      title: title.trim(),
      description:
        typeof description === "string"
          ? description.trim()
          : "",
      host: req.user.id,
      category: category || "Other",
      scheduledAt: date,
      durationMinutes:
        Number(durationMinutes) || 60,
      capacity:
        Number(capacity) || 20,
      attendees: [],
      status: "Upcoming",
    });

    const populatedWorkshop =
      await Workshop.findById(workshop._id)
        .populate("host", "fullName profileImage")
        .populate("attendees", "fullName profileImage");

    return res.status(201).json({
      success: true,
      message: "Workshop created successfully",
      workshop: populatedWorkshop,
    });
  } catch (error) {
    console.error(
      "Create workshop error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};