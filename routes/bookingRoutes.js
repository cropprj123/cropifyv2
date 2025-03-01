const express = require("express");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

const router = express.Router();
router.get("/bookingstat", bookingController.getbookingstats);
router.get("/getallbooking", bookingController.getallbookings);
router.get("/report", bookingController.createreport);
// router.get("/:id", bookingController.getsinglebooking);
router.use(authController.protect);

router.get("/checkout-session/:id", bookingController.getCheckoutSession);
router.get("/booking", bookingController.createBookingCheckout);
router.get("/mypurchase", bookingController.mypurchase);
router.get("/checkoutforcart", bookingController.createCheckoutSessionForCart);
router.get("/cart", bookingController.createBookingCheckoutcart);

// Verification routes
router.post("/verify-delivery", authController.restrictTo('admin'), bookingController.verifyDelivery);
router.get("/delivery-status/:id", bookingController.getDeliveryStatus);

router.get("/admin-dashboard", bookingController.getAllBookingsWithStats);

// Add these new routes
router.get(
  '/delivery-management',
  authController.protect,
  authController.restrictTo('admin'),
  bookingController.getDeliveryManagementBookings
);

router.patch(
  '/:bookingId/delivery-status',
  authController.protect,
  authController.restrictTo('admin'),
  bookingController.updateDeliveryStatus
);

module.exports = router;
