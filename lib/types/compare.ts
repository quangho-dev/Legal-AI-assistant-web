export type CompareDocumentRecord = {
  id: string;
  filename: string;
  fileSize?: number;
  fileType?: string;
  processingStatus: string;
  createdAt?: string;
};

export type ComparisonPlan = {
  objectives: string[];
  focusAreas: string[];
  comparisonDimensions: string[];
};

export type ComparisonAgentStep = {
  agent: string;
  status: string;
  summary: string;
};

export type CompareDocumentsRequest = {
  sourceDocumentId: string;
  referenceDocumentIds: string[];
  instruction: string;
};

export type CompareDocumentsResponse = {
  report: string;
  steps: ComparisonAgentStep[];
  plan: ComparisonPlan;
  documentContext?: {
    filename: string;
    role: string;
    documentType: string;
    titleOrSubject: string;
    summary: string;
    legalDomain?: string;
  }[];
  sourceDocument: {
    id: string;
    filename: string;
  };
  referenceDocuments: {
    id: string;
    filename: string;
  }[];
};

export type CompareUploadUrlResponse = {
  uploadUrl: string;
  s3Key: string;
  document: CompareDocumentRecord;
};
