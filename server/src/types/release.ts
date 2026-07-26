export type ReleaseStatus = 'planned' | 'ongoing' | 'done';

export interface Step {
  id: string;
  name: string;
}

export interface Release {
  id: number;
  name: string;
  due_date: string;
  status: ReleaseStatus;
  additional_info?: string | null;
  completed_steps: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateReleaseInput {
  name: string;
  due_date: string;
  additional_info?: string;
  completed_steps?: string[];
}

export interface UpdateReleaseInput {
  name?: string;
  due_date?: string;
  additional_info?: string;
  completed_steps?: string[];
}
