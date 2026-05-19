import { Router, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { calculateSqrtAsync } from "@/common/utils/squareRootUtils";
import { prisma } from "@/common/utils/database";
import type { SqrtHistoryResponse } from "@shared/types";

const router = Router();

//validating input as finite number with zod
const SquareRootInputSchema = z.object({
    input: z.number().finite("Input must be a finite number"),
});

const HistoryQuerySchema = z.object({
    limit: z.preprocess((value) => {
        if (typeof value === "string") {
            const trimmed = value.trim();
            return trimmed === "" ? undefined : Number(trimmed);
        }
        return value;
    }, z.number().int().positive().max(100).optional()),
    cursor: z.preprocess((value) => {
        if (typeof value === "string") {
            const trimmed = value.trim();
            return trimmed === "" ? undefined : trimmed;
        }
        return value;
    }, z.string().optional()),
});

type SquareRootInput = z.infer<typeof SquareRootInputSchema>;

type HistoryQuery = z.infer<typeof HistoryQuerySchema>;






/**
 * POST /square-root/calculate
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


            const calculation = await prisma.calculation.create({
                data: {
                    input,
                    result,
                },
            });

            const successResponse = ServiceResponse.success(
                `Square root of ${input} calculated successfully`,
                {
                    id: calculation.id,
                    input,
                    result,
                    createdAt: calculation.createdAt.toISOString(),
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

/**
 * GET /square-root/history
 */
router.get(
    "/history",
    async (req: Request, res: Response) => {
        const validationResult = HistoryQuerySchema.safeParse(req.query);

        if (!validationResult.success) {
            const errors = validationResult.error.errors.map((err) => err.message).join(", ");
            const errorResponse = ServiceResponse.failure(
                `Validation failed: ${errors}`,
                null,
                StatusCodes.BAD_REQUEST,
            );
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        const { limit, cursor } = validationResult.data as HistoryQuery;
        const pageSize = limit ?? 10;
        const take = pageSize + 1;
        const queryOptions: Parameters<typeof prisma.calculation.findMany>[0] = {
            take,
            orderBy: [
                { createdAt: "desc" },
                { id: "desc" },
            ],
        };

        if (cursor) {
            queryOptions.cursor = { id: cursor };
            queryOptions.skip = 1;
        }

        try {
            const calculations = await prisma.calculation.findMany(queryOptions);
            let nextCursor: string | undefined;

            if (calculations.length > pageSize) {
                const nextItem = calculations[pageSize];
                nextCursor = nextItem.id;
                calculations.pop();
            }

            const successResponse = ServiceResponse.success<SqrtHistoryResponse>(
                "Successfully loaded calculation history",
                {
                    items: calculations.map((calculation) => ({
                        id: calculation.id,
                        input: calculation.input,
                        result: calculation.result,
                        createdAt: calculation.createdAt.toISOString(),
                    })),
                    nextCursor,
                },
                StatusCodes.OK,
            );

            res.status(successResponse.statusCode).json(successResponse);
        } catch (error) {
            const errorResponse = ServiceResponse.failure(
                "Failed to load history",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            res.status(errorResponse.statusCode).json(errorResponse);
        }
    },
);

/**
 * DELETE /square-root/history
 */
router.delete(
    "/history",
    async (req: Request, res: Response) => {
        try {
            await prisma.calculation.deleteMany();

            const successResponse = ServiceResponse.success(
                "Calculation history deleted successfully",
                {
                    itemsDeleted: true,
                },
                StatusCodes.OK,
            );

            res.status(successResponse.statusCode).json(successResponse);
        } catch (error) {
            const errorResponse = ServiceResponse.failure(
                "Failed to delete history",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            res.status(errorResponse.statusCode).json(errorResponse);
        }
    },
);

export { router as squareRootRouter };
