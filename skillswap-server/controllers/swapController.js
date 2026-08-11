const SwapRequest = require("../models/SwapRequest");
const Skill = require("../models/Skill");
const createNotification = require("../utils/createNotification");

// ======================================
// Create Swap Request
// ======================================

exports.createSwapRequest = async (req, res) => {
  try {
    const {
      receiver,
      senderSkill,
      receiverSkill,
      message,
    } = req.body;

    // ======================================
    // Validate fields
    // ======================================

    if (!receiver || !senderSkill || !receiverSkill) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver, sender skill and receiver skill are required",
      });
    }

    // ======================================
    // Prevent requesting yourself
    // ======================================

    if (receiver.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot send a swap request to yourself",
      });
    }

    // ======================================
    // Check Sender Skill
    // ======================================

    const senderSkillData =
      await Skill.findById(senderSkill);

    if (!senderSkillData) {
      return res.status(404).json({
        success: false,
        message: "Sender skill not found",
      });
    }

    // ======================================
    // Make sure sender owns this skill
    // ======================================

    if (
      senderSkillData.owner.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only offer your own skill",
      });
    }

    // ======================================
    // Check Receiver Skill
    // ======================================

    const receiverSkillData =
      await Skill.findById(receiverSkill);

    if (!receiverSkillData) {
      return res.status(404).json({
        success: false,
        message:
          "Receiver skill not found",
      });
    }

    // ======================================
    // Make sure receiver owns this skill
    // ======================================

    if (
      receiverSkillData.owner.toString() !==
      receiver.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver skill does not belong to this user",
      });
    }

    // ======================================
    // Check Duplicate Request
    // ======================================

    const existingRequest =
      await SwapRequest.findOne({
        sender: req.user.id,
        receiver,
        senderSkill,
        receiverSkill,
        status: "Pending",
      });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message:
          "You already sent this swap request",
      });
    }

    // ======================================
    // Create Swap Request
    // ======================================

    const swapRequest =
      await SwapRequest.create({
        sender: req.user.id,
        receiver,
        senderSkill,
        receiverSkill,
        message: message || "",
      });

    // ======================================
    // Populate Request
    // ======================================

    const populatedRequest =
      await SwapRequest.findById(
        swapRequest._id
      )
        .populate(
          "sender",
          "fullName email profileImage"
        )
        .populate(
          "receiver",
          "fullName email profileImage"
        )
        .populate(
          "senderSkill",
          "title category level availability"
        )
        .populate(
          "receiverSkill",
          "title category level availability"
        );

    // ======================================
    // Notification
    // ======================================

    await createNotification({
      user: receiver,
      type: "swap_request",
      text: `${populatedRequest.sender.fullName} sent you a swap request`,
      link: "/dashboard/requests",
      relatedUser: req.user.id,
      relatedId: populatedRequest._id,
    });

    // ======================================
    // Response
    // ======================================

    return res.status(201).json({
      success: true,
      message:
        "Swap request sent successfully",
      swapRequest: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Create swap request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Received Swap Requests
// ======================================

exports.getReceivedSwaps = async (req, res) => {
  try {
    const swapRequests =
      await SwapRequest.find({
        receiver: req.user.id,
      })
        .populate(
          "sender",
          "fullName email profileImage"
        )
        .populate(
          "receiver",
          "fullName email profileImage"
        )
        .populate(
          "senderSkill",
          "title category level availability"
        )
        .populate(
          "receiverSkill",
          "title category level availability"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: swapRequests.length,
      swapRequests,
    });
  } catch (error) {
    console.error(
      "Get received swaps error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Sent Swap Requests
// ======================================

exports.getSentSwaps = async (req, res) => {
  try {
    const swapRequests =
      await SwapRequest.find({
        sender: req.user.id,
      })
        .populate(
          "sender",
          "fullName email profileImage"
        )
        .populate(
          "receiver",
          "fullName email profileImage"
        )
        .populate(
          "senderSkill",
          "title category level availability"
        )
        .populate(
          "receiverSkill",
          "title category level availability"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: swapRequests.length,
      swapRequests,
    });
  } catch (error) {
    console.error(
      "Get sent swaps error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Accept Swap Request
// ======================================

exports.acceptSwapRequest = async (req, res) => {
  try {
    const swapRequest =
      await SwapRequest.findById(
        req.params.id
      );

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Swap request not found",
      });
    }

    // ======================================
    // Only receiver can accept
    // ======================================

    if (
      swapRequest.receiver.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the receiver can accept this request",
      });
    }

    // ======================================
    // Only pending can be accepted
    // ======================================

    if (swapRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending requests can be accepted",
      });
    }

    // ======================================
    // Update status
    // ======================================

    swapRequest.status = "Accepted";

    await swapRequest.save();

    // ======================================
    // Populate
    // ======================================

    const populatedRequest =
      await SwapRequest.findById(
        swapRequest._id
      )
        .populate(
          "sender",
          "fullName email profileImage"
        )
        .populate(
          "receiver",
          "fullName email profileImage"
        )
        .populate(
          "senderSkill",
          "title category level availability"
        )
        .populate(
          "receiverSkill",
          "title category level availability"
        );

    // ======================================
    // Notification to Sender
    // ======================================

    await createNotification({
      user: populatedRequest.sender._id,
      type: "swap_accepted",
      text: `${populatedRequest.receiver.fullName} accepted your swap request`,
      link: "/dashboard/requests",
      relatedUser: req.user.id,
      relatedId: populatedRequest._id,
    });

    // ======================================
    // Response
    // ======================================

    return res.status(200).json({
      success: true,
      message:
        "Swap request accepted successfully",
      swapRequest: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Accept swap request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Reject Swap Request
// ======================================

exports.rejectSwapRequest = async (req, res) => {
  try {
    const swapRequest =
      await SwapRequest.findById(
        req.params.id
      );

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Swap request not found",
      });
    }

    // ======================================
    // Only receiver can reject
    // ======================================

    if (
      swapRequest.receiver.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the receiver can reject this request",
      });
    }

    // ======================================
    // Only pending can be rejected
    // ======================================

    if (swapRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending requests can be rejected",
      });
    }

    // ======================================
    // Update status
    // ======================================

    swapRequest.status = "Rejected";

    await swapRequest.save();

    // ======================================
    // Populate
    // ======================================

    const populatedRequest =
      await SwapRequest.findById(
        swapRequest._id
      )
        .populate(
          "sender",
          "fullName email profileImage"
        )
        .populate(
          "receiver",
          "fullName email profileImage"
        )
        .populate(
          "senderSkill",
          "title category level availability"
        )
        .populate(
          "receiverSkill",
          "title category level availability"
        );

    // ======================================
    // Notification to Sender
    // ======================================

    await createNotification({
      user: populatedRequest.sender._id,
      type: "swap_rejected",
      text: `${populatedRequest.receiver.fullName} declined your swap request`,
      link: "/dashboard/requests",
      relatedUser: req.user.id,
      relatedId: populatedRequest._id,
    });

    // ======================================
    // Response
    // ======================================

    return res.status(200).json({
      success: true,
      message:
        "Swap request rejected successfully",
      swapRequest: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Reject swap request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Cancel Swap Request
// ======================================

exports.cancelSwapRequest = async (req, res) => {
  try {
    const swapRequest =
      await SwapRequest.findById(
        req.params.id
      );

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Swap request not found",
      });
    }

    // ======================================
    // Only sender can cancel
    // ======================================

    if (
      swapRequest.sender.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the sender can cancel this request",
      });
    }

    // ======================================
    // Only pending can be cancelled
    // ======================================

    if (swapRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending requests can be cancelled",
      });
    }

    // ======================================
    // Update status
    // ======================================

    swapRequest.status = "Cancelled";

    await swapRequest.save();

    // ======================================
    // Populate
    // ======================================

    const populatedRequest =
      await SwapRequest.findById(
        swapRequest._id
      )
        .populate(
          "sender",
          "fullName email profileImage"
        )
        .populate(
          "receiver",
          "fullName email profileImage"
        )
        .populate(
          "senderSkill",
          "title category level availability"
        )
        .populate(
          "receiverSkill",
          "title category level availability"
        );

    // ======================================
    // Notification to Receiver
    // ======================================

    await createNotification({
      user: populatedRequest.receiver._id,
      type: "swap_rejected",
      text: `${populatedRequest.sender.fullName} cancelled the swap request`,
      link: "/dashboard/requests",
      relatedUser: req.user.id,
      relatedId: populatedRequest._id,
    });

    // ======================================
    // Response
    // ======================================

    return res.status(200).json({
      success: true,
      message:
        "Swap request cancelled successfully",
      swapRequest: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Cancel swap request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ======================================
// Get Pending Received Swap Request Count
// ======================================

exports.getPendingSwapRequestCount = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const count = await SwapRequest.countDocuments({
      receiver: req.user.id,
      status: "Pending",
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(
      "Get pending swap request count error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get pending swap request count",
    });
  }
};