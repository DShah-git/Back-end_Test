import { NewtonRaphsonAlgorithm, SqrtCalculator } from "@/common/models/square-root";


const roundResult = (value: number, decimals: number = 10): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Calculate square root asynchronously using Newton-Raphson algorithm
 * Runs calculation off the main thread using setImmediate to prevent blocking
 * @param input - The number to calculate square root for
 * @returns Promise resolving to the square root result
 */
export const calculateSqrtAsync = (input: number): Promise<number> => {
    return new Promise((resolve) => {
        setImmediate(() => {
            // Return 0 for negative inputs (square root of negative numbers is not real)
            if (input < 0) {
                resolve(0);
                return;
            }

            const algorithm = new NewtonRaphsonAlgorithm();
            const calculator = new SqrtCalculator(input, algorithm);
            const result = calculator.calculate();
            resolve(roundResult(result));
        });
    });
};