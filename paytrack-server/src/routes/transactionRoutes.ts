
import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";

import Transaction from "../models/Transactions";
import authenticateToken from "../middleware/authMiddleware";

const router = Router();

// Every transaction endpoint requires a valid JWT.
router.use(authenticateToken);

//Validates YYYY-MM-DD without allowing impossible dates.
const transactionDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format")
  .refine((value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) return false;

    const [, year, month, day] = match;
    const parsed = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day)),
    );

    return (
      parsed.getUTCFullYear() === Number(year) &&
      parsed.getUTCMonth() === Number(month) - 1 &&
      parsed.getUTCDate() === Number(day)
    );
  }, "Please provide a valid transaction date")
  .transform((value) => {
    const [year, month, day] = value.split("-").map(Number);

    // Store the selected calendar date at UTC midnight.
    return new Date(Date.UTC(year, month - 1, day));
  });

// Schema used when creating a transaction.
const transactionSchema = z
  .object({
    sender: z.string().trim().min(1, "Sender name is required").max(100),
    reference: z.string().trim().min(1, "Reference is required").max(100),
    amount: z.coerce
      .number()
      .finite()
      .positive("Amount must be greater than zero"),
    date: transactionDateSchema,
    status: z
      .enum(["Confirmed", "Pending", "Needs review"])
      .default("Pending"),
    remarks: z.string().trim().max(1000).default(""),
    isReconciled: z.boolean().default(false),
  })
  .strict();




// Schema used when updating only the fields provided.
const updateTransactionSchema = z
  .object({
    sender: z.string().trim().min(1, "Sender name is required").max(100).optional(),

    reference: z.string().trim().min(1, "Reference is required").max(100).optional(),

    amount: z.coerce
      .number()
      .finite()
      .positive("Amount must be greater than zero")
      .optional(),

    date: transactionDateSchema.optional(),

    status: z
      .enum(["Confirmed", "Pending", "Needs review"])
      .optional(),

    remarks: z.string().trim().max(1000).optional(),

    isReconciled: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });
// GET /api/transactions
// Retrieve only the logged-in user's transactions.
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const transactions = await Transaction.find({
      userId: req.userId,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error: unknown) {
    console.error("Fetch transactions error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch transactions",
    });
  }
});

// POST /api/transactions
// Create a transaction owned by the logged-in user.
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const result = transactionSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Please check your transaction details",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const transaction = await Transaction.create({
      ...result.data,
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error: unknown) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "This transaction reference already exists in your account",
      });
      return;
    }

    console.error("Create transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create transaction",
    });
  }
});

// PATCH /api/transactions/:id
// Update only a transaction belonging to the logged-in user.
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
      return;
    }

    const result = updateTransactionSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Please check the fields you want to update",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      { $set: result.data },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error: unknown) {
    // Log the actual failure on the backend for diagnosis.
    console.error("Update transaction error:", error);

    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "This transaction reference already exists in your account",
      });
      return;
    }

    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        success: false,
        message: "Transaction validation failed",
        errors: Object.values(error.errors).map((issue) => issue.message),
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to update transaction",
    });
  }
});

// DELETE /api/transactions/:id
// Delete only a transaction belonging to the logged-in user.
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
      return;
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete transaction",
    });
  }
});

export default router;
