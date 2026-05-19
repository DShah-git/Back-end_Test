import type { SubmitEvent } from "react";
import { useState } from "react";
import type { SqrtCalculationResponse } from "@shared/types";
import { calculateSquareRoot } from "../api/squareRootService";
import "./CalculatorForm.css";

interface CalculatorFormProps {
    onSuccess: (result: SqrtCalculationResponse) => void;
    onError: (error: string) => void;
}

export function CalculatorForm({ onSuccess, onError }: CalculatorFormProps) {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // Validation
        const value = parseFloat(input);
        if (isNaN(value)) {
            setError("Please enter a valid number");
            return;
        }


        if (!isFinite(value)) {
            setError("Input must be a finite number");
            return;
        }

        setIsLoading(true);

        try {
            const result = await calculateSquareRoot(value);
            onSuccess(result);
            setInput("");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "An unexpected error occurred";
            setError(message);
            onError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="calculator-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="input">Enter a number:</label>
                <input
                    type="number"
                    id="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., 16"
                    disabled={isLoading}
                    step="any"
                    required
                />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" disabled={isLoading} className="form-button">
                {isLoading ? "Calculating..." : "Calculate Square Root"}
            </button>
        </form>
    );
}
