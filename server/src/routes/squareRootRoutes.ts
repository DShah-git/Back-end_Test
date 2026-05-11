import { Router, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { calculateSqrtAsync } from "@/common/utils/squareRootUtils";

const router = Router();

//validating input as finite number with zod
const SquareRootInputSchema = z.object({
    input: z.number().finite("Input must be a finite number"),
});

type SquareRootInput = z.infer<typeof SquareRootInputSchema>;






/**
 * POST /square-root/calculate
 * Calculate the square root of a given number using Newton-Raphson algorithm
 */
router.post(
    "/calculate",
    async (req: Request, res: Response) => {

        const validationResult = SquareRootInputSchema.safeParse(req.body);

        //validate input
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map((err) => err.message).join(", ");
            const errorResponse = ServiceResponse.failure(
                `Validation failed: ${errors}`,
                null,
                StatusCodes.BAD_REQUEST,
            );
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        const { input } = validationResult.data as SquareRootInput;

        try {
            const result = await calculateSqrtAsync(input);

            const successResponse = ServiceResponse.success(
                `Square root of ${input} calculated successfully`,
                {
                    input,
                    result
                },
                StatusCodes.OK,
            );

            res.status(successResponse.statusCode).json(successResponse);
        } catch (error) {
            const errorResponse = ServiceResponse.failure(
                "Failed to calculate square root",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            res.status(errorResponse.statusCode).json(errorResponse);
        }
    },
);

export { router as squareRootRouter };
