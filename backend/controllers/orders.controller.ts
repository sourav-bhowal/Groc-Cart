import type { FastifyReply, FastifyRequest } from "fastify";
import {
  BranchModel,
  CustomerModel,
  OrderModel,
  DeliveryPartnerModel,
} from "../models/index.models";
import type { IOrder } from "../models/orders.models";
import type { IDeliveryPartner } from "../models/user.models";

export const createOrder = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    // Extract user ID and order details from the request
    const { _id: userId } = req.user;
    const orderDetails = req.body as IOrder;

    // Destructure order details
    const { items, branch, totalPrice } = orderDetails;

    // Find the customer by user ID
    const customerData = await CustomerModel.findById(userId);
    if (!customerData) {
      return reply.status(404).send({ message: "Customer not found" });
    }

    // Find the branch by ID
    const branchData = await BranchModel.findById(branch);
    if (!branchData) {
      return reply.status(404).send({ message: "Branch not found" });
    }

    // Create a new order
    const newOrder = new OrderModel({
      customer: customerData._id,
      branch: branchData._id,
      items,
      totalPrice,
      deliveryLocation: {
        latitude: customerData.liveLocation?.latitude,
        longitude: customerData.liveLocation?.longitude,
        address: customerData.address || "No address provided",
      },
      pickupLocation: {
        latitude: branchData.liveLocation?.latitude,
        longitude: branchData.liveLocation?.longitude,
        address: branchData.address || "No address provided",
      },
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();
    if (!savedOrder) {
      return reply.status(500).send({ message: "Failed to create order" });
    }

    // Respond with the created order details
    return reply.status(201).send({
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const confirmOrder = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Extract order ID from the request parameters
    const { orderId } = req.params as { orderId: string };

    //
    const { liveLocation, address } = req.body as Partial<IDeliveryPartner>;

    // Delivery partner ID from the request user
    const { _id: deliveryPartnerId } = req.user;

    // Find the delivery partner by ID
    const deliveryPartner = await DeliveryPartnerModel.findById(
      deliveryPartnerId
    );

    if (!deliveryPartner) {
      return reply.status(404).send({ message: "Delivery partner not found" });
    }

    // Find the order by ID
    const order = await OrderModel.findById(orderId);

    // Check if the order exists
    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    // Check if the order is available for confirmation
    if (order.status !== "Available") {
      return reply.status(400).send({ message: "Order is not available" });
    }

    // Update the order with delivery partner details and status
    order.status = "Accepted";

    // Set the delivery partner and their live location
    order.deliveryPartner = deliveryPartnerId;
    order.deliveryPersonLocation = {
      latitude: liveLocation?.latitude || 0,
      longitude: liveLocation?.longitude || 0,
      address: address,
    };

    // Emit the order confirmation event to the specific order room
    req.server.io.to(orderId).emit("orderConfirmed", order);

    // Save the updated order to the database
    const updatedOrder = await order.save();

    if (!updatedOrder) {
      return reply.status(500).send({ message: "Failed to confirm order" });
    }

    // Respond with the updated order details
    return reply.status(200).send({
      message: "Order confirmed successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error in confirmOrder:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const updateOrderStatus = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Extract order ID from the request parameters
    const { orderId } = req.params as { orderId: string };

    // Extract status and delivery person location from the request body
    const { status, deliveryPersonLocation } = req.body as Partial<IOrder>;

    // Delivery partner ID from the request user
    const { _id: userId } = req.user;

    // Find delivery partner by user ID
    const deliveryPartner = await DeliveryPartnerModel.findById(userId);

    if (!deliveryPartner) {
      return reply.status(404).send({ message: "Delivery partner not found" });
    }

    // Find the order by ID
    const order = await OrderModel.findById(orderId);

    // Check if the order exists
    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    // Check if the order is cancelled or completed
    if (order.status === "Cancelled" || order.status === "Delivered") {
      return reply
        .status(400)
        .send({ message: "Cannot update a cancelled or completed order" });
    }

    // if delieveryPartner doesn't match the order's delivery partner
    if (order.deliveryPartner?.toString() !== deliveryPartner._id.toString()) {
      return reply
        .status(403)
        .send({ message: "You are not authorized to update this order" });
    }

    // Update the order status and delivery person location\
    order.status = status || order.status;

    // If deliveryPersonLocation is provided, update the order's delivery person location
    if (deliveryPersonLocation) {
      order.deliveryPersonLocation = {
        latitude: deliveryPersonLocation.latitude,
        longitude: deliveryPersonLocation.longitude,
        address: deliveryPersonLocation.address || "No address provided",
      };
    }

    // Save the updated order to the database
    const updatedOrder = await order.save();

    if (!updatedOrder) {
      return reply.status(500).send({ message: "Failed to update order" });
    }

    // Emit the order update event to the specific order room
    req.server.io.to(orderId).emit("liveTrackingOrderUpdates", order);

    // Respond with the updated order details
    return reply.status(200).send({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error in updateOrderDetails:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getOrders = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    // Extract query parameters for filtering orders
    const { status, CustomerId, deliveryPartnerId, branchId } = req.query as {
      status?: string;
      CustomerId?: string;
      deliveryPartnerId?: string;
      branchId?: string;
    };

    // Initialize filter object for MongoDB query
    const filter: any = {};

    // Apply filters based on query parameters
    if (status) {
      filter.status = status;
    }

    if (CustomerId) {
      filter.customer = CustomerId;
    }

    if (deliveryPartnerId) {
      filter.deliveryPartner = deliveryPartnerId;
    }

    if (branchId) {
      filter.branch = branchId;
    }

    // Fetch orders based on the filter
    const orders = await OrderModel.find(filter)
      .populate("customer", "userName email phoneNumber")
      .populate("branch", "userName address liveLocation")
      .populate("deliveryPartner", "userName phoneNumber liveLocation")
      .populate("items.product", "name price");

    if (!orders || orders.length === 0) {
      return reply.status(404).send({ message: "No orders found" });
    }

    // Respond with the orders
    return reply.status(200).send({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Error in getOrders:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const getOrderById = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Extract order ID from the request parameters
    const { orderId } = req.params as { orderId: string };

    // Find the order by ID and populate necessary fields
    const order = await OrderModel.findById(orderId)
      .populate("customer", "userName email phoneNumber")
      .populate("branch", "userName address liveLocation")
      .populate("deliveryPartner", "userName phoneNumber liveLocation")
      .populate("items.product", "name price");

    // Check if the order exists
    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    // Respond with the order details
    return reply.status(200).send({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Error in getOrderById:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};
