export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  code?: number;
  metadata?: Record<string, any>;
}

export interface EmailResult {
  messageId?: string;
  previewUrl?: string;
  recipient: string;
  subject: string;
  templateName?: string;
  sent: boolean;
  sentAt?: Date;
  error?: string;
}

export interface EmailDeliveryMetadata {
  processingTimeMs?: number;
  template?: {
    name?: string;
    renderTimeMs?: number;
    size?: number;
    path?: string;
  };
  delivery?: {
    provider?: string;
    etherealUrl?: string;
  };
}
