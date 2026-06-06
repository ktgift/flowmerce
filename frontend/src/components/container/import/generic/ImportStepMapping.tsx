import { useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"

import { IMPORT_SYSTEM_FIELDS } from "shared"
import AppSelect, { type AppSelectOption } from "@/components/common/AppSelect"
import AppTextField from "@/components/common/AppTextField"
import { COLORS } from "@/lib/constants/colors"
import {
  IMPORT_IGNORE_LABEL,
  IMPORT_IGNORE_VALUE,
} from "@/lib/constants/import"
import {
  useExecuteImport,
  useSaveTemplate,
  useSuggestImport,
} from "@/lib/api/import.api"
import { useSnackbar } from "@/lib/hook/useSnackbar"
import { useImportWizardStore } from "@/lib/store/importWizardStore"

import ImportFilePreviewBar from "./ImportFilePreviewBar"
import ImportMatchStatusBanner from "./ImportMatchStatusBanner"
import ImportMappingPreviewCard, {
  type ImportMappingRowData,
} from "./ImportMappingPreviewCard"
import ImportSavedTemplatesCard from "../ImportSavedTemplatesCard"
import ImportTipsCard from "../ImportTipsCard"
import ImportUpsertKeyBar from "./ImportUpsertKeyBar"

export default function ImportStepMapping() {
  const {
    file,
    targetTable,
    suggestion,
    columnMapping,
    sheetName,
    upsertKey,
    setColumn,
    setStep,
    setUpsertKey,
    setFile,
    applySheetChange,
    setExecuteResult,
  } = useImportWizardStore()

  const snackbar = useSnackbar()
  const [savingTemplate,    setSavingTemplate]    = useState(false)
  const [templateNameInput, setTemplateNameInput] = useState("")

  const { mutate: reSuggest } = useSuggestImport({
    onSuccess: (data) => {
      if (sheetName) applySheetChange(sheetName, data)
    },
    onError: (err) => snackbar.error(err.message ?? "Failed to load sheet"),
  })

  const { mutate: execute, isPending: isExecuting } = useExecuteImport({
    onSuccess: (data) => {
      setExecuteResult(data)
      setStep(2)
    },
    onError:   (err)  => snackbar.error(err.message ?? "Failed to preview import"),
  })

  const { mutate: saveTemplate, isPending: isSavingTemplate } = useSaveTemplate({
    onSuccess: () => {
      snackbar.success("Template saved")
      setSavingTemplate(false)
      setTemplateNameInput("")
    },
    onError: (err) => snackbar.error(err.message ?? "Failed to save template"),
  })

  if (!file || !suggestion) return null

  const systemFields = IMPORT_SYSTEM_FIELDS[targetTable]
  const fieldOptions: AppSelectOption[] = [
    { value: IMPORT_IGNORE_VALUE, label: IMPORT_IGNORE_LABEL },
    ...systemFields.map((f) => ({ value: f, label: f })),
  ]
  const sheetOptions: AppSelectOption[] = suggestion.sheets.map((name) => ({
    value: name,
    label: name,
  }))

  const mappedFields = Array.from(
    new Set(Object.values(columnMapping).filter((v) => v && v !== IMPORT_IGNORE_VALUE)),
  )
  const upsertOptions: AppSelectOption[] = mappedFields.length > 0
    ? mappedFields.map((f) => ({ value: f, label: f }))
    : systemFields.map((f) => ({ value: f, label: f }))

  const rows: ImportMappingRowData[] = suggestion.headers.map((header) => ({
    header,
    sample: suggestion.previewRows[0]?.[header] ?? "—",
  }))

  const totalCount  = rows.length
  const mappedCount = rows.filter(
    (r) => (columnMapping[r.header] ?? IMPORT_IGNORE_VALUE) !== IMPORT_IGNORE_VALUE,
  ).length

  const matched      = Boolean(suggestion.matchedTemplate)
  const templateName = suggestion.matchedTemplate?.name
  const bannerDetail = matched
    ? `Matched by filename + ${mappedCount}/${totalCount} columns`
    : `Detected ${totalCount} columns — system suggested mapping. Please review and edit.`

  function handleSheetChange(name: string) {
    if (!file) return
    applySheetChange(name, suggestion!)
    reSuggest({ file, targetTable })
  }

  function handleSave() {
    if (!templateNameInput.trim()) {
      snackbar.warning("Please enter a template name")
      return
    }
    saveTemplate({
      name:          templateNameInput.trim(),
      targetTable,
      columnMapping,
    })
  }

  function handlePreview() {
    if (!file) return
    execute({
      file,
      targetTable,
      columnMapping,
      sheetName,
      upsertKey,
      dryRun: true,
    })
  }

  function handleRemoveFile() {
    setFile(null)
    setStep(0)
  }

  return (
    <Box
      sx={{
        display:             "grid",
        gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
        gap:                 3,
        alignItems:          "start",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <ImportFilePreviewBar
          file={file}
          targetTable={targetTable}
          onRemove={handleRemoveFile}
        />

        <ImportMatchStatusBanner
          matched={matched}
          templateName={templateName}
          detail={bannerDetail}
          onEdit={matched ? undefined : () => undefined}
        />

        {suggestion.sheets.length > 1 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography sx={{ fontSize: "0.875rem", color: COLORS.textLabelBlack }}>
              Sheet:
            </Typography>
            <AppSelect
              value={sheetName ?? ""}
              onChange={handleSheetChange}
              options={sheetOptions}
              width={200}
            />
          </Box>
        )}

        <ImportMappingPreviewCard
          title={matched ? "Preview Mapping" : "Suggested Mapping"}
          hint={matched ? "Click ✏ to edit a row" : undefined}
          rows={rows}
          columnMapping={columnMapping}
          fieldOptions={fieldOptions}
          onColumnChange={setColumn}
        />

        <Box
          sx={{
            display:        "flex",
            flexDirection:  { xs: "column", sm: "row" },
            alignItems:     { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap:            1.5,
          }}
        >
          {savingTemplate ? (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <AppTextField
                placeholder="Template name"
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
                sx={{ minWidth: 200 }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleSave}
                disabled={isSavingTemplate}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSavingTemplate(false)
                  setTemplateNameInput("")
                }}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <Button variant="outlined" onClick={() => setSavingTemplate(true)}>
              Save as Template
            </Button>
          )}

          <Button variant="text" onClick={() => setStep(0)}>
            Back
          </Button>
        </Box>

        <ImportUpsertKeyBar
          upsertKey={upsertKey}
          options={upsertOptions}
          onChange={setUpsertKey}
          onPreview={handlePreview}
          previewDisabled={isExecuting}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <ImportTipsCard />
        <ImportSavedTemplatesCard />
      </Box>
    </Box>
  )
}
