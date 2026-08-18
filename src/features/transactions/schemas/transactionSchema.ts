import { z } from "zod";

export const transactionSchema = z
  .object({
    type: z.enum([
      "expense",
      "income",
      "transfer",
    ]),

    amount: z
      .number({
        error: "Amount is required.",
      })
      .positive(
        "Amount must be greater than zero."
      ),

    category_id: z.number().nullable().optional(),

    from_account_id: z.number().nullable().optional(),

    to_account_id: z.number().nullable().optional(),

    transaction_date: z.date(),

    note: z.string().optional(),

    payment_method: z.string().optional(),

    location: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    /*
    * Category validation
    *
    * Transfers do not require a category,
    * while income and expense do.
    */
    if (data.type !== "transfer") {
      if (
        data.category_id == null ||
        data.category_id <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["category_id"],
          message:
            "Please select a category.",
        });
      }
    }

    /*
    * Income validation
    *
    * from_account_id = NULL
    * to_account_id = required
    */
    if (data.type === "income") {
      if (data.from_account_id != null) {
        ctx.addIssue({
          code: "custom",
          path: ["from_account_id"],
          message:
            "Income cannot have a source account.",
        });
      }

      if (
        data.to_account_id == null ||
        data.to_account_id <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["to_account_id"],
          message:
            "Please select the destination account.",
        });
      }
    }

    /*
    * Expense validation
    *
    * from_account_id = required
    * to_account_id = NULL
    */
    if (data.type === "expense") {
      if (
        data.from_account_id == null ||
        data.from_account_id <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["from_account_id"],
          message:
            "Please select the source account.",
        });
      }

      if (data.to_account_id != null) {
        ctx.addIssue({
          code: "custom",
          path: ["to_account_id"],
          message:
            "Expense cannot have a destination account.",
        });
      }
    }

    /*
    * Transfer validation
    *
    * category_id = NULL
    * Both accounts are required
    * and must be different.
    */
    if (data.type === "transfer") {
      if (data.category_id != null) {
        ctx.addIssue({
          code: "custom",
          path: ["category_id"],
          message:
            "Transfers cannot have a category.",
        });
      }

      if (
        data.from_account_id == null ||
        data.from_account_id <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["from_account_id"],
          message:
            "Please select the source account.",
        });
      }

      if (
        data.to_account_id == null ||
        data.to_account_id <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["to_account_id"],
          message:
            "Please select the destination account.",
        });
      }

      if (
        data.from_account_id != null &&
        data.from_account_id > 0 &&
        data.to_account_id != null &&
        data.to_account_id > 0 &&
        data.from_account_id ===
          data.to_account_id
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["to_account_id"],
          message:
            "From and To accounts must be different.",
        });
      }
    }
  });

export type TransactionFormValues =
  z.infer<typeof transactionSchema>;