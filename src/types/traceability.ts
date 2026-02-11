export type DataSourceKind = 'file' | 'db' | 'slack' | 'email' | 'jira' | 'drive' | 'api';

export type DataSourceReference = {
  source_id: string;
  type: DataSourceKind;
  name: string;
  url: string;
  page?: number;
  row_id?: string;
  highlight_text?: string;
  highlight_anchor?: string;
};

export type TraceVersionSnapshot = {
  source_version: string;
  snapshot_at: string;
  display_value?: string;
  logic_summary?: string;
  confidence?: number;
  data_source?: DataSourceReference[];
};

export type TraceabilityPayload = {
  trace_id: string;
  display_value: string;
  logic_summary: string;
  logic_formula?: string;
  data_source: DataSourceReference[];
  is_ai_generated: boolean;
  source_version?: string;
  snapshot_at?: string;
  confidence?: number;
  version_history?: TraceVersionSnapshot[];
};
