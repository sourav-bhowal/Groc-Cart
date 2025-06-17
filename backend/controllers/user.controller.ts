import { CustomerModel, DeliveryPartnerModel } from "../models/index.models";
import jwt from "jsonwebtoken";
import type { FastifyRequest, FastifyReply } from "fastify";
import type { ICustomer, IDeliveryPartner } from "../models/user.models";
import { generateTokens } from "../services/generateTokens";
import { REFRESH_TOKEN_SECRET } from "../config/config";

// Function to handle customer login
export const loginCustomer = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Validate the request body
    const data = req.body as ICustomer;

    // Check if phone number is provided
    if (!data.phoneNumber) {
      return reply.status(400).send({ message: "Phone number is required" });
    }

    // Check if the phone number is valid
    const { phoneNumber } = data;

    // Example regex for validating phone number format
    const phoneNumberRegex = /^\d{10}$/;

    // Validate phone number format
    if (!phoneNumberRegex.test(phoneNumber.toString())) {
      return reply.status(400).send({ message: "Invalid phone number format" });
    }

    // Find the customer by phone number
    let customer = await CustomerModel.findOne({ phoneNumber });

    // If customer does not exist, create a new one
    if (!customer) {
      customer = await CustomerModel.create({
        phoneNumber,
        role: "Customer",
        isActive: true,
      });

      // Save the customer to the database
      await customer.save();
    }

    // Generate JWT token
    const { accessToken, refreshToken } = await generateTokens(customer);

    // Respond with the tokens and customer data
    return reply.status(200).send({
      message: "Login successful",
      accessToken,
      refreshToken,
      customer,
    });
  } catch (error) {
    console.error("Error in loginCustomer:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

// Function to handle delivery partner login using email and password
export const loginDeliveryPartner = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Validate the request body
    const { email, password } = req.body as IDeliveryPartner;

    // Check if email and password are provided
    if (!email || !password) {
      return reply
        .status(400)
        .send({ message: "Email and password are required" });
    }

    // Find the delivery partner by email
    const deliveryPartner = await DeliveryPartnerModel.findOne({ email });

    // If delivery partner does not exist
    if (!deliveryPartner) {
      return reply.status(404).send({ message: "Delivery partner not found" });
    }

    // Check if the password matches
    const isPasswordValid = password === deliveryPartner.password;

    // If password is invalid
    if (!isPasswordValid) {
      return reply.status(401).send({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const { accessToken, refreshToken } = await generateTokens(deliveryPartner);

    // Remove sensitive information like password from the response
    deliveryPartner.password = ""; // Ensure password is not included in the response

    // Respond with the tokens and delivery partner data
    return reply.status(200).send({
      message: "Login successful",
      accessToken,
      refreshToken,
      deliveryPartner,
    });
  } catch (error) {
    console.error("Error in loginDeliveryPartner:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

// Function to refresh access and refresh tokens
export const refreshToken = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Validate the request body for refresh token
    const { refreshToken } = req.body as { refreshToken: string };

    // Verify the refresh token
    if (!refreshToken) {
      return reply.status(400).send({ message: "Refresh token is required" });
    }

    // Decode the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
      userId: string;
      role: string;
    };

    // User variable to hold the fetched user
    let user: ICustomer | IDeliveryPartner | null;

    // Check if the decoded token has a valid role
    if (decoded.role === "Customer") {
      user = await CustomerModel.findById(decoded.userId);
    } else if (decoded.role === "DeliveryPartner") {
      user = await DeliveryPartnerModel.findById(decoded.userId).select(
        "-password"
      );
    } else {
      return reply.status(400).send({ message: "Invalid token role" });
    }

    // If user does not exist
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    // Generate new access and refresh tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user
    );

    // Respond with the new tokens
    return reply.status(200).send({
      message: "Tokens refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken,
      user,
    });
  } catch (error) {
    console.error("Error in refreshToken:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

// Function to fetch user data
export const fetchUser = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    // Get the user from the request
    const { _id, role } = req.user;

    // User variable to hold the fetched user
    let user: ICustomer | IDeliveryPartner | null;

    // Fetch user based on role
    if (role === "Customer") {
      user = await CustomerModel.findById(_id);
    } else if (role === "DeliveryPartner") {
      user = await DeliveryPartnerModel.findById(_id).select("-password");
    } else {
      return reply.status(400).send({ message: "Invalid user role" });
    }

    // If user does not exist
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    // Respond with the user data
    return reply.status(200).send({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error in fetchUser:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

// Function to update user information
export const updateUser = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    // Extract user ID and update data from the request
    const { _id } = req.user;
    const updateData = req.body;

    // Validate user ID and update data
    if (!_id || !updateData) {
      return reply
        .status(400)
        .send({ message: "User ID and update data are required" });
    }

    // Find the user by ID and update their information
    let user =
      (await CustomerModel.findByIdAndUpdate(
        _id,
        { $set: updateData },
        { new: true } // Return the updated user
      )) ||
      (await DeliveryPartnerModel.findByIdAndUpdate(
        _id,
        { $set: updateData },
        { new: true } // Return the updated user
      ));

    // If user not found, return an error
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    // Remove sensitive information like password from the response
    if (user instanceof DeliveryPartnerModel) {
      user.password = ""; // Ensure password is not included in the response
    }

    // Respond with the updated user information
    return reply.status(200).send({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};
