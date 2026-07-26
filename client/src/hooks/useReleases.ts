import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchReleasesApi,
  fetchStepsApi,
  fetchHealthApi,
  createReleaseApi,
  updateReleaseApi,
  deleteReleaseApi
} from '../services/api';
import { CreateReleaseInput, UpdateReleaseInput } from '../types/release';

export const RELEASES_QUERY_KEY = ['releases'];
export const STEPS_QUERY_KEY = ['steps'];
export const HEALTH_QUERY_KEY = ['health'];

export function useReleasesQuery() {
  return useQuery({
    queryKey: RELEASES_QUERY_KEY,
    queryFn: fetchReleasesApi
  });
}

export function useStepsQuery() {
  return useQuery({
    queryKey: STEPS_QUERY_KEY,
    queryFn: fetchStepsApi
  });
}

export function useHealthQuery() {
  return useQuery({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: fetchHealthApi,
    refetchOnWindowFocus: false,
    retry: 1
  });
}

export function useCreateReleaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReleaseInput) => createReleaseApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELEASES_QUERY_KEY });
    }
  });
}

export function useUpdateReleaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateReleaseInput }) => updateReleaseApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELEASES_QUERY_KEY });
    }
  });
}

export function useDeleteReleaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReleaseApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELEASES_QUERY_KEY });
    }
  });
}
