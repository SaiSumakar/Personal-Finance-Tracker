import { z } from "zod";

export const transactionSchema = z.object({

    type: z.enum([
        "expense",
        "income",
        "transfer"
    ]),

    amount: z
        .number({
            error: "Amount is required."
        })
        .positive("Amount must be greater than zero."),

    category_id: z.number(),

    account_id: z.number(),

    transaction_date: z.date(),

    note: z.string().optional(),

    payment_method: z.string().optional(),

    location: z.string().optional()

});

export type TransactionFormValues =
    z.infer<typeof transactionSchema>;