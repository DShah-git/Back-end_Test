import { useState } from "react";
import type { SqrtCalculationResponse } from "@shared/types";
import { CalculatorForm } from "./components/CalculatorForm";
import { HistoryTable } from "./components/HistoryTable";
import "./App.css";

function App() {
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [calculationResult, setCalculationResult] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const handleCalculationSuccess = (result: SqrtCalculationResponse) => {
		setCalculationResult({
			type: "success",
			message: `√${result.input} = ${result.result.toFixed(6)}`,
		});
		setRefreshTrigger((prev) => prev + 1);
	};

	const handleCalculationError = (error: string) => {
		setCalculationResult({
			type: "error",
			message: error,
		});
	};

	return (
		<main className="app">
			<div className="app-header">
				<h1>Square Root Calculator</h1>
			</div>

			<div className="app-container">

				<div className="app-content">
					<section className="form-section">
						<CalculatorForm
							onSuccess={handleCalculationSuccess}
							onError={handleCalculationError}
						/>
					</section>
					<section>
						{calculationResult && (
							<div className={`calculationResult calculationResult-${calculationResult.type}`}>
								{calculationResult.message}
							</div>
						)}
					</section>

					<section className="history-section">
						<HistoryTable refreshTrigger={refreshTrigger} />
					</section>
				</div>
			</div>
		</main>
	);
}

export default App;
