const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const LOGIN_PATH = "/login";

type QueryValue = string | number | boolean | null | undefined;

export type RequestQuery = Record<string, QueryValue | QueryValue[]>;

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: RequestQuery;
  skipAuthRefresh?: boolean;
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: "patient" | "admin";
}

export interface PatientProfileResponse {
  id: string;
  email: string;
  role: "patient";
  isVerified: boolean;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  occupation: string;
  bloodGroup: string;
  knownConditions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PatientAssessmentResponse {
  id: string;
  patientId: string;
  patientName: string;
  score: number;
  maxScore: number;
  percentage: number;
  tier: {
    tier: "urgent" | "high" | "moderate" | "low";
    label: string;
    icon: string;
    summary: string;
    recommendation: string;
    urgency: string;
  };
  automaticRecommendation: string | null;
  breakdown: Record<string, number>;
  selectedIds: string[];
  timestamp: string;
  status: "confirmed";
}

export interface PatientDashboardResponse {
  profile: PatientProfileResponse;
  stats: {
    assessments: number;
    recommendations: number;
    latestRiskLevel: string;
    latestAssessmentDate: string | null;
  };
  latestAssessment: PatientAssessmentResponse | null;
  assessments: PatientAssessmentResponse[];
  recommendations: PatientAssessmentResponse[];
}

export interface AdminDashboardResponse {
  stats: {
    patients: number;
    admins: number;
    assessments: number;
  };
  riskTierDistribution: { tier: string; count: number }[];
  mostCommonSymptoms: { id: string; count: number }[];
  recentAssessments: PatientAssessmentResponse[];
}

export interface AdminUser {
  id: string;
  email: string;
  role: "patient" | "admin";
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
  firstName: string;
  lastName: string;
  status: string | null;
}

export type AdminActionResponse = {
  message: string;
  userId: string;
  isActive: boolean;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof ApiError) {
    const responseMessage = getErrorMessage(error.data, "");
    return responseMessage || error.message || fallback;
  }

  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return "Unable to reach the server. Check your internet connection and try again.";
  }

  if (error instanceof Error && error.message.trim()) return error.message;

  return fallback;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (isPlainObject(data)) {
    const message = data.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (Array.isArray(message) && message.length > 0) {
      const messages = message.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      );
      if (messages.length > 0) {
        return messages.join(" ");
      }

      const validationMessages = message
        .filter(isPlainObject)
        .map((item) => item.error)
        .filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        );
      if (validationMessages.length > 0) {
        return validationMessages.join(" ");
      }
    }

    const nestedError = data.error;
    if (typeof nestedError === "string" && nestedError.trim()) {
      return nestedError;
    }

    if (isPlainObject(nestedError)) {
      return getErrorMessage(nestedError, fallback);
    }
  }

  return fallback;
}

export class BaseApiClient {
  constructor(private readonly baseUrl: string = DEFAULT_API_BASE_URL) {}

  protected buildUrl(path: string, query?: RequestQuery): string {
    const url = new URL(path, this.baseUrl);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
          continue;
        }

        if (Array.isArray(value)) {
          for (const item of value) {
            if (item !== undefined && item !== null) {
              url.searchParams.append(key, String(item));
            }
          }
          continue;
        }

        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }

  public async request<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    const { query, body, headers, skipAuthRefresh, ...requestInit } = options;
    void skipAuthRefresh;
    const url = this.buildUrl(path, query);
    const requestHeaders = new Headers(headers);

    let requestBody: BodyInit | undefined;
    if (body !== undefined && body !== null) {
      if (
        body instanceof FormData ||
        body instanceof URLSearchParams ||
        body instanceof Blob ||
        body instanceof ArrayBuffer ||
        ArrayBuffer.isView(body) ||
        typeof body === "string"
      ) {
        requestBody = body as BodyInit;
      } else {
        requestBody = JSON.stringify(body);
        if (!requestHeaders.has("content-type")) {
          requestHeaders.set("content-type", "application/json");
        }
      }
    }

    const response = await fetch(url, {
      ...requestInit,
      credentials: requestInit.credentials ?? "include",
      headers: requestHeaders,
      body: requestBody,
    });

    return this.parseResponse<T>(response);
  }

  protected async parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    let data: unknown;

    if (isJson) {
      try {
        data = await response.json();
      } catch {
        data = undefined;
      }
    } else {
      const text = await response.text();
      data = text.trim() ? text : undefined;
    }

    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(data, response.statusText || "Request failed"),
        response.status,
        data,
      );
    }

    if (isPlainObject(data) && data.success === true && "data" in data) {
      return data.data as T;
    }

    return data as T;
  }

  public get<T>(
    path: string,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public post<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  public patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  public put<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  public delete<T>(
    path: string,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export class AuthApiClient extends BaseApiClient {
  private refreshPromise: Promise<boolean> | null = null;

  override async request<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    try {
      return await super.request<T>(path, options);
    } catch (error) {
      if (this.shouldRefresh(error, path, options)) {
        const refreshed = await this.ensureAccessToken();

        if (refreshed) {
          return super.request<T>(path, options);
        }

        this.redirectToLogin();
      }

      throw error;
    }
  }

  private shouldRefresh(
    error: unknown,
    path: string,
    options: ApiRequestOptions,
  ): boolean {
    return (
      error instanceof ApiError &&
      error.status === 401 &&
      !options.skipAuthRefresh &&
      path !== "/api/auth/refresh"
    );
  }

  private async ensureAccessToken(): Promise<boolean> {
    if (typeof window === "undefined") {
      return false;
    }

    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          await super.post<{ message: string }>(
            "/api/auth/refresh",
            undefined,
            {
              skipAuthRefresh: true,
            },
          );
          return true;
        } catch {
          return false;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }

    return this.refreshPromise;
  }

  private redirectToLogin(): void {
    if (typeof window === "undefined") {
      return;
    }

    if (window.location.pathname !== LOGIN_PATH) {
      window.location.replace(LOGIN_PATH);
    }
  }

  public login(email: string, password: string) {
    return this.post<{ message: string }>(
      "/api/auth/login",
      { email, password },
      { skipAuthRefresh: true },
    );
  }

  public logout() {
    return this.post<{ message: string }>("/api/auth/logout", undefined, {
      skipAuthRefresh: true,
    });
  }

  public register(body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dateOfBirth: string;
    phoneNumber: string;
    address: string;
    occupation?: string;
    bloodGroup?: string;
    knownConditions?: string[];
  }) {
    return this.post<{ userId: string; message: string }>(
      "/api/auth/register",
      body,
      { skipAuthRefresh: true },
    );
  }

  public resendVerificationEmail(email: string) {
    return this.post<{ message: string }>(
      "/api/auth/resend-verification-email",
      { email },
      { skipAuthRefresh: true },
    );
  }

  public buildVerifyEmailUrl(token: string): string {
    return this.buildUrl("/api/auth/verify-email", { token });
  }

  public getCurrentUser() {
    return this.get<User>("/api/auth/me");
  }

  public getPatientDashboard() {
    return this.get<PatientDashboardResponse>("/api/patients/dashboard");
  }

  public getPatientProfile() {
    return this.get<PatientProfileResponse>("/api/patients/profile");
  }

  public updatePatientProfile(body: {
    phoneNumber?: string;
    address?: string;
    occupation?: string;
    bloodGroup?: string;
    knownConditions?: string[];
  }) {
    return this.patch<PatientProfileResponse>("/api/patients/profile", body);
  }

  public getPatientAssessments() {
    return this.get<PatientAssessmentResponse[]>("/api/patients/assessments");
  }

  public getPatientRecommendations() {
    return this.get<PatientAssessmentResponse[]>(
      "/api/patients/recommendations",
    );
  }

  public createPatientAssessment(body: {
    score: number;
    maxScore: number;
    percentage: number;
    tier: {
      tier: "urgent" | "high" | "moderate" | "low";
      label: string;
      icon: string;
      summary: string;
      recommendation: string;
      urgency: string;
    };
    automaticRecommendation?: string;
    breakdown: Record<string, number>;
    selectedIds: string[];
    patientName?: string;
    timestamp?: string;
  }) {
    return this.post<PatientAssessmentResponse>(
      "/api/patients/assessments",
      body,
    );
  }

  public getAdminDashboard() {
    return this.get<AdminDashboardResponse>("/api/admin/dashboard");
  }

  public getAdminUsers() {
    return this.get<AdminUser[]>("/api/admin/users");
  }

  public getAdminAssessments() {
    return this.get<PatientAssessmentResponse[]>("/api/admin/assessments");
  }

  public suspendUser(userId: string) {
    return this.patch<AdminActionResponse>(
      `/api/admin/users/${userId}/suspend`,
    );
  }

  public activateUser(userId: string) {
    return this.patch<AdminActionResponse>(
      `/api/admin/users/${userId}/activate`,
    );
  }

  public deleteUser(userId: string) {
    return this.delete<{ message: string; userId: string }>(
      `/api/admin/users/${userId}`,
    );
  }
}

export const apiClient = new BaseApiClient();
export const authApiClient = new AuthApiClient();
