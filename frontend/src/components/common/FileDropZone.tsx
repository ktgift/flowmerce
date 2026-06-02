import { useRef, type ReactNode } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined"
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined"
import CloseIcon from "@mui/icons-material/Close"

import { COLORS } from "@/lib/constants/colors"

type Responsive<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T }

interface FileDropZoneProps {
  files:              File[]
  onChange:           (files: File[]) => void
  accept?:            string[]
  multiple?:          boolean
  maxFiles?:          number
  hint?:              string
  title?:             string
  icon?:              ReactNode
  showSelectButton?:  boolean
  selectButtonLabel?: string
  minHeight?:         Responsive<number | string>
  py?:                Responsive<number>
}

function formatSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const DEFAULT_ACCEPT = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp",
]

export default function FileDropZone({
  files,
  onChange,
  accept            = DEFAULT_ACCEPT,
  multiple          = true,
  maxFiles          = 10,
  hint              = "PDF, Excel, Images",
  title             = "Drop files here or click to select",
  icon,
  showSelectButton  = false,
  selectButtonLabel = "Select File",
  minHeight,
  py                = 4,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const limit    = multiple ? maxFiles : 1

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const next = multiple
      ? [...files, ...Array.from(incoming)].slice(0, limit)
      : Array.from(incoming).slice(0, 1)
    onChange(next)
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  function openPicker(e?: React.MouseEvent) {
    e?.stopPropagation()
    inputRef.current?.click()
  }

  return (
    <Box>
      <Box
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
        onClick={() => openPicker()}
        sx={{
          border:         "1.5px dashed",
          borderColor:    COLORS.border,
          borderRadius:   2,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          py,
          px:             3,
          gap:            1,
          cursor:         "pointer",
          bgcolor:        COLORS.backgroundDefault,
          transition:     "border-color 0.15s, background-color 0.15s",
          "&:hover":      { borderColor: COLORS.primary },
          ...(minHeight !== undefined && { minHeight }),
        }}
      >
        <Box
          sx={{
            width:          icon ? 56 : 48,
            height:         icon ? 56 : 48,
            bgcolor:        COLORS.primarylight,
            borderRadius:   icon ? 2 : "50%",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            mb:             0.5,
          }}
        >
          {icon ?? <UploadFileOutlinedIcon sx={{ color: COLORS.primary, fontSize: 24 }} />}
        </Box>

        <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: COLORS.textLabelBlack }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: COLORS.subText, textAlign: "center" }}>
          {hint}{multiple ? ` — up to ${limit} files` : ""}
        </Typography>

        {showSelectButton && (
          <Button
            variant="contained"
            onClick={openPicker}
            sx={{ mt: 1, textTransform: "none", fontWeight: 600, px: 3 }}
          >
            {selectButtonLabel}
          </Button>
        )}
      </Box>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept.join(",")}
        style={{ display: "none" }}
        onChange={(e) => { addFiles(e.target.files); e.target.value = "" }}
      />

      {files.length > 0 && (
        <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {files.map((file, idx) => (
            <Box
              key={`${file.name}-${idx}`}
              sx={{
                display:      "flex",
                alignItems:   "center",
                gap:          1,
                px:           1.5,
                py:           0.75,
                border:       "1px solid",
                borderColor:  COLORS.border,
                borderRadius: 1.5,
                bgcolor:      COLORS.backgroundPaper,
              }}
            >
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: COLORS.success, flexShrink: 0 }} />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize:     "0.82rem",
                    fontWeight:   600,
                    color:        COLORS.textLabelBlack,
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace:   "nowrap",
                  }}
                >
                  {file.name}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: COLORS.subText }}>
                  {formatSize(file.size)}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => removeFile(idx)} sx={{ flexShrink: 0 }}>
                <CloseIcon sx={{ fontSize: 15, color: COLORS.neutral }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
