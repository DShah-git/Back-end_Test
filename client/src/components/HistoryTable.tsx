import { useEffect, useState } from "react";
import type { SqrtCalculationResponse, SqrtHistoryResponse } from "@shared/types";
import { fetchCalculationHistory, deleteCalculationHistory } from "../api/squareRootService";
import "./HistoryTable.css";

interface HistoryTableProps {
    refreshTrigger?: number;
}

export function HistoryTable({ refreshTrigger = 0 }: HistoryTableProps) {
    const [items, setItems] = useState<SqrtCalculationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentCursor, setCurrentCursor] = useState<string | undefined>();
    const [nextCursor, setNextCursor] = useState<string | undefined>();
    const [hasMore, setHasMore] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const PAGE_SIZE = 10;

    const loadHistory = async (cursor?: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchCalculationHistory(PAGE_SIZE, cursor);

            setItems(data.items);
            setCurrentCursor(cursor);
            setNextCursor(data.nextCursor);
            setHasMore(!!data.nextCursor);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load history";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [refreshTrigger]);

    useEffect(() => {
        if (successMessage) {
            const t = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(t);
        }
    }, [successMessage]);

    const handleNextPage = () => {
        if (nextCursor) {
            loadHistory(nextCursor);
        }
    };

    const handlePreviousPage = () => {

        loadHistory();
    };

    const handleDeleteHistory = async () => {
        const confirmed = window.confirm("Delete all calculation history? This action cannot be undone.");
        if (!confirmed) return;

        setIsLoading(true);
        setError(null);

        try {
            await deleteCalculationHistory();
            setItems([]);
            setHasMore(false);
            setSuccessMessage("Calculation history deleted");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete history";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="history-table-container">
            <div className="history-header">
                <h2>Calculation History</h2>
                <button
                    className="delete-button"
                    onClick={handleDeleteHistory}
                    disabled={isLoading || items.length === 0}
                    aria-label="Delete calculation history"
                >
                    Delete All
                </button>
            </div>

            {successMessage && <div className="table-success">{successMessage}</div>}

            {error && <div className="table-error">{error}</div>}

            {isLoading && items.length === 0 ? (
                <div className="table-loading">Loading history...</div>
            ) : items.length === 0 ? (
                <div className="table-empty">No calculations yet. Start by calculating a square root!</div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th># </th>
                                    <th>Input</th>
                                    <th>Result</th>
                                    <th>Calculated At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => (
                                    <tr key={item.id}>
                                        <td> {i + 1} </td>
                                        <td className="input-cell">{item.input}</td>
                                        <td className="result-cell">
                                            {item.result.toFixed(6)}
                                        </td>
                                        <td className="timestamp-cell">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-pagination">
                        <button
                            onClick={handlePreviousPage}
                            disabled={!currentCursor || isLoading}
                            className="pagination-button"
                        >
                            ← Previous
                        </button>
                        <span className="pagination-info">
                            Showing {items.length} results
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={!hasMore || isLoading}
                            className="pagination-button"
                        >
                            Next →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
