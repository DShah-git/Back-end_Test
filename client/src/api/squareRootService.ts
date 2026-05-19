import type {
    SqrtCalculationRequest,
    SqrtCalculationResponse,
    SqrtHistoryResponse,
} from "@shared/types";

// Use relative path for API calls to leverage vite proxy during dev
const API_BASE_URL = "/api";


interface ApiResponse<T> {
    success: boolean;
    message: string;
    responseObject: T;
    statusCode: number;
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");
    const text = await response.text();

    if (contentType?.includes("application/json")) {
        try {
            return JSON.parse(text) as ApiResponse<T>;
        } catch {
            throw new Error(text || "Invalid JSON response from API");
        }
    }

    if (!response.ok) {
        throw new Error(text || "Request failed with empty response");
    }

    throw new Error("Unexpected non-JSON response from API");
}

/**
 * Calculate square root via the API
 */
export async function calculateSquareRoot(
    input: number,
): Promise<SqrtCalculationResponse> {
    const response = await fetch(`${API_BASE_URL}/square-root/calculate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ input } as SqrtCalculationRequest),
    });

    const data = await parseApiResponse<SqrtCalculationResponse>(response);



    if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to calculate square root");
    }

    return data.responseObject;
}

/**
 * Fetch calculation history with optional pagination
 */
export async function fetchCalculationHistory(
    limit?: number,
    cursor?: string,
): Promise<SqrtHistoryResponse> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (cursor) params.append("cursor", cursor);

    const url = `${API_BASE_URL}/square-root/history${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetch(url);
    const data = await parseApiResponse<SqrtHistoryResponse>(response);

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch calculation history");
    }

    return data.responseObject;
}

/**
 * Delete entire calculation history
 */
export async function deleteCalculationHistory(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/square-root/history`, {
        method: "DELETE",
    });

    // Server returns a ServiceResponse with a responseObject; parse it
    const data = await parseApiResponse<Record<string, unknown>>(response);

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete calculation history");
    }

    return;
}


