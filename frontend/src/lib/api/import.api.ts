import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query"

import type { ErrorResponse } from "shared/errors"
import type { ApiResponse }   from "@/lib/@types/api"
import { QK }                 from "@/lib/constants/queryKeys"
import { endpoints }          from "@/lib/config/endpoints"
import { api }                from "@/lib/api/axios"
import type {
  SuggestResponse,
  ExecuteResponse,
  ImportTemplate,
  SaveTemplateInput,
  ExecuteImportInput,
} from "@/lib/@types/import"

// ─── Raw functions ────────────────────────────────────────────────

export async function suggestImport(file: File, targetTable: string): Promise<SuggestResponse> {
  const form = new FormData()
  form.append("file",        file)
  form.append("targetTable", targetTable)

  const res = await api.post<ApiResponse<SuggestResponse>>(
    endpoints.import.suggest,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  )
  return res.data.data
}

export async function executeImport(input: ExecuteImportInput): Promise<ExecuteResponse> {
  const form = new FormData()
  form.append("file",          input.file)
  form.append("targetTable",   input.targetTable)
  form.append("columnMapping", JSON.stringify(input.columnMapping))
  if (input.sheetName) form.append("sheetName", input.sheetName)
  if (input.upsertKey) form.append("upsertKey", input.upsertKey)
  if (input.dryRun !== undefined) form.append("dryRun", String(input.dryRun))

  const res = await api.post<ApiResponse<ExecuteResponse>>(
    endpoints.import.execute,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  )
  return res.data.data
}

// ─── Hooks ────────────────────────────────────────────────────────

export function useImportTemplates(
  options?: Omit<UseQueryOptions<ImportTemplate[], ErrorResponse>, "queryKey" | "queryFn">,
) {
  return useQuery<ImportTemplate[], ErrorResponse>({
    queryKey: [QK.import, "templates"],
    queryFn:  () =>
      api.get<ApiResponse<ImportTemplate[]>>(endpoints.import.templates)
        .then((r) => r.data.data),
    ...options,
  })
}

export function useSuggestImport(
  options?: UseMutationOptions<SuggestResponse, ErrorResponse, { file: File; targetTable: string }>,
) {
  return useMutation<SuggestResponse, ErrorResponse, { file: File; targetTable: string }>({
    mutationFn: ({ file, targetTable }) => suggestImport(file, targetTable),
    ...options,
  })
}

export function useExecuteImport(
  options?: UseMutationOptions<ExecuteResponse, ErrorResponse, ExecuteImportInput>,
) {
  return useMutation<ExecuteResponse, ErrorResponse, ExecuteImportInput>({
    mutationFn: (input) => executeImport(input),
    ...options,
  })
}

export function useSaveTemplate(
  options?: UseMutationOptions<ImportTemplate, ErrorResponse, SaveTemplateInput>,
) {
  const qc = useQueryClient()
  return useMutation<ImportTemplate, ErrorResponse, SaveTemplateInput>({
    mutationFn: (body) =>
      api.post<ApiResponse<ImportTemplate>>(endpoints.import.templates, body)
        .then((r) => r.data.data),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: [QK.import, "templates"] })
      options?.onSuccess?.(...args)
    },
  })
}
