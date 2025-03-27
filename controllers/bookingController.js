// bookingController.js

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Crop = require("./../models/cropModel");
const catchAsync = require("./../utils/catchAsync");

const Booking = require("../models/bookingModel");
const AppError = require("../utils/appErrors");
const Email = require("./../utils/email");
const ExcelJS = require("exceljs");
const User = require("../models/userModel");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const crop = await Crop.findById(req.params.id);

  const image = crop.image;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://localhost:5173/crops/?crop=${req.params.id}&user=${req.user.id}&price=${crop.price}`,
    cancel_url: `${req.protocol}://localhost:5173/crops/${crop.id}`,
    customer_email: req.user.email,
    client_reference_id: req.params.id,
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `${crop.name} crop`,
            description: crop.name,
            images: [image],
          },
          unit_amount: crop.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    // Include address collection
    billing_address_collection: "required",
  });
  res.status(200).json({
    status: "success",
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res) => {
  try {
    const { crop, user, price } = req.query;

    if (!crop || !user || !price) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    // Generate verification code first
    const email = new Email(req.user, `${req.protocol}://localhost:5173/profile`);
    const verificationCode = email.generateVerificationCode();

    // Create booking with verification code
    let booking = await Booking.create({ 
      crop, 
      user, 
      price,
      verificationCode // Include verification code during creation
    });

    // Update crop quantity
    const updatedCrop = await Crop.findByIdAndUpdate(
      crop,
      { $inc: { quantity: -1 } },
      { new: true }
    );

    if (!updatedCrop) {
      // If crop not found, delete the booking and return error
      await Booking.findByIdAndDelete(booking._id);
      return res.status(404).json({ message: "Crop not found" });
    }

    // Populate necessary fields
    booking = await Booking.findById(booking._id).populate([
      { 
        path: 'crop',
        select: 'name price image' 
      },
      { 
        path: 'user',
        select: 'name email'
      }
    ]);

    try {
      // Send all emails
      await email.sendBookingReceipt(booking);

      res.status(200).json({ 
        status: 'success',
        message: "Order placed successfully", 
        data: {
          booking,
          verificationCode
        }
      });
    } catch (error) {
      // If email sending fails, still save the booking but log the error
      console.error("Error sending emails:", error);
      
      res.status(200).json({ 
        status: 'success',
        message: "Order placed successfully, but there was an error sending confirmation emails", 
        data: {
          booking,
          verificationCode
        }
      });
    }
  } catch (error) {
    console.error("Error processing order:", error);
    res.status(500).json({ 
      status: 'error',
      message: "Failed to process order",
      error: error.message 
    });
  }
});

exports.getsinglebooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
      isVerified: booking.isVerified,
      verifiedAt: booking.verifiedAt
    }
  });
});

exports.getallbookings = catchAsync(async (req, res, next) => {
  // Find all bookings and populate necessary fields
  const bookings = await Booking.find()
    .populate({
      path: 'crop',
      select: 'name image soldby',
      populate: {
        path: 'soldby',
        select: 'name'
      }
    })
    .populate({
      path: 'user',
      select: 'name photo'
    });

  // Filter out bookings where crop is null (deleted products)
  const validBookings = bookings.filter(booking => booking.crop !== null);

  if (!validBookings || validBookings.length === 0) {
    return next(new AppError("Sorry, there are no bookings", 404));
  }

  // Sort bookings by creation date (newest first)
  validBookings.sort((a, b) => b.createdAt - a.createdAt);

  // Calculate total revenue from valid bookings
  const totalRevenue = validBookings.reduce(
    (total, booking) => total + (booking.price || 0),
    0
  );

  res.status(200).json({
    status: "success",
    total: validBookings.length,
    totalRevenue: totalRevenue,
    data: {
      data: validBookings,
    },
  });
});

exports.getbookingstats = catchAsync(async (req, res, next) => {
  const stats = await Booking.aggregate([
    {
      $match: {
        crop: { $ne: null },
      },
    },
    {
      $lookup: {
        from: "crops",
        localField: "crop",
        foreignField: "_id",
        as: "cropDetails",
      },
    },
    {
      $group: {
        _id: "$cropDetails.name",
        numofusers: { $sum: 1 },
        totalRevenue: { $sum: "$price" },
        avgPrice: { $avg: "$price" },
      },
    },
    {
      $match: {
        _id: { $ne: [] },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      doc: stats,
    },
  });
});

exports.mypurchase = catchAsync(async (req, res, next) => {
  const purchase = await Booking.find({ user: req.user.id });

  const productid = purchase.map((el) => el.crop);
  const crops = await Crop.find({ _id: { $in: productid } });
  res.status(200).json({
    status: "success",
    individualpurchase: crops.length,
    data: {
      crops,
    },
  });
});

const Cart = require("../models/cartModel");

exports.addToCart = catchAsync(async (req, res, next) => {
  const cropId = req.params.cropId;
  const { quantity } = req.body;
  const userId = req.user.id;

  const crop = await Crop.findById(cropId);

  if (!crop) {
    return res.status(404).json({ message: "Crop not found" });
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.crop.toString() === cropId
  );

  if (existingItemIndex !== -1) {
    // If item exists in cart, update quantity and recalculate price
    cart.items[existingItemIndex].quantity += quantity || 1;
    cart.items[existingItemIndex].price =
      crop.price * cart.items[existingItemIndex].quantity;
  } else {
    // If item does not exist in cart, add it with quantity and price
    const price = crop.price * (quantity || 1);
    cart.items.push({ crop: cropId, quantity: quantity || 1, price });
  }

  await cart.save();

  res.status(200).json({
    status: "success",
    cart,
  });
});

// exports.myCart = catchAsync(async (req, res, next) => {
//   const userId = req.user.id;

//   const mycart = await Cart.findOne({ user: userId }).populate({
//     path: "items",
//     populate: {
//       path: "crop",
//       select: "name image type",
//     },
//   });
//   if (!mycart) {
//     return next(new AppError("sorry there is no cart you have build up", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       data: mycart,
//     },
//   });
// });

exports.myCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const mycart = await Cart.findOne({ user: userId }).populate({
    path: "items",
    populate: {
      path: "crop",
      select: "name image type",
      match: { _id: { $ne: null } }, // This ensures that the crop is not null (i.e., not deleted)
    },
  });

  if (!mycart) {
    return next(new AppError("Sorry, there is no cart you have built up", 404));
  }

  // Filter out items where the populated crop is null (because the crop was deleted)
  mycart.items = mycart.items.filter((item) => item.crop !== null);

  res.status(200).json({
    status: "success",
    data: {
      data: mycart,
    },
  });
});

exports.deleteFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const cropId = req.params.cropId;

  // Find the user's cart
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  // Find the index of the item to be deleted
  const itemIndex = cart.items.findIndex(
    (item) => item.crop.toString() === cropId
  );

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  // Remove the item from the cart
  cart.items.splice(itemIndex, 1);

  // Save the updated cart
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Item deleted from cart",
  });
});

exports.createCheckoutSessionForCart = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items",
      populate: {
        path: "crop",
      },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Prepare line items for the checkout session
    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: `${item.crop.name} crop`,
          description: item.crop.name,
          images: [item.crop.image],
        },
        unit_amount: item.crop.price * 100,
      },
      quantity: item.quantity,
    }));

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${req.protocol}://localhost:5173/cart/?${cart.items
        .map(
          (item) =>
            `crop=${item.crop.id}&user=${req.user.id}&price=${item.crop.price}`
        )
        .join("&")}`,
      cancel_url: `${req.protocol}://localhost:5173/crops/`,
      customer_email: req.user.email,
      line_items: lineItems,
      mode: "payment",
      billing_address_collection: "required",
    });

    res.status(200).json({
      status: "success",
      session,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Backend code
exports.createBookingCheckoutcart = catchAsync(async (req, res) => {
  try {
    const { crops, users, prices } = req.query;

    // Split the query parameters by ',' to get individual products
    const cropArr = crops.split(",");
    const userArr = users.split(",");
    const priceArr = prices.split(",");
    console.log(cropArr);

    // Ensure all arrays have the same length
    if (
      cropArr.length !== userArr.length ||
      userArr.length !== priceArr.length
    ) {
      return res.status(400).json({ message: "Invalid URL parameters" });
    }

    // Generate verification codes and create bookings
    const email = new Email(req.user, `${req.protocol}://localhost:5173/profile`);
    
    const bookings = await Promise.all(
      cropArr.map(async (cropId, index) => {
        const verificationCode = email.generateVerificationCode();
        
        const booking = await Booking.create({
          crop: cropId,
          user: userArr[index],
          price: parseInt(priceArr[index]),
          verificationCode,
          deliveryStatus: 'pending',
          isVerified: false
        });

        // Update crop quantity
        await Crop.findByIdAndUpdate(
          cropId,
          { $inc: { quantity: -1 } },
          { new: true }
        );

        return booking;
      })
    );

    // Populate necessary fields for all bookings
    const populatedBookings = await Promise.all(
      bookings.map(booking => 
        Booking.findById(booking._id)
          .populate({
            path: 'crop',
            select: 'name price image'
          })
          .populate({
            path: 'user',
            select: 'name email'
          })
      )
    );

    // Send emails for each booking
    try {
      await Promise.all(
        populatedBookings.map(booking => 
          email.sendBookingReceipt(booking)
        )
      );
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Continue with the response even if emails fail
    }

    res.status(200).json({
      status: "success",
      message: "Orders placed successfully",
      data: {
        bookings: populatedBookings
      }
    });
  } catch (error) {
    console.error("Error handling success URL data:", error);
    res.status(500).json({ 
      status: "error",
      message: "Failed to process orders",
      error: error.message 
    });
  }
});

exports.createreport = catchAsync(async (req, res, next) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("bookingsdata");
  worksheet.columns = [
    { header: "S.no", key: "s_no", width: 5 },
    { header: "Crop ID", key: "cropId", width: 29 },
    { header: "Product Name", key: "productName", width: 29 },
    { header: "User Name", key: "userName", width: 29 },
    { header: "User Email", key: "userEmail", width: 29 },
    { header: "Price", key: "price", width: 29 },
    { header: "Paid", key: "paid", width: 5 },
    { header: "Delivery Status", key: "deliveryStatus", width: 15 },
    { header: "Verification Status", key: "verificationStatus", width: 15 },
    { header: "Verification Code", key: "verificationCode", width: 20 },
    { header: "Date & Time", key: "dateTime", width: 29 },
  ];

  const { year } = req.query;

  let query = {};

  if (year) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
    query.createdAt = { $gte: startDate, $lte: endDate };
  }

  const book = await Booking.find(query)
    .populate({
      path: 'crop',
      select: 'name'
    })
    .populate({
      path: 'user',
      select: 'name email'
    });

  const bookings = book.filter((booking) => booking.crop != null);
  
  bookings.forEach((booking, index) => {
    worksheet.addRow({
      s_no: index + 1,
      cropId: booking.crop.id,
      productName: booking.crop.name,
      userName: booking.user.name,
      userEmail: booking.user.email,
      price: booking.price,
      paid: booking.paid ? "Yes" : "No",
      deliveryStatus: booking.deliveryStatus?.charAt(0).toUpperCase() + booking.deliveryStatus?.slice(1) || 'Pending',
      verificationStatus: booking.isVerified ? "Verified" : "Pending",
      verificationCode: booking.verificationCode,
      dateTime: booking.createdAt,
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=bookingsdata.xlsx"
  );
  await workbook.xlsx.write(res);
});

exports.verifyOrder = catchAsync(async (req, res, next) => {
  const { bookingId, verificationCode } = req.body;

  if (!bookingId || !verificationCode) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide both bookingId and verificationCode'
    });
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'No booking found with that ID'
    });
  }

  if (booking.isVerified) {
    return res.status(400).json({
      status: 'error',
      message: 'This order has already been verified'
    });
  }

  if (booking.verificationCode !== verificationCode) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid verification code'
    });
  }

  // Update booking status to verified
  booking.isVerified = true;
  booking.verifiedAt = Date.now();
  await booking.save();

  res.status(200).json({
    status: 'success',
    message: 'Order verified successfully',
    data: {
      booking
    }
  });
});

exports.verifyDelivery = catchAsync(async (req, res, next) => {
  const { bookingId, verificationCode } = req.body;

  // 1) Find the booking
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // 2) Check if already verified
  if (booking.isVerified) {
    return next(new AppError('This delivery has already been verified', 400));
  }

  // 3) Verify the code
  if (booking.verificationCode !== verificationCode) {
    return next(new AppError('Invalid verification code', 400));
  }

  // 4) Update booking status
  booking.isVerified = true;
  booking.verifiedAt = Date.now();
  booking.deliveryStatus = 'delivered';
  await booking.save();

  // 5) Send response
  res.status(200).json({
    status: 'success',
    message: 'Delivery verified successfully',
    data: {
      booking
    }
  });
});

// Get delivery status
exports.getDeliveryStatus = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      deliveryStatus: booking.deliveryStatus,
      isVerified: booking.isVerified,
      verifiedAt: booking.verifiedAt
    }
  });
});

exports.getAllBookingsWithStats = catchAsync(async (req, res, next) => {
  const { timeRange } = req.query;
  
  // Calculate date range based on timeRange
  let dateFilter = {};
  const now = new Date();
  
  switch (timeRange) {
    case 'day':
      // Today
      dateFilter = {
        createdAt: {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lt: new Date(now.setHours(23, 59, 59, 999))
        }
      };
      break;
    case 'week':
      // This week (last 7 days)
      dateFilter = {
        createdAt: {
          $gte: new Date(now.setDate(now.getDate() - 7)),
          $lt: new Date()
        }
      };
      break;
    case 'month':
      // This month
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lt: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        }
      };
      break;
    case 'year':
      // This year
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), 0, 1),
          $lt: new Date(now.getFullYear() + 1, 0, 1)
        }
      };
      break;
    default:
      // All time - no filter
      dateFilter = {};
  }

  // Fetch all bookings with detailed information and apply date filter
  const bookings = await Booking.find(dateFilter)
    .populate({
      path: 'crop',
      select: 'name price image'
    })
    .populate({
      path: 'user',
      select: 'name email'
    })
    .sort({ createdAt: -1 }); // Sort by newest first

  // Instead of throwing error, return empty data
  if (!bookings || bookings.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        totalBookings: 0,
        totalRevenue: 0,
        avgRevenue: 0,
        deliveryStatusCounts: {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0
        },
        verifiedCount: 0,
        unverifiedCount: 0,
        revenueByCrop: {},
        bookingsByDate: {},
        recentBookings: []
      }
    });
  }

  // Calculate statistics
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((total, booking) => total + (booking.price || 0), 0);
  const avgRevenue = totalRevenue / totalBookings;

  // Delivery status counts
  const deliveryStatusCounts = bookings.reduce((acc, booking) => {
    const status = booking.deliveryStatus || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Verification counts
  const verifiedCount = bookings.filter(booking => booking.isVerified).length;
  const unverifiedCount = totalBookings - verifiedCount;

  // Revenue by crop
  const revenueByCrop = bookings.reduce((acc, booking) => {
    if (booking.crop) {
      const cropName = booking.crop.name || 'Unknown';
      acc[cropName] = (acc[cropName] || 0) + (booking.price || 0);
    }
    return acc;
  }, {});

  // Bookings by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const date = booking.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Get only the most recent bookings for the table
  const recentBookings = bookings.slice(0, 10); // Get last 10 bookings

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      totalBookings,
      totalRevenue,
      avgRevenue,
      deliveryStatusCounts,
      verifiedCount,
      unverifiedCount,
      revenueByCrop,
      bookingsByDate,
      recentBookings
    }
  });
});

exports.getDeliveryManagementBookings = catchAsync(async (req, res, next) => {
  const { 
    search, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    dateFilter,
    status
  } = req.query;

  // Build the base query
  let query = {};

  // Handle search
  if (search) {
    // First, find users that match the search term
    const users = await User.find({
      name: { $regex: search, $options: 'i' }
    }).select('_id');

    // Then, find crops that match the search term
    const crops = await Crop.find({
      name: { $regex: search, $options: 'i' }
    }).select('_id');

    // Build the query with OR conditions
    query.$or = [
      { user: { $in: users.map(u => u._id) } },
      { crop: { $in: crops.map(c => c._id) } }
    ];
  }

  // Handle date filtering
  if (dateFilter) {
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        query.createdAt = {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lt: new Date(now.setHours(23, 59, 59, 999))
        };
        break;
      case 'week':
        query.createdAt = {
          $gte: new Date(now.setDate(now.getDate() - 7)),
          $lt: new Date()
        };
        break;
      case 'month':
        query.createdAt = {
          $gte: new Date(now.setMonth(now.getMonth() - 1)),
          $lt: new Date()
        };
        break;
    }
  }

  // Handle status filtering
  if (status && status !== 'all') {
    query.deliveryStatus = status;
  }

  // Prepare sort configuration
  let sort = {};
  if (sortBy === 'user.name') {
    // Handle sorting by populated fields
    const bookings = await Booking.find(query)
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate({
        path: 'crop',
        select: 'name soldby',
        populate: {
          path: 'soldby',
          select: 'name'
        }
      });
    
    // Sort manually for populated fields
    bookings.sort((a, b) => {
      const nameA = (a.user?.name || '').toLowerCase();
      const nameB = (b.user?.name || '').toLowerCase();
      return sortOrder === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    });

    // Filter out null crops after sorting
    const validBookings = bookings.filter(booking => booking.crop !== null);

    // Calculate statistics
    const deliveryStats = validBookings.reduce((acc, booking) => {
      const status = booking.deliveryStatus || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = validBookings.reduce((total, booking) => total + (booking.price || 0), 0);

    return res.status(200).json({
      status: 'success',
      total: validBookings.length,
      totalRevenue,
      deliveryStats,
      data: {
        data: validBookings
      }
    });
  } else {
    // For other fields, use MongoDB sort
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const bookings = await Booking.find(query)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'crop',
        select: 'name soldby',
        populate: {
          path: 'soldby',
          select: 'name'
        }
      })
      .sort(sort);

    // Filter out null crops
    const validBookings = bookings.filter(booking => booking.crop !== null);

    // Calculate statistics
    const deliveryStats = validBookings.reduce((acc, booking) => {
      const status = booking.deliveryStatus || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = validBookings.reduce((total, booking) => total + (booking.price || 0), 0);

    res.status(200).json({
      status: 'success',
      total: validBookings.length,
      totalRevenue,
      deliveryStats,
      data: {
        data: validBookings
      }
    });
  }
});

// Add route handler for updating delivery status
exports.updateDeliveryStatus = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;
  const { deliveryStatus } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
  
  if (!validStatuses.includes(deliveryStatus)) {
    return next(new AppError('Invalid delivery status', 400));
  }

  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Update the delivery status
  booking.deliveryStatus = deliveryStatus;
  
  // If status is delivered, also mark as verified
  if (deliveryStatus === 'delivered') {
    booking.isVerified = true;
    booking.verifiedAt = Date.now();
  }

  await booking.save();

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});
